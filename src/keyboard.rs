use rusqlite::{params};
use tokio_rusqlite::{Connection, Result};
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Keyboard {
    pub id: i32,
    pub name: String,
    pub row: Vec<String>,
    pub column: Vec<String>,
    pub orientation: String,
    pub layout: Vec<String>,
//    img: String,
}

pub async fn get_keyboard_by_id(conn: &Connection, id: u32) -> Keyboard {
    println!("in get keyboards"); 
    conn.call(move |conn| {
        let mut stmt = conn.prepare("select * from keyboards WHERE id=?1").unwrap();
        Ok(stmt.query_row(params![id], |row| {
            let layoutString = row.get::<_,String>(5).unwrap(); 
            let rowString =  row.get::<_,String>(2).unwrap();
            let colString =  row.get::<_,String>(3).unwrap();
            return Ok(
                Keyboard{
                id: row.get(0).unwrap(),
                name: row.get(1).unwrap(),
                row: rowString.split(",").map(|s| s.to_string()).collect(),
                column: colString.split(",").map(|s| s.to_string()).collect(),
                orientation: row.get(4).unwrap(),
                layout: layoutString.split(",").map(|s| s.to_string()).collect(),
//                img: row.get(6).unwrap(),
            })
        }).unwrap())
    }).await.unwrap()
    
}

pub fn buildKeyboardHtml(keyboard: Keyboard) -> &'static str {

    ""
}
