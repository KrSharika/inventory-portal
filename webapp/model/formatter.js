sap.ui.define([
    "sap/ui/core/format/DateFormat"
], function (DateFormat) {
    "use strict";

    return {

        statusState: function (iStock, iThreshold) {
            if (iStock === 0) {
                return "Error";
            } else if (iStock <= iThreshold) {
                return "Warning";
            }
            return "Success";
        },

        statusText: function (iStock, iThreshold, sAvailable, sLow, sOut) {
            if (iStock === 0) {
                return sOut;
            } else if (iStock <= iThreshold) {
                return sLow;
            }
            return sAvailable;
        },

        statusIcon: function (iStock, iThreshold) {
            if (iStock === 0) {
                return "sap-icon://sys-cancel";
            } else if (iStock <= iThreshold) {
                return "sap-icon://alert";
            }
            return "sap-icon://sys-enter-2";
        },

        currencyValue: function (fPrice, sCurrency) {
            if (fPrice === undefined || fPrice === null) {
                return "";
            }
            var sSymbol = sCurrency === "USD" ? "$" : (sCurrency || "");
            return sSymbol + parseFloat(fPrice).toFixed(2);
        },

        dateMedium: function (sDate) {
            if (!sDate) {
                return "";
            }
            var oDate = new Date(sDate);
            if (isNaN(oDate.getTime())) {
                return sDate;
            }
            var oFormat = DateFormat.getDateInstance({ style: "medium" });
            return oFormat.format(oDate);
        }
    };
});
