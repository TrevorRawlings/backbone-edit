(function() {
  var editors, _ref, _ref1, _ref2,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  editors = Backbone.Edit.editors;

  editors.Select = (function(_super) {
    __extends(Select, _super);

    function Select() {
      _ref = Select.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Select.prototype.tagName = 'select';

    Select.prototype.initialize = function(options) {
      Select.__super__.initialize.apply(this, arguments);
      return this.initialize_addNew();
    };

    Select.prototype.modelType = function(form) {
      return this.options.model_class.prototype.modelType(form);
    };

    Select.prototype.jsEditor_formatResult = function(result) {
      if (result.create_new) {
        return '<i class="icon-plus"></i> ' + result.create_new.message;
      } else {
        return Select.__super__.jsEditor_formatResult.apply(this, arguments);
      }
    };

    Select.prototype.initialize_addNew = function() {
      var modelType_plural, modelType_singular;
      if (this.options.allowNewValues) {
        if (!this.options.model_class) {
          throw "options.model_class is required";
        }
        this.options.model_class = Backbone.Edit.helpers.getObjectByName(this.options.model_class);
        modelType_singular = _.string.capitalize(this.modelType("singular"));
        modelType_plural = _.string.capitalize(this.modelType("plural"));
        if (!this.options.newModelView) {
          this.options.newModelView = "Landscape.Views.New" + modelType_singular;
        }
        this.options.newValueMessage = "Create a new " + (this.modelType("singular"));
        return this.options.newModelView = Backbone.Edit.helpers.getObjectByName(this.options.newModelView);
      }
    };

    Select.prototype.unbindFromNewModel = function() {
      var binding, _i, _len, _ref1, _results;
      if (!this.newModelBindings) {
        this.newModelBindings = [];
      }
      _ref1 = this.newModelBindings;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        binding = _ref1[_i];
        _results.push(this.unbindFrom(binding));
      }
      return _results;
    };

    Select.prototype.add_new_selected = function(selected_value) {
      var model, term, view;
      this.unbindFromNewModel();
      if (this.jsEditor_initialised) {
        term = this.$el.select2("lastSearchTerm");
      }
      model = this.buildNewModel(selected_value, term);
      view = this.buildNewModelView(selected_value, model);
      this.newModelBindings.push(this.bindTo(view, "save:success", this.on_modelCreated));
      this.newModelBindings.push(this.bindTo(view, "close", this.on_viewClosed));
      return Landscape.App.showModal(view);
    };

    Select.prototype.buildNewModel = function(selected_value, term) {
      var model;
      model = new this.options.model_class({
        business: window.Landscape.Data.Business,
        name: term
      });
      model.setModelDefaults(Landscape.Data.Business);
      return model;
    };

    Select.prototype.buildNewModelView = function(selected_value, model) {
      return new this.options.newModelView({
        model: model
      });
    };

    Select.prototype.on_modelCreated = function(model) {
      this.unbindFromNewModel();
      this.value = this.getItemValue(model);
      this.applyValue(model);
      return this.triggerChanged();
    };

    Select.prototype.on_viewClosed = function() {
      this.unbindFromNewModel();
      return this.applyValue(this.value);
    };

    Select.prototype.updateCachedValue = function() {
      var selected_value;
      selected_value = this.$('option:selected').data("value");
      if (this.options.allowNewValues && _.isString(selected_value) && _.string.startsWith(selected_value, "create_new")) {
        return this.add_new_selected(selected_value);
      } else {
        return this.value = selected_value;
      }
    };

    Select.prototype.applyValue = function(value) {
      var new_selected, option, optionCreated, val, _i, _len, _ref1;
      optionCreated = false;
      val = this.getItemValue(value);
      new_selected = this.optionExists(val);
      if (!new_selected) {
        new_selected = this.createOption(this.$el, value, 0);
        optionCreated = true;
      }
      _ref1 = this.$('option');
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        option = _ref1[_i];
        if (option !== new_selected) {
          $(option).removeAttr("selected");
        }
      }
      new_selected.attr("selected", "selected");
      if (optionCreated) {
        this.jsEditor_notifyChange("options");
      } else {
        this.jsEditor_notifyChange("selected");
      }
      return this.extraOptionCreated = this.extraOptionCreated || optionCreated;
    };

    Select.prototype.optionExists = function(val) {
      var option, _i, _len, _ref1;
      _ref1 = this.$("option");
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        option = _ref1[_i];
        if ($(option).data("value") === val) {
          return $(option);
        }
      }
      return false;
    };

    Select.prototype.createOption = function(container, item, index) {
      var label, option, value, valueAsString;
      value = this.getItemValue(item);
      label = this.getItemLabel(item);
      valueAsString = this.getItemValueAsString(item);
      if ((label === null) || (label === void 0)) {
        label = "";
      }
      option = $('<option/>', {
        value: valueAsString
      }).text(label).data("value", value);
      if (_.isNull(item)) {
        container.prepend(option);
      } else {
        container.append(option);
      }
      return option;
    };

    Select.prototype.renderOptions_append_CreateNewOption = function() {
      var $option, message;
      message = this.options.newValueMessage;
      $option = this.createOption(this.$el, {
        val: "create_new",
        label: "[" + this.options.newValueMessage + "]"
      }, _.uniqueId('i'));
      return $option.data("create_new", {
        message: message
      });
    };

    Select.prototype.renderOptions = function(options) {
      Select.__super__.renderOptions.apply(this, arguments);
      if (this.options.allowNewValues) {
        return this.renderOptions_append_CreateNewOption();
      }
    };

    return Select;

  })(editors.Select2Base);

  editors.Radio = (function(_super) {
    __extends(Radio, _super);

    function Radio() {
      _ref1 = Radio.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    Radio.prototype.tagName = 'div';

    Radio.prototype.className = 'bbf-radio';

    Radio.prototype.allow_deselect = function() {
      return false;
    };

    Radio.prototype.updateCachedValue = function() {
      this.value = this.$el.find('input[type=radio]:checked').data("value");
      return this.value;
    };

    Radio.prototype.applyValue = function(value) {
      return this.$el.find('input[type=radio][value=' + value + ']').attr('checked', true);
    };

    Radio.prototype.createOption = function(container, item, index) {
      var input, inputId, label, val, valueAsString;
      val = this.getItemValue(item);
      label = this.getItemLabel(item);
      valueAsString = this.getItemValueAsString(item);
      inputId = "" + this.id + '-' + index;
      label = $('<label/>', {
        "for": inputId,
        "class": 'radio'
      }).text(label);
      input = $('<input/>', {
        type: 'radio',
        name: this.id,
        value: valueAsString,
        id: inputId
      }).data("value", val);
      label.prepend(input);
      return container.append(label);
    };

    return Radio;

  })(editors.Select);

  editors.GroupedSelect = (function(_super) {
    __extends(GroupedSelect, _super);

    function GroupedSelect() {
      _ref2 = GroupedSelect.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    GroupedSelect.prototype.initialize = function() {
      if (!this.options.group_children) {
        this.options.group_children = "options";
      }
      return GroupedSelect.__super__.initialize.apply(this, arguments);
    };

    GroupedSelect.prototype.getGroupChildren = function(group) {
      if (group instanceof Backbone.Model) {
        return group.get(this.options.group_children);
      } else {
        return group[this.options.group_children];
      }
    };

    GroupedSelect.prototype.getGroupLabel = function(group) {
      if (group instanceof Backbone.Model) {
        return group.get("name");
      } else if (_.isString(group.label)) {
        return group.label;
      } else {
        return group;
      }
    };

    GroupedSelect.prototype.renderOptions = function(groups) {
      var bindTo, group, groupChildren, optgroup, _i, _len;
      this.extraOptionCreated = false;
      this.$el.html('');
      this.unbindFromCollection();
      if (this.allow_deselect()) {
        this.createOption(this.$el, null);
      }
      if ((groups instanceof Backbone.Collection) || (groups instanceof Landscape.Subset)) {
        bindTo = groups;
        groups = (function() {
          var _i, _len, _ref3, _results;
          _ref3 = groups.models;
          _results = [];
          for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
            group = _ref3[_i];
            if (!group.isNew()) {
              _results.push(group);
            }
          }
          return _results;
        })();
      }
      for (_i = 0, _len = groups.length; _i < _len; _i++) {
        group = groups[_i];
        groupChildren = this.getGroupChildren(group);
        if (groupChildren.length > 0) {
          optgroup = $('<optgroup/>', {
            label: this.getGroupLabel(group)
          });
          if (_.isArray(groupChildren)) {
            this._arrayToHtml(optgroup, groupChildren);
          } else if ((groupChildren instanceof Backbone.Collection) || (groupChildren instanceof Landscape.Subset)) {
            this._collectionToHtml(optgroup, groupChildren);
          } else {
            throw new Error("expected an array or collection");
          }
          this.$el.append(optgroup);
        }
        if ((groupChildren instanceof Backbone.Collection) || (groupChildren instanceof Landscape.Subset)) {
          this.bindToCollection(groupChildren);
        }
      }
      if (this.options.allowNewValues) {
        this.renderOptions_append_CreateNewOption();
      }
      this.applyValue(this.value);
      if (bindTo) {
        return this.bindToCollection(bindTo);
      }
    };

    return GroupedSelect;

  })(editors.Select);

}).call(this);
