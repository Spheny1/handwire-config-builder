use axum::{routing::{get, post}, Router, Server,  extract, TypedHeader, response::IntoResponse, headers::ContentType, Extension};
use std::net::SocketAddr;
use tokio_rusqlite::{Connection};
use crate::keyboard::{get_keyboard_by_id, Keyboard, build_keyboard_html};
use crate::download_config::generate_config_file;
use crate::circuitboard::{get_circuitboard_by_id, Circuitboard, build_circuitboard_html};
use std::sync::Arc;
use serde::{Deserialize};
use tower_http::{services::{ServeDir}};

mod keyboard;
mod download_config;
mod circuitboard;

struct State{
    connection: Connection,
}

#[tokio::main]
async fn main() {
    let state = Arc::new(State{ connection: Connection::open("/home/kyle/Workspace/handwire-config-builder/resources/local.db").await.expect("Couldnt open DB")}); 
    let app = Router::new()
        //.route("/",ServeDir::new("resources/index"))
        .route("/configdownload",post(config_handler))
        .route("/keycodes",get(keycode_handler))
        .route("/keyboard",get(keyboard_handler))
        .route("/circuitboard",get(circuitboard_handler))
        .nest_service("/",ServeDir::new("resources/index"))
        .layer(Extension(state));
  //      .route("/keyboard",get(keyboardHandler));
    let listener = SocketAddr::from(([127,0,0,1],3000));
    Server::bind(&listener).serve(app.into_make_service()).await.unwrap();
}

async fn index() -> impl IntoResponse {
       (TypedHeader(ContentType::html()),include_str!("../resources/index/index.html"),)
}

async fn config_handler(extract::Json(payload): extract::Json<Keyboard>) -> impl IntoResponse{
    let config_html = generate_config_file(payload);

    (TypedHeader(ContentType::html()), config_html)
}

async fn keycode_handler() -> impl IntoResponse{
    let options = include_str!("../resources/keycode.html");
    (TypedHeader(ContentType::html()),options)
}

//TODO find a better way to do this having an extra struct per query seems bad
#[derive(Deserialize)]
struct KeyboardParams{
    id: u32,
}
async fn keyboard_handler( connection: Extension<Arc<State>>) -> impl IntoResponse{
    let keyboard_params: KeyboardParams = KeyboardParams{id:0};
    let keyboard = get_keyboard_by_id(&connection.connection, keyboard_params.id).await;
    //println!("{:?}", keyboard);   
    (TypedHeader(ContentType::html()), build_keyboard_html(keyboard)) 
    
}
#[derive(Deserialize)]
struct CircuitParams{
    id: u32,
}
async fn circuitboard_handler( connection: Extension<Arc<State>>) -> impl IntoResponse{
    let circuitboard_params: CircuitParams = CircuitParams{id:0};
    let circuitboard = get_circuitboard_by_id(&connection.connection, circuitboard_params.id).await;

    (TypedHeader(ContentType::html()), build_circuitboard_html(circuitboard))
}
//async fn keyboardHandler(Path(params) : Path<Vec<(String,String)>>) -> impl IntoResponse{
  // println!("{}", params[0].0); 
//}
