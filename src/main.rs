use axum::{response::Html, routing::{get, post}, Router, Server, middleware, extract::Query, TypedHeader, response::IntoResponse, headers::ContentType, Extension};
use std::net::SocketAddr;
use base64::{encode};
use tokio_rusqlite::{Connection};
use crate::keyboard::get_keyboard_by_id;
use std::sync::Arc;
mod keyboard;

struct State{
    connection: Connection,
}

#[tokio::main]
async fn main() {
    let state = Arc::new(State{ connection: Connection::open("/home/kyle/Workspace/handwire-config-builder-htmx/resources/testdb.db").await.expect("Couldnt open DB")}); 
    let app = Router::new().route("/",get(index))
        .route("/configdownload",post(config_handler))
        .route("/keycodes",get(keycode_handler))
        .layer(Extension(state));
  //      .route("/keyboard",get(keyboardHandler));
    let listener = SocketAddr::from(([127,0,0,1],3000));
    Server::bind(&listener).serve(app.into_make_service()).await.unwrap();
}

async fn index(connection: Extension<Arc<State>>) -> impl IntoResponse {
        println!("{:?}", get_keyboard_by_id(&connection.connection, 0).await);    
    (TypedHeader(ContentType::html()),include_str!("../resources/index.html"),)
}

async fn config_handler(body: String) -> impl IntoResponse{
     //println!("{}", body); 
    let row_pins = "(board.GP14, board.GP15, board.GP16, board.GP17, board.GP18)";
    let col_pins = "(board.GP0, board.GP1, board.GP2, board.GP3, board.GP4, board.GP5, board.GP6, board.GP7, board.GP8, board.GP9, board.GP10, board.GP11, board.GP12, board.GP13)";
    let keymaps = "[ \n     #Layer 0 - base layer \n     [KC.ESC   ,KC.N1    ,KC.N2    ,KC.N3    ,KC.N4    ,KC.N5    ,KC.N6    ,KC.N7    ,KC.N8    ,KC.N9    ,KC.N0    ,KC.MINUS ,KC.EQUAL ,KC.BKSP  , \n      KC.TAB   ,KC.Q     ,KC.W     ,KC.E     ,KC.R     ,KC.T     ,KC.Y     ,KC.U     ,KC.I     ,KC.O     ,KC.P     ,KC.LBRC  ,KC.RBRC  ,KC.BSLASH, \n      KC.CAPS  ,KC.A     ,KC.S     ,KC.D     ,KC.F     ,KC.G     ,KC.H     ,KC.J     ,KC.K     ,KC.L     ,KC.SCLN  ,KC.QUOT  ,KC.NO    ,KC.ENTER , \n      KC.LSHIFT,KC.NO    ,KC.Z     ,KC.X     ,KC.C     ,KC.V     ,KC.B     ,KC.N     ,KC.M     ,KC.COMM  ,KC.DOT   ,KC.SLSH  ,KC.SLSH  ,KC.RSHIFT, \n      KC.LCTRL ,KC.LGUI  ,KC.MO(1) ,KC.NO    ,KC.NO    ,KC.NO    ,KC.SPACE ,KC.NO    ,KC.NO    ,KC.NO    ,KC.RALT  ,KC.NO    ,KC.RGUI  ,KC.RCTRL ], \n     #Layer 1 - function layer left \n     [KC.TILDE ,KC.F1    ,KC.F2    ,KC.F3    ,KC.F4    ,KC.F5    ,KC.F6    ,KC.F7    ,KC.F8    ,KC.F9    ,KC.F10   ,KC.F11   ,KC.F12   ,KC.DELETE, \n      KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.UP    ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  , \n      KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.LEFT  ,KC.DOWN  ,KC.RIGHT ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  , \n      KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  , \n      KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ,KC.RALT  ,KC.TRNS  ,KC.TRNS  ,KC.TRNS  ] \n ] ";
    let configfile = format!("print(\"Starting\") \n import board \n import supervisor \n import board \n import digitalio \n import storage \n import usb_cdc \n import usb_hid \n from kmk.kmk_keyboard import KMKKeyboard \n from kmk.keys import KC \n from kmk.scanners import DiodeOrientation \n from kmk.modules.layers import Layers \n keyboard = KMKKeyboard() \n layers = Layers() \n keyboard.row_pins = {row_pins} # Cols \n keyboard.col_pins = {col_pins}            # Rows \n keyboard.diode_orientation = DiodeOrientation.COL2ROW \n # Keymap \n keyboard.keymap {keymaps} = \n if __name__ == '__main__': \n keyboard.go");
    let config_html = format!(include_str!("../resources/config-button.html"), String::from("data:application/octet-stream;charset=utf-8;base64,") + &encode(configfile));
//    println!("{}", config_html);

    (TypedHeader(ContentType::html()), config_html)
}

async fn keycode_handler() -> impl IntoResponse{
    let options = include_str!("../resources/keycode.html");
    (TypedHeader(ContentType::html()),options)
}
//async fn keyboardHandler(Path(params) : Path<Vec<(String,String)>>) -> impl IntoResponse{
  // println!("{}", params[0].0); 
//}
