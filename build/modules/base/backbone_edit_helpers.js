(function() {
  var helpers,
    __slice = [].slice;

  if (!Backbone.Edit) {
    Backbone.Edit = {};
  }

  if (!Backbone.Edit.options) {
    Backbone.Edit["enum"] = {};
  }

  Backbone.Edit["enum"].DefaultValue = {
    backbone_edit_enum: "DefaultValue"
  };

  if (!Backbone.Edit.helpers) {
    Backbone.Edit.helpers = {};
  }

  helpers = Backbone.Edit.helpers;

  if (!helpers.dom) {
    helpers.dom = {};
  }

  helpers.dom.element_equal_or_contains = function(element, target) {
    if (!_.isElement(element) || !_.isElement(target)) {
      throw "arg should be a dom element";
    }
    return element === target || $.contains(element, target);
  };

  helpers.getObjectByName = function(name) {
    var object;
    if (_.isFunction(name) || _.isObject(name)) {
      return name;
    }
    object = Backbone.Relational.store.getObjectByName(name);
    if (!object) {
      throw "failed to find object " + name;
    }
    return object;
  };

  helpers.keyToTitle = function(str) {
    str = _.string.humanize(str);
    str = _.string.titleize(str);
    return str;
  };

  helpers.createTemplate = function(str, context) {
    var template, _interpolateBackup;
    _interpolateBackup = _.templateSettings.interpolate;
    _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;
    template = _.template(str);
    _.templateSettings.interpolate = _interpolateBackup;
    if (!context) {
      return template;
    } else {
      return template(context);
    }
  };

  helpers.setTemplates = function(templates, classNames) {
    var createTemplate, key, template;
    createTemplate = helpers.createTemplate;
    Backbone.Edit.templates = Backbone.Edit.templates || {};
    Backbone.Edit.classNames = Backbone.Edit.classNames || {};
    for (key in templates) {
      template = templates[key];
      if (_.isString(template)) {
        template = createTemplate(template);
      }
      Backbone.Edit.templates[key] = template;
    }
    return _.extend(Backbone.Edit.classNames, classNames);
  };

  helpers.setSchemaDefaults = function(schema, key) {
    if (!schema.type) {
      schema.type = (function() {
        switch (schema.dataType) {
          case 'Date':
            return 'Date';
          case 'DateTime':
            return 'DateTime';
          case 'Model':
            return 'Select';
          case 'Number':
            return 'Number';
          case 'Boolean':
            return 'Checkbox';
          case 'Decimal':
            return 'Text';
          case 'Currency':
            return 'Currency';
          default:
            return 'Text';
        }
      })();
    }
    if (!schema.title) {
      schema.title = helpers.keyToTitle(key);
    }
    if (!schema.template) {
      schema.template = 'field';
    }
    if (!schema.placeholder) {
      schema.placeholder = schema.title;
      if (Backbone.Validators && Backbone.Validators.hasValidator(schema, "required")) {
        schema.placeholder += " (required)";
      }
    }
    if (_.isUndefined(schema.readOnly)) {
      schema.readOnly = false;
    }
    if (!schema.field) {
      return schema.field = Backbone.Edit.Field;
    }
  };

  helpers.mergeSchema = function() {
    var base, e, extend, key, keys, schema, schema_row, _i, _j, _k, _len, _len1, _len2, _ref;
    base = arguments[0], extend = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    schema = {};
    keys = [_.keys(base)];
    for (_i = 0, _len = extend.length; _i < _len; _i++) {
      e = extend[_i];
      keys.push(_.keys(e));
    }
    _ref = _.union.apply(_, keys);
    for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
      key = _ref[_j];
      schema_row = [{}, base[key] || {}];
      for (_k = 0, _len2 = extend.length; _k < _len2; _k++) {
        e = extend[_k];
        schema_row.push(e[key] || {});
      }
      schema[key] = _.extend.apply(_, schema_row);
    }
    return schema;
  };

  helpers.createEditor = function(schemaType, options) {
    var ConstructorFn;
    if (_.isString(schemaType)) {
      if (_.isFunction(Backbone.Edit.editors[schemaType])) {
        ConstructorFn = Backbone.Edit.editors[schemaType];
      } else {
        throw "" + schemaType + " is not a Backbone.Edit editor";
      }
    } else {
      ConstructorFn = schemaType;
    }
    return new ConstructorFn(options);
  };

  Backbone.Edit.helpers = helpers;

}).call(this);
