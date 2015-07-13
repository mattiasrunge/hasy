"use strict";

define([
    "knockout"
], function(ko) {
    var list = [
        "property-range",
        "property-enum",
        "property-switch"
    ];

    for (var n = 0; n < list.length; n++) {
        var modulePath = "components/" + list[n] + "/model";

        require([ modulePath ], (function(name) {
            return function(module) {
                if (!ko.components.isRegistered(name)) {
                    ko.components.register(name, module);
                }
            };
        })(list[n]));

        ko.components.register(list[n], { require: modulePath });
    }
});
