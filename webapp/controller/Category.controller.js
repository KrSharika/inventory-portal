sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("novamart.inventory.controller.Category", {

        onInit: function () {
            this.setModel(this.getModel("appView"), "appView");
            this.getRouter().getRoute("category").attachPatternMatched(this._onRouteMatched, this);

            // Build the category list immediately too, so it's populated even
            // when the app opens directly on a "products" or "detail" deep link
            // (e.g. browser refresh on category/Accessories) and the "category"
            // route's own pattern never matches.
            var oProductsModel = this.getModel("products");
            var oExistingData = oProductsModel.getData();
            if (oExistingData && oExistingData.products && oExistingData.products.length) {
                this._buildCategoryList();
            } else {
                oProductsModel.attachEventOnce("requestCompleted", this._buildCategoryList, this);
            }
        },

        _onRouteMatched: function () {
            this._buildCategoryList();
            this.getModel("appView").setProperty("/layout", "OneColumn");
            this.getModel("appView").setProperty("/categoryId", null);
        },

        _buildCategoryList: function () {
            var oResourceBundle = this.getResourceBundle();
            var aProducts = this.getModel("products").getProperty("/products") || [];
            var mByCategory = {};

            aProducts.forEach(function (oProduct) {
                var sCategory = oProduct.category || oResourceBundle.getText("uncategorizedLabel");
                if (!mByCategory[sCategory]) {
                    mByCategory[sCategory] = {
                        category: sCategory,
                        count: 0,
                        lowStockCount: 0,
                        outOfStockCount: 0
                    };
                }
                var oEntry = mByCategory[sCategory];
                oEntry.count++;
                if (oProduct.stock === 0) {
                    oEntry.outOfStockCount++;
                } else if (oProduct.stock <= oProduct.reorderThreshold) {
                    oEntry.lowStockCount++;
                }
            });

            var aCategories = Object.keys(mByCategory).sort().map(function (sKey) {
                var oEntry = mByCategory[sKey];
                if (oEntry.outOfStockCount > 0) {
                    oEntry.statusText = oEntry.outOfStockCount + " " + oResourceBundle.getText("statusOutOfStock");
                    oEntry.statusState = "Error";
                    oEntry.statusIcon = "sap-icon://message-error";
                } else if (oEntry.lowStockCount > 0) {
                    oEntry.statusText = oEntry.lowStockCount + " " + oResourceBundle.getText("statusLowStock");
                    oEntry.statusState = "Warning";
                    oEntry.statusIcon = "sap-icon://alert";
                } else {
                    oEntry.statusText = oResourceBundle.getText("statusAvailable");
                    oEntry.statusState = "Success";
                    oEntry.statusIcon = "sap-icon://sys-enter-2";
                }
                return oEntry;
            });

            this.setModel(new JSONModel({ categories: aCategories }), "categories");
        },

        onCategoryPress: function (oEvent) {
            var oItem = oEvent.getParameter("listItem");
            var oContext = oItem.getBindingContext("categories");
            var sCategoryId = oContext.getProperty("category");
            this.getRouter().navTo("products", { categoryId: sCategoryId });
        }
    });
});