use crate::keyboard::Keyboard;
use base64::{encode};
pub fn generate_config_file(keyboard : Keyboard) -> String{
    //TODO Get the prefixes stored and retrieved from the DB for kmk and qmk maybe even my rmk
    let io_prefix = "board.GP";
    let key_prefix = "KC.";
    //let kmk_elem_len = 9;
    let row_pins = format!("({})",keyboard.row.iter().map(|pin| format!("{}{}",io_prefix,pin)).collect::<Vec<_>>().join(","));
    let col_pins = format!("({})",keyboard.column.iter().map(|pin| format!("{}{}",io_prefix,pin)).collect::<Vec<_>>().join(","));
    let mut proto_layout = Vec::new();  
    for key_row in keyboard.layout[0].chunks(keyboard.column.len()){
        proto_layout.push(format!("[{}]",key_row.iter().map(|key| format!("{}{}",key_prefix,key)).collect::<Vec<_>>().join(",")));
    }
    let keymaps = format!("[{}]",proto_layout.join(",\n"));

    let configfile = format!("print(\"Starting\") \n import board \n import supervisor \n import board \n impor00t digitalio \n import storage \n import usb_cdc \n import usb_hid \n from kmk.kmk_keyboard import KMKKeyboard \n from kmk.keys import KC \n from kmk.scanners import DiodeOrientation \n from kmk.modules.layers import Layers \n keyboard = KMKKeyboard() \n layers = Layers() \n keyboard.row_pins = {row_pins} # Cols \n keyboard.col_pins = {col_pins}            # Rows \n keyboard.diode_orientation = DiodeOrientation.{0} \n # Keymap \n keyboard.keymap = {keymaps} = \n if __name__ == '__main__': \n keyboard.go",keyboard.orientation);
    format!(include_str!("../resources/config-button.html"), String::from("data:application/octet-stream;charset=utf-8;base64,") + &encode(configfile))
}
