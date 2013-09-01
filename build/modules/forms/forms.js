(function() {
  var classNames, helpers, templates, _ref, _ref1, _ref2,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (!Backbone.Edit) {
    Backbone.Edit = {};
  }

  helpers = Backbone.Edit.helpers;

  Backbone.Edit.FormMixin = (function(_super) {
    __extends(FormMixin, _super);

    function FormMixin() {
      _ref = FormMixin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    FormMixin.prototype.initializeForm = function(options) {
      var model;
      if (options.schema) {
        this.schema = options.schema;
      } else {
        model = options.model;
        if (!model || !model.schema) {
          throw new Error('Could not find schema');
        }
        this.schema = _.result(model, 'schema');
      }
      this.model = options.model;
      this.data = options.data;
      this.fieldsToRender = this.fieldsToRender || this.options.fields;
      if (this.fieldsToRender && !_.isArray(this.fieldsToRender)) {
        throw "expected an array";
      }
      this.fieldsets = options.fieldsets;
      this.templateName = options.template || 'form';
      return this.fields = {};
    };

    FormMixin.prototype.renderForm = function() {
      var $fieldset, $fieldsetContainer, $form, fieldsToRender, fieldsets, fs, templates, _i, _len;
      fieldsToRender = this.fieldsToRender;
      fieldsets = this.fieldsets;
      templates = Backbone.Edit.templates;
      this.closeFields();
      $form = $(templates[this.templateName]({
        fieldsets: '<div class="bbf-placeholder"></div>'
      }));
      $fieldsetContainer = $('.bbf-placeholder', $form).parent();
      $fieldsetContainer.html('');
      if (fieldsets) {
        if (!_.isArray(this.fieldsets)) {
          throw "expected fieldsets to be an array";
        }
        for (_i = 0, _len = fieldsets.length; _i < _len; _i++) {
          fs = fieldsets[_i];
          if (_(fs).isArray()) {
            fs = {
              'fields': fs
            };
          }
          $fieldset = this.renderFieldset(fieldsToRender, fs.legend);
          $fieldsetContainer.append($fieldset);
        }
      } else {
        $fieldset = this.renderFieldset(fieldsToRender, '');
        $fieldsetContainer.append($fieldset);
      }
      this.setElement($form);
      return this;
    };

    FormMixin.prototype.renderFieldset = function(fields, legend) {
      var $fieldsContainer, $fieldset, options;
      options = {
        legend: legend ? "<legend>" + legend + "</legend>" : '',
        fields: '<div class="bbf-placeholder"></div>'
      };
      $fieldset = $(Backbone.Edit.templates.fieldset(options));
      $fieldsContainer = $('.bbf-placeholder', $fieldset).parent();
      $fieldsContainer.html('');
      this.renderFields(fields, $fieldsContainer);
      return $fieldset;
    };

    FormMixin.prototype.renderFields = function(fieldsToRender, $container) {
      var field, key, options, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = fieldsToRender.length; _i < _len; _i++) {
        key = fieldsToRender[_i];
        if (_.isUndefined(key) || _.isNull(key)) {
          throw "key is undefined";
        }
        options = this.optionsForField(key);
        field = this.addField(key, options);
        $container.append(field.render().el);
        if (this._fieldsShown) {
          _results.push(field.show());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    FormMixin.prototype.showFields = function() {
      var key, _results;
      this._fieldsShown = true;
      _results = [];
      for (key in this.fields) {
        _results.push(this.fields[key].show());
      }
      return _results;
    };

    FormMixin.prototype.setFocus = function(field) {
      if (!_.isString(field)) {
        throw "expected field to be a string";
      }
      if (!this.fields[field]) {
        throw "field " + field + " not found";
      }
      return this.fields[field].setFocus();
    };

    FormMixin.prototype.optionsForFieldEditor = function(key) {
      var itemSchema, options;
      if (!_.isString(key)) {
        throw "expected key to be a string";
      }
      if (!_.isObject(this.schema)) {
        throw "expected this.schema to be an object";
      }
      itemSchema = this.schema[key];
      if (!itemSchema) {
        throw "Field '" + key + "' not found in schema";
      }
      options = {
        form: this,
        key: key,
        schema: itemSchema,
        idPrefix: this.options.idPrefix
      };
      if (this.model) {
        options.model = this.model;
      } else if (this.data) {
        options.value = this.data[key];
      } else {
        options.value = null;
      }
      return options;
    };

    FormMixin.prototype.optionsForField = function(key) {
      var k, options;
      options = {
        form: this,
        idPrefix: this.options.idPrefix,
        model: this.model
      };
      if (_.isArray(key)) {
        options.editors = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = key.length; _i < _len; _i++) {
            k = key[_i];
            _results.push(this.optionsForFieldEditor(k));
          }
          return _results;
        }).call(this);
      } else {
        options.editors = [this.optionsForFieldEditor(key)];
      }
      return options;
    };

    FormMixin.prototype.addField = function(key, options) {
      var field, field_class;
      if (!_.isUndefined(this.fields[key])) {
        throw new Error("already set");
      }
      if (!options) {
        options = this.optionsForField(key);
      }
      field_class = options.schema ? options.schema.field : options.editors[0].schema.field;
      field = new (field_class || Backbone.Edit.Field)(options);
      if (!(field instanceof Backbone.Edit.Field)) {
        throw "expected a Backbone.Edit.Field";
      }
      this.fields[key] = field;
      return field;
    };

    FormMixin.prototype.beforeCloseFields = function() {
      var key, _results;
      _results = [];
      for (key in this.fields) {
        _results.push(this.fields[key].beforeClose());
      }
      return _results;
    };

    FormMixin.prototype.closeFields = function() {
      var key, _results;
      _results = [];
      for (key in this.fields) {
        this.fields[key].close();
        _results.push(delete this.fields[key]);
      }
      return _results;
    };

    FormMixin.prototype.deactivateFields = function() {
      var key, _results;
      _results = [];
      for (key in this.fields) {
        _results.push(this.fields[key].deactivate());
      }
      return _results;
    };

    return FormMixin;

  })(Backbone.Edit.Mixin);

  Backbone.Edit.Form = (function(_super) {
    __extends(Form, _super);

    function Form() {
      _ref1 = Form.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    Backbone.Edit.FormMixin.add_to(Form);

    Form.prototype.initialize = function(options) {
      Form.__super__.initialize.apply(this, arguments);
      return this.initializeForm(options);
    };

    Form.prototype.render = function() {
      this.renderForm();
      return this;
    };

    Form.prototype.onShow = function() {
      Form.__super__.onShow.apply(this, arguments);
      return this.showFields();
    };

    Form.prototype.onDeactivate = function() {
      Form.__super__.onDeactivate.apply(this, arguments);
      return this.deactivateFields();
    };

    Form.prototype.beforeClose = function() {
      Form.__super__.beforeClose.apply(this, arguments);
      return this.beforeCloseFields();
    };

    Form.prototype.onClose = function() {
      Form.__super__.onClose.apply(this, arguments);
      return this.closeFields();
    };

    return Form;

  })(Backbone.Marionette.ItemView);

  Backbone.Edit.Field = (function(_super) {
    __extends(Field, _super);

    function Field() {
      _ref2 = Field.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    Backbone.Edit.FindElementMixin.add_to(Field);

    Backbone.Edit.OnContainerResizeMixin.add_to(Field);

    Field.prototype.initialize = function(options) {
      var change_keys, editor, _i, _len, _ref3;
      this.form = options.form;
      this.model = options.model;
      this.editors = [];
      if (options.key || options.errors_key || options.value || options.schema) {
        if (options.editors) {
          throw "argument error";
        }
        options.editors = [_.pick(options, 'key', 'errors_key', 'value', 'schema')];
      }
      this.error_keys = [];
      change_keys = [];
      _ref3 = options.editors;
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        editor = _ref3[_i];
        if (!_.isString(editor.key)) {
          throw "Backbone.Edit.Field: key is required";
        }
        change_keys.push("change:" + editor.key);
        editor.errors_key = editor.errors_key || editor.key;
        if (_.isString(editor.schema)) {
          editor.schema = {
            type: editor.schema
          };
        } else {
          editor.schema = _.extend({}, editor.schema || {});
        }
        helpers.setSchemaDefaults(editor.schema, editor.key);
      }
      if (this.model) {
        this.bindTo(this.model, "serverErrorsChanged", this.on_serverSideValidation);
        this.bindTo(this.model, "clientErrorsChanged", this.on_clientSideValidation);
        this.bindTo(this.model, change_keys.join(" "), this.on_modelChanged);
        return this.bindTo(this.model, "change:canEdit", this.on_canEditChanged);
      }
    };

    Field.prototype.generateId = function(id) {
      var prefix;
      prefix = this.options.idPrefix;
      if (_.isString(prefix) || _.isNumber(prefix)) {
        return prefix + id;
      }
      if (_.isNull(prefix)) {
        return id;
      }
      if (this.model) {
        return "" + this.model.cid + "_" + id;
      }
      return id;
    };

    Field.prototype.formatErrors = function(schema, errors) {
      var allErrors, error, item, key, list, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref3, _ref4;
      if (schema.dataType === 'Collection') {
        allErrors = {};
        for (_i = 0, _len = errors.length; _i < _len; _i++) {
          item = errors[_i];
          if (_.isObject(item.errors)) {
            _ref3 = _.keys(item.errors);
            for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
              key = _ref3[_j];
              allErrors[key] = _.union(allErrors[key] || [], item.errors[key]);
            }
          }
        }
        errors = [];
        _ref4 = _.keys(allErrors);
        for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
          key = _ref4[_k];
          errors.push(helpers.keyToTitle(key) + " " + allErrors[key]);
        }
      }
      if (errors instanceof Array) {
        list = $("<ul></ul>");
        for (_l = 0, _len3 = errors.length; _l < _len3; _l++) {
          error = errors[_l];
          if (_.isObject(error) && !_.isUndefined(error.message)) {
            list.append($("<li></li>").text(error.message));
          } else if (_.isBoolean(error)) {

          } else {
            list.append($("<li></li>").text(error.toString()));
          }
        }
        return list.html();
      } else {
        return _.string.escapeHTML(errors.toString());
      }
    };

    Field.prototype.filter_errors = function(itemErrors) {
      return itemErrors;
    };

    Field.prototype.hasErrors = function(errorType) {
      var editor, errorsHtml, filtered, _i, _len, _ref3;
      if (errorType !== "serverErrors" && errorType !== "clientErrors") {
        throw "invalid type " + errorType;
      }
      errorsHtml = [];
      _ref3 = this.options.editors;
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        editor = _ref3[_i];
        filtered = this.filter_errors(this.model[errorType][editor.errors_key]);
        if (filtered) {
          errorsHtml.push(this.formatErrors(editor.schema, filtered));
        }
      }
      if (errorsHtml.length > 0) {
        return errorsHtml.join('');
      } else {
        return null;
      }
    };

    Field.prototype.hasServerSideErrors = function() {
      return this.hasErrors("serverErrors");
    };

    Field.prototype.hasClientSideErrors = function() {
      return this.hasErrors("clientErrors");
    };

    Field.prototype.on_serverSideValidation = function() {
      var itemErrors;
      itemErrors = this.hasErrors("serverErrors");
      if (_.isString(itemErrors)) {
        return this.setError(itemErrors);
      } else {
        return this.clearError();
      }
    };

    Field.prototype.on_clientSideValidation = function() {
      var itemErrors;
      itemErrors = this.hasErrors("clientErrors");
      if (_.isString(itemErrors)) {
        return this.setError(itemErrors);
      } else {
        return this.clearError();
      }
    };

    Field.prototype.on_modelChanged = function(model, value, options) {
      var changed, editor, key, _i, _len, _ref3, _results;
      changed = this.model.changedAttributes();
      _ref3 = this.editors;
      _results = [];
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        editor = _ref3[_i];
        key = editor.field_editor_options.key;
        _.has(changed, key);
        _results.push(editor.setValue(this.model.get(key)));
      }
      return _results;
    };

    Field.prototype.getCanEdit = function() {
      if (_.isFunction(this.model.canEdit)) {
        return this.model.canEdit();
      } else {
        return true;
      }
    };

    Field.prototype.on_canEditChanged = function(model, newValue) {
      return this.setEditable(newValue);
    };

    Field.prototype.setEditable = function(canEdit) {
      var editor, _i, _len, _ref3, _results;
      if (!_.isBoolean(canEdit)) {
        throw "setEditable: expected a boolean";
      }
      _ref3 = this.editors;
      _results = [];
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        editor = _ref3[_i];
        _results.push(editor.setEditable(canEdit));
      }
      return _results;
    };

    Field.prototype.on_editorChanged = function(editor) {
      if (!(editor instanceof Backbone.Marionette.View)) {
        throw "expected an editor";
      }
      this.logValue();
      return editor.commit();
    };

    Field.prototype.findErrorClassElement = function() {
      var $element;
      $element = this.$el.hasClass('control-group') ? this.$el : this.$el.find('.control-group');
      if ($element === 0) {
        throw "field.setError: control-group element was not found";
      }
      return $element;
    };

    Field.prototype.setError = function(errHtml) {
      var $element, errClass;
      errClass = Backbone.Edit.classNames.error;
      $element = this.findErrorClassElement().addClass(errClass);
      if (this.$help) {
        return this.$help.html(errHtml);
      }
    };

    Field.prototype.clearError = function() {
      var errClass, helpMsg;
      errClass = Backbone.Edit.classNames.error;
      this.findErrorClassElement().removeClass(errClass);
      if (this.$help) {
        this.$help.empty();
      }
      helpMsg = this.options.editors[0].schema.help;
      if (helpMsg) {
        return this.$help.text(helpMsg);
      }
    };

    Field.prototype.commit = function(editor) {
      if (!(editor instanceof Backbone.Marionette.View)) {
        throw "expected an editor";
      }
      return editor.commit();
    };

    Field.prototype.getValue = function() {
      if (this.editors.length === 1) {
        return this.editors[0].getValue();
      } else {
        throw "getValue: not supported";
      }
    };

    Field.prototype.setValue = function(value) {
      if (this.editors.length === 1) {
        return this.editors[0].setValue(value);
      } else {
        throw "setValue: not supported";
      }
    };

    Field.prototype.setFocus = function() {
      if (this.editors.length >= 1) {
        return this.editors[0].focus();
      }
    };

    Field.prototype.logValue = function() {
      if (!console || !console.log) {

      }
    };

    Field.prototype._closeEditors = function() {
      var editor, _i, _len, _ref3;
      _ref3 = this.editors;
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        editor = _ref3[_i];
        editor.off('change');
        editor.close();
      }
      return this.editors = [];
    };

    Field.prototype.on_container_resize = function(details) {
      if (details.widthChanged) {
        return this.setAutosizedWidth();
      }
    };

    Field.prototype.setAutosizedWidth = function() {
      var $parent, addOnWidth, editor, element, inputWidth, input_padding, _i, _len, _ref3;
      if (this.isAutosized() && this.editors.length === 1) {
        editor = this.editors[0];
        $parent = editor.$el.parent();
        addOnWidth = 0;
        _ref3 = $parent.find('.add-on');
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          element = _ref3[_i];
          addOnWidth = addOnWidth + $(element).outerWidth();
        }
        if (addOnWidth > 0) {
          editor.$el.css('width', '');
          input_padding = editor.$el.outerWidth() - editor.$el.width();
          inputWidth = editor.$el.outerWidth();
          return editor.$el.css('width', "" + (inputWidth - addOnWidth - input_padding) + "px");
        }
      }
    };

    Field.prototype.isAutosized = function() {
      var schema;
      schema = this.options.editors[0].schema;
      return (schema.append || schema.prepend) && !schema.editorAttrs;
    };

    Field.prototype.beforeClose = function() {
      Field.__super__.beforeClose.apply(this, arguments);
      return this._closeEditors();
    };

    Field.prototype.onShow = function(wasAlreadyActive) {
      var editor, _i, _len, _ref3, _results;
      Field.__super__.onShow.apply(this, arguments);
      if (this.isAutosized() && !wasAlreadyActive) {
        this.setContainer(this.$el.parent());
      }
      _ref3 = this.editors;
      _results = [];
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        editor = _ref3[_i];
        _results.push(editor.show());
      }
      return _results;
    };

    Field.prototype.onDeactivate = function() {
      var editor, _i, _len, _ref3;
      Field.__super__.onDeactivate.apply(this, arguments);
      _ref3 = this.editors;
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        editor = _ref3[_i];
        editor.deactivate();
      }
      if (this.isAutosized()) {
        return this.setContainer(null);
      }
    };

    Field.prototype.onClose = function() {
      var editor, _i, _len, _ref3, _results;
      Field.__super__.onClose.apply(this, arguments);
      _ref3 = this.editors;
      _results = [];
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        editor = _ref3[_i];
        _results.push(editor.close());
      }
      return _results;
    };

    Field.prototype.render = function() {
      var $editorPlaceholder, $field, $inputContainer, append, attr_index, editor_object, editor_options, i, options, prepend, template_args, template_name, templates, _i, _j, _k, _len, _len1, _len2, _ref3, _ref4, _ref5;
      templates = Backbone.Edit.templates;
      this._closeEditors();
      template_args = {
        help: '<div class="bbf-placeholder-help"></div>'
      };
      _ref3 = this.options.editors;
      for (i = _i = 0, _len = _ref3.length; _i < _len; i = ++_i) {
        editor_options = _ref3[i];
        options = {
          form: this.form,
          key: editor_options.key,
          schema: editor_options.schema,
          idPrefix: this.options.idPrefix,
          id: this.generateId(editor_options.key)
        };
        if (this.model) {
          options.model = this.model;
          options.editable = this.getCanEdit();
        } else {
          options.value = editor_options.value;
        }
        editor_object = helpers.createEditor(editor_options.schema.type, options);
        editor_object.field_editor_options = editor_options;
        editor_object.on('changed', this.on_editorChanged, this);
        this.editors.push(editor_object);
        attr_index = i === 0 ? "" : "_" + i;
        template_args["key" + attr_index] = editor_options.key;
        template_args["title" + attr_index] = editor_options.schema.title;
        template_args["id" + attr_index] = editor_object.id;
        template_args["type" + attr_index] = editor_options.schema.type;
        template_args["editor" + attr_index] = "<div class=\"bbf-placeholder-editor" + attr_index + "\"></div>";
      }
      template_name = this.options.editors[0].schema.template;
      $field = $(_.string.trim(templates[template_name](template_args)));
      _ref4 = this.options.editors;
      for (i = _j = 0, _len1 = _ref4.length; _j < _len1; i = ++_j) {
        editor_options = _ref4[i];
        editor_object = this.editors[i];
        attr_index = i === 0 ? "" : "_" + i;
        $editorPlaceholder = $(".bbf-placeholder-editor" + attr_index, $field);
        if (editor_options.schema.prepend || editor_options.schema.append) {
          $inputContainer = $editorPlaceholder;
          $inputContainer.removeClass('bbf-placeholder-editor');
          $editorPlaceholder = $("<div class=\"bbf-placeholder-editor" + attr_index + "\"></div>");
          $inputContainer.append($editorPlaceholder);
          if (editor_options.schema.prepend) {
            prepend = $('<span class="add-on"></span>');
            prepend.text(editor_options.schema.prepend);
            $inputContainer.addClass('input-prepend');
            prepend.insertBefore($editorPlaceholder);
          }
          if (editor_options.schema.append) {
            append = $('<span class="add-on"></span>');
            append.text(editor_options.schema.append);
            $inputContainer.addClass('input-append');
            append.insertAfter($editorPlaceholder);
          }
        }
        $editorPlaceholder.replaceWith(editor_object.render().el);
        if (editor_options.schema.fieldClass) {
          $field.addClass(editor_options.schema.fieldClass);
        }
        if (editor_options.schema.fieldAttrs) {
          $field.attr(editor_options.schema.fieldAttrs);
        }
      }
      this.$help = $('.bbf-placeholder-help', $field).parent();
      if (this.$help) {
        this.$help.empty();
      }
      this.setElement($field);
      if (this.isActive) {
        _ref5 = this.editors;
        for (_k = 0, _len2 = _ref5.length; _k < _len2; _k++) {
          editor_object = _ref5[_k];
          editor_object.show();
        }
      }
      if (this.$help) {
        if (this.model && this.model.serverErrors && this.hasErrors("serverErrors")) {
          this.on_serverSideValidation();
        } else if (this.model && this.model.clientErrors && this.hasErrors("clientErrors")) {
          this.on_clientSideValidation();
        } else {
          this.clearError();
        }
      }
      return this;
    };

    return Field;

  })(Backbone.Marionette.View);

  Backbone.Edit.editors = {};

  Backbone.Edit.setTemplates = helpers.setTemplates;

  templates = {
    form: '<form class="bbf-form">{{fieldsets}}</form>',
    fieldset: '<fieldset>{{legend}}<ul>{{fields}}</ul></fieldset>',
    field: '<li class="bbf-field bbf-field{{type}}">' +
          '<label for="{{id}}">{{title}}</label>' +
          '<div class="bbf-editor bbf-editor{{type}}">{{editor}}</div>' +
          '<div class="bbf-help">{{help}}</div>' +
          '</li>'
  };

  classNames = {
    error: 'bbf-error'
  };

  Backbone.Edit.setTemplates(templates, classNames);

}).call(this);
