sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, Device, JSONModel) {
    "use strict";

    return UIComponent.extend("novamart.inventory.Component", {

        metadata: {
            manifest: "json"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            var oDeviceModel = new JSONModel(Device);
            oDeviceModel.setDefaultBindingMode("OneWay");
            this.setModel(oDeviceModel, "device");

            var oAppViewModel = new JSONModel({
                layout: "OneColumn",
                busy: true,
                productCount: 0
            });
            this.setModel(oAppViewModel, "appView");

            // "products" model is declared in manifest.json and auto-loads.
            // Hook its load events so the busy indicator reflects real timing.
            var oProductsModel = this.getModel("products");
            var oExistingData = oProductsModel.getData();

            if (oExistingData && oExistingData.products) {
                // Data already loaded synchronously before init() ran — clear busy now
                oAppViewModel.setProperty("/busy", false);
            } else {
                oProductsModel.attachRequestCompleted(function () {
                    oAppViewModel.setProperty("/busy", false);
                });
            }

            oProductsModel.attachRequestFailed(function () {
                oAppViewModel.setProperty("/busy", false);
                var oBundle = this.getModel("i18n").getResourceBundle();
                sap.m.MessageToast.show(oBundle.getText("msgLoadError"));
            }.bind(this));

            this.getRouter().initialize();
        },

        getContentDensityClass: function () {
            if (!this._sContentDensityClass) {
                this._sContentDensityClass = Device.support.touch ? "sapUiSizeCozy" : "sapUiSizeCompact";
            }
            return this._sContentDensityClass;
        }
    });
});