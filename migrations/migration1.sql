CREATE TABLE IF NOT EXISTS keyboards(id integer primary key NOT NULL,
name text,
row JSON,
column JSON,
orientation TEXT,
layers json);
