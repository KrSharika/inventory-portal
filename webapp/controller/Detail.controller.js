sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../model/formatter"
], function (BaseController, JSONModel, Fragment, MessageBox, MessageToast, formatter) {
    "use strict";

    var REORDER_BATCH = 50;

    return BaseController.extend("novamart.inventory.controller.Detail", {

        formatter: formatter,

        onInit: function () {
            this.setModel(this.getModel("products"), "products");
            this.setModel(this.getModel("appView"), "appView");
            this.getRouter().getRoute("detail").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var sProductId = oEvent.getParameter("arguments").productId;
            var aProducts = this.getModel("products").getProperty("/products");
            var iIndex = aProducts.findIndex(function (p) { return p.productId === sProductId; });

            if (iIndex === -1) {
                this.getModel("appView").setProperty("/layout", "TwoColumnsBeginExpanded");
                this.getRouter().getTargets().display("notFound");
                return;
            }

            this._iIndex = iIndex;
            this.getView().bindElement({
                path: "/products/" + iIndex,
                model: "products"
            });

            this.getModel("appView").setProperty("/layout", "TwoColumnsBeginExpanded");
        },

        onNavBack: function () {
            this.getModel("appView").setProperty("/layout", "OneColumn");
            this.getRouter().navTo("list");
        },

        onEditProduct: function () {
            var oView = this.getView();
            var oContext = oView.getBindingContext("products");
            var oClone = JSON.parse(JSON.stringify(oContext.getObject()));
            var oTempModel = new JSONModel(oClone);

            if (!this._pAddEditDialog) {
                this._pAddEditDialog = Fragment.load({
                    id: oView.getId(),
                    name: "novamart.inventory.fragment.AddEditProduct",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    this._oDraftIndicator = Fragment.byId(oView.getId(), "draftIndicator");
                    this.attachUnsavedChangesGuard(oDialog);
                    return oDialog;
                }.bind(this));
            }
            this._pAddEditDialog.then(function (oDialog) {
                oDialog.setModel(oTempModel, "temp");
                oDialog.setBindingContext(oTempModel.createBindingContext("/"), "temp");
                this.resetDraftState();
                oDialog.open();
            }.bind(this));
        },

        onSaveProduct: function (oEvent) {
            var oDialog = oEvent.getSource().getParent();
            var oTempModel = oDialog.getModel("temp");
            var oUpdated = oTempModel.getData();

            if (!this._validateProduct(oDialog)) {
                MessageToast.show(this.getResourceBundle().getText("msgValidationError"));
                return;
            }

            var oProductsModel = this.getModel("products");
            oProductsModel.setProperty("/products/" + this._iIndex, oUpdated);
            oProductsModel.refresh(true);
            this.persistProducts();
            this._bDialogDirty = false;

            MessageToast.show(this.getResourceBundle().getText("msgSaved"));
            oDialog.close();
        },

        onCancelProduct: function (oEvent) {
            var oDialog = oEvent.getSource().getParent();
            if (this._bDialogDirty) {
                this._confirmDiscardChanges().then(function () {
                    this._bDialogDirty = false;
                    oDialog.close();
                }.bind(this), function () { /* stay open */ });
            } else {
                oDialog.close();
            }
        },

        _validateProduct: function (oDialog) {
            var bValid = true;
            var oData = oDialog.getModel("temp").getData();
            var sFragmentId = this.getView().getId();

            ["inputName", "inputCategory", "inputSku"].forEach(function (sId) {
                var oInput = Fragment.byId(sFragmentId, sId);
                var sField = sId.replace("input", "").toLowerCase();
                var sValue = oData[sField === "sku" ? "sku" : sField];
                if (oInput) {
                    if (!sValue) {
                        oInput.setValueState("Error");
                        bValid = false;
                    } else {
                        oInput.setValueState("None");
                    }
                }
            });

            var oPriceInput = Fragment.byId(sFragmentId, "inputPrice");
            var oStockInput = Fragment.byId(sFragmentId, "inputStock");
                if (oPriceInput) {
                if (isNaN(oData.price) || oData.price < 0) {
                    oPriceInput.setValueState("Error");
                    bValid = false;
                } else {
                    oPriceInput.setValueState("None");
                }
            }
            if (oStockInput) {
                if (isNaN(oData.stock) || oData.stock < 0) {
                    oStockInput.setValueState("Error");
                    bValid = false;
                } else {
                    oStockInput.setValueState("None");
                }
            }
            return bValid;
        },

        onDeleteProduct: function () {
            var that = this;
            MessageBox.confirm(
                this.getResourceBundle().getText("msgDeleteConfirmText"),
                {
                    title: this.getResourceBundle().getText("msgDeleteConfirmTitle"),
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            var oProductsModel = that.getModel("products");
                            var aProducts = oProductsModel.getProperty("/products");
                            aProducts.splice(that._iIndex, 1);
                            oProductsModel.setProperty("/products", aProducts);
                            oProductsModel.refresh(true);
                            that.persistProducts();

                            MessageToast.show(that.getResourceBundle().getText("msgDeleted"));
                            that.getModel("appView").setProperty("/layout", "OneColumn");
                            that.getRouter().navTo("list");
                        }
                    }
                }
            );
        },

        onReorder: function () {
            var oProductsModel = this.getModel("products");
            var sPath = "/products/" + this._iIndex + "/stock";
            var iCurrentStock = oProductsModel.getProperty(sPath);
            oProductsModel.setProperty(sPath, iCurrentStock + REORDER_BATCH);
            oProductsModel.setProperty(
                "/products/" + this._iIndex + "/lastUpdated",
                new Date().toISOString().slice(0, 10)
            );
            this.persistProducts();
            MessageToast.show(this.getResourceBundle().getText("msgReordered"));
        }
    });
});