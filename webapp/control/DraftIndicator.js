sap.ui.define([
    "sap/m/ObjectStatus"
], function (ObjectStatus) {
    "use strict";

    /**
     * Small ObjectStatus subclass used as the unsaved-changes / draft
     * indicator in the Add/Edit product dialog. Text is passed in by the
     * caller (already resolved from the resource bundle) so this control
     * has no i18n dependency of its own.
     */
    return ObjectStatus.extend("novamart.inventory.control.DraftIndicator", {

        clear: function () {
            this.setText("");
            this.setIcon("");
            this.setState("None");
            return this;
        },

        showDraftSaving: function (sText) {
            this.setText(sText);
            this.setIcon("sap-icon://pending");
            this.setState("Warning");
            return this;
        },

        showDraftSaved: function (sText) {
            this.setText(sText);
            this.setIcon("sap-icon://accept");
            this.setState("Success");
            return this;
        }
    });
});