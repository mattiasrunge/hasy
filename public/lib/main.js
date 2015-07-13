"use strict";

define([
    "knockout",
    "mdl",
    "lib/properties",
    "components/list",
    "lib/bindings"
], function(ko, mdl, properties) {
    function Model() {
        this.properties = properties.list;
    }

    ko.applyBindings(new Model(), document.body);
});
