use rusqlite::{params};
use tokio_rusqlite::{Connection};
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
    conn.call(move |conn| {
        let mut stmt = conn.prepare("select * from keyboards WHERE id=?1").unwrap();
        Ok(stmt.query_row(params![id], |row| {
            let layout_string = row.get::<_,String>(5).unwrap(); 
            let row_string =  row.get::<_,String>(2).unwrap();
            let col_string =  row.get::<_,String>(3).unwrap();
            return Ok(
                Keyboard{
                id: row.get(0).unwrap(),
                name: row.get(1).unwrap(),
                row: row_string.split(",").map(|s| s.to_string()).collect(),
                column: col_string.split(",").map(|s| s.to_string()).collect(),
                orientation: row.get(4).unwrap(),
                layout: layout_string.split(",").map(|s| s.to_string()).collect(),
//                img: row.get(6).unwrap(),
            })
        }).unwrap())
    }).await.unwrap()
    
}

pub fn build_keyboard_html(keyboard: Keyboard) -> String{
    let mut proto_layout = Vec::new();  
    for key_row in keyboard.layout.chunks(keyboard.column.len()){
        proto_layout.push(format!(include_str!("../resources/row.html"),key_row.iter().map(|key| format!(include_str!("../resources/key-button.html"),key)).collect::<Vec<_>>().join("\n")));
    }
    format!(include_str!("../resources/keyboard.html"),proto_layout.join(",\n"))

}
