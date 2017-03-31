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
