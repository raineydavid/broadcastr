SELECT 
users.user_id,users.fname,users.lname,users.fname||' '||users.lname as name,users.email,access_level_name,TO_CHAR(users.created_at,'MM/DD/YY HH:MM') as created_at,created.email as created_by,users.inactive,
ARRAY_AGG(JSON_OBJECT(ARRAY['client_id','name'],ARRAY[clients.client_id::varchar,clients.name])) as clients
FROM broadcastr.users LEFT JOIN broadcastr.access_levels USING(access_id) LEFT JOIN broadcastr.users created ON created.user_id = users.created_by
LEFT JOIN broadcastr.client_access ON users.user_id = client_access.user_id
LEFT JOIN broadcastr.clients ON clients.client_id = client_access.client_id AND clients.inactive = FALSE
GROUP BY users.user_id,users.fname,users.lname,users.email,access_level_name,users.created_at,created.email,users.inactive;

DROP TABLE IF EXISTS broadcastr.client_access;
CREATE TABLE broadcastr.client_access(
	client_id int,
	user_id varchar
);
INSERT INTO broadcastr.client_Access values (1,'UFp5Kbv4d4dlNTVYdDli3JUAe6G2');
INSERT INTO broadcastr.client_access values (2,'UFp5Kbv4d4dlNTVYdDli3JUAe6G2')

select * from broadcastr.clients

insert into broadcastr.clients (name,twoseventy_lead,created_at,created_by) values ('Mike Johnston','UFp5Kbv4d4dlNTVYdDli3JUAe6G2',current_Timestamp,'UFp5Kbv4d4dlNTVYdDli3JUAe6G2')

delete from broadcastr.users
	where user_id = 'XR5JcogcqGdT4knF2GRBiCu6Ldo1'

UPDATE broadcastr.users SET inactive = TRUE WHERE user_id = 'fy4tKKte5IgDMWGq1TmB5zlkezO2'


SELECT users.user_id,users.fname,users.lname,users.fname||' '||users.lname as name,users.email,access_level_name,TO_CHAR(users.created_at,'MM/DD/YY HH:MM') as created_at,created.email as created_by,users.inactive,ARRAY_AGG(JSON_OBJECT(ARRAY['client_id','name'],ARRAY[clients.client_id::varchar,clients.name])) as clients FROM broadcastr.users LEFT JOIN broadcastr.access_levels USING(access_id) LEFT JOIN broadcastr.users created ON created.user_id = users.created_by LEFT JOIN broadcastr.client_access ON users.user_id = client_access.user_id LEFT JOIN broadcastr.clients ON clients.client_id = client_access.client_id AND clients.inactive = FALSE GROUP BY users.user_id,users.fname,users.lname,users.email,access_level_name,users.created_at,created.email,users.inactive

select * from broadcastr.users

delete from broadcastr.client_access where client_id is null

ALTER TABLE broadcastr.activity_logs
	ADD COLUMN client_id int;

ALTER TABLE broadcastr.clients
	ADD COLUMN admin BOOLEAN DEFAULT FALSE

UPDATE broadcastr.activity_logs
	set client_id = 2
	where client_id is null
	where sender_email in ('akahle@270strategies.com','ahooper@270strategies.com')

alter table broadcastr.access_levels
	add column admin_only_assign boolean default true
