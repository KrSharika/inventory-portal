sap.ui.define([
    "./BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("novamart.inventory.controller.NotFound", {

        onInit: function () {
           
        },

        onNavBack: function () {
            this.getModel("appView").setProperty("/layout", "OneColumn");
            this.getRouter().navTo("list");
        }
    });
});
