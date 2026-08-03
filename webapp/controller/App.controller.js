
sap.ui.define([
    "./BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("novamart.inventory.controller.App", {

        onInit: function () {
            var oAppViewModel = this.getModel("appView");
            this.getView().setModel(oAppViewModel, "appView");
        }
    });
});
