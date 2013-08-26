# backbone.edit

Automatically renders forms that include [datepicker](http://jqueryui.com/datepicker/), [Select2](http://ivaynberg.github.io/select2/) and [SlickGrid](https://github.com/mleibman/SlickGrid) controls


backbone.edit started from a desire to move the validation logic that is built into [backbone-forms](https://github.com/powmedia/backbone-forms)
down to the models. Along the way support for server side validation errors and wrappers for several javascript controls was added.

backbone.edit is based on the excellent [backbone-forms](https://github.com/powmedia/backbone-forms) library and uses [marionette.js](http://marionettejs.com/)
to manage the closing of editors as parent layouts are removed from the DOM.

Backbone edit modules
---------------------
1. **base** - Utillity functions and classes used by the other modules
2. **form** - Displays editable forms - similar to [backbone-forms](https://github.com/powmedia/backbone-forms).  A Backbone.Edit.editors._editor_
              will be required for each supported data type.
3. **editors** - Backbone-edit wrappers around edit controls.  Supported editors include [Select2](http://ivaynberg.github.io/select2/),
              [datepicker](http://jqueryui.com/datepicker/), [mobiscroll.com datetime](http://demo.mobiscroll.com/datetime) and the basic html form elements.  
4. **slickgrid** - Wrapper around [SlickGrid](https://github.com/mleibman/SlickGrid). For data display the only dependency is the 'base' module.
              To support editing then the 'form' and 'editors' modules are also required.



Development Workflow
--------------------

You will need [Git](http://git-scm.com/), [Node](http://nodejs.org/), and NPM installed.
For clarification, please view the
[jQuery readme](https://github.com/jquery/jquery/blob/master/README.md#what-you-need-to-build-your-own-jquery),
which requires a similar setup.

You will need to have the [Grunt](http://gruntjs.com/) build system installed globally (`-g`) on your system:

	npm install -g grunt-cli

To install Backbone-edit's development dependencies enter the directory and install:

	npm install


After you make code changes, you'll want to compile the CoffeeScript to JS. You can either manually rebuild each time you make a change:

	grunt dev

Or, you can run a script that automatically rebuilds whenever you save a source file:

	./build/watch

