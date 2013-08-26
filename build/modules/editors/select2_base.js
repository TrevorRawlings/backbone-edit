(function() {
  var editors, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  editors = Backbone.Edit.editors;

  editors.Select2Base = (function(_super) {
    __extends(Select2Base, _super);

    function Select2Base() {
      _ref = Select2Base.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Select2Base.prototype.javascriptEditor = function() {
      if (!categorizr.isDesktop) {
        return false;
      }
      if (this.isInModal()) {
        return false;
      }
      return this.schema.javascriptEditor === true || _.isUndefined(this.schema.javascriptEditor);
    };

    Select2Base.prototype.jsEditor_options = function() {
      var options;
      options = {
        search_contains: true
      };
      if (this.schema.placeholder) {
        options.placeholder = this.schema.placeholder;
      }
      if (this.allow_deselect()) {
        options.allowClear = true;
      }
      options.formatResult = this.jsEditor_formatResult;
      options.formatSelection = this.jsEditor_formatResult;
      return options;
    };

    Select2Base.prototype.jsEditor_construct = function() {
      return this.$el.select2(this.jsEditor_options());
    };

    Select2Base.prototype.jsEditor_initialise = function() {
      if (!this.jsEditor_initialised && this.javascriptEditor()) {
        this.jsEditor_construct();
        return this.jsEditor_initialised = true;
      }
    };

    Select2Base.prototype.jsEditor_destroy = function() {
      if (this.jsEditor_initialised) {
        this.jsEditor_initialised = false;
        return this.$el.select2("destroy");
      }
    };

    Select2Base.prototype.jsEditor_handleChange = function(type) {
      switch (type) {
        case "selected":
          return this.$el.trigger("change");
        case "options":
          this.jsEditor_destroy();
          return this.jsEditor_initialise();
        default:
          throw "jsEditor_notifyChange: unexpected change type " + type;
      }
    };

    Select2Base.prototype.jsEditor_notifyChange = function(type) {
      if (!this.jsEditor_initialised) {
        return;
      }
      try {
        this.updatingJavascriptEditor = true;
        return this.jsEditor_handleChange(type);
      } finally {
        this.updatingJavascriptEditor = false;
      }
    };

    Select2Base.prototype.jsEditor_setEditable = function(canEdit) {
      if (!this.jsEditor_initialised) {
        return;
      }
      if (canEdit) {
        return this.$el.select2("enable");
      } else {
        return this.$el.select2("disable");
      }
    };

    Select2Base.prototype.jsEditor_formatResult = function(result) {
      return _.string.escapeHTML(result.text);
    };

    Select2Base.prototype.focus = function() {
      if (this.jsEditor_initialised) {
        return this.$el.select2("focus");
      } else {
        return this.$el.focus();
      }
    };

    Select2Base.prototype.setEditable = function(canEdit) {
      Select2Base.__super__.setEditable.apply(this, arguments);
      return this.jsEditor_setEditable(canEdit);
    };

    Select2Base.prototype.onShow = function() {
      Select2Base.__super__.onShow.apply(this, arguments);
      return this.jsEditor_initialise();
    };

    Select2Base.prototype.onDeactivate = function() {
      Select2Base.__super__.onDeactivate.apply(this, arguments);
      return this.jsEditor_destroy();
    };

    return Select2Base;

  })(editors.OptionSelect);

}).call(this);
