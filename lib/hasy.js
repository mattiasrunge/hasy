"use strict";

let promisifyAll = require("bluebird").promisifyAll;
let co = require("bluebird").coroutine;
let fs = promisifyAll(require("fs"));
let path = require("path");
let express = require("express");
let app = express();
let server = require("http").Server(app);
let io = require("socket.io")(server);
let Unit = require("./unit");
let logger = require("./logger")(module);

module.exports = function() {
    this.units = {};
    this.config = {};

    this.loadConfiguration = co(function*(file) {
        file = path.resolve(file || path.join(__dirname, "..", "conf", "config.json"));

        this.config = JSON.parse(yield fs.readFileAsync(file, "utf8"));

        logger.info("Configuration loaded successfully from " + file);

        // Default values
        this.config.port = this.config.port || 3000;
        this.config.units = this.config.units || {};
    }, this);

    this.loadUnits = co(function*() {
        for (let unitId of Object.keys(this.config.units)) {
            if (!this.config.units[unitId].type || !this.config.units[unitId].name) {
                throw new Error("Missing type or name from unit declaration in configuration: " + JSON.stringify(this.config.units[unitId], null, 2));
            }

            logger.info("Initializing unit " + this.config.units[unitId].name + " of type " + this.config.units[unitId].type + "...");

            this.units[unitId] = {
                unitId: unitId,
                type: this.config.units[unitId].type,
                name: this.config.units[unitId].name,
                instance: new Unit(this.config.units[unitId])
            };
        }
    }, this);

    this.startServer = co(function*() {
        // Serve static documents
        app.use(express.static(path.join(__dirname, "..", "public")));

        // Start units
        for (let unitId of Object.keys(this.units)) {
            logger.info("Setting up unit " + this.units[unitId].name + "...");
            yield this.units[unitId].instance.setup();

            // Setup unit to client events
            this.units[unitId].instance.onEvent(function(event, data) {
                io.emit(event, { unitId: unitId, data: data });
            });
        }

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

                this.units[data.unitId].instance.setProperty(data.name, data.value).then(function() {
                    callback();
                });
            }.bind(this));

            socket.on("getProperties", function(data, callback) {
                let list = [];

                Object.keys(this.units).forEach(function(unitId) {
                    Object.keys(this.units[unitId].instance.getProperties()).forEach(function(name) {
                        let property = {
                            name: name,
                            unitId: unitId,
                            unitType: this.units[unitId].type,
                            unitName: this.units[unitId].name
                        };

                        for (let key in this.units[unitId].instance.getProperties()[name]) {
                            if (this.units[unitId].instance.getProperties()[name].hasOwnProperty(key)) {
                                property[key] = this.units[unitId].instance.getProperties()[name][key];
                            }
                        }

                        list.push(property);
                    }.bind(this));
                }.bind(this));

                callback(list);
            }.bind(this));
        }.bind(this));

        // Start HTTP server
        server.listen(this.config.port);
    }, this);

    this.start = co(function*(argv) {
        try {
            yield this.loadConfiguration(argv.config);

            yield this.loadUnits();

            yield this.startServer();

            logger.info("Hasy initialized!");
        } catch (error) {
            console.error(error);
            console.error(error.stack);
            process.exit(255);
        }
    }, this);
};
