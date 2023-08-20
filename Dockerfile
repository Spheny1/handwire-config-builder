FROM rust:1.71 as build

# create a new empty shell project
RUN USER=root cargo new --bin handwire-config-builder
WORKDIR /handwire-config-builder

# copy over your manifests
COPY ./Cargo.lock ./Cargo.lock
COPY ./Cargo.toml ./Cargo.toml


# this build step will cache your dependencies
RUN rm src/*.rs

# copy your source tree
COPY ./src ./src
COPY ./resources ./resources
# build for release
#RUN rm ./target/release/deps/my_project*
RUN cargo build --release
# our final base
FROM debian:bookworm-slim
WORKDIR /app
# copy the build artifact from the build stage
COPY --from=build /handwire-config-builder/target/release/handwire-config-builder ./handwire-config-builder

EXPOSE 3000
# set the startup command to run your binary
#CMD ls -l /app
ENTRYPOINT ["/app/handwire-config-builder"]
