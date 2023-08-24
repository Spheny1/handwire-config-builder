use rusqlite::{params};
use tokio_rusqlite::{Connection, Result};
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Keyboard {
    id: i32,
    name: String,
    row: String,
    column: String,
    orientation: String,
    layout: String,
//    img: String,
}

pub async fn get_keyboard_by_id(conn: &Connection, id: u32) -> Keyboard {
    println!("in get keyboards"); 
    conn.call(move |conn| {
        let mut stmt = conn.prepare("select * from keyboards WHERE id=?1").unwrap();
        Ok(stmt.query_row(params![id], |row| {
            return Ok(Keyboard{
                id: row.get(0).unwrap(),
                name: row.get(1).unwrap(),
                row: row.get(2).unwrap(),
                column: row.get(3).unwrap(),
                orientation: row.get(4).unwrap(),
                layout: row.get(5).unwrap(),
//                img: row.get(6).unwrap(),
            })
        }).unwrap())
    }).await.unwrap()
    
}
