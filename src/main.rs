use axum::{response::Html, routing::get, Router, Server, middleware, extract::Extension, TypedHeader, response::IntoResponse, headers::ContentType};
use std::net::SocketAddr;
#[tokio::main]
async fn main() {
    let app = Router::new().route("/",get(index));
    let listener = SocketAddr::from(([127,0,0,1],3000));
    Server::bind(&listener).serve(app.into_make_service()).await.unwrap();
}

async fn index() -> impl IntoResponse {
    (TypedHeader(ContentType::html()),include_str!("../index.html"),)
}
