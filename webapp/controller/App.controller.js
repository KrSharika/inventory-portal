sap.ui.define([
    "./BaseController",
    "../util/Storage",
    "sap/m/Menu",
    "sap/m/MenuItem",
    "sap/ui/core/Theming"
], function (BaseController, Storage, Menu, MenuItem, Theming) {
    "use strict";

    return BaseController.extend("novamart.inventory.controller.App", {

        onInit: function () {
            var oAppViewModel = this.getModel("appView");
            this.getView().setModel(oAppViewModel, "appView");
        },

        onSettingsPress: function (oEvent) {
            if (!this._oThemeMenu) {
                var oResourceBundle = this.getResourceBundle();
                this._oThemeMenu = new Menu({
                    items: [
                        new MenuItem({ text: oResourceBundle.getText("themeMorningHorizon"), key: "sap_horizon" }),
                        new MenuItem({ text: oResourceBundle.getText("themeHorizonDark"), key: "sap_horizon_dark" })
                    ],
                    itemSelected: this.onThemeSelect.bind(this)
                });
                this.getView().addDependent(this._oThemeMenu);
            }
            this._markActiveTheme();
            this._oThemeMenu.openBy(oEvent.getSource());
        },

        _markActiveTheme: function () {
            var sActiveTheme = Theming.getTheme();
            this._oThemeMenu.getItems().forEach(function (oItem) {
                oItem.setIcon(oItem.getKey() === sActiveTheme ? "sap-icon://accept" : "");
            });
        },

        onThemeSelect: function (oEvent) {
            var sThemeKey = oEvent.getParameter("item").getKey();
            Theming.setTheme(sThemeKey);
            Storage.saveTheme(sThemeKey);
        }
    });
});