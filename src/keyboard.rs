use rusqlite::{params};
use tokio_rusqlite::{Connection};
use serde::{Serialize, Deserialize};
use serde_json::Result;
use std::collections::HashMap;
#[derive(Debug, Serialize, Deserialize)]
pub struct Keyboard {
    pub id: i32,
    pub name: String,
    pub row: Vec<String>,
    pub column: Vec<String>,
    pub orientation: String,
    pub layer: Vec<Vec<String>>,
    pub layout: HashMap<u8,String>,
    pub default_circuit_id: u32,
//    img: String,
}

pub async fn get_keyboard_by_id(conn: &Connection, id: u32) -> Keyboard {
    conn.call(move |conn| {
        let mut stmt = conn.prepare("select * from keyboards WHERE id=?1").unwrap();
        Ok(stmt.query_row(params![id], |row| {
            let layer_string = row.get::<_,String>(5).unwrap(); 
            let row_string =  row.get::<_,String>(2).unwrap();
            let col_string =  row.get::<_,String>(3).unwrap();
            let layout_vec: Vec<String> = serde_json::from_str(&row.get::<_,String>(6).unwrap()).unwrap();
            let mut layout_hashmap = HashMap::<u8,String>::new();
            layout_vec.iter().for_each(|element| {let key_value:Vec<&str> = element.split("-").collect(); layout_hashmap.insert(key_value[0].parse::<u8>().unwrap(), key_value[1].to_string());});
            return Ok(
                Keyboard{
                id: row.get(0).unwrap(),
                name: row.get(1).unwrap(),
                row: row_string.split(",").map(|s| s.to_string()).collect(),
                column: col_string.split(",").map(|s| s.to_string()).collect(),
                orientation: row.get(4).unwrap(),
                layer: serde_json::from_str(&layer_string).unwrap(),
                layout: layout_hashmap,
                default_circuit_id: row.get(7).unwrap(),
//                img: row.get(6).unwrap(),
            })
        }).unwrap())
    }).await.unwrap()
    
}
//TODO handle kc0row
pub fn build_keyboard_html(keyboard: Keyboard, circuitboard_html: String) -> String{
    let mut proto_layers:Vec<String> = Vec::new();  
    let mut proto_tab = Vec::new();
    let mut proto_wiring = Vec::new();
    for (index,layer) in keyboard.layer.iter().enumerate(){
        let mut key_index:u8 = 0;
        let mut proto_layer = Vec::new();
        let to_hide = if index == 0 { "".to_string() } else { "hide".to_string() };
        let is_selected = if index == 0 { "tab-selected".to_string() } else { "".to_string() };
        proto_tab.push(format!(include_str!("../resources/tab.html"),is_selected, index, index, index + 1, index));
        for key_row in layer.chunks(keyboard.column.len()){
            proto_layer.push(format!(include_str!("../resources/row.html"),key_row.iter().map(|key|{ key_index +=1; format!(include_str!("../resources/key-button.html"),keyboard.layout.get(&(key_index-1)).unwrap_or(&"1".to_string()),key)}).collect::<Vec<_>>().join("\n")));
        }
        proto_layers.push(format!(include_str!("../resources/row-container.html"),index,to_hide,proto_layer.join("\n")));
    }
    let mut wiring_index:u8 = 0;
    for key_row_wiring in keyboard.layer[0].chunks(keyboard.column.len()){
        //TODO refactor so this uses the same file key0button.html as above
        //QUESTION do we want to reflect the keyboard for the wiring?
        proto_wiring.push(format!(include_str!("../resources/row.html"),key_row_wiring.iter().map(|key|{wiring_index +=1; format!(include_str!("../resources/key-button-wirable.html"),keyboard.layout.get(&(wiring_index-1)).unwrap_or(&"1".to_string()))}).collect::<Vec<_>>().join("\n")));
    }
    format!(include_str!("../resources/keyboard.html"),proto_tab.join("\n"), proto_layers.join("\n"),proto_wiring.join("\n"), circuitboard_html,"wiring","layout-editor here")

}
