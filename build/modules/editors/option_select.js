(function() {
  var editors, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  editors = Backbone.Edit.editors;

  editors.OptionSelect = (function(_super) {
    __extends(OptionSelect, _super);

    function OptionSelect() {
      _ref = OptionSelect.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    OptionSelect.prototype.events = {
      'change': 'on_ui_selection_changed'
    };

    OptionSelect.prototype.initialize = function(options) {
      OptionSelect.__super__.initialize.apply(this, arguments);
      return this.evaluateSchemaOptions();
    };

    OptionSelect.prototype.getValue = function() {
      return this.value;
    };

    OptionSelect.prototype.setValue = function(value) {
      if (this.value !== value) {
        this.value = value;
        if (this._optionSelect_rendered) {
          if (this.extraOptionCreated) {
            return this.renderOptions(this.select_options);
          } else {
            return this.applyValue(value);
          }
        }
      }
    };

    OptionSelect.prototype.applyValue = function(value) {
      throw "not implemented";
    };

    OptionSelect.prototype.updateCachedValue = function(value) {
      throw "not implemented";
    };

    OptionSelect.prototype.on_ui_selection_changed = function() {
      var old_cached_value;
      if (this.updatingJavascriptEditor) {
        return;
      }
      old_cached_value = this.value;
      this.updateCachedValue();
      if (old_cached_value !== this.value) {
        return this.triggerChanged();
      }
    };

    OptionSelect.prototype.setOptions = function(options) {
      if (this.select_options !== options) {
        this.check_options_valid(options);
        this.select_options = options;
        if (Backbone.Edit.helpers.isCollection(options)) {
          this.unbindFromCollection();
          this.bindToCollection(options);
        }
        if (this._optionSelect_rendered) {
          return this.renderOptions();
        }
      }
    };

    OptionSelect.prototype.check_options_valid = function(options) {
      if (!_.isArray(options) && !Backbone.Edit.helpers.isCollection(options)) {
        throw new Error("expected string, array or collection");
      }
    };

    OptionSelect.prototype.evaluateSchemaOptions = function() {
      var callback, options, self;
      if (!this.schema || !this.schema.options) {
        throw "Missing required 'schema.options'";
      }
      options = this.schema.options;
      self = this;
      if (_.isFunction(options)) {
        callback = function(result) {
          return self.setOptions(result);
        };
        return options(callback, self.model, self.schema);
      } else {
        return self.setOptions(options);
      }
    };

    OptionSelect.prototype._collectionToHtml = function(container, collection) {
      var index, model, _i, _len, _ref1, _results;
      _ref1 = collection.models;
      _results = [];
      for (index = _i = 0, _len = _ref1.length; _i < _len; index = ++_i) {
        model = _ref1[index];
        if (!model.isNew()) {
          _results.push(this.createOption(container, model, index));
        }
      }
      return _results;
    };

    OptionSelect.prototype._arrayToHtml = function(container, array) {
      var index, option, _i, _len, _results;
      _results = [];
      for (index = _i = 0, _len = array.length; _i < _len; index = ++_i) {
        option = array[index];
        _results.push(this.createOption(container, option, index));
      }
      return _results;
    };

    OptionSelect.prototype.renderOptions = function(options) {
      this.$el.html('');
      this.extraOptionCreated = false;
      if (this.allow_deselect()) {
        this.createOption(this.$el, null);
      }
      if (_.isArray(options)) {
        this._arrayToHtml(this.$el, options);
      } else if (Backbone.Edit.helpers.isCollection(options)) {
        this._collectionToHtml(this.$el, options);
      } else {
        throw new Error("renderOptions: expected an array or collection: " + options);
      }
      return this.applyValue(this.value);
    };

    OptionSelect.prototype.allow_deselect = function() {
      return !Backbone.Validators.hasValidator(this.schema, "required");
    };

    OptionSelect.prototype.bindToCollection = function(collection, eventName, callback, context) {
      var binding;
      if (eventName == null) {
        eventName = "add remove reset change";
      }
      if (callback == null) {
        callback = this.on_CollectionChanged;
      }
      if (context == null) {
        context = this;
      }
      if (!this.collectionBindings) {
        this.collectionBindings = [];
      }
      binding = this.bindTo(collection, eventName, callback, context);
      this.collectionBindings.push(binding);
      return binding;
    };

    OptionSelect.prototype.unbindFromCollection = function() {
      var binding, _i, _len, _ref1, _results;
      if (this.collectionBindings) {
        _ref1 = this.collectionBindings;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          binding = _ref1[_i];
          _results.push(this.unbindFrom(binding));
        }
        return _results;
      }
    };

    OptionSelect.prototype.on_CollectionChanged = function() {
      if (this._optionSelect_rendered) {
        this.renderOptions(this.select_options);
        return this.jsEditor_notifyChange("options");
      }
    };

    OptionSelect.prototype.getItemValue = function(item) {
      if (this.schema.getItemValue) {
        return this.schema.getItemValue(item);
      } else {
        return this._getItemValue(item);
      }
    };

    OptionSelect.prototype._getItemValue = function(item) {
      if (_.isObject(item)) {
        if (item instanceof Backbone.Model) {
          return item;
        } else {
          if (!_.isUndefined(item.val)) {
            return item.val;
          } else {
            return item;
          }
        }
      } else if (_.isNull(item) || _.isUndefined(item)) {
        return null;
      } else {
        return item;
      }
    };

    OptionSelect.prototype.getItemValueAsString = function(item) {
      var value;
      value = this.getItemValue(item);
      if (value instanceof Backbone.Model) {
        return value.id;
      } else if (_.isUndefined(item) || _.isNull(item)) {
        return "";
      } else {
        return value.toString();
      }
    };

    OptionSelect.prototype.getItemLabel = function(item) {
      if (this.schema.getItemLabel) {
        return this.schema.getItemLabel(item);
      } else {
        return this._getItemLabel(item);
      }
    };

    OptionSelect.prototype._getItemLabel = function(item) {
      if (_.isObject(item)) {
        if (item instanceof Backbone.Model) {
          return item.toString();
        } else {
          return item.label;
        }
      } else if (_.isNull(item) || _.isUndefined(item)) {
        return null;
      } else {
        return item.toString();
      }
    };

    OptionSelect.prototype.render = function() {
      if (!this._optionSelect_rendered) {
        this._optionSelect_rendered = true;
        this.renderOptions(this.select_options);
      }
      return this;
    };

    return OptionSelect;

  })(editors.Base);

}).call(this);
