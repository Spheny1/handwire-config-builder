use rusqlite::{params};
use tokio_rusqlite::{Connection};
use serde::{Serialize, Deserialize};
use serde_json::Result;
#[derive(Debug, Serialize, Deserialize)]
pub struct Keyboard {
    pub id: i32,
    pub name: String,
    pub row: Vec<String>,
    pub column: Vec<String>,
    pub orientation: String,
    pub layout: Vec<Vec<String>>,
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
                layout: serde_json::from_str(&layout_string).unwrap(),
//                img: row.get(6).unwrap(),
            })
        }).unwrap())
    }).await.unwrap()
    
}

pub fn build_keyboard_html(keyboard: Keyboard) -> String{
    let mut proto_layout = Vec::new();  
    for (index,layer) in keyboard.layout.iter().enumerate(){
        let layer_string = format!("layer-{}",index.to_string());
        let mut proto_layer = Vec::new();
        for key_row in layer.chunks(keyboard.column.len()){
            let to_hide = if index == 0 { "".to_string() } else { "hide".to_string() };
            proto_layer.push(format!(include_str!("../resources/row.html"),layer_string,to_hide,key_row.iter().map(|key| format!(include_str!("../resources/key-button.html"),key)).collect::<Vec<_>>().join("\n")));
        }
        proto_layout.push(format!(include_str!("../resources/row-container.html"),index,proto_layer.join("\n")));
    }
    format!(include_str!("../resources/keyboard.html"),proto_layout.join("\n"))

}
