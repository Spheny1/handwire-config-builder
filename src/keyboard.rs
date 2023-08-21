use rusqlite::{params};
use tokio_rusqlite::{Connection, Result};
#[derive(Debug)]
pub struct Keyboard {
    id: i32,
    name: String,
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
                name: row.get(3).unwrap(),
                layout: row.get(1).unwrap(),
//                img: row.get(3).unwrap(),
            })
        }).unwrap())
    }).await.unwrap()
    
}
