
sap.ui.define([
    "./BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "../model/formatter"
], function (BaseController, Filter, FilterOperator, Sorter, JSONModel, Fragment, formatter) {
    "use strict";

    return BaseController.extend("novamart.inventory.controller.List", {

        formatter: formatter,

        onInit: function () {
            var oList = this.byId("productList");
            var oProductsModel = this.getModel("products");
            this.setModel(oProductsModel, "products");
            this.setModel(this.getModel("appView"), "appView");
            this.setModel(this.getModel("i18n"), "i18n");

            oProductsModel.attachRequestCompleted(this._updateCount.bind(this));
            this._updateCount();

            this._oList = oList;
            this._aSearchFilters = [];
            this._aViewSettingsFilters = [];
        },

        _updateCount: function () {
            var aProducts = this.getModel("products").getProperty("/products") || [];
            var oBinding = this._oList ? this._oList.getBinding("items") : null;
            var iCount = oBinding ? oBinding.getLength() : aProducts.length;
            this.getModel("appView").setProperty("/productCount", iCount);
        },

        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue") || oEvent.getParameter("query") || "";
            this._aSearchFilters = sQuery ? [
                new Filter({
                    filters: [
                        new Filter("name", FilterOperator.Contains, sQuery),
                        new Filter("category", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                })
            ] : [];
            this._applyAllFilters();
        },

        _applyAllFilters: function () {
            var oBinding = this._oList.getBinding("items");
            var aCombined = this._aSearchFilters.concat(this._aViewSettingsFilters);
            oBinding.filter(aCombined);
            this._updateCount();
        },

        onOpenViewSettings: function () {
            var oView = this.getView();
            if (!this._pViewSettingsDialog) {
                this._pViewSettingsDialog = Fragment.load({
                    id: oView.getId(),
                    name: "novamart.inventory.fragment.ViewSettings",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pViewSettingsDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        onConfirmViewSettings: function (oEvent) {
            var mParams = oEvent.getParameters();
            var oBinding = this._oList.getBinding("items");
            var aSorters = [];

            if (mParams.sortItem) {
                var sPath = mParams.sortItem.getKey();
                aSorters.push(new Sorter(sPath, mParams.sortDescending));
            }
            if (mParams.groupItem) {
                var sGroupPath = mParams.groupItem.getKey();
                aSorters.unshift(new Sorter(sGroupPath, false, true));
            }

            oBinding.sort(aSorters);
            this._aViewSettingsFilters = this._buildStatusAndPriceFilters(mParams.filterItems);
            this._applyAllFilters();
        },

        _buildStatusAndPriceFilters: function (aFilterItems) {
            var aFilters = [];
            aFilterItems.forEach(function (oItem) {
                var sKey = oItem.getKey();
                if (sKey === "Available") {
                    aFilters.push(new Filter({
                        path: "",
                        test: function (o) { return o.stock > o.reorderThreshold; }
                    }));
                } else if (sKey === "LowStock") {
                    aFilters.push(new Filter({
                        path: "",
                        test: function (o) { return o.stock > 0 && o.stock <= o.reorderThreshold; }
                    }));
                } else if (sKey === "OutOfStock") {
                    aFilters.push(new Filter("stock", FilterOperator.EQ, 0));
                } else if (sKey === "Under50") {
                    aFilters.push(new Filter("price", FilterOperator.LT, 50));
                } else if (sKey === "50to200") {
                    aFilters.push(new Filter("price", FilterOperator.BT, 50, 200));
                } else if (sKey === "Over200") {
                    aFilters.push(new Filter("price", FilterOperator.GT, 200));
                }
            });
            return aFilters.length ? [new Filter({ filters: aFilters, and: false })] : [];
        },

        onProductPress: function (oEvent) {
            var oItem = oEvent.getParameter("listItem");
            var oContext = oItem.getBindingContext("products");
            var sProductId = oContext.getProperty("productId");
            this.getRouter().navTo("detail", { productId: sProductId });
        },

        onAddProduct: function () {
            var oView = this.getView();
            var oEmptyProduct = {
                __isNew: true,
                productId: "P-" + Date.now(),
                name: "",
                category: "",
                sku: "",
                price: 0,
                currency: "USD",
                stock: 0,
                reorderThreshold: 5,
                supplier: "",
                warehouse: "",
                description: "",
                imageUrl: "",
                lastUpdated: new Date().toISOString().slice(0, 10)
            };
            var oTempModel = new JSONModel(oEmptyProduct);
            this._bMode = "create";

            if (!this._pAddEditDialog) {
                this._pAddEditDialog = Fragment.load({
                    id: oView.getId(),
                    name: "novamart.inventory.fragment.AddEditProduct",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pAddEditDialog.then(function (oDialog) {
                oDialog.setModel(oTempModel, "temp");
                oDialog.setBindingContext(oTempModel.createBindingContext("/"), "temp");
                oDialog.open();
            });
        },

        onSaveProduct: function (oEvent) {
            var oDialog = oEvent.getSource().getParent();
            var oTempModel = oDialog.getModel("temp");
            var oProduct = oTempModel.getData();

            if (!this._validateProduct(oDialog)) {
                sap.m.MessageToast.show(this.getResourceBundle().getText("msgValidationError"));
                return;
            }

            var oProductsModel = this.getModel("products");
            var aProducts = oProductsModel.getProperty("/products");

            delete oProduct.__isNew;

            if (this._bMode === "create") {
                aProducts.push(oProduct);
            } else {
                var iIndex = aProducts.findIndex(function (p) { return p.productId === oProduct.productId; });
                if (iIndex > -1) {
                    aProducts[iIndex] = oProduct;
                }
            }
            oProductsModel.setProperty("/products", aProducts);
            oProductsModel.refresh(true);
            this._updateCount();

            sap.m.MessageToast.show(this.getResourceBundle().getText("msgSaved"));
            oDialog.close();
        },

        onCancelProduct: function (oEvent) {
            oEvent.getSource().getParent().close();
        },

        _validateProduct: function (oDialog) {
            var bValid = true;
            var oData = oDialog.getModel("temp").getData();
            var sFragmentId = this.getView().getId();

            var mFieldsToCheck = {
                "inputName": oData.name,
                "inputCategory": oData.category,
                "inputSku": oData.sku
            };
            Object.keys(mFieldsToCheck).forEach(function (sId) {
                var oInput = sap.ui.core.Fragment.byId(sFragmentId, sId);
                if (oInput) {
                    if (!mFieldsToCheck[sId]) {
                        oInput.setValueState("Error");
                        bValid = false;
                    } else {
                        oInput.setValueState("None");
                    }
                }
            });

            var oPriceInput = sap.ui.core.Fragment.byId(sFragmentId, "inputPrice");
            var oStockInput = sap.ui.core.Fragment.byId(sFragmentId, "inputStock");
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
        }
    });
});
