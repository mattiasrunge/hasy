"use strict";

define([
    "text!./template.html"
], function(template) {
    return {
        template: template,
        viewModel: function(params) {
            this.min = params.property.min;
            this.max = params.property.max;
            this.value = params.property.value;
            this.step = params.property.step;
            this.disabled = params.property.disabled;
        }
    };
});
