select (substring(datecode from 5 for 2)||'/'||substring(datecode from 7 for 2)||'/'||substring(datecode from 1 for 4)) as send_date,
	COUNT(CASE WHEN action = 'send' THEN recipient_email ELSE null END) as sends,
	COUNT(DISTINCT CASE WHEN action = 'open' THEN recipient_email ELSE null END) as unique_opens,
	COUNT(CASE WHEN action = 'open' THEN recipient_email ELSE null END) as opens
FROM echo.activity_logs
WHERE sender_id = '9LS4SGgU2COX4LMsmhFy0lingkD2'
	GROUP BY send_date

SELECT 	COUNT(DISTINCT datecode),
	COUNT(CASE WHEN action = 'send' THEN recipient_email ELSE null END) as sends,
	COUNT(DISTINCT CASE WHEN action = 'open' THEN recipient_email ELSE null END) as unique_opens,
	COUNT(DISTINCT CASE WHEN action = 'open' THEN recipient_email ELSE null END)::FLOAT/COUNT(CASE WHEN action = 'send' THEN recipient_email ELSE null END) as unique_open_rate,
	COUNT(CASE WHEN action = 'open' THEN recipient_email ELSE null END) as opens
FROM echo.activity_logs
WHERE sender_id = '9LS4SGgU2COX4LMsmhFy0lingkD2'

SELECT 	COUNT(DISTINCT datecode),COUNT(CASE WHEN action = 'send' THEN recipient_email ELSE null END) as sends,COUNT(DISTINCT CASE WHEN action = 'open' THEN recipient_email ELSE null END) as unique_opens,COUNT(DISTINCT CASE WHEN action = 'open' THEN recipient_email ELSE null END)::FLOAT/COUNT(CASE WHEN action = 'send' THEN recipient_email ELSE null END) as unique_open_rate,COUNT(CASE WHEN action = 'open' THEN recipient_email ELSE null END) as opens FROM echo.activity_logs

select (substring(datecode from 5 for 2)||'/'||substring(datecode from 7 for 2)||'/'||substring(datecode from 1 for 4)) as send_date,COUNT(CASE WHEN action = 'send' THEN recipient_email ELSE null END) as sends,COUNT(DISTINCT CASE WHEN action = 'open' THEN recipient_email ELSE null END) as unique_opens,COUNT(CASE WHEN action = 'open' THEN recipient_email ELSE null END) as opens FROM echo.activity_logs WHERE sender_id = $1 GROUP BY send_date

CREATE TABLE echo.users(
	user_id varchar,
	fname varchar,
	lname varchar,
	email varchar,
	access varchar,
	disabled boolean default false
);

CREATE TABLE echo.clients(
	client_id varchar,
	name varchar,
	created_at timestamp,
	created_by varchar,
	disabled boolean default false
);

CREATE TABLE echo.client_access(
	client_id varchar,
	user_id varchar
);

CREATE TABLE echo.template_access(
	client_id varchar,
	template_id varchar
);


SELECT
users.user_id,users.fname,users.lname,users.fname||' '||users.lname as name,users.email,access_level_name,TO_CHAR(users.created_at,'MM/DD/YY HH:MM') as created_at,created.email as created_by,users.inactive,
ARRAY_AGG(JSON_OBJECT(ARRAY['client_id','name'],ARRAY[clients.client_id::varchar,clients.name])) as clients
FROM echo.users LEFT JOIN echo.access_levels USING(access_id) LEFT JOIN echo.users created ON created.user_id = users.created_by
LEFT JOIN echo.client_access ON users.user_id = client_access.user_id
LEFT JOIN echo.clients ON clients.client_id = client_access.client_id AND clients.inactive = FALSE
GROUP BY users.user_id,users.fname,users.lname,users.email,access_level_name,users.created_at,created.email,users.inactive;

DROP TABLE IF EXISTS echo.client_access;
CREATE TABLE echo.client_access(
	client_id int,
	user_id varchar
);
INSERT INTO echo.client_Access values (1,'UFp5Kbv4d4dlNTVYdDli3JUAe6G2');
INSERT INTO echo.client_access values (2,'UFp5Kbv4d4dlNTVYdDli3JUAe6G2')

select * from echo.clients

insert into echo.clients (name,twoseventy_lead,created_at,created_by) values ('Mike Johnston','UFp5Kbv4d4dlNTVYdDli3JUAe6G2',current_Timestamp,'UFp5Kbv4d4dlNTVYdDli3JUAe6G2')
