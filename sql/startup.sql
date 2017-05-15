DROP SCHEMA IF EXISTS {SCHEMA} CASCADE;
CREATE SCHEMA {SCHEMA};

CREATE SEQUENCE {SCHEMA}.user_id
  INCREMENT 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1;
CREATE TABLE {SCHEMA}.users(
	user_id INT NOT NULL DEFAULT nextval('{SCHEMA}.user_id'::regclass),
	fname VARCHAR,
	lname VARCHAR,
	email VARCHAR,
  password VARCHAR,
  created_at TIMESTAMP DEFAULT current_timestamp,
  created_by INT,
	disabled BOOLEAN DEFAULT FALSE,
  CONSTRAINT uniq_email UNIQUE (email)
);
INSERT INTO {SCHEMA}.users (fname,lname,email,password,created_by) VALUES ('Test','User','test@270strategies.com','{PASSWORD}',1);

CREATE TABLE {SCHEMA}.user_access(
  user_id INT,
  access_id INT,
  disabled BOOLEAN DEFAULT FALSE,
  CONSTRAINT uniq_user_access UNIQUE (user_id,access_id,disabled)
);
INSERT INTO {SCHEMA}.user_access (user_id,access_id) VALUES (1,1);

CREATE SEQUENCE {SCHEMA}.access_id
  INCREMENT 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1;
CREATE TABLE {SCHEMA}.access_levels(
  access_id INT NOT NULL DEFAULT nextval('{SCHEMA}.access_id'::regclass),
  name VARCHAR,
  admin_only_assign BOOLEAN DEFAULT TRUE
);
INSERT INTO {SCHEMA}.access_levels (name,admin_only_assign) VALUES ('270 Admin',TRUE),('Client Admin',TRUE),('Client User',FALSE);

CREATE SEQUENCE {SCHEMA}.client_id
  INCREMENT 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1;
CREATE TABLE {SCHEMA}.clients(
  client_id INT NOT NULL DEFAULT nextval('{SCHEMA}.client_id'::regclass),
  name VARCHAR,
  twoseventy_lead INT,
  created_at TIMESTAMP DEFAULT current_timestamp,
  created_by INT,
  admin BOOLEAN DEFAULT FALSE,
  disabled BOOLEAN DEFAULT FALSE
);
INSERT INTO {SCHEMA}.clients (name,twoseventy_lead,created_by,admin) VALUES ('270 Strategies',1,1,true);

CREATE TABLE {SCHEMA}.client_access(
  user_id int,
  client_id int,
  disabled BOOLEAN DEFAULT FALSE,
  CONSTRAINT uniq_client_access UNIQUE (user_id,client_id)
);
INSERT INTO {SCHEMA}.client_access (user_id,client_id) VALUES (1,1);

CREATE SEQUENCE {SCHEMA}.page_category_id
  INCREMENT 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1;
CREATE TABLE {SCHEMA}.page_categories(
  page_category_id INT NOT NULL DEFAULT nextval('{SCHEMA}.page_category_id'::regclass),
  page_category_name VARCHAR,
  display BOOLEAN DEFAULT TRUE,
  _order INT
);
INSERT INTO {SCHEMA}.page_categories (page_category_name,_order) VALUES ('Home',1),('Settings',2),('My Account',3);

CREATE SEQUENCE {SCHEMA}.page_id
  INCREMENT 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1;
CREATE TABLE {SCHEMA}.pages(
  page_category_id INT,
  page_id INT NOT NULL DEFAULT nextval('{SCHEMA}.page_id'::regclass),
  page_name VARCHAR,
  link VARCHAR,
  display BOOLEAN DEFAULT TRUE,
  _order INT
);
INSERT INTO {SCHEMA}.pages (page_category_id,page_name,link,_order) VALUES (1,'Home','/',1),(2,'Users','/settings/users',1),(2,'Clients','/settings/clients',2),(3,'My Account','/settings/me',1),(3,'Switch Client','/account/switch-client',2),(3,'Logout','/logout',3);

CREATE TABLE {SCHEMA}.page_access(
  access_id INT,
  page_id INT
);
INSERT INTO {SCHEMA}.page_access (
  SELECT 1,page_id FROM {SCHEMA}.pages
);
INSERT INTO {SCHEMA}.page_access (
  SELECT 2,page_id FROM {SCHEMA}.pages
    WHERE page_id NOT IN (3,5)
);
INSERT INTO {SCHEMA}.page_access (
  SELECT 3,page_id FROM {SCHEMA}.pages
    WHERE page_category_id <> 2 AND page_id <> 5
);

DROP FUNCTION IF EXISTS {SCHEMA}.space_concat(first varchar,second varchar);
CREATE FUNCTION {SCHEMA}.space_concat(first varchar,second varchar) returns varchar as $$
    select $1||' '||$2;
$$ language 'sql';

DROP FUNCTION IF EXISTS {SCHEMA}.login(IN varchar);
CREATE OR REPLACE FUNCTION {SCHEMA}.login(
	IN varchar
	)
	RETURNS TABLE (user_id int,email varchar,password varchar,fname varchar,lname varchar,name varchar,access_name varchar,pages varchar[],clients json[]) AS
$BODY$
BEGIN
RETURN QUERY EXECUTE
'SELECT
        users.user_id,
        email,
        password,
        fname,
        lname,
        {SCHEMA}.SPACE_CONCAT(fname,lname) AS name,
        access_levels.name,
        ARRAY_AGG(DISTINCT link) AS pages,
        ARRAY_AGG(JSON_OBJECT(ARRAY[''client_id'',''name''],ARRAY[clients.client_id::varchar,clients.name])) AS clients
  FROM {SCHEMA}.users
  LEFT JOIN {SCHEMA}.user_access
    ON users.user_id = user_access.user_id
    AND user_access.disabled = FALSE
  LEFT JOIN {SCHEMA}.access_levels
    ON user_access.access_id = access_levels.access_id
  LEFT JOIN {SCHEMA}.page_access
    ON page_access.access_id = access_levels.access_id
  LEFT JOIN {SCHEMA}.pages
    ON pages.page_id = page_access.page_id
  LEFT JOIN {SCHEMA}.client_access
    ON client_access.user_id = users.user_id
    AND client_access.disabled = FALSE
  LEFT JOIN {SCHEMA}.clients
    ON client_access.client_id = clients.client_id
    AND clients.disabled = FALSE
  WHERE users.email = '''||$1||''' AND users.disabled  = FALSE
  GROUP BY users.user_id,email,password,fname,lname,access_levels.name;';
END;
$BODY$
	LANGUAGE plpgsql VOLATILE
	COST 100;
