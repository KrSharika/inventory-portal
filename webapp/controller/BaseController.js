sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "../util/Storage"
], function (Controller, Fragment, JSONModel, Filter, FilterOperator, MessageBox, Storage) {
    "use strict";

    return Controller.extend("novamart.inventory.controller.BaseController", {

        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },

        getModel: function (sName) {
            return this.getOwnerComponent().getModel(sName);
        },

        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        // -----------------------------------------------------------
        // localStorage persistence - call after every mutation
        // (create/save/delete/reorder) so changes survive a refresh
        // -----------------------------------------------------------
        persistProducts: function () {
            var aProducts = this.getModel("products").getProperty("/products");
            Storage.saveProducts(aProducts);
        },

        // -----------------------------------------------------------
        // Draft indicator / unsaved-changes guard (Add/Edit dialog)
        // -----------------------------------------------------------
        resetDraftState: function () {
            this._bDialogDirty = false;
            if (this._oDraftIndicator) {
                this._oDraftIndicator.clear();
            }
        },

        onDraftFieldChange: function () {
            this._bDialogDirty = true;
            var oDraftIndicator = this._oDraftIndicator;
            if (!oDraftIndicator) {
                return;
            }
            oDraftIndicator.showDraftSaving();
            clearTimeout(this._iDraftTimeout);
            this._iDraftTimeout = setTimeout(function () {
                oDraftIndicator.showDraftSaved();
            }, 600);
        },

        attachUnsavedChangesGuard: function (oDialog) {
            var that = this;
            oDialog.setEscapeHandler(function (oPromiseWrapper) {
                if (that._bDialogDirty) {
                    that._confirmDiscardChanges().then(function () {
                        oPromiseWrapper.resolve();
                    }, function () {
                        oPromiseWrapper.reject();
                    });
                } else {
                    oPromiseWrapper.resolve();
                }
            });
        },

        _confirmDiscardChanges: function () {
            var oResourceBundle = this.getResourceBundle();
            return new Promise(function (resolve, reject) {
                MessageBox.warning(oResourceBundle.getText("msgUnsavedChanges"), {
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.NO,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.YES) {
                            resolve();
                        } else {
                            reject();
                        }
                    }
                });
            });
        },

        // -----------------------------------------------------------
        // Generic value help (category / supplier) for the Add/Edit dialog.
        // Triggering Input needs customData key="field" value="category"|"supplier".
        // -----------------------------------------------------------
        onValueHelpRequest: function (oEvent) {
            var oSource = oEvent.getSource();
            var sField = oSource.data("field");
            this._sValueHelpField = sField;
            this._oValueHelpTargetModel = oSource.getModel("temp");

            var oView = this.getView();
            if (!this._pValueHelpDialog) {
                this._pValueHelpDialog = Fragment.load({
                    id: oView.getId(),
                    name: "novamart.inventory.fragment.ValueHelp",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pValueHelpDialog.then(function (oDialog) {
                this._openValueHelp(oDialog, sField);
            }.bind(this));
        },

        _openValueHelp: function (oDialog, sField) {
            var oResourceBundle = this.getResourceBundle();
            var aProducts = this.getModel("products").getProperty("/products") || [];
            var aValues = Array.from(new Set(
                aProducts.map(function (oProduct) { return oProduct[sField]; }).filter(Boolean)
            )).sort();

            var aItems = aValues.map(function (sValue) {
                return { text: sValue };
            });

            oDialog.setModel(new JSONModel({ items: aItems }), "vh");
            oDialog.setTitle(sField === "category"
                ? oResourceBundle.getText("vhTitleCategory")
                : oResourceBundle.getText("vhTitleSupplier"));
            oDialog.open();
        },

        onValueHelpSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value") || "";
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter(sValue ? [new Filter("text", FilterOperator.Contains, sValue)] : []);
        },

        onValueHelpConfirm: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            oEvent.getSource().getBinding("items").filter([]);
            if (!oSelectedItem || !this._oValueHelpTargetModel) {
                return;
            }
            var sText = oSelectedItem.getTitle();
            this._oValueHelpTargetModel.setProperty("/" + this._sValueHelpField, sText);
            this.onDraftFieldChange();
        }
    });
});