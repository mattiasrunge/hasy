"use strict";

define([
    "knockout",
    "lib/socket"
], function(ko, socket) {
    var Me = function() {
        var subscriptions = [];
        this.list = ko.observableArray();

        socket.on("connect", function() {
            subscriptions.forEach(function(subscription) {
                subscription.dispose();
            });
            subscriptions = [];

            socket.emit("getProperties", {}, function(error, list) {
                console.log("getProperties", list);

                list = list.map(function(property) {
                    console.log(property, property.value);
                    property.value = ko.observable(property.value);
                    property.disabled = ko.observable(false);

                    subscriptions.push(property.value.subscribe(function(value) {
                        property.disabled(true);
                        socket.emit("setProperty", { unitId: property.unitId, name: property.name, value: value }, function(error) {
                            property.disabled(false);

                            if (error) {
                                return console.error("Failed to set property", { unitId: property.unitId, name: property.name, value: value }, error);
                            }
                        });
                    }));

                    return property;
                }.bind(this));

                this.list(list);
            }.bind(this));
        }.bind(this));

        socket.on("propertyChange", function(data) {
            console.log("propertyChange", data);

            var property = this.list().filter(function(property) {
                return property.unitId === data.unitId && property.name === data.data.name;
            })[0];

            if (!property) {
                console.error("Got property change for unknown property", data);
                return;
            }

            property.value(data.data.newValue);
        }.bind(this));
    };

    return new Me();
});
