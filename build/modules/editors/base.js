(function() {
  var editors, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  editors = Backbone.Edit.editors;

  editors.Base = (function(_super) {
    __extends(Base, _super);

    function Base() {
      _ref = Base.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Base.prototype.defaultValue = null;

    Base.prototype.initialize = function(options) {
      var editable;
      if (options == null) {
        options = {};
      }
      if (options.model) {
        if (!options.key) {
          throw new Error("Missing option: 'key'");
        }
        this.model = options.model;
        this.key = options.key;
        this.value = this.model.get(this.key);
      } else if (options.value) {
        this.value = options.value;
      }
      if (this.value === void 0) {
        this.value = this.defaultValue;
      }
      this.form = options.form;
      this.schema = options.schema || {};
      if (this.key) {
        this.$el.attr('name', this.key);
      }
      if (this.schema.editorClass) {
        this.$el.addClass(this.schema.editorClass);
      }
      if (this.schema.editorAttrs) {
        this.$el.attr(this.schema.editorAttrs);
      }
      this.initialize_placeholder();
      editable = _.isUndefined(this.options.editable) ? true : this.options.editable;
      return this.setEditable(editable);
    };

    Base.prototype.initialize_placeholder = function() {
      if (_.isString(this.schema.placeholder)) {
        return this.$el.attr("placeholder", this.schema.placeholder);
      } else if (this.schema.placeholder === Backbone.Edit["enum"].DefaultValue) {
        this.$el.attr("placeholder", "" + (this.getDefaultValue()));
        return this.bindTo(this.model, "change:default:" + this.key, this.on_default_value_changed);
      }
    };

    Base.prototype.on_default_value_changed = function() {
      return this.$el.attr("placeholder", "" + (this.getDefaultValue()));
    };

    Base.prototype.getDefaultValue = function() {
      return this.model["default" + (_.string.capitalize(this.key))]();
    };

    Base.prototype.isInModal = function() {
      return this.$el.closest('#modal').length >= 1;
    };

    Base.prototype.getValue = function() {
      throw 'Not implemented. Extend and override this method.';
    };

    Base.prototype.setValue = function() {
      throw 'Not implemented. Extend and override this method.';
    };

    Base.prototype.setEditable = function(value) {
      if (value) {
        return this.$el.removeAttr("disabled");
      } else {
        return this.$el.attr({
          "disabled": "disabled"
        });
      }
    };

    Base.prototype.triggerChanged = function() {
      if (this.updatingJavascriptEditor) {
        return;
      }
      this.trigger('changed', this);
      return true;
    };

    Base.prototype.focus = function() {
      return this.$el.focus();
    };

    Base.prototype._delayed_focus_click = function() {
      if (this.isActive) {
        return this.focus();
      }
    };

    Base.prototype.delayed_focus = function() {
      if (this.isActive) {
        return window.setTimeout(this._delayed_focus_click, 0);
      }
    };

    Base.prototype.commit = function() {
      return this.model.set(this.key, this.getValue(), {
        changeSource: "ui"
      });
    };

    return Base;

  })(Backbone.Marionette.View);

  editors.Hidden = (function(_super) {
    __extends(Hidden, _super);

    function Hidden() {
      _ref1 = Hidden.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    Hidden.prototype.defaultValue = '';

    Hidden.prototype.initialize = function(options) {
      Hidden.__super__.initialize.apply(this, arguments);
      return this.$el.attr('type', 'hidden');
    };

    Hidden.prototype.getValue = function() {
      return this.value;
    };

    Hidden.prototype.setValue = function() {
      return this.value = value;
    };

    return Hidden;

  })(editors.Base);

  editors.Text = (function(_super) {
    __extends(Text, _super);

    function Text() {
      _ref2 = Text.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    Text.prototype.tagName = 'input';

    Text.prototype.defaultValue = '';

    Text.prototype.events = {
      'change': 'triggerChanged'
    };

    Text.prototype.validInputTypes = ["text", "password", "datetime", "datetime-local", "date", "month", "time", "week", "number", "email", "url", "search", "tel", "color"];

    Text.prototype.initialize = function(options) {
      var type;
      Text.__super__.initialize.apply(this, arguments);
      if (this.schema && this.schema.editorAttrs && this.schema.editorAttrs.type) {
        type = schema.editorAttrs.type;
      } else if (this.schema && this.schema.dataType && _.contains(this.validInputTypes, this.schema.dataType)) {
        type = this.schema.dataType;
      } else {
        type = 'text';
      }
      return this.$el.attr('type', type);
    };

    Text.prototype.getValue = function() {
      return this.$el.val();
    };

    Text.prototype.setValue = function(value) {
      if (_.isUndefined(value)) {
        value = "";
      }
      return this.$el.val(value);
    };

    Text.prototype.render = function() {
      this.setValue(this.value);
      return this;
    };

    return Text;

  })(editors.Base);

  editors.Number = (function(_super) {
    __extends(Number, _super);

    function Number() {
      _ref3 = Number.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    Number.prototype.defaultValue = 0;

    Number.prototype.events = {
      'keypress': 'onKeyPress',
      'change': 'triggerChanged'
    };

    Number.prototype.initialize = function(options) {
      var validator;
      Number.__super__.initialize.apply(this, arguments);
      this.$el.attr('type', 'number');
      if (validator = this.getValidator()) {
        if (!_.isUndefined(validator.min)) {
          this.$el.attr('min', validator.min);
        }
        if (!_.isUndefined(validator.max)) {
          return this.$el.attr('max', validator.max);
        }
      }
    };

    Number.prototype.onKeyPress = function(event) {
      var newVal, numeric;
      if (event.charCode === 0) {
        return;
      }
      newVal = this.$el.val() + String.fromCharCode(event.charCode);
      numeric = /^[0-9]*\.?[0-9]*?$/.test(newVal);
      if (!numeric) {
        return event.preventDefault();
      }
    };

    Number.prototype.getValidator = function() {
      var v, _i, _len, _ref4;
      if (this.options.schema && this.options.schema.validators) {
        _ref4 = this.options.schema.validators;
        for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
          v = _ref4[_i];
          if (_.isObject(v) && v.type === "number") {
            return v;
          }
        }
      }
    };

    Number.prototype.getValue = function() {
      var value;
      value = this.$el.val();
      if (value === "") {
        return null;
      } else {
        return parseFloat(value, 10);
      }
    };

    Number.prototype.setValue = function(value) {
      if (value !== null) {
        value = parseFloat(value, 10);
      }
      return Number.__super__.setValue.call(this, value);
    };

    return Number;

  })(editors.Text);

  editors.Password = (function(_super) {
    __extends(Password, _super);

    function Password() {
      _ref4 = Password.__super__.constructor.apply(this, arguments);
      return _ref4;
    }

    Password.prototype.initialize = function(options) {
      Password.__super__.initialize.apply(this, arguments);
      return this.$el.attr('type', 'password');
    };

    return Password;

  })(editors.Text);

  editors.TextArea = (function(_super) {
    __extends(TextArea, _super);

    function TextArea() {
      _ref5 = TextArea.__super__.constructor.apply(this, arguments);
      return _ref5;
    }

    TextArea.prototype.tagName = 'textarea';

    return TextArea;

  })(editors.Text);

  editors.Checkbox = (function(_super) {
    __extends(Checkbox, _super);

    function Checkbox() {
      _ref6 = Checkbox.__super__.constructor.apply(this, arguments);
      return _ref6;
    }

    Checkbox.prototype.defaultValue = false;

    Checkbox.prototype.tagName = 'input';

    Checkbox.prototype.events = {
      'change': 'triggerChanged'
    };

    Checkbox.prototype.initialize = function(options) {
      Checkbox.__super__.initialize.apply(this, arguments);
      return this.$el.attr('type', 'checkbox');
    };

    Checkbox.prototype.getValue = function() {
      if (this.$el.prop('checked')) {
        return true;
      } else {
        return false;
      }
    };

    Checkbox.prototype.setValue = function(value) {
      return this.$el.prop('checked', value === true);
    };

    Checkbox.prototype.render = function() {
      this.setValue(this.value);
      return this;
    };

    return Checkbox;

  })(editors.Base);

}).call(this);
