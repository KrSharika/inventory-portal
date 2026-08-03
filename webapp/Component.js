sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "./util/Storage"
], function (UIComponent, Device, JSONModel, Storage) {
    "use strict";

    return UIComponent.extend("novamart.inventory.Component", {

        metadata: {
            manifest: "json"
        },

        init: function () {
            // apply any previously chosen theme before the shell renders
            var sTheme = Storage.loadTheme("sap_horizon");
            sap.ui.getCore().applyTheme(sTheme);

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

            // "products" model is declared in manifest.json and auto-loads from
            // model/products.json. If a persisted copy exists in localStorage
            // (from a prior add/edit/delete/reorder), it overrides the JSON
            // file so user changes survive a refresh.
            var oProductsModel = this.getModel("products");

            var fnApplyPersistedOverride = function () {
                var aSaved = Storage.loadProducts();
                if (aSaved) {
                    oProductsModel.setProperty("/products", aSaved);
                }
                oAppViewModel.setProperty("/busy", false);
            };

            var oExistingData = oProductsModel.getData();
            if (oExistingData && oExistingData.products) {
                fnApplyPersistedOverride();
            } else {
                oProductsModel.attachRequestCompleted(fnApplyPersistedOverride);
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