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

delete from echo.users
	where user_id = 'XR5JcogcqGdT4knF2GRBiCu6Ldo1'

UPDATE echo.users SET inactive = TRUE WHERE user_id = 'fy4tKKte5IgDMWGq1TmB5zlkezO2'


SELECT users.user_id,users.fname,users.lname,users.fname||' '||users.lname as name,users.email,access_level_name,TO_CHAR(users.created_at,'MM/DD/YY HH:MM') as created_at,created.email as created_by,users.inactive,ARRAY_AGG(JSON_OBJECT(ARRAY['client_id','name'],ARRAY[clients.client_id::varchar,clients.name])) as clients FROM echo.users LEFT JOIN echo.access_levels USING(access_id) LEFT JOIN echo.users created ON created.user_id = users.created_by LEFT JOIN echo.client_access ON users.user_id = client_access.user_id LEFT JOIN echo.clients ON clients.client_id = client_access.client_id AND clients.inactive = FALSE GROUP BY users.user_id,users.fname,users.lname,users.email,access_level_name,users.created_at,created.email,users.inactive

select * from echo.users

delete from echo.client_access where client_id is null

ALTER TABLE echo.activity_logs
	ADD COLUMN client_id int;

ALTER TABLE echo.clients
	ADD COLUMN admin BOOLEAN DEFAULT FALSE

UPDATE echo.activity_logs
	set client_id = 2
	where client_id is null
	where sender_email in ('akahle@270strategies.com','ahooper@270strategies.com')

alter table echo.access_levels
	add column admin_only_assign boolean default true
