CREATE TABLE IF NOT EXISTS circuitboards(id integer primary key NOT NULL,
name text,
ports JSON
);

ALTER TABLE keyboards ADD COLUMN layout TEXT; 
