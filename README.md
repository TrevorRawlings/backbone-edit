# backbone.edit

Automatically renders forms that include datepicker, Chosen and slickgrid controls


backbone.edit started from a desire to move the validation logic that is built into [backbone-forms](https://github.com/powmedia/backbone-forms)
down to the models. Along the way support for server side validation errors and wrappers for several javascript controls was added.

backbone.edit is based on the excellent [backbone-forms](https://github.com/powmedia/backbone-forms) library and uses [marionette.js](http://marionettejs.com/)
to manage the closing of editors as parent layouts are removed from the DOM.
