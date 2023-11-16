use rusqlite::{params};
use tokio_rusqlite::{Connection};
use serde::{Serialize, Deserialize};
use serde_json::Result;
use std::collections::HashMap;
#[derive(Debug, Serialize, Deserialize)]
pub struct Circuitboard {
    pub id: i32,
    pub name: String,
    pub ports: Vec<String>,
//    img: String,
}

pub async fn get_circuitboard_by_id(conn: &Connection, id: u32) -> Circuitboard {
    conn.call(move |conn| {
        let mut stmt = conn.prepare("select * from keyboards WHERE id=?1").unwrap();
        Ok(stmt.query_row(params![id], |row| {
            let ports_string = row.get::<_,String>(2).unwrap(); 
            return Ok(
                Circuitboard{
                id: row.get(0).unwrap(),
                name: row.get(1).unwrap(),
                ports: serde_json::from_str(&ports_string).unwrap(),
//                img: row.get(4).unwrap(),
            })
        }).unwrap())
    }).await.unwrap()
    
}

pub fn build_circuitboard_html(circuitboard: Circuitboard) -> String{
"".to_string()
}
