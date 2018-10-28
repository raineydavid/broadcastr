DROP SCHEMA IF EXISTS broadcastr CASCADE;
CREATE SCHEMA broadcastr;

CREATE SEQUENCE broadcastr.user_id
  INCREMENT 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1;
CREATE TABLE broadcastr.users(
	user_id INT NOT NULL DEFAULT nextval('broadcastr.user_id'::regclass),
	fname VARCHAR,
	lname VARCHAR,
	email VARCHAR,
  password VARCHAR,
  created_at TIMESTAMP DEFAULT current_timestamp,
  created_by INT,
	disabled BOOLEAN DEFAULT FALSE,
  CONSTRAINT uniq_email UNIQUE (email)
);
INSERT INTO broadcastr.users (fname,lname,email,password,created_by) VALUES ('Test','User','ajkahle@gmail.com','{PASSWORD}',1);

CREATE TABLE broadcastr.user_access(
  user_id INT,
  access_id INT,
  disabled BOOLEAN DEFAULT FALSE,
  CONSTRAINT uniq_user_access UNIQUE (user_id,access_id,disabled)
);
INSERT INTO broadcastr.user_access (user_id,access_id) VALUES (1,1);

CREATE SEQUENCE broadcastr.access_id
  INCREMENT 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1;
CREATE TABLE broadcastr.access_levels(
  access_id INT NOT NULL DEFAULT nextval('broadcastr.access_id'::regclass),
  name VARCHAR,
  admin_only_assign BOOLEAN DEFAULT TRUE
);
INSERT INTO broadcastr.access_levels (name,admin_only_assign) VALUES ('Admin',TRUE),('Client Admin',TRUE),('Client User',FALSE);

CREATE SEQUENCE broadcastr.client_id
  INCREMENT 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1;
CREATE TABLE broadcastr.clients(
  client_id INT NOT NULL DEFAULT nextval('broadcastr.client_id'::regclass),
  name VARCHAR,
  twoseventy_lead INT,
  created_at TIMESTAMP DEFAULT current_timestamp,
  created_by INT,
  admin BOOLEAN DEFAULT FALSE,
  disabled BOOLEAN DEFAULT FALSE
);
INSERT INTO broadcastr.clients (name,twoseventy_lead,created_by,admin) VALUES ('Client 1',1,1,true);

CREATE TABLE broadcastr.client_access(
  user_id int,
  client_id int,
  disabled BOOLEAN DEFAULT FALSE,
  CONSTRAINT uniq_client_access UNIQUE (user_id,client_id)
);
INSERT INTO broadcastr.client_access (user_id,client_id) VALUES (1,1);

CREATE SEQUENCE broadcastr.page_category_id
  INCREMENT 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1;
CREATE TABLE broadcastr.page_categories(
  page_category_id INT NOT NULL DEFAULT nextval('broadcastr.page_category_id'::regclass),
  page_category_name VARCHAR,
  display BOOLEAN DEFAULT TRUE,
  _order INT
);
INSERT INTO broadcastr.page_categories (page_category_name,_order) VALUES ('Home',1),('Settings',2),('My Account',3);

CREATE SEQUENCE broadcastr.page_id
  INCREMENT 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1;
CREATE TABLE broadcastr.pages(
  page_category_id INT,
  page_id INT NOT NULL DEFAULT nextval('broadcastr.page_id'::regclass),
  page_name VARCHAR,
  link VARCHAR,
  display BOOLEAN DEFAULT TRUE,
  _order INT
);
INSERT INTO broadcastr.pages (page_category_id,page_name,link,_order) VALUES (1,'Home','/',1),(2,'Users','/settings/users',1),(2,'Clients','/settings/clients',2),(3,'My Account','/settings/me',1),(3,'Switch Client','/account/switch-client',2),(3,'Logout','/logout',3);

CREATE TABLE broadcastr.page_access(
  access_id INT,
  page_id INT
);
INSERT INTO broadcastr.page_access (
  SELECT 1,page_id FROM broadcastr.pages
);
INSERT INTO broadcastr.page_access (
  SELECT 2,page_id FROM broadcastr.pages
    WHERE page_id NOT IN (3,5)
);
INSERT INTO broadcastr.page_access (
  SELECT 3,page_id FROM broadcastr.pages
    WHERE page_category_id <> 2 AND page_id <> 5
);

DROP FUNCTION IF EXISTS broadcastr.space_concat(first varchar,second varchar);
CREATE FUNCTION broadcastr.space_concat(first varchar,second varchar) returns varchar as $$
    select $1||' '||$2;
$$ language 'sql';

DROP FUNCTION IF EXISTS broadcastr.login(IN varchar);
CREATE OR REPLACE FUNCTION broadcastr.login(
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
        broadcastr.SPACE_CONCAT(fname,lname) AS name,
        access_levels.name,
        ARRAY_AGG(DISTINCT link) AS pages,
        ARRAY_AGG(JSON_OBJECT(ARRAY[''client_id'',''name''],ARRAY[clients.client_id::varchar,clients.name])) AS clients
  FROM broadcastr.users
  LEFT JOIN broadcastr.user_access
    ON users.user_id = user_access.user_id
    AND user_access.disabled = FALSE
  LEFT JOIN broadcastr.access_levels
    ON user_access.access_id = access_levels.access_id
  LEFT JOIN broadcastr.page_access
    ON page_access.access_id = access_levels.access_id
  LEFT JOIN broadcastr.pages
    ON pages.page_id = page_access.page_id
  LEFT JOIN broadcastr.client_access
    ON client_access.user_id = users.user_id
    AND client_access.disabled = FALSE
  LEFT JOIN broadcastr.clients
    ON client_access.client_id = clients.client_id
    AND clients.disabled = FALSE
  WHERE users.email = '''||$1||''' AND users.disabled  = FALSE
  GROUP BY users.user_id,email,password,fname,lname,access_levels.name;';
END;
$BODY$
	LANGUAGE plpgsql VOLATILE
	COST 100;
