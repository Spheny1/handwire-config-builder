use axum::{response::Html, routing::{get, post}, Router, Server, middleware, extract, TypedHeader, response::IntoResponse, headers::ContentType, Extension};
use std::net::SocketAddr;
use tokio_rusqlite::{Connection};
use crate::keyboard::{get_keyboard_by_id, Keyboard};
use crate::download_config::generate_config_file;
use std::sync::Arc;
mod keyboard;
mod download_config;

struct State{
    connection: Connection,
}

#[tokio::main]
async fn main() {
    let state = Arc::new(State{ connection: Connection::open("/home/kyle/Workspace/handwire-config-builder/resources/local.db").await.expect("Couldnt open DB")}); 
    let app = Router::new().route("/",get(index))
        .route("/configdownload",post(config_handler))
        .route("/keycodes",get(keycode_handler))
        .layer(Extension(state));
  //      .route("/keyboard",get(keyboardHandler));
    let listener = SocketAddr::from(([127,0,0,1],3000));
    Server::bind(&listener).serve(app.into_make_service()).await.unwrap();
}

async fn index(connection: Extension<Arc<State>>) -> impl IntoResponse {
        //println!("{:?}", get_keyboard_by_id(&connection.connection, 0).await);    
    (TypedHeader(ContentType::html()),include_str!("../resources/index.html"),)
}

async fn config_handler(extract::Json(payload): extract::Json<Keyboard>) -> impl IntoResponse{
//    println!("{:?}", payload);
    let config_html = generate_config_file(payload);

    (TypedHeader(ContentType::html()), config_html)
}

async fn keycode_handler() -> impl IntoResponse{
    let options = include_str!("../resources/keycode.html");
    (TypedHeader(ContentType::html()),options)
}
//async fn keyboardHandler(Path(params) : Path<Vec<(String,String)>>) -> impl IntoResponse{
  // println!("{}", params[0].0); 
//}
