jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"de/asr/library/booksdbapp/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"de/asr/library/booksdbapp/test/integration/pages/App",
	"de/asr/library/booksdbapp/test/integration/pages/Browser",
	"de/asr/library/booksdbapp/test/integration/pages/Master",
	"de/asr/library/booksdbapp/test/integration/pages/Detail",
	"de/asr/library/booksdbapp/test/integration/pages/NotFound"
], function(Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "de.asr.library.booksdbapp.view."
	});

	sap.ui.require([
		"de/asr/library/booksdbapp/test/integration/NavigationJourneyPhone",
		"de/asr/library/booksdbapp/test/integration/NotFoundJourneyPhone",
		"de/asr/library/booksdbapp/test/integration/BusyJourneyPhone"
	], function() {
		QUnit.start();
	});
});