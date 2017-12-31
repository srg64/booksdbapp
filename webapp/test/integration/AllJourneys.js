jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 Books in the list
// * All 3 Books have at least one AuthorDetails

sap.ui.require([
	"sap/ui/test/Opa5",
	"de/asr/library/booksdbapp/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"de/asr/library/booksdbapp/test/integration/pages/App",
	"de/asr/library/booksdbapp/test/integration/pages/Browser",
	"de/asr/library/booksdbapp/test/integration/pages/Master",
	"de/asr/library/booksdbapp/test/integration/pages/Detail",
	"de/asr/library/booksdbapp/test/integration/pages/Create",
	"de/asr/library/booksdbapp/test/integration/pages/NotFound"
], function(Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "de.asr.library.booksdbapp.view."
	});

	sap.ui.require([
		"de/asr/library/booksdbapp/test/integration/MasterJourney",
		"de/asr/library/booksdbapp/test/integration/NavigationJourney",
		"de/asr/library/booksdbapp/test/integration/NotFoundJourney",
		"de/asr/library/booksdbapp/test/integration/BusyJourney",
		"de/asr/library/booksdbapp/test/integration/FLPIntegrationJourney"
	], function() {
		QUnit.start();
	});
});