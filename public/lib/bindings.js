"use strict";

define([
    "knockout"
], function(ko) {
    ko.bindingHandlers.slider = {
        init: function(element, valueAccessor) {
            var value = ko.unwrap(valueAccessor());

            componentHandler.upgradeElement(element, "MaterialSlider");

            var s = value.disabled.subscribe(function(value) {
                if (value) {
                    element.MaterialSlider.disable();
                } else {
                    element.MaterialSlider.enable();
                }
            });

            element.MaterialSlider.change(ko.unwrap(value.value));

            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                downgradeElements(element.MaterialSlider);
                s.dispose();
            });

            element.addEventListener("change", function(event) {
                value.value(element.value);
            });
        },
        update: function(element, valueAccessor, allBindings) {
            var value = ko.unwrap(valueAccessor());
            element.MaterialSlider.change(ko.unwrap(value.value));
        }
    };

    ko.bindingHandlers.radio = {
        init: function(element, valueAccessor) {
            var value = ko.unwrap(valueAccessor());

            componentHandler.upgradeElement(element, "MaterialRadio");

            var s = value.disabled.subscribe(function(value) {
                if (value) {
                    element.MaterialRadio.disable();
                } else {
                    element.MaterialRadio.enable();
                }
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                downgradeElements(element.MaterialRadio);
                s.dispose();
            });
        },
        update: function(element, valueAccessor, allBindings) {
            var value = ko.unwrap(valueAccessor());
            if (ko.unwrap(value.checked)) {
                element.MaterialRadio.check();
            } else {
                element.MaterialRadio.uncheck();
            }
        }
    };

    ko.bindingHandlers.switch = {
        init: function(element, valueAccessor) {
            var value = ko.unwrap(valueAccessor());

            componentHandler.upgradeElement(element, "MaterialSwitch");

            var s = value.disabled.subscribe(function(value) {
                if (value) {
                    element.MaterialSwitch.disable();
                } else {
                    element.MaterialSwitch.enable();
                }
            });

            if (ko.unwrap(value.value)) {
                element.MaterialSwitch.on();
            } else {
                element.MaterialSwitch.off();
            }

            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                downgradeElements(element.MaterialSwitch);
                s.dispose();
            });
        },
        update: function(element, valueAccessor, allBindings) {
            var value = ko.unwrap(valueAccessor());
            if (ko.unwrap(value.value)) {
                element.MaterialSwitch.on();
            } else {
                element.MaterialSwitch.off();
            }
        }
    };

    ko.bindingHandlers.textfield = {
        init: function(element, valueAccessor) {
            var value = ko.unwrap(valueAccessor());

            componentHandler.upgradeElement(element, "MaterialTextfield");

            var s = value.disabled.subscribe(function(value) {
                if (value) {
                    element.MaterialTextfield.disable();
                } else {
                    element.MaterialTextfield.enable();
                }
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                downgradeElements(element.MaterialTextfield);
                s.dispose();
            });
        }
    };
});
