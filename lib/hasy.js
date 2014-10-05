
var fs = require('fs');
var path = require("path");
var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

var LgTV = require("./units/lgtv/index");

module.exports = function() {
    this.units = {};
    this.config = {};

    this.loadConfiguration = function(file, callback) {
        file = path.resolve(file || path.join(__dirname, "..", "conf", "config.json"));

        fs.readFile(file, "utf8", function(error, data) {
            if (error) {
                callback(error);
                return;
            }

            try {
                this.config = JSON.parse(data);
            } catch (e) {
                callback(e.toString());
                return;
            }

            console.log("Configuration loaded successfully from " + file);

            // Default values
            this.config.port = this.config.port || 3000;
            this.config.units = this.config.units || {};

            callback();
        }.bind(this));
    };

    this.loadUnits = function(callback) {
        for (var unitId in this.config.units) {
            if (this.config.units.hasOwnProperty(unitId)) {
                if (!this.config.units[unitId].type || !this.config.units[unitId].name) {
                    callback("Missing type or name from unit declaration in configuration", this.config.units[unitId]);
                    return;
                }

                var Type = require("./units/" + this.config.units[unitId].type + "/index");

                this.units[unitId] = {
                    unitId: unitId,
                    type: this.config.units[unitId].type,
                    name: this.config.units[unitId].name,
                    instance: new Type(this.config.units[unitId])
                };
            }
        }

        callback();
    };

    this.startServer = function(callback) {
        // Serve static documents
        app.use(express.static(path.join(__dirname, "..", "public")));

        // Start units
        for (var unitId in this.units) {
            if (this.units.hasOwnProperty(unitId)) {
                this.units[unitId].instance.setup();

                // Setup unit to client events
                this.units[unitId].instance.onEvent(function(event, data, actionId) {
                    io.emit(event, { unitId: unitId, data: data, actionId: actionId });
                });
            }
        }

        // Setup client APIs
        io.on("connection", function(socket) {
            console.log("A new websocket client connected!");

            socket.on("setProperty", function(data) {
                if (!data.unitId || !data.name || typeof data.value === "undefined") {
                    console.error("Malformed setProperty data", data);
                    return;
                }

                this.units[data.unitId].instance.setProperty(data.name, data.value, data.actionId);
            }.bind(this));

            socket.on("getUnits", function(data, callback) {
                var list = {};

                for (var unitId in this.units) {
                    if (this.units.hasOwnProperty(unitId)) {
                        list[unitId] = {
                            unitId: unitId,
                            name: this.units[unitId].name,
                            type: this.units[unitId].type
                        };

                        list[unitId].properties = {};

                        Object.keys(this.units[unitId].instance.getProperties()).forEach(function(name) {
                            list[unitId].properties[name] = {
                                name: name,
                                value: this.units[unitId].instance.getProperties()[name].value,
                                type: this.units[unitId].instance.getProperties()[name].type
                            };
                        }.bind(this));
                    }
                }

                callback(list);
            }.bind(this));
        }.bind(this));

        // Start HTTP server
        server.listen(this.config.port);
    };

    this.start = function(argv) {
        this.loadConfiguration(argv.config, function(error) {
            if (error) {
                console.error("Failed to load configuration, error: ", error);
                process.exit(255);
            }

            this.loadUnits(function(error) {
                if (error) {
                    console.error("Failed to load units, error: ", error);
                    process.exit(255);
                }

                this.startServer(function(error) {
                    if (error) {
                        console.error("Failed to start server, error: ", error);
                        process.exit(255);
                    }

                    console.log("Hasy initialized!");
                }.bind(this));
            }.bind(this));
        }.bind(this));
    };
};
