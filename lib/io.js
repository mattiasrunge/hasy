"use strict";

let co = require("bluebird").coroutine;
let path = require("path");
let express = require("express");
let app = express();
let server = require("http").Server(app);
let io = require("socket.io")(server);
let logger = require("./logger")(module);
let properties = require("./properties");

module.exports = {
    start: co(function*(config) {
        // Serve static documents
        app.use(express.static(path.join(__dirname, "..", "public")));

        // Listen for events and distribute
        properties.onEvent(function(event, data) {
            io.emit(event, data);
        });

        // Setup client APIs
        io.on("connection", function(socket) {
            logger.info("A new websocket client connected from " + socket.handshake.address.address);

            socket.on("setProperty", function(data, callback) {
                callback = callback || function() {};

                if (!data.unitId || !data.name || typeof data.value === "undefined") {
                    console.error("Malformed setProperty data", data);
                    callback("Malformed setProperty data");
                    return;
                }

                properties.set(data.unitId, data.name, data.value).then(function() {
                    callback();
                });
            });

            socket.on("getProperties", function(data, callback) {
                callback(null, properties.list());
            });
        });

        // Start HTTP server
        server.listen(config.port);
        logger.info("Now listening for connections on " + config.port);
    })
};
