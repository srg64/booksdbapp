sap.ui.define([
	"de/asr/library/booksdbapp/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"

], function(BaseController, JSONModel, MessageBox) {
	"use strict";

	return BaseController.extend("de.asr.library.booksdbapp.controller.CreateEntity", {

		_oBinding: {},

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function() {
			var that = this;
			this.getRouter().getTargets().getTarget("create").attachDisplay(null, this._onDisplay, this);
			this._oODataModel = this.getOwnerComponent().getModel();
			this._oResourceBundle = this.getResourceBundle();
			this._oViewModel = new JSONModel({
				enableCreate: false,
				delay: 0,
				busy: false,
				mode: "create",
				viewTitle: ""
			});
			this.setModel(this._oViewModel, "viewModel");

			// Register the view with the message manager
			sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);
			var oMessagesModel = sap.ui.getCore().getMessageManager().getMessageModel();
			this._oBinding = new sap.ui.model.Binding(oMessagesModel, "/", oMessagesModel.getContext("/"));
			this._oBinding.attachChange(function(oEvent) {
				var aMessages = oEvent.getSource().getModel().getData();
				for (var i = 0; i < aMessages.length; i++) {
					if (aMessages[i].type === "Error" && !aMessages[i].technical) {
						that._oViewModel.setProperty("/enableCreate", false);
					}
				}
			});
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler (attached declaratively) for the view save button. Saves the changes added by the user.
		 * @function
		 * @public
		 */
		onSave: function() {
			var that = this,
				oModel = this.getModel();

			// abort if the  model has not been changed
			if (!oModel.hasPendingChanges()) {
				MessageBox.information(
					this._oResourceBundle.getText("noChangesMessage"), {
						id: "noChangesInfoMessageBox",
						styleClass: that.getOwnerComponent().getContentDensityClass()
					}
				);
				return;
			}
			this.getModel("appView").setProperty("/busy", true);
			if (this._oViewModel.getProperty("/mode") === "edit") {
				// attach to the request completed event of the batch
				oModel.attachEventOnce("batchRequestCompleted", function(oEvent) {
					var oParams = oEvent.getParameters();
					if (oParams.success) {
						that._fnUpdateSuccess();
					} else {
						that._fnEntityCreationFailed();
					}
				});
			}
			oModel.submitChanges();
		},

		/**
		 * Event handler (attached declaratively) for the view cancel button. Asks the user confirmation to discard the changes.
		 * @function
		 * @public
		 */
		onCancel: function() {
			// check if the model has been changed
			if (this.getModel().hasPendingChanges()) {
				// get user confirmation first
				this._showConfirmQuitChanges(); // some other thing here....
			} else {
				this.getModel("appView").setProperty("/addEnabled", true);
				// cancel without confirmation
				this._navBack();
			}
		},

		onScanSuccess: function(event) {
			this._loadGoogleBook(event.getParameter("text"));
//  jQuery.sap.require("sap.ndc.BarcodeScanner");
		},
		
		onScanFail: function(event) {
			
		},
		
		onScanInputLiveUpdate: function(event) {
			
		},

		/* =========================================================== */
		/* Internal functions
		/* =========================================================== */
		
		_loadGoogleBook: function(isbnCode) {
			var oView = this.getView();
			var oParams = {
				q: isbnCode
			};
			var sUrl = "/destinations/GoogleApi/books/v1/volumes";
			oView.setBusy(true);
			
			var self = this;
			
			$.get(sUrl, oParams)
				.done(function(result) {
					oView.setBusy(false);
					self._putGoogleBookDataToSimpleForm(result);
				})
				.fail(function(err) {
					oView.setBusy(false);
					if (err !== undefined) {
						var oErrorResponse = $.parseJSON(err.responseText);
						sap.m.MessageToast.show(oErrorResponse.message, {duration: 6000});
					} else {
						sap.m.MessageToast.show("Unknown error!", {duration: 6000});
					}
				});
		},
		
		_putGoogleBookDataToSimpleForm: function(googleBook) {
		    if (googleBook.items === undefined) {
                sap.m.MessageToast.show("Unknown ISBN code!", {duration: 6000});
                return;
		    }
			var oAuthors = googleBook.items[0].volumeInfo.authors[0];
			var oDescription = googleBook.items[0].volumeInfo.description !== undefined ? googleBook.items[0].volumeInfo.description : "-";
			var oIsbn10;
			var oIsbn13;
			if (googleBook.items[0].volumeInfo.industryIdentifiers[0].type === "ISBN_10") {
				oIsbn10 = googleBook.items[0].volumeInfo.industryIdentifiers[0].identifier;
			}
			if (googleBook.items[0].volumeInfo.industryIdentifiers[1].type === "ISBN_10") {
				oIsbn10 = googleBook.items[0].volumeInfo.industryIdentifiers[1].identifier;
			}
			if (googleBook.items[0].volumeInfo.industryIdentifiers[0].type === "ISBN_13") {
				oIsbn13 = googleBook.items[0].volumeInfo.industryIdentifiers[0].identifier;
			}
			if (googleBook.items[0].volumeInfo.industryIdentifiers[1].type === "ISBN_13") {
				oIsbn13 = googleBook.items[0].volumeInfo.industryIdentifiers[1].identifier;
			}
			var oPageCount = googleBook.items[0].volumeInfo.pageCount !== undefined ? googleBook.items[0].volumeInfo.pageCount : "-";
			var oPrintType = googleBook.items[0].volumeInfo.printType !== undefined ? googleBook.items[0].volumeInfo.printType : "-";
			var oPublishedDate = googleBook.items[0].volumeInfo.publishedDate !== undefined ? googleBook.items[0].volumeInfo.publishedDate : "-";
			var oPublisherString = googleBook.items[0].volumeInfo.publisher !== undefined ? googleBook.items[0].volumeInfo.publisher : "-";
//			var oRatingAvg = googleBook.items[0].volumeInfo.averageRating !== undefined ? googleBook.items[0].volumeInfo.averageRating : 0;
//			var oRatingBase = googleBook.items[0].volumeInfo.ratingsCount !== undefined ? googleBook.items[0].volumeInfo.ratingsCount : 0;
            if (googleBook.items[0].volumeInfo.imageLinks !== undefined) {
                var oSmallThumbnailUrl = googleBook.items[0].volumeInfo.imageLinks.smallThumbnail !== undefined ? googleBook.items[0].volumeInfo.imageLinks.smallThumbnail : "";
                var oThumbnailUrl = googleBook.items[0].volumeInfo.imageLinks.thumbnail !== undefined ? googleBook.items[0].volumeInfo.imageLinks.thumbnail : "";
            }
			var oSubtitle = googleBook.items[0].volumeInfo.subtitle !== undefined ? googleBook.items[0].volumeInfo.subtitle : "-";
			var oTitle = googleBook.items[0].volumeInfo.title !== undefined ? googleBook.items[0].volumeInfo.title : "-";
			
			this.byId("AuthorsString_id").setValue(oAuthors);
			this.byId("Description_id").setValue(oDescription);
			this.byId("Isbn10_id").setValue(oIsbn10);
			this.byId("Isbn13_id").setValue(oIsbn13);
			this.byId("PageCount_id").setValue(oPageCount);
			this.byId("PrintType_id").setValue(oPrintType);
			this.byId("PublishedDate_id").setValue(oPublishedDate);
			this.byId("PublisherString_id").setValue(oPublisherString);
//			this.byId("RatingAvg_id").setValue(oRatingAvg);
//			this.byId("RatingBase_id").setValue(oRatingBase);
			this.byId("SmallThumbnailUrl_id").setValue(oSmallThumbnailUrl);
			this.byId("Subtitle_id").setValue(oSubtitle);
			this.byId("ThumbnailUrl_id").setValue(oThumbnailUrl);
			this.byId("Title_id").setValue(oTitle);
		},
		
		_createBookFromGoogleBook: function(googleBook, location) {
			var oAuthors = googleBook.items[0].volumeInfo.authors[0];
			var oIsbn10 = googleBook.items[0].volumeInfo.industryIdentifiers[1].identifier;
			var oIsbn13 = googleBook.items[0].volumeInfo.industryIdentifiers[0].identifier;
			var oLocation;
			if (location) {
				oLocation = location;
			} else {
				oLocation = "unknown";
			}
			this._oODataModel.createEntry(("Books", {
				"AuthorsString": oAuthors,
				"Description": googleBook.items[0].volumeInfo.description,
				"Isbn10": oIsbn10,
				"Isbn13": oIsbn13,
				"LocationString": oLocation,
				"PageCount": googleBook.items[0].volumeInfo.pageCount,
				"PrintType": googleBook.items[0].volumeInfo.printType,
				"PublishedDate": googleBook.items[0].volumeInfo.publishedDate,
				"PublisherString": googleBook.items[0].volumeInfo.publisher,
				"Rating": googleBook.items[0].volumeInfo.averageRating,
				"RatingBase": googleBook.items[0].volumeInfo.ratingsCount,
				"SmallThumbnailUrl": googleBook.items[0].volumeInfo.imageLinks.smallThumbnail,
				"Subtitle": googleBook.items[0].volumeInfo.subTitle,
				"ThumbnailUrl": googleBook.items[0].volumeInfo.imageLinks.thumbnail,
				"Title": googleBook.items[0].volumeInfo.title
/*
				"AuthorDetails": [{
					"Id": 9776,
					"Name": "Name 5",
					"Version": "/Date(1202482182000)/",
					"__metadata": {
						"uri": "Authors(9776)",
						"type": "BooksDB.Author"
					}
				}],
				"LocationDetails": {
					"__deferred": {
						"uri": "Books(7461)/LocationDetails"
					}
				},
				"PublisherDetails": {
					"__deferred": {
						"uri": "Books(7461)/PublisherDetails"
					}
				}
*/				
			}));
			this._oODataModel.submitChanges();
		},

		/**
		 * Navigates back in the browser history, if the entry was created by this app.
		 * If not, it navigates to the Details page
		 * @private
		 */
		_navBack: function() {
			var oHistory = sap.ui.core.routing.History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash();

			this.getView().unbindObject();
			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			} else {
				this.getRouter().getTargets().display("object");
			}
		},

		/**
		 * Opens a dialog letting the user either confirm or cancel the quit and discard of changes.
		 * @private
		 */
		_showConfirmQuitChanges: function() {
			var oComponent = this.getOwnerComponent(),
				oModel = this.getModel();
			var that = this;
			MessageBox.confirm(
				this._oResourceBundle.getText("confirmCancelMessage"), {
					styleClass: oComponent.getContentDensityClass(),
					onClose: function(oAction) {
						if (oAction === sap.m.MessageBox.Action.OK) {
							that.getModel("appView").setProperty("/addEnabled", true);
							oModel.resetChanges();
							that._navBack();
						}
					}
				}
			);
		},

		/**
		 * Prepares the view for editing the selected object
		 * @param {sap.ui.base.Event} oEvent the  display event
		 * @private
		 */
		_onEdit: function(oEvent) {
			var oData = oEvent.getParameter("data"),
				oView = this.getView();
			this._oViewModel.setProperty("/mode", "edit");
			this._oViewModel.setProperty("/enableCreate", true);
			this._oViewModel.setProperty("/viewTitle", this._oResourceBundle.getText("editViewTitle"));

			oView.bindElement({
				path: oData.objectPath
			});
		},

		/**
		 * Prepares the view for creating new object
		 * @param {sap.ui.base.Event} oEvent the  display event
		 * @private
		 */

		_onCreate: function(oEvent) {
			if (oEvent.getParameter("name") && oEvent.getParameter("name") !== "create") {
				this._oViewModel.setProperty("/enableCreate", false);
				this.getRouter().getTargets().detachDisplay(null, this._onDisplay, this);
				this.getView().unbindObject();
				return;
			}

			this._oViewModel.setProperty("/viewTitle", this._oResourceBundle.getText("createViewTitle"));
			this._oViewModel.setProperty("/mode", "create");
			var oContext = this._oODataModel.createEntry("Books", {
				success: this._fnEntityCreated.bind(this),
				error: this._fnEntityCreationFailed.bind(this)
			});
			this.getView().setBindingContext(oContext);
		},

		/**
		 * Checks if the save button can be enabled
		 * @private
		 */
		_validateSaveEnablement: function() {
			var aInputControls = this._getFormFields(this.setValue("newEntitySimpleForm"));
			var oControl;
			for (var m = 0; m < aInputControls.length; m++) {
				oControl = aInputControls[m].control;
				if (aInputControls[m].required) {
					var sValue = oControl.getValue();
					if (!sValue) {
						this._oViewModel.setProperty("/enableCreate", false);
						return;
					}
				}
			}
			this._checkForErrorMessages();
		},

		/**
		 * Checks if there is any wrong inputs that can not be saved.
		 * @private
		 */

		_checkForErrorMessages: function() {
			var aMessages = this._oBinding.oModel.oData;
			if (aMessages.length > 0) {
				var bEnableCreate = true;
				for (var i = 0; i < aMessages.length; i++) {
					if (aMessages[i].type === "Error" && !aMessages[i].technical) {
						bEnableCreate = false;
						break;
					}
				}
				this._oViewModel.setProperty("/enableCreate", bEnableCreate);
			} else {
				this._oViewModel.setProperty("/enableCreate", true);
			}
		},

		/**
		 * Handles the success of updating an object
		 * @private
		 */
		_fnUpdateSuccess: function() {
			this.getModel("appView").setProperty("/busy", false);
			this.getView().unbindObject();
			this.getRouter().getTargets().display("object");
		},

		/**
		 * Handles the success of creating an object
		 *@param {object} oData the response of the save action
		 * @private
		 */
		_fnEntityCreated: function(oData) {
			var sObjectPath = this.getModel().createKey("Books", oData);
			this.getModel("appView").setProperty("/itemToSelect", "/" + sObjectPath); //save last created
			this.getModel("appView").setProperty("/busy", false);
			this.getRouter().getTargets().display("object");
		},

		/**
		 * Handles the failure of creating/updating an object
		 * @private
		 */
		_fnEntityCreationFailed: function() {
			this.getModel("appView").setProperty("/busy", false);
		},

		/**
		 * Handles the onDisplay event which is triggered when this view is displayed
		 * @param {sap.ui.base.Event} oEvent the on display event
		 * @private
		 */
		_onDisplay: function(oEvent) {
			var oData = oEvent.getParameter("data");
			if (oData && oData.mode === "update") {
				this._onEdit(oEvent);
			} else {
				this._onCreate(oEvent);
			}
		},

		/**
		 * Gets the form fields
		 * @param {sap.ui.layout.form} oSimpleForm the form in the view.
		 * @private
		 */
		_getFormFields: function(oSimpleForm) {
			var aControls = [];
			var aFormContent = oSimpleForm.getContent();
			var sControlType;
			for (var i = 0; i < aFormContent.length; i++) {
				sControlType = aFormContent[i].getMetadata().getName();
				if (sControlType === "sap.m.Input" || sControlType === "sap.m.DateTimeInput" ||
					sControlType === "sap.m.CheckBox") {
					aControls.push({
						control: aFormContent[i],
						required: aFormContent[i - 1].getRequired && aFormContent[i - 1].getRequired()
					});
				}
			}
			return aControls;
		}
	});

});