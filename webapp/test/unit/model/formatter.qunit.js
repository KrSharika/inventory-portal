sap.ui.define([
    "novamart/inventory/model/formatter"
], function (formatter) {
    "use strict";

    QUnit.module("formatter.js - statusState");

    QUnit.test("returns 'Error' when stock is exactly 0, regardless of threshold", function (assert) {
        assert.strictEqual(formatter.statusState(0, 10), "Error", "0 stock with a positive threshold is Error");
        assert.strictEqual(formatter.statusState(0, 0), "Error", "0 stock with 0 threshold is still Error");
    });

    QUnit.test("returns 'Warning' when stock is above 0 but at or below the reorder threshold", function (assert) {
        assert.strictEqual(formatter.statusState(5, 10), "Warning", "stock below threshold is Warning");
        assert.strictEqual(formatter.statusState(10, 10), "Warning", "stock equal to threshold is Warning");
    });

    QUnit.test("returns 'Success' when stock is above the reorder threshold", function (assert) {
        assert.strictEqual(formatter.statusState(11, 10), "Success", "stock just above threshold is Success");
        assert.strictEqual(formatter.statusState(1000, 5), "Success", "stock well above threshold is Success");
    });

    QUnit.module("formatter.js - currencyValue");

    QUnit.test("formats known currency codes with the correct symbol and two decimals", function (assert) {
        assert.strictEqual(formatter.currencyValue(1299, "INR"), "₹1299.00", "INR uses ₹ symbol");
        assert.strictEqual(formatter.currencyValue(49.5, "USD"), "$49.50", "USD uses $ symbol");
        assert.strictEqual(formatter.currencyValue(10, "EUR"), "€10.00", "EUR uses € symbol");
    });

    QUnit.test("falls back to the currency code itself when the symbol is unknown", function (assert) {
        assert.strictEqual(formatter.currencyValue(20, "GBP"), "GBP 20.00", "unknown currency falls back to code + space");
    });

    QUnit.test("returns an empty string when price is undefined or null", function (assert) {
        assert.strictEqual(formatter.currencyValue(undefined, "INR"), "", "undefined price returns empty string");
        assert.strictEqual(formatter.currencyValue(null, "INR"), "", "null price returns empty string");
    });
});