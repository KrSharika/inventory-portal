sap.ui.define([], function () {
    "use strict";

    var PRODUCTS_KEY = "novamart.inventory.products";
    var THEME_KEY = "novamart.inventory.theme";

    return {
        loadProducts: function () {
            try {
                var sData = window.localStorage.getItem(PRODUCTS_KEY);
                return sData ? JSON.parse(sData) : null;
            } catch (e) {
                return null;
            }
        },

        saveProducts: function (aProducts) {
            try {
                window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(aProducts));
                return true;
            } catch (e) {
                return false;
            }
        },

        loadTheme: function (sFallback) {
            try {
                return window.localStorage.getItem(THEME_KEY) || sFallback;
            } catch (e) {
                return sFallback;
            }
        },

        saveTheme: function (sTheme) {
            try {
                window.localStorage.setItem(THEME_KEY, sTheme);
                return true;
            } catch (e) {
                return false;
            }
        }
    };
});