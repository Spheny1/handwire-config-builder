#[derive(Debug)]
struct Keyboard {
    id: i32,
    name: String,
    layout: String,
    img: String,
}

pub fn get_keyboards(conn: &Connection) -> Result<()> {
    let mut stmnt = conn.prepare("SELECT * FROM keyboard);
    let keyboard_iter

}
