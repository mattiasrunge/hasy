"use strict";

define([
    "text!./template.html"
], function(template) {
    return {
        template: template,
        viewModel: function(params) {
            this.value = params.property.value;
            this.disabled = params.property.disabled;
        }
    };
});
