"use strict";

define([
    "text!./template.html"
], function(template) {
    return {
        template: template,
        viewModel: function(params) {
            this.values = params.property.values;
            this.value = params.property.value;
            this.name = params.property.unitId + "_" + params.property.name;
            this.disabled = params.property.disabled;
        }
    };
});
