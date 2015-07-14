"use strict";

define([
    "text!./template.html",
    "knockout",
    "lib/properties"
], function(template, ko, properties) {
    return {
        template: template,
        viewModel: function(params) {
            this.property = ko.pureComputed(function() {
                return properties.list().filter(function(property) {
                    return property.unitId === ko.unwrap(params.unitId) && property.name === ko.unwrap(params.name);
                })[0] || false;
            });

            this.name = ko.pureComputed(function() {
                return ko.unwrap(params.unitId) + "_" + ko.unwrap(params.name);
            });
        }
    };
});
