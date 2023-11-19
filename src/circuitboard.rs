use rusqlite::{params};
use tokio_rusqlite::{Connection};
use serde::{Serialize, Deserialize};
use serde_json::Result;
#[derive(Debug, Serialize, Deserialize)]
pub struct Circuitboard {
    pub id: i32,
    pub name: String,
    pub ports: Vec<String>,
//    img: String,
}

pub async fn get_circuitboard_by_id(conn: &Connection, id: u32) -> Circuitboard {
    conn.call(move |conn| {
        let mut stmt = conn.prepare("select * from circuitboards WHERE id=?1").unwrap();
        Ok(stmt.query_row(params![id], |row| {
            let ports_string = row.get::<_,String>(2).unwrap(); 
            return Ok(
                Circuitboard{
                id: row.get(0).unwrap(),
                name: row.get(1).unwrap(),
                ports: ports_string.split(",").map(|s| s.to_string()).collect(),
//                img: row.get(4).unwrap(),
            })
        }).unwrap())
    }).await.unwrap()
    
}
//TODO it has a bracket on the first and last element
pub fn build_circuitboard_html(circuitboard: Circuitboard) -> String{
    let mut proto_circuit_gpio = Vec::new();
    println!("{:?}", circuitboard.ports);
    for(index, gpio) in circuitboard.ports.iter().enumerate(){
        proto_circuit_gpio.push(format!(include_str!("../resources/circuit-row.html"), index.to_string(), gpio));
    }
    format!(include_str!("../resources/col-container.html"),proto_circuit_gpio.join("\n"))
}

