(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (!Backbone.Edit) {
    Backbone.Edit = {};
  }

  Backbone.Edit.Mixin = (function() {
    function Mixin() {}

    return Mixin;

  })();

  Backbone.Edit.Mixin.add_to = function(object) {
    var key, value, _ref, _results;
    _ref = this.prototype;
    _results = [];
    for (key in _ref) {
      value = _ref[key];
      if (key !== "constructor") {
        _results.push(object.prototype[key] = value);
      }
    }
    return _results;
  };

  Backbone.Edit.FindElementMixin = (function(_super) {
    __extends(FindElementMixin, _super);

    function FindElementMixin() {
      _ref = FindElementMixin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    FindElementMixin.prototype.findElement = function(search) {
      var elements;
      elements = this.$(search);
      if (elements.length !== 1) {
        throw "element " + search + " found " + elements.length + " times (expected 1 instance)";
      } else {

      }
      return $(elements[0]);
    };

    FindElementMixin.prototype.findChildElement = function(search) {
      var elements;
      elements = this.$el.children(search);
      if (elements.length !== 1) {
        throw "element " + search + " found " + elements.length + " times (expected 1 instance)";
      } else {

      }
      return $(elements[0]);
    };

    return FindElementMixin;

  })(Backbone.Edit.Mixin);

}).call(this);

;;
(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Backbone.Edit.SoftDeleteMixin = (function(_super) {
    __extends(SoftDeleteMixin, _super);

    function SoftDeleteMixin() {
      _ref = SoftDeleteMixin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    SoftDeleteMixin.prototype.initializeSoftDelete = function() {
      return this.on('change:deleted_at change:_destroy', this.on_checkDeleted, this);
    };

    SoftDeleteMixin.prototype.isDeleted = function() {
      return this.has("deleted_at") || this.has("_destroy");
    };

    SoftDeleteMixin.prototype.isActive = function() {
      return !this.isDeleted();
    };

    SoftDeleteMixin.prototype.on_checkDeleted = function() {
      var newValue;
      newValue = this.isDeleted();
      if (newValue !== this.previousDeleted) {
        this.previousDeleted = newValue;
        return this.trigger("change:isDeleted", this, newValue, {});
      }
    };

    SoftDeleteMixin.prototype.destroy = function(options) {
      if (this.isNew()) {
        return this.trigger('destroy', this, this.collection, options);
      } else {
        return this.set("_destroy", true, options);
      }
    };

    return SoftDeleteMixin;

  })(Backbone.Edit.Mixin);

}).call(this);

;;
(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Backbone.Edit.OnContainerResizeMixin = (function(_super) {
    __extends(OnContainerResizeMixin, _super);

    function OnContainerResizeMixin() {
      _ref = OnContainerResizeMixin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    OnContainerResizeMixin.prototype._container_resize = function() {
      var details;
      details = {
        widthChanged: false,
        heightChanged: false
      };
      if (this.container_previous_width !== this.container.width()) {
        details.widthChanged = true;
        details.previous_width = this.container_previous_width;
        details.new_width = this.container.width();
        this.container_previous_width = details.new_width;
      }
      if (this.container_previous_height !== this.container.height()) {
        details.heightChanged = true;
        details.previous_height = this.container_previous_height;
        details.new_height = this.container.height();
        this.container_previous_height = details.new_height;
      }
      if (details.widthChanged || details.heightChanged) {
        return this.on_container_resize(details);
      }
    };

    OnContainerResizeMixin.prototype.setContainer = function(value) {
      if (!this._container_bindAll) {
        this._container_bindAll = true;
        _.bindAll(this, '_container_resize');
      }
      if (this.container !== value) {
        if (this.container) {
          this.container.off('resize', this._container_resize);
        }
        this.container = value;
        if (this.container) {
          this.container_previous_width = null;
          this.container_previous_height = null;
          this.container.on('resize', this._container_resize);
          return this._container_resize();
        }
      }
    };

    return OnContainerResizeMixin;

  })(Backbone.Edit.Mixin);

}).call(this);

;;
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
    var object, parts;
    if (_.isFunction(name) || _.isObject(name)) {
      return name;
    }
    parts = name.split('.');
    object = window[parts.shift()];
    while (obj && parts.length) {
      object = object[parts.shift()];
    }
    if (!object) {
      throw "failed to find object " + name;
    }
    return object;
  };

  helpers.isCollection = function(object) {
    return (object instanceof Backbone.Collection) || (Backbone.Subset && object instanceof Backbone.Subset);
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

  if (_.isUndefined(window.categorizr)) {
    helpers.categorizr = {
      isDesktop: true
    };
  } else {
    helpers.categorizr = categorizr;
  }

}).call(this);

;;
(function() {
  var converters, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (!Backbone.Edit) {
    Backbone.Edit = {};
  }

  if (!Backbone.Edit.converters) {
    Backbone.Edit.converters = {};
  }

  converters = Backbone.Edit.converters;

  Backbone.Edit.dateConverter = (function() {
    dateConverter.prototype.string_check = /^(\d{4})[-\/](\d{2})[-\/](\d{2})$/;

    function dateConverter() {
      this.fromDateToString = this.toServerString;
      this.fromStringToDate = this.fromServerString;
    }

    dateConverter.prototype.fromServerString = function(string) {
      if (_.isNull(string) || _.isUndefined(string)) {
        return null;
      }
      return this.fromServerString_ToMoment(string).toDate();
    };

    dateConverter.prototype.fromServerString_ToMoment = function(string) {
      var m;
      if (_.isNull(string) || _.isUndefined(string)) {
        return null;
      }
      if (!_.isString(string) || !this.string_check.test(string)) {
        throw "dateConverter.fromServerString() expected a \"YYYY-MM-DD\" string but got " + string;
      }
      m = moment(string, "YYYY-MM-DD");
      if (!m.isValid()) {
        throw "date invalid";
      }
      return m;
    };

    dateConverter.prototype.toServerString = function(date) {
      var m;
      if (_.isNull(date)) {
        return null;
      } else {
        if (!_.isDate(date)) {
          throw "dateConverter.toServerString() expected a date but got " + date;
        }
        return m = moment(date).local().format("YYYY-MM-DD");
      }
    };

    return dateConverter;

  })();

  Backbone.Edit.dateTimerConverter = (function() {
    dateTimerConverter.prototype.isoFormat = 'YYYY-MM-DDTHH:mm:ssZ';

    dateTimerConverter.prototype.string_check = /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[0-1]|0[1-9]|[1-2][0-9])T(2[0-3]|[0-1][0-9]):([0-5][0-9]):([0-5][0-9])(\.[0-9]+)?(Z|[+-](?:2[0-3]|[0-1][0-9]):[0-5][0-9])?$/;

    function dateTimerConverter() {
      this.fromDateToString = this.toServerString;
      this.fromStringToDate = this.fromServerString;
    }

    dateTimerConverter.prototype.fromServerString = function(string) {
      if (_.isNull(string) || _.isUndefined(string)) {
        return null;
      }
      return this.fromServerString_ToMoment(string).toDate();
    };

    dateTimerConverter.prototype.fromServerString_ToMoment = function(string) {
      var m;
      if (_.isNull(string) || _.isUndefined(string)) {
        return null;
      }
      if (!_.isString(string) || !this.string_check.test(string)) {
        throw "dateTimerConverter.fromServerString() expected a string but got " + string;
      }
      m = moment(string, this.isoFormat);
      if (!m.isValid()) {
        throw "date invalid";
      }
      return m;
    };

    dateTimerConverter.prototype.toServerString = function(date) {
      var m;
      if (_.isNull(date)) {
        return null;
      } else {
        if (!_.isDate(date)) {
          throw "dateTimerConverter.toServerString() expected a date but got " + date;
        }
        return m = moment(date).local().format(this.isoFormat);
      }
    };

    return dateTimerConverter;

  })();

  Backbone.Edit.decimalConverter = (function() {
    function decimalConverter() {}

    decimalConverter.prototype.string_check = /^[-+]?\d*\.?\d*$/;

    decimalConverter.prototype.fromServerString_ToFloat = function(string) {
      if (_.isNull(string)) {
        return null;
      }
      if (!_.isString(string) || !this.string_check.test(string)) {
        throw "decimalConverter.fromServerString() expected a string but got " + string;
      }
      return parseFloat(string);
    };

    return decimalConverter;

  })();

  Backbone.Edit.currencyConverter = (function() {
    function currencyConverter() {}

    currencyConverter.prototype.fromServerValue_ToBaseUnit = function(integer) {
      if (_.isNull(integer) || _.isUndefined(integer)) {
        return null;
      }
      if (!_.isFinite(integer)) {
        throw "currencyConverter.fromServerValue_ToBaseUnit() expected a number but got " + integer;
      }
      return integer / 100;
    };

    currencyConverter.prototype.toServerValue_FromPounds = function(baseUnit) {
      if (_.isNull(baseUnit) || _.isUndefined(baseUnit)) {
        return null;
      }
      return baseUnit * 100;
    };

    return currencyConverter;

  })();

  converters.date = new Backbone.Edit.dateConverter();

  converters.dateTime = new Backbone.Edit.dateTimerConverter();

  converters.decimal = new Backbone.Edit.decimalConverter();

  converters.currency = new Backbone.Edit.currencyConverter();

  Backbone.Edit.ConverterMixin = (function(_super) {
    __extends(ConverterMixin, _super);

    function ConverterMixin() {
      _ref = ConverterMixin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    ConverterMixin.prototype.converter = function(attr) {
      var itemSchema;
      itemSchema = this.schema[attr];
      if (itemSchema.dataType === "Date") {
        return converters.date;
      } else if (itemSchema.dataType === "DateTime") {
        return converters.dateTime;
      } else if (itemSchema.dataType === "Decimal") {
        return converters.decimal;
      } else {
        throw "ConverterMixin.convert, dataType " + itemSchema.dataType + " is not supported";
      }
    };

    ConverterMixin.prototype.convert = function(attr, to) {
      var converter, method;
      converter = this.converter(attr);
      if (to === "jsDate") {
        method = "fromServerString";
      } else if (to === "Moment") {
        method = "fromServerString_ToMoment";
      } else if (to === "Float") {
        method = "fromServerString_ToFloat";
      } else {
        throw "ConverterMixin.convert, to '" + to + "' is not supported";
      }
      return converter[method](this.get(attr));
    };

    return ConverterMixin;

  })(Backbone.Edit.Mixin);

}).call(this);

;;
(function() {
  var converters, formatters, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (!Backbone.Edit) {
    Backbone.Edit = {};
  }

  if (!Backbone.Edit.formatters) {
    Backbone.Edit.formatters = {};
  }

  formatters = Backbone.Edit.formatters;

  converters = Backbone.Edit.converters;

  formatters.dataTypes = {
    "Date": "dateFormater",
    "DateTime": "dateTimeFormater",
    "Model": "modelFormater",
    "Collection": "collectionFormater",
    "Decimal": "decimalFormater",
    "Text": "textFormater",
    "Currency": "currencyFormatter"
  };

  formatters.find_by_data_type = function(type) {
    var formatterName;
    if (formatterName = formatters.dataTypes[type]) {
      return formatters[formatterName];
    } else {
      return null;
    }
  };

  formatters.defaultFormater = function(value) {
    if (_.isNull(value) || _.isUndefined(value)) {
      return "";
    } else if (value instanceof Backbone.Model) {
      return formatters.modelFormater(value);
    } else if (value instanceof Backbone.Collection) {
      return formatters.collectionFormater(value);
    } else if (_.isDate(value)) {
      return formatters.dateFormater(value);
    } else {
      return _.string.escapeHTML(value.toString());
    }
  };

  formatters.decimalFormater = function(value) {
    if (_.isNull(value) || _.isUndefined(value)) {
      return "";
    } else {
      return _.string.escapeHTML(value.toString());
    }
  };

  formatters.textFormater = function(value) {
    if (_.isNull(value) || _.isUndefined(value)) {
      return "";
    } else {
      return _.string.escapeHTML(value.toString());
    }
  };

  formatters.currencyFormatter = function(value) {
    var baseUnit;
    if (_.isNull(value) || _.isUndefined(value)) {
      return "";
    } else if (_.isFinite(value)) {
      baseUnit = converters.currency.fromServerValue_ToBaseUnit(value);
      return "£ " + numeral(baseUnit).format('0.00');
    } else {
      return "?";
    }
  };

  formatters.dateFormater = function(value) {
    var date;
    if (_.isDate(value)) {
      return moment(value).format("DD-MM-YYYY");
    } else if (_.isString(value)) {
      date = converters.date.fromServerString(value);
      return moment(date).format("DD-MM-YYYY");
    } else if (_.isNull(value) || _.isUndefined(value)) {
      return "";
    } else {
      return "?";
    }
  };

  formatters.dateTimeFormater = function(value) {
    var date;
    if (_.isDate(value)) {
      return moment(value).format("DD-MM-YYYY");
    } else if (_.isString(value)) {
      date = converters.dateTime.fromServerString(value);
      return moment(date).format("DD-MM-YYYY");
    } else if (_.isNull(value) || _.isUndefined(value)) {
      return "";
    } else {
      return "?";
    }
  };

  formatters.modelFormater = function(value, options) {
    var text;
    if (value instanceof Backbone.Model) {
      text = value.toString();
      if (options && options.lazy_load && value.constructor.lazy_loader && !value.isLoaded()) {
        if (value.canLoad()) {
          value.constructor.lazy_loader.fetchModel(value, {
            view: options.lazy_load.view,
            callback: options.lazy_load.callback
          });
          if (_.isUndefined(text)) {
            text = "loading...";
          }
        }
        if (value.getLoadError() && _.isUndefined(text)) {
          text = value.getLoadError();
        }
      } else if (_.isUndefined(text)) {
        text = "?";
      }
      text = _.string.escapeHTML(text);
      if (value.isDeleted && value.isDeleted()) {
        text = "<del>" + text + "</del>";
      }
      return text;
    } else if (_.isNull(value) || _.isUndefined(value)) {
      return "";
    } else {
      return "?";
    }
  };

  formatters.collectionFormater = function(value, modelFormater, options) {
    if (modelFormater == null) {
      modelFormater = formatters.modelFormater;
    }
    if (Backbone.Edit.helpers.isCollection(value)) {
      return formatters.arrayFormater(value.models, modelFormater, options);
    } else if (_.isNull(value) || _.isUndefined(value)) {
      return "";
    } else {
      return "?";
    }
  };

  formatters.arrayFormater = function(value, modelFormater, options) {
    var model, values;
    if (modelFormater == null) {
      modelFormater = formatters.modelFormater;
    }
    if (_.isArray(value)) {
      values = (function() {
        var _i, _len, _ref, _results;
        _ref = value.slice(0, 10);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          model = _ref[_i];
          _results.push(modelFormater(model, options));
        }
        return _results;
      })();
      if (value.length > 10) {
        values.push("...");
      }
      return values.join(", ");
    } else if (_.isNull(value) || _.isUndefined(value)) {
      return "";
    } else {
      return "?";
    }
  };

  Backbone.Edit.FormatterMixin = (function(_super) {
    __extends(FormatterMixin, _super);

    function FormatterMixin() {
      _ref = FormatterMixin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    FormatterMixin.prototype.format = function(attr) {
      var formatter, itemSchema;
      itemSchema = this.schema[attr];
      formatter = formatters.find_by_data_type(itemSchema.dataType);
      return formatter(this.get(attr));
    };

    return FormatterMixin;

  })(Backbone.Edit.Mixin);

}).call(this);

;;
(function() {
  if (!Backbone.Slickgrid) {
    Backbone.Slickgrid = {};
  }

  Backbone.Slickgrid.FormatterBase = (function() {
    FormatterBase.prototype.formatters = {
      "Date": "dateFormater",
      "DateTime": "dateTimeFormater",
      "Model": "modelFormater",
      "Collection": "collectionFormater",
      "Array": "arrayFormater",
      "Decimal": "decimalFormater",
      "Text": "textFormater",
      "Currency": "currencyFormatter"
    };

    function FormatterBase(view) {
      this.view = view;
      this.lazy_load_options = {
        lazy_load: {
          view: this.view,
          callback: this.view.on_row_data_loaded
        }
      };
      this.get_related_options = {
        "return": "model",
        view: this.view,
        callback: this.view.on_row_data_loaded
      };
      if (!(this.view instanceof Backbone.Marionette.View)) {
        throw "expected a Backbone.Slickgrid.View";
      }
      _.bindAll(this, "decimalFormater", "defaultFormater", "dateFormater", "currencyFormatter", "dateTimeFormater", "modelFormater", "collectionFormater", "arrayFormater");
    }

    FormatterBase.prototype.getFormatter = function(column) {
      var formatterName;
      if (column.schema && column.schema.formatter && this[column.schema.formatter]) {
        return this[column.schema.formatter];
      } else if (column.dataType && this.formatters[column.dataType]) {
        formatterName = this.formatters[column.dataType];
        return this.get(formatterName);
      } else {
        return this.defaultFormater;
      }
    };

    FormatterBase.prototype.get = function(formatterName) {
      return this[formatterName];
    };

    FormatterBase.prototype.rowIndexFormater = function(row, cell, value, col, data) {
      return row + 1;
    };

    FormatterBase.prototype.defaultFormater = function(row, cell, value, col, data) {
      value = _.isArray(col.field) ? this.loadNestedAttribute(col, data) : data.get(col.field);
      return Backbone.Edit.formatters.defaultFormater(value);
    };

    FormatterBase.prototype.decimalFormater = function(row, cell, value, col, data) {
      value = _.isArray(col.field) ? this.loadNestedAttribute(col, data) : data.get(col.field);
      return Backbone.Edit.formatters.decimalFormater(value);
    };

    FormatterBase.prototype.textFormater = function(row, cell, value, col, data) {
      value = _.isArray(col.field) ? this.loadNestedAttribute(col, data) : data.get(col.field);
      return Backbone.Edit.formatters.textFormater(value);
    };

    FormatterBase.prototype.currencyFormatter = function(row, cell, value, col, data) {
      value = _.isArray(col.field) ? this.loadNestedAttribute(col, data) : data.get(col.field);
      return Backbone.Edit.formatters.currencyFormatter(value);
    };

    FormatterBase.prototype.dateFormater = function(row, cell, value, col, data) {
      value = _.isArray(col.field) ? this.loadNestedAttribute(col, data) : data.get(col.field);
      return Backbone.Edit.formatters.dateFormater(value);
    };

    FormatterBase.prototype.dateTimeFormater = function(row, cell, value, col, data) {
      value = _.isArray(col.field) ? this.loadNestedAttribute(col, data) : data.get(col.field);
      return Backbone.Edit.formatters.dateTimeFormater(value);
    };

    FormatterBase.prototype.modelFormater = function(row, cell, value, col, data) {
      if (_.isArray(col.field)) {
        value = this.loadNestedAttribute(col, data);
      } else if (col.schema && col.schema.custom_get) {
        value = data.get(col.field);
      } else if (data.getRelated) {
        value = data.getRelated(col.field, this.get_related_options);
      } else {
        value = data.get(col.field);
      }
      return Backbone.Edit.formatters.modelFormater(value, this.lazy_load_options);
    };

    FormatterBase.prototype.collectionFormater = function(row, cell, value, col, data) {
      value = _.isArray(col.field) ? this.loadNestedAttribute(col, data) : data.get(col.field);
      return Backbone.Edit.formatters.collectionFormater(value, Backbone.Edit.formatters.modelFormater, this.lazy_load_options);
    };

    FormatterBase.prototype.arrayFormater = function(row, cell, value, col, data) {
      value = _.isArray(col.field) ? this.loadNestedAttribute(col, data) : data.get(col.field);
      return Backbone.Edit.formatters.arrayFormater(value, Backbone.Edit.formatters.modelFormater, this.lazy_load_options);
    };

    FormatterBase.prototype.loadNestedAttribute = function(column, data) {
      var attr, i, last_i, model, _i, _len, _ref;
      model = data;
      last_i = column.field.length - 1;
      _ref = column.field;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        attr = _ref[i];
        if (i > 0) {
          this.view.bindToModel(model, attr);
        }
        if (i === last_i) {
          return model.get(attr);
        } else {
          if (model.getRelated) {
            model = model.getRelated(attr, this.get_related_options);
          } else {
            model = model.get(attr);
          }
          if (model === null) {
            return null;
          }
        }
      }
    };

    return FormatterBase;

  })();

}).call(this);

;;
(function() {
  var editors, _ref, _ref1, _ref2, _ref3,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (!Backbone.Slickgrid) {
    Backbone.Slickgrid = {};
  }

  if (!Backbone.Slickgrid.editors) {
    Backbone.Slickgrid.editors = {};
  }

  editors = Backbone.Slickgrid.editors;

  editors.getEditor_default = function(schema) {
    if ((schema.type === 'Select') || (schema.type === 'GroupedSelect')) {
      return editors.SelectEditor;
    } else if ((schema.dataType === 'Text') && (schema.type === 'AutoSizeTextArea')) {
      return editors.Detached.MultiLineText;
    } else {
      return editors.DefaultEditor;
    }
  };

  editors.getEditor = editors.getEditor_default;

  editors.Base = (function() {
    function Base(args) {
      this.args = args;
      this.column = args.column;
      this.item = args.item;
      this.grid = args.grid;
      if (!this.column || !this.item || !this.grid) {
        throw "argument missing";
      }
      this.valueBeforeEdit = this.item.get(this.column.field);
      this.constructEditor();
      this.appendEditor(args);
      this.editorFocus();
    }

    Base.prototype.editorAttrs = function(currentAttrs) {
      return currentAttrs;
    };

    Base.prototype.editorOptions = function() {
      var options;
      options = {};
      options.schema = _.clone(this.column.schema);
      options.schema.editorAttrs = this.editorAttrs(options.schema.editorAttrs);
      options.model = this.item;
      options.key = this.column.field;
      options.editable = true;
      return options;
    };

    Base.prototype.constructEditor = function() {
      var editorOptions;
      if (this.editor) {
        throw "already set";
      }
      editorOptions = this.editorOptions();
      this.editor = Backbone.Edit.helpers.createEditor(this.column.schema.type, editorOptions);
      this.editor.on('changed', this.on_editorChanged, this);
      this.editor.on('applyingValue:start', this.applyingValue_start, this);
      this.editor.on('applyingValue:finish', this.applyingValue_finish, this);
      return this.editor;
    };

    Base.prototype.editorFocus = function() {
      return this.editor.focus();
    };

    Base.prototype.appendEditor = function(args) {
      throw "not implemented ";
    };

    Base.prototype.on_editorChanged = function() {
      var state;
      if (this.item instanceof Backbone.Model) {
        state = this.serializeValue();
        return this.applyValue(this.item, state);
      }
    };

    Base.prototype.destroy = function() {
      if (this.editor) {
        this.editor.off('changed', this.on_editorChanged, this);
        this.editor.off('applyingValue:start', this.applyingValue_start, this);
        this.editor.off('applyingValue:finish', this.applyingValue_finish, this);
        this.editor.close();
        return this.editor = null;
      }
    };

    Base.prototype.focus = function() {
      return this.editor.focus();
    };

    Base.prototype.isValueChanged = function() {
      return this.valueBeforeEdit !== this.editor.getValue();
    };

    Base.prototype.serializeValue = function() {
      if (this.editor) {
        return this.editor.getValue();
      } else {
        return "";
      }
    };

    Base.prototype.loadValue = function() {
      this.valueBeforeEdit = this.item.get(this.column.field);
      this.editor.setValue(this.valueBeforeEdit);
      if (this.valueBeforeEdit === void 0) {
        return this.valueBeforeEdit = this.editor.getValue();
      }
    };

    Base.prototype.applyingValue_start = function() {
      return this.grid.parentView.applyingValue_start();
    };

    Base.prototype.applyingValue_finish = function() {
      return this.grid.parentView.applyingValue_finish();
    };

    Base.prototype.applyValue = function(item, state) {
      if (item instanceof Backbone.Model) {
        try {
          this.applyingValue_start();
          return item.set(this.column.field, state, {
            changeSource: "ui"
          });
        } finally {
          this.applyingValue_finish();
        }
      } else {
        return item[this.column.field] = state;
      }
    };

    Base.prototype.validate = function() {
      return {
        valid: true,
        msg: null
      };
    };

    return Base;

  })();

  editors.InlineEditor = (function(_super) {
    __extends(InlineEditor, _super);

    function InlineEditor() {
      _ref = InlineEditor.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    InlineEditor.prototype.editorAttrs = function() {
      var attrs;
      if (!this._editorAttrs) {
        attrs = [];
        attrs.push('border: none;');
        attrs.push('box-shadow: none;');
        attrs.push('display: inline;');
        attrs.push('font-size: 14px;');
        attrs.push('margin: 0px;');
        attrs.push('padding: 0px;');
        attrs.push('width: 100%;');
        attrs.push('height: 100%;');
        this._editorAttrs = {
          style: attrs.join(" ")
        };
      }
      return this._editorAttrs;
    };

    InlineEditor.prototype.editorOptions = function() {
      var options;
      options = InlineEditor.__super__.editorOptions.apply(this, arguments);
      options.schema.editorAttrs = this.editorAttrs();
      return options;
    };

    InlineEditor.prototype.appendEditor = function(args) {
      if (!this.editor) {
        throw "@editor not set";
      }
      return $(args.container).append(this.editor.render().el);
    };

    return InlineEditor;

  })(editors.Base);

  editors.DefaultEditor = (function(_super) {
    __extends(DefaultEditor, _super);

    function DefaultEditor() {
      _ref1 = DefaultEditor.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    return DefaultEditor;

  })(editors.InlineEditor);

  editors.SelectEditor = (function(_super) {
    __extends(SelectEditor, _super);

    function SelectEditor(args) {
      _.bindAll(this, '_handleKeyDown');
      SelectEditor.__super__.constructor.apply(this, arguments);
    }

    SelectEditor.prototype.constructEditor = function() {
      var editor;
      editor = SelectEditor.__super__.constructEditor.apply(this, arguments);
      this.editor.$el.keydown(this._handleKeyDown);
      return editor;
    };

    SelectEditor.prototype.destroy = function() {
      if (this.editor) {
        this.editor.$el.unbind('keydown');
      }
      return SelectEditor.__super__.destroy.apply(this, arguments);
    };

    SelectEditor.prototype._handleKeyDown = function(e) {
      if ((e.which === $.ui.keyCode.UP) || (e.which === $.ui.keyCode.DOWN) || (e.which === $.ui.keyCode.RIGHT) || (e.which === $.ui.keyCode.LEFT)) {
        e.preventDefault();
        return e.stopPropagation();
      }
    };

    return SelectEditor;

  })(editors.InlineEditor);

  editors.DetachedEditor = (function(_super) {
    __extends(DetachedEditor, _super);

    function DetachedEditor(args) {
      _.bindAll(this, '_setup_click', '_handleKeyDown');
      DetachedEditor.__super__.constructor.apply(this, arguments);
      this.updateValue();
      if (!_.isUndefined(this.grid.DetachedEditor)) {
        throw "already has a DetachedEditor";
      }
      this.grid.DetachedEditor = this;
      this.wrapper.focus();
    }

    DetachedEditor.prototype.updateValue = function() {
      var activeCell, formatter, html;
      if (this.args.column.formater) {
        formatter = this.args.column.formater;
      } else {
        formatter = this.grid.getOptions().formatterFactory.getFormatter(this.args.column);
      }
      activeCell = this.grid.getActiveCell();
      html = formatter(activeCell.row, activeCell.cell, 0, this.args.column, this.args.item);
      return $(this.args.container).html(html);
    };

    DetachedEditor.prototype.appendEditor = function(args) {
      var wrapper;
      if (!this.editor) {
        throw "@editor not set";
      }
      $(this.args.container).css("border-color", "transparent silver silver transparent");
      $(this.args.container).css("border-style", "solid dotted solid solid");
      $(this.args.container).css("background-color", "#FCF8E3");
      $(this.args.container).css("color", "#C09853");
      wrapper = this.getWrapper();
      wrapper.append(this.editor.render().el);
      this.editor.show();
      return this.position(args.position);
    };

    DetachedEditor.prototype.editorAttrs = function() {
      var attrs, width;
      if (!this._editorAttrs) {
        width = $(this.args.container).width();
        if (width < 400) {
          width = 400;
        }
        attrs = [];
        attrs.push("width: " + width + "px;");
        this._editorAttrs = {
          style: attrs.join(" ")
        };
      }
      return this._editorAttrs;
    };

    DetachedEditor.prototype.editorFocus = function() {};

    DetachedEditor.prototype.getWrapper = function() {
      var self;
      self = this;
      if (!this.wrapper) {
        this.wrapper = $("<div>", {
          "tabindex": -1,
          "class": "detached-editor"
        });
        this.wrapper.appendTo(document.body);
        this.wrapper.click(this._wrapper_click);
        this.wrapper.keydown(this._handleKeyDown);
        window.setTimeout(this._setup_click, 0);
      }
      return this.wrapper;
    };

    DetachedEditor.prototype._wrapper_click = function(e) {
      return e.stopPropagation();
    };

    DetachedEditor.prototype._setup_click = function() {
      return this.ready_for_click = true;
    };

    DetachedEditor.prototype.handle_document_event = function(e) {
      if (!this.wrapper || !this.ready_for_click) {
        return;
      }
      if (this._equal_or_contains(this.wrapper[0], e.target) || this.isEditorElement(e.target)) {
        return "contains";
      } else {
        this.focus_lost = true;
        return this.cancel();
      }
    };

    DetachedEditor.prototype._equal_or_contains = function(contains, target) {
      return Backbone.Edit.helpers.dom.element_equal_or_contains(contains, target);
    };

    DetachedEditor.prototype.isEditorElement = function(target) {
      return this._equal_or_contains(this.editor.el, target);
    };

    DetachedEditor.prototype._handleKeyDown = function(e) {
      if (e.which === $.ui.keyCode.ENTER) {
        e.preventDefault();
        if (_.isFunction(this.editor.delayed_focus)) {
          return this.editor.delayed_focus();
        } else {
          return this.editor.focus();
        }
      } else if (e.which === $.ui.keyCode.ESCAPE && this.isEditorElement(e.target)) {
        this.wrapper.focus();
        this.updateValue();
        return e.preventDefault();
      } else if (e.which === $.ui.keyCode.ESCAPE) {
        e.preventDefault();
        return this.cancel();
      } else if ((e.which === $.ui.keyCode.TAB && e.shiftKey) || (e.which === $.ui.keyCode.LEFT)) {
        e.preventDefault();
        return this.grid.navigatePrev();
      } else if ((e.which === $.ui.keyCode.TAB) || (e.which === $.ui.keyCode.RIGHT)) {
        e.preventDefault();
        return this.grid.navigateNext();
      } else if (e.which === $.ui.keyCode.UP) {
        e.preventDefault();
        return this.grid.navigateUp();
      } else if (e.which === $.ui.keyCode.DOWN) {
        e.preventDefault();
        return this.grid.navigateDown();
      }
    };

    DetachedEditor.prototype.destroy = function() {
      DetachedEditor.__super__.destroy.apply(this, arguments);
      $(this.args.container).removeAttr('style');
      if (this.wrapper) {
        this.wrapper.remove();
        this.wrapper = null;
      }
      if (_.isUndefined(this.grid.DetachedEditor)) {
        throw "DetachedEditor not defined";
      }
      return delete this.grid.DetachedEditor;
    };

    DetachedEditor.prototype.hide = function() {
      if (this.wrapper) {
        return this.wrapper.addClass('hide');
      }
    };

    DetachedEditor.prototype.show = function() {
      if (this.wrapper) {
        return this.wrapper.removeClass('hide');
      }
    };

    DetachedEditor.prototype.position = function(cellBox) {
      var args;
      if (this.wrapper) {
        args = {
          of: this.args.container,
          my: "center top",
          at: "center bottom",
          offset: "0 -1",
          collision: "fit flip"
        };
        return this.wrapper.position(args);
      }
    };

    DetachedEditor.prototype.cancel = function() {
      if (this.focus_lost) {
        return this.grid.getEditorLock().cancelCurrentEdit();
      } else {
        return this.args.cancelChanges();
      }
    };

    return DetachedEditor;

  })(editors.Base);

  if (!editors.Detached) {
    editors.Detached = {};
  }

  editors.Detached.MultiLineText = (function(_super) {
    __extends(MultiLineText, _super);

    function MultiLineText() {
      _ref2 = MultiLineText.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    MultiLineText.prototype._handleKeyDown = function(e) {
      if (this.editor.el === e.target) {
        switch (e.which) {
          case $.ui.keyCode.ENTER:
          case $.ui.keyCode.UP:
          case $.ui.keyCode.DOWN:
          case $.ui.keyCode.LEFT:
          case $.ui.keyCode.RIGHT:
            return;
        }
      }
      return MultiLineText.__super__._handleKeyDown.apply(this, arguments);
    };

    return MultiLineText;

  })(editors.DetachedEditor);

  editors.Detached.Slickgrid = (function(_super) {
    __extends(Slickgrid, _super);

    function Slickgrid() {
      _ref3 = Slickgrid.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    Slickgrid.prototype.editorOptions = function() {
      var options;
      options = Slickgrid.__super__.editorOptions.apply(this, arguments);
      options.newEditorLock = true;
      return options;
    };

    Slickgrid.prototype.handle_document_event = function(e) {
      if (this.editor) {
        if (this.editor.grid && this.editor.grid.clearingTextSelection) {
          return;
        }
        this.editor.on_document_event(e);
      }
      return Slickgrid.__super__.handle_document_event.apply(this, arguments);
    };

    return Slickgrid;

  })(editors.DetachedEditor);

}).call(this);

;;
(function() {
  var SlickgridEditors, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (!Backbone.Slickgrid) {
    Backbone.Slickgrid = {};
  }

  SlickgridEditors = Backbone.Slickgrid.editors;

  if (!Backbone.Slickgrid.formatter) {
    Backbone.Slickgrid.formatter = Backbone.Slickgrid.FormatterBase;
  }

  Backbone.Slickgrid.View = (function(_super) {
    __extends(View, _super);

    function View() {
      _ref = View.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    View.prototype.className = "slickgrid";

    View.prototype.enableItemClick = false;

    View.prototype.enableCellClick = false;

    View.prototype.events = {
      'resize': 'on_resize'
    };

    View.prototype.initialize = function(options) {
      if (options == null) {
        options = {};
      }
      _.bindAll(this, "on_ContextMenu", 'on_item_click');
      this.formatter = new Backbone.Slickgrid.formatter(this);
      this.allColumns = this.getColumns();
      this.autoHeight = this._autoHeight(this.getLength());
      this.setCollection(this.collection, {
        force: true
      });
      this.toolTipEnabled = false;
      return View.__super__.initialize.apply(this, arguments);
    };

    View.prototype.gridOptions = function() {
      var gridOptions;
      gridOptions = {
        formatterFactory: this.formatter,
        autoHeight: this.autoHeight,
        fullWidthRows: true,
        forceFitColumns: true
      };
      return gridOptions;
    };

    View.prototype.schema = function() {
      if (this.options.schema) {
        return this.options.schema;
      } else if (this.collection.model && this.collection.model.prototype.schema) {
        return this.collection.model.prototype.schema;
      } else {
        return null;
      }
    };

    View.prototype.getColumns = function() {
      var column, columns, key, modelSchema, schema, value, _ref1;
      columns = [];
      modelSchema = this.schema();
      if (!modelSchema) {
        throw new Error('Could not find schema');
      }
      if (this.columns) {
        schema = {};
        _ref1 = this.columns;
        for (key in _ref1) {
          column = _ref1[key];
          column = _.clone(column);
          schema[key] = _.defaults(column, modelSchema[key], {
            visible: true
          });
        }
      } else {
        schema = modelSchema;
      }
      for (key in schema) {
        value = schema[key];
        value = _.clone(value);
        Backbone.Edit.helpers.setSchemaDefaults(value, key);
        column = {};
        column.id = key;
        column.schema = value;
        column.field = value.source ? value.source.split('.') : key;
        column.name = value.title;
        column.visible = _.isUndefined(value.visible) ? true : value.visible;
        column.canHide = _.isUndefined(value.canHide) ? true : value.canHide;
        column.dataType = value.dataType;
        if (!value.readOnly) {
          column.editor = SlickgridEditors.getEditor(value);
        }
        column.formatter = value.formatter ? this.formatter.get(value.formatter) : this.formatter.getFormatter(column);
        column.sortable = this.columnSupportsOrderBy(column);
        columns.push(column);
      }
      return columns;
    };

    View.prototype.columnSupportsOrderBy = function() {
      return false;
    };

    View.prototype.getVisibleColumns = function() {
      var column, visibleColumns, _i, _len, _ref1;
      visibleColumns = [];
      _ref1 = this.allColumns;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        column = _ref1[_i];
        if (column.visible) {
          visibleColumns.push(column);
        }
      }
      return visibleColumns;
    };

    View.prototype._findColumn = function(key) {
      var column, _i, _len, _ref1;
      _ref1 = this.allColumns;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        column = _ref1[_i];
        if (column.id === key) {
          return column;
        }
      }
      return null;
    };

    View.prototype._updateVisible = function() {
      if (this.grid) {
        this.grid.setColumns(this.getVisibleColumns());
        return this.grid.autosizeColumns();
      }
    };

    View.prototype.showColumn = function(key) {
      var column;
      if (column = this._findColumn(key)) {
        if (column.visible !== true) {
          column.visible = true;
          this._updateVisible();
          return this.updateCollectionBindings();
        }
      }
    };

    View.prototype.hideColumn = function(key) {
      var column;
      if ((column = this._findColumn(key)) && (this.getVisibleColumns().length > 1) && column.canHide) {
        if (column.visible !== false) {
          column.visible = false;
          this._updateVisible();
          return this.updateCollectionBindings();
        }
      }
    };

    View.prototype.columnIsVisible = function(key) {
      var column;
      if ((column = this._findColumn(key))) {
        return column.visible;
      } else {
        return false;
      }
    };

    View.prototype.bindToModel = function(model, attribute) {
      var binding, eventName, model_details, _i, _len, _ref1;
      if (!this.modelBindings) {
        this.modelBindings = {};
      }
      if (!(model_details = this.modelBindings[model.cid])) {
        model_details = {
          bindings: []
        };
        this.modelBindings[model.cid] = model_details;
      }
      eventName = "change:" + attribute;
      _ref1 = model_details.bindings;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        binding = _ref1[_i];
        if (binding.eventName === eventName) {
          return true;
        }
      }
      binding = this.bindTo(model, eventName, this.on_Related_ModelChanged, this);
      model_details.bindings.push(binding);
      return true;
    };

    View.prototype.unbindFromModels = function() {
      var b, cid, item, _i, _len, _ref1, _ref2;
      if (this.modelBindings) {
        _ref1 = this.modelBindings;
        for (cid in _ref1) {
          item = _ref1[cid];
          _ref2 = item.bindings;
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            b = _ref2[_i];
            this.unbindFrom(b);
          }
        }
        this.modelBindings = {};
      }
      return true;
    };

    View.prototype.bindToCollection = function(eventName, callback, context) {
      var binding;
      if (!this.collectionBindings) {
        this.collectionBindings = [];
      }
      binding = this.bindTo(this.collection, eventName, callback, context);
      this.collectionBindings.push(binding);
      return binding;
    };

    View.prototype.setupCollectionBindings = function() {
      var changes, column, _i, _len, _ref1;
      this.bindToCollection("add remove reset", this.on_CollectionChanged, this);
      changes = [];
      _ref1 = this.getVisibleColumns();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        column = _ref1[_i];
        if (column.isSpecialColumn !== true) {
          if (column.schema.dataType === "Collection") {
            changes.push("change:" + column.id + " change:childCollection:" + column.id);
          } else {
            changes.push("change:" + column.id);
          }
        }
      }
      if (changes.length > 0) {
        return this.bindToCollection(changes.join(" "), this.on_ModelChanged, this);
      }
    };

    View.prototype.unbindFromCollection = function() {
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

    View.prototype.updateCollectionBindings = function() {
      this.unbindFromCollection();
      return this.setupCollectionBindings();
    };

    View.prototype.setCollection = function(value, options) {
      if (this.collection !== value || (options && options.force)) {
        this.unbindFromCollection();
        this.unbindFromModels();
        this.collection = value;
        this.setupCollectionBindings();
        if (this.grid) {
          this.removeGrid();
          return this.on_CollectionChanged();
        }
      }
    };

    View.prototype.getLength = function() {
      return this.collection.models.length;
    };

    View.prototype.getItem = function(i) {
      return this.collection.models[i];
    };

    View.prototype.on_metadata = function(row, model, metadata) {
      if (model) {
        if (_.isFunction(model.isDeleted) && model.isDeleted()) {
          metadata.cssClasses += " model-isDeleted";
        }
        if (this.enableItemClick) {
          if (_.isFunction(model.user_can_access) && !model.user_can_access()) {
            return metadata.cssClasses += " slick-row-not-selectable";
          } else {
            return metadata.cssClasses += " slick-row-selectable";
          }
        }
      }
    };

    View.prototype.getItemMetadata = function(row) {
      var metadata, model;
      if (metadata = this._metadata_cache_get(row)) {
        return metadata;
      } else {
        metadata = {
          cssClasses: ""
        };
      }
      if (row !== null) {
        model = this.getItem(row);
        this.on_metadata(row, model, metadata);
      }
      this._metadata_cache_save(row, metadata);
      return metadata;
    };

    View.prototype._metadata_cache_save = function(row, value) {
      if (row !== null) {
        return this.metadata_cache = {
          row: row,
          value: value
        };
      }
    };

    View.prototype._metadata_cache_get = function(row, value) {
      if (this.metadata_cache && (this.metadata_cache.row === row)) {
        return this.metadata_cache.value;
      }
    };

    View.prototype._showGrid = function(length) {
      if (length === null) {
        return null;
      }
      if (length === 0) {
        return false;
      } else {
        return true;
      }
    };

    View.prototype.on_Related_ModelChanged = function(model) {
      this.metadata_cache = null;
      if (!this.grid || this.grid.EditorApplyingValue) {
        return;
      }
      return this.notifyCollectionChanged();
    };

    View.prototype.on_ModelChanged = function(model) {
      var activeCell, columnIndex, key, rowindex;
      this.metadata_cache = null;
      if (!this.grid || this.grid.EditorApplyingValue) {
        return;
      }
      rowindex = this.collection.indexOf(model);
      activeCell = this.grid.getActiveCell();
      if (activeCell && activeCell.row === rowindex) {
        for (key in model.changedAttributes()) {
          columnIndex = this.grid.getColumnIndex(key);
          if (_.isNumber(columnIndex)) {
            this.grid.updateCell(rowindex, columnIndex);
          }
        }
      } else {
        this.grid.invalidateRow(rowindex);
      }
      this.grid.autosizeColumns();
      return this.grid.render();
    };

    View.prototype.on_CollectionChanged = function() {
      var length, showGrid;
      this.metadata_cache = null;
      if (!this.isActive) {
        return;
      }
      if (this.grid && this.grid.EditorApplyingValue) {
        return;
      }
      length = this.getLength();
      if (length === null) {
        this.trigger("collection:length:unknown", length);
      }
      if (length !== null && length !== this.previousLength) {
        this.previousLength = length;
        this.on_LengthChanged(length);
      }
      showGrid = this._showGrid(length);
      if (showGrid === null) {
        return this.notifyCollectionChanged();
      } else {
        if (!showGrid) {
          this.removeGrid();
          this.unbindFromModels();
          if (this.on_collectionEmpty) {
            return this.on_collectionEmpty();
          }
        } else if (showGrid && !this.grid) {
          return this.createGrid();
        } else {
          return this.notifyCollectionChanged();
        }
      }
    };

    View.prototype.on_row_data_loaded = function() {
      if (!this.isActive) {
        return;
      }
      return this.notifyCollectionChanged();
    };

    View.prototype.applyingValue_start = function() {
      if (this.grid.EditorApplyingValue) {
        throw "slickgrid_view: applyingValue_start: Already applying value";
      }
      this.grid.EditorApplyingValue = true;
      return this.trigger("applyingValue:start");
    };

    View.prototype.applyingValue_finish = function() {
      if (!this.grid.EditorApplyingValue) {
        throw "slickgrid_view: applyingValue_finish: Not set";
      }
      this.grid.EditorApplyingValue = false;
      return this.trigger("applyingValue:finish");
    };

    View.prototype.notifyCollectionChanged = function() {
      this.metadata_cache = null;
      this.unbindFromModels();
      if (this.grid) {
        this.grid.updateRowCount();
        this.grid.invalidateAllRows();
        this.grid.autosizeColumns();
        return this.grid.render();
      }
    };

    View.prototype.on_LengthChanged = function(length) {
      var newAutoHeight;
      this.trigger("collection:length:changed", length);
      newAutoHeight = this._autoHeight(length);
      if (newAutoHeight !== this.autoHeight) {
        this.autoHeight = newAutoHeight;
        if (this.grid) {
          this.removeGrid();
          if (this._showGrid()) {
            return this.createGrid();
          }
        }
      }
    };

    View.prototype._autoHeight = function(length) {
      var newAutoHeight;
      if (this.options.maxHeight && (this.options.maxHeight > 0)) {
        newAutoHeight = (length * 20) < this.options.maxHeight;
        if (newAutoHeight) {
          this.$el.height('auto');
        } else {
          this.$el.height(this.options.maxHeight);
        }
        return newAutoHeight;
      } else {
        return this.options.autoHeight || false;
      }
    };

    View.prototype.createGrid = function() {
      if (this.grid) {
        this.removeGrid();
      }
      this.grid = new Slick.Grid(this.el, this, this.getVisibleColumns(), this.gridOptions());
      this.grid.onHeaderContextMenu.subscribe(this.on_ContextMenu);
      if (this.enableItemClick || this.enableCellClick) {
        this.grid.onClick.subscribe(this.on_item_click);
      }
      this.grid.autosizeColumns();
      this.grid.parentView = this;
      if (this.enableItemClick) {
        this.grid.setSelectionModel(new Slick.RowSelectionModel({
          selectActiveRow: true,
          multiSelect: false
        }));
      }
      if (this.previousGrid) {
        if (this.previousGrid.selectedRows) {
          this.grid.setSelectedRows(this.previousGrid.selectedRows);
        }
        if (this.previousGrid.viewport) {
          this.grid.scrollRowToTop(this.previousGrid.viewport.top);
        }
      }
      this.trigger("grid:created");
      return this.grid;
    };

    View.prototype.removeGrid = function() {
      if (this.grid) {
        this.previousGrid = {};
        if (this.enableItemClick) {
          this.previousGrid.selectedRows = this.grid.getSelectedRows();
        }
        this.previousGrid.viewport = this.grid.getViewport();
        this.grid.destroy();
        this.grid = null;
        return this.trigger("grid:removed");
      } else {
        return this.previousGrid = null;
      }
    };

    View.prototype.hasSlickgrid = function() {
      return !_.isNull(this.grid) && !_.isUndefined(this.grid);
    };

    View.prototype.on_ContextMenu = function(e, args) {
      if (!_.isUndefined(Backbone.Slickgrid.SlickgridColumnPicker)) {
        e.preventDefault();
        if (this.contextMenu) {
          this.contextMenu.close();
        }
        this.contextMenu = new Backbone.Slickgrid.SlickgridColumnPicker({
          grid: this
        });
        return this.contextMenu.openMenu(e);
      }
    };

    View.prototype.newButtonsView = function() {
      if (!_.isUndefined(Backbone.Slickgrid.SlickgridButtons)) {
        return new Backbone.Slickgrid.SlickgridButtons({
          grid: this
        });
      } else {
        return null;
      }
    };

    View.prototype.getTooltip = function(model) {
      var toolTipClass;
      if (!this.toolTip) {
        toolTipClass = "Landscape.Views." + (_.string.classify(model.paramRoot)) + "Tooltip";
        toolTipClass = Backbone.Edit.helpers.getObjectByName(toolTipClass);
        this.toolTip = new toolTipClass();
        if (this.getVisibleColumns().length === 1) {
          this.toolTip.setAlignment("center");
        } else {
          this.toolTip.setAlignment("right");
        }
        $('body').append(this.toolTip.render().$el);
        if (this.isActive) {
          this.toolTip.show();
        }
      }
      return this.toolTip;
    };

    View.prototype.setTooltipEnabled = function(value) {
      if (!_.isBoolean(value)) {
        throw "setTooltipEnabled: expected a boolean";
      }
      if (this.toolTipEnabled !== value) {
        return this.toolTipEnabled = value;
      }
    };

    View.prototype.getTooltipEnabled = function() {
      return this.toolTipEnabled;
    };

    View.prototype.on_item_click = function(e, args) {
      var cellNode, column, item, toolTip, tooltipEnabled, tooltipTarget;
      if (this.grid) {
        item = this.grid.getDataItem(args.row);
        if (!item) {
          return;
        }
        tooltipEnabled = this.getTooltipEnabled();
        tooltipTarget = $(e.target);
        if (this.enableCellClick) {
          column = this.grid.getColumns()[args.cell];
          if (column.schema.tooltip && column.schema.dataType === 'Model') {
            tooltipEnabled = true;
            if (cellNode = this.grid.getCellNode(args.row, args.cell)) {
              tooltipTarget = $(cellNode);
            }
            e.preventDefault();
            item = item.get(column.id);
            if (!item) {
              return;
            }
          } else {
            if (!this.enableItemClick) {
              return;
            }
          }
        }
        args = {
          selected_item: item,
          display_item: item
        };
        this.trigger("before:item:clicked", args);
        if (!(item = args.display_item)) {
          return;
        }
        if (item && _.isFunction(item.user_can_access) && !item.user_can_access()) {
          toolTip = this.getTooltip(item);
          return toolTip.click({
            view: this,
            $el: tooltipTarget,
            model: item
          });
        } else if (item && tooltipEnabled === true) {
          toolTip = this.getTooltip(item);
          return toolTip.click({
            view: this,
            $el: tooltipTarget,
            model: item
          });
        } else {
          this.grid.setSelectedRows([args.row]);
          return this.trigger("item:clicked", item);
        }
      }
    };

    View.prototype.on_resize = function() {
      var f, self, width;
      width = this.$el.width();
      if (this.oldWidth !== width) {
        this.oldWidth = width;
        if (this.resizeTimer) {
          clearTimeout(this.resizeTimer);
          this.resizeTimer = null;
        }
        if (this.grid) {
          self = this;
          f = function() {
            console.log("resize");
            return self.grid.autosizeColumns();
          };
          return this.resizeTimer = window.setTimeout(f, 300);
        }
      }
    };

    View.prototype.onShow = function() {
      View.__super__.onShow.apply(this, arguments);
      this.on_CollectionChanged();
      if (this.toolTip) {
        return this.toolTip.show();
      }
    };

    View.prototype.onDeactivate = function() {
      View.__super__.onDeactivate.apply(this, arguments);
      this.removeGrid();
      this.unbindFromModels();
      if (this.contextMenu) {
        this.contextMenu.close();
      }
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = null;
      }
      if (this.toolTip) {
        this.toolTip.close();
        return this.toolTip = null;
      }
    };

    View.prototype.render = function() {
      this.on_CollectionChanged();
      return this;
    };

    return View;

  })(Backbone.Marionette.View);

}).call(this);

;;
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

;;
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

;;
(function() {
  var converters, editors, _ref, _ref1, _ref2,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  editors = Backbone.Edit.editors;

  converters = Backbone.Edit.converters;

  editors.DateTypeBase = (function(_super) {
    __extends(DateTypeBase, _super);

    function DateTypeBase() {
      _ref = DateTypeBase.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    DateTypeBase.prototype.tagName = 'input';

    DateTypeBase.prototype.className = 'bbf-date';

    DateTypeBase.prototype.events = {
      'change': 'triggerChanged'
    };

    DateTypeBase.prototype.initialize = function(options) {
      DateTypeBase.__super__.initialize.apply(this, arguments);
      return this.$el.attr('type', 'text');
    };

    DateTypeBase.prototype.pickerType = function() {
      if (Backbone.Edit.categorizr.isDesktop) {
        return "jquery";
      } else {
        return "mobiscroll";
      }
    };

    DateTypeBase.prototype.render = function() {
      var beforeShow, editor, onClose;
      editor = this;
      if (this.pickerType() === "jquery") {
        beforeShow = function() {
          editor.css = editor.$el.css("z-index");
          editor.position = editor.$el.css("position");
          return editor.$el.css({
            "z-index": 2000,
            "position": "relative"
          });
        };
        onClose = function() {
          return editor.$el.css({
            "z-index": editor.css,
            "position": editor.position
          });
        };
        this.$el.datepicker({
          dateFormat: 'dd/mm/yy',
          showButtonPanel: true,
          beforeShow: beforeShow,
          onClose: onClose
        });
      } else {
        this.$el.mobiscroll().date({
          dateFormat: 'dd/mm/yyyy',
          dateOrder: 'D dMyy',
          maxDate: moment().add('years', 10)
        });
      }
      this.setValue(this.value);
      return this;
    };

    DateTypeBase.prototype.getValueAsDate = function() {
      if (this.pickerType() === "jquery") {
        return this.$el.datepicker('getDate');
      } else {
        return this.$el.mobiscroll('getDate');
      }
    };

    DateTypeBase.prototype.setValueAsDate = function(value) {
      var current, current_in_ms, value_in_ms;
      if (this.pickerType() === "jquery") {
        current = this.$el.datepicker('getDate');
        current_in_ms = current ? current.getTime() : null;
        value_in_ms = value ? value.getTime() : null;
        if (current_in_ms !== value_in_ms) {
          return this.$el.datepicker('setDate', value);
        }
      } else {
        if (value === null || value === "") {
          return this.$el.val('');
        } else {
          this.$el.val(moment(value).format('DD/MM/YYYY'));
          return this.$el.mobiscroll('setDate', value);
        }
      }
    };

    DateTypeBase.prototype.setEditable = function(value) {
      DateTypeBase.__super__.setEditable.apply(this, arguments);
      if (this.pickerType() === "mobiscroll") {
        if (value) {
          return this.$el.addClass('mobiscroll');
        } else {
          return this.$el.removeClass('mobiscroll');
        }
      }
    };

    return DateTypeBase;

  })(editors.Base);

  editors.DateEditor = (function(_super) {
    __extends(DateEditor, _super);

    function DateEditor() {
      _ref1 = DateEditor.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    DateEditor.prototype.getValue = function() {
      var date;
      date = this.getValueAsDate();
      return converters.date.toServerString(date);
    };

    DateEditor.prototype.setValue = function(value) {
      if (value && !_.isDate(value)) {
        value = converters.date.fromServerString(value);
      }
      return this.setValueAsDate(value);
    };

    return DateEditor;

  })(editors.DateTypeBase);

  editors.DateTimeEditor = (function(_super) {
    __extends(DateTimeEditor, _super);

    function DateTimeEditor() {
      _ref2 = DateTimeEditor.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    DateTimeEditor.prototype.getValue = function() {
      var date;
      date = this.getValueAsDate();
      return converters.dateTime.toServerString(date);
    };

    DateTimeEditor.prototype.setValue = function(value) {
      if (value && !_.isDate(value)) {
        value = converters.dateTime.fromServerString(value);
      }
      return this.setValueAsDate(value);
    };

    return DateTimeEditor;

  })(editors.DateTypeBase);

  editors["Date"] = editors.DateEditor;

  editors["DateTime"] = editors.DateTimeEditor;

}).call(this);

;;
(function() {
  var converters, editors, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  editors = Backbone.Edit.editors;

  converters = Backbone.Edit.converters;

  editors.Currency = (function(_super) {
    __extends(Currency, _super);

    function Currency() {
      _ref = Currency.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Currency.prototype.tagName = 'input';

    Currency.prototype.events = {
      'change': 'triggerChanged'
    };

    Currency.prototype.initialize = function(options) {
      Currency.__super__.initialize.apply(this, arguments);
      return this.$el.attr('type', 'text');
    };

    Currency.prototype.getValueAsBaseUnit = function() {
      var val;
      val = this.$el.val();
      if (_.string.isBlank(val)) {
        return null;
      } else {
        return numeral().unformat(val);
      }
    };

    Currency.prototype.setValueAsBaseUnit = function(pounds) {
      if (_.isNull(pounds) || _.isUndefined(pounds)) {
        return this.$el.val('');
      } else if (_.isFinite(pounds)) {
        return this.$el.val(numeral(pounds).format('0.00'));
      } else {
        throw "setValueAsBaseUnit: invalid value";
      }
    };

    Currency.prototype.getValue = function() {
      var pounds;
      pounds = this.getValueAsBaseUnit();
      return converters.currency.toServerValue_FromPounds(pounds);
    };

    Currency.prototype.setValue = function(value) {
      var pounds;
      pounds = converters.currency.fromServerValue_ToBaseUnit(value);
      return this.setValueAsBaseUnit(pounds);
    };

    Currency.prototype.render = function() {
      this.setValue(this.value);
      return this;
    };

    return Currency;

  })(editors.Base);

}).call(this);

;;
(function() {
  var editors, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  editors = Backbone.Edit.editors;

  editors.AutoSizeTextArea = (function(_super) {
    __extends(AutoSizeTextArea, _super);

    function AutoSizeTextArea() {
      _ref = AutoSizeTextArea.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    AutoSizeTextArea.prototype.className = "autoSizeTextArea";

    AutoSizeTextArea.prototype.updateHeight = function() {
      if (this.isActive) {
        return this.$el.TextAreaExpander(50, 200);
      }
    };

    AutoSizeTextArea.prototype.onShow = function() {
      AutoSizeTextArea.__super__.onShow.apply(this, arguments);
      return this.updateHeight();
    };

    AutoSizeTextArea.prototype.setValue = function() {
      AutoSizeTextArea.__super__.setValue.apply(this, arguments);
      return this.updateHeight();
    };

    AutoSizeTextArea.prototype.render = function() {
      AutoSizeTextArea.__super__.render.apply(this, arguments);
      this.updateHeight();
      return this;
    };

    return AutoSizeTextArea;

  })(editors.TextArea);

}).call(this);

;;
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

;;
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
      if (!Backbone.Edit.categorizr.isDesktop) {
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

;;
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
      if (Backbone.Edit.helpers.isCollection(groups)) {
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
          } else if (Backbone.Edit.helpers.isCollection(groupChildren)) {
            this._collectionToHtml(optgroup, groupChildren);
          } else {
            throw new Error("expected an array or collection");
          }
          this.$el.append(optgroup);
        }
        if (Backbone.Edit.helpers.isCollection(groupChildren)) {
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

;;
(function() {
  var editors, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  editors = Backbone.Edit.editors;

  editors.TagSelect = (function(_super) {
    __extends(TagSelect, _super);

    function TagSelect() {
      _ref = TagSelect.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    TagSelect.prototype.tagName = 'input';

    TagSelect.prototype.events = {
      'change': 'on_ui_selection_changed'
    };

    TagSelect.prototype.initialize = function(options) {
      _.bindAll(this, 'getTags_query', 'jsEditor_initSelection', 'createSearchChoice');
      this.check_options(options);
      TagSelect.__super__.initialize.apply(this, arguments);
      return this.setValue(this.value);
    };

    TagSelect.prototype.check_options = function(options) {
      var key, required, _i, _j, _len, _len1, _ref1, _ref2;
      _ref1 = ['tag_collection_class', 'selected_collection_class'];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        required = _ref1[_i];
        if (!this.options[required]) {
          throw "options." + required + " is required";
        }
      }
      _ref2 = ['tag_collection_class', 'selected_collection_class', 'tag_model_class', 'selected_model_class'];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        key = _ref2[_j];
        if (_.isString(this.options[key])) {
          this.options[key] = Backbone.Edit.helpers.getObjectByName(this.options[key]);
        }
      }
      if (!this.options.tag_model_class) {
        this.options.tag_model_class = this.options.tag_collection_class.prototype.model;
      }
      if (!this.options.selected_model_class) {
        this.options.selected_model_class = this.options.selected_collection_class.prototype.model;
      }
      if (!this.options.selected_obj_tag_key) {
        return this.options.selected_obj_tag_key = this.options.tag_model_class.prototype.modelType("singular");
      }
    };

    TagSelect.prototype.javascriptEditor = function() {
      return true;
    };

    TagSelect.prototype.allow_deselect = function() {
      return false;
    };

    TagSelect.prototype.jsEditor_options = function() {
      var options;
      options = TagSelect.__super__.jsEditor_options.apply(this, arguments);
      options.multiple = true;
      options.query = this.getTags_query;
      options.createSearchChoice = this.createSearchChoice;
      options.initSelection = this.jsEditor_initSelection;
      return options;
    };

    TagSelect.prototype.jsEditor_construct = function() {
      this.$el.val("");
      TagSelect.__super__.jsEditor_construct.apply(this, arguments);
      return this.$el.select2("val", this.getSelectedTags_js());
    };

    TagSelect.prototype.jsEditor_initSelection = function(element) {
      throw "jsEditor_initSelection: not expecting this to get called";
    };

    TagSelect.prototype.jsEditor_handleChange = function(type) {
      if (type === "selected") {
        return this.$el.select2("val", this.getSelectedTags_js(), {
          silent: this.$el.select2("isFocused")
        });
      } else {
        return TagSelect.__super__.jsEditor_handleChange.apply(this, arguments);
      }
    };

    TagSelect.prototype.setOptions = function(tags) {
      return this.setTags(tags);
    };

    TagSelect.prototype.setTags = function(value, options) {
      if (options == null) {
        options = {};
      }
      if (!(value instanceof this.options.tag_collection_class)) {
        throw "setTags: expected an Backbone.Collection";
      }
      if ((this.tags !== value) || options.force) {
        if (this.tags) {
          this.tags.off(null, this.on_tagsChanged, this);
        }
        this._tags_js = null;
        this.tags = value;
        return this.tags.on('add remove reset change', this.on_tagsChanged, this);
      }
    };

    TagSelect.prototype.on_tagsChanged = function() {
      return this._tags_js = null;
    };

    TagSelect.prototype.getTags_query = function(query) {
      var filtered, tab_object, term;
      term = _.string.trim(query.term);
      filtered = {};
      filtered.results = (function() {
        var _i, _len, _ref1, _results;
        _ref1 = this.getTagObjects();
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          tab_object = _ref1[_i];
          if (term === "" || query.matcher(term, tab_object.text)) {
            _results.push(tab_object);
          }
        }
        return _results;
      }).call(this);
      return query.callback(filtered);
    };

    TagSelect.prototype.getTagObjects = function() {
      var model, _i, _len, _ref1;
      if (!this._tags_js) {
        this._tags_js = [];
        if (!this.tags || !this.selectedTags) {
          throw "@tags or @selectedTags not set";
        }
        _ref1 = this.tags.models;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          model = _ref1[_i];
          if (!model.isDeleted()) {
            this._tags_js.push(this.getTagObject(model));
          }
        }
      }
      return this._tags_js;
    };

    TagSelect.prototype.getTagObject = function(model) {
      if (!(model instanceof this.options.tag_model_class)) {
        throw "getTag_object: model is not of the correct type";
      }
      return {
        id: model.cid,
        text: this.getItemLabel(model),
        model: model
      };
    };

    TagSelect.prototype.findOrCreateTagObject = function(model) {
      var iterator, object;
      iterator = function(item) {
        return item.model === model;
      };
      object = _.find(this._tags_js, iterator);
      if (!object) {
        object = this.getTagObject(model);
      }
      return object;
    };

    TagSelect.prototype.createTag = function(text) {
      return new this.options.tag_model_class({
        name: text,
        asset_type: "Animal"
      });
    };

    TagSelect.prototype.findTag = function(text) {
      var model, search, _i, _len, _ref1;
      search = _.string.trim(text).toLowerCase();
      _ref1 = this.tags.models;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        model = _ref1[_i];
        if (_.string.trim(model.get("name")).toLowerCase() === search) {
          return model;
        }
      }
      return null;
    };

    TagSelect.prototype.findOrCreateTag = function(text) {
      var tag;
      tag = this.findTag(text);
      if (!tag) {
        tag = this.createTag(_.string.trim(text));
      }
      return tag;
    };

    TagSelect.prototype.createSearchChoice = function(term, results) {
      var text;
      text = _.string.trim(term).substring(0, 50);
      if (text === "") {
        return null;
      }
      if (this.findTag(text) !== null) {
        return null;
      } else {
        return {
          id: _.uniqueId('c'),
          text: text
        };
      }
    };

    TagSelect.prototype.getValue = function() {
      return this.selectedTags;
    };

    TagSelect.prototype.setValue = function(value) {
      return this.setSelectedTags(value);
    };

    TagSelect.prototype.setSelectedTags = function(value, options) {
      if (options == null) {
        options = {};
      }
      if (!(value instanceof this.options.selected_collection_class)) {
        throw "setSelectedTags: expected an Backbone.Collection";
      }
      if ((this.selectedTags !== value) || options.force) {
        if (this.selectedTags) {
          this.selectedTags.off(null, this.on_selectedTagsChanged, this);
        }
        this._selectedTags_js = null;
        this._tags_js = null;
        this.selectedTags = value;
        this.selectedTags.on('add remove reset change', this.on_selectedTagsChanged, this);
        return this.jsEditor_notifyChange("selected");
      }
    };

    TagSelect.prototype.getSelectedTags_js = function() {
      var selected, tag_model, tag_object, _i, _len, _ref1;
      if (!this._selectedTags_js) {
        this._selectedTags_js = [];
        if (!this.selectedTags) {
          throw "@selectedTags not set";
        }
        _ref1 = this.selectedTags.models;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          selected = _ref1[_i];
          if (!(!selected.isDeleted())) {
            continue;
          }
          tag_model = selected.get(this.options.selected_obj_tag_key);
          tag_object = this.findOrCreateTagObject(tag_model);
          tag_object.sortBy = selected.id;
          this._selectedTags_js.push(tag_object);
        }
        _.sortBy(this._selectedTags_js, 'sortBy');
        this._selectedTags_js.reverse();
      }
      return this._selectedTags_js;
    };

    TagSelect.prototype.on_selectedTagsChanged = function() {
      if (this.EditorApplyingValue) {
        return;
      }
      this._selectedTags_js = null;
      return this.jsEditor_notifyChange("selected");
    };

    TagSelect.prototype.on_ui_selection_changed = function() {
      if (this.updatingJavascriptEditor) {
        return;
      }
      return this.updateCollection();
    };

    TagSelect.prototype.updateCollection = function() {
      var attrs, choice, item, items_to_remove, new_selected, selected, selected_tag, tag_model, tag_object, tags_to_add, ui_selected_tags, where, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref1, _ref2, _results;
      if (this.EditorApplyingValue) {
        throw "Already applying value";
      }
      try {
        this.applyingValue_start();
        ui_selected_tags = [];
        _ref1 = this.$el.select2('container').find('.select2-search-choice');
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          choice = _ref1[_i];
          tag_object = $(choice).data("select2Data");
          if (!tag_object.model) {
            tag_object.model = this.findOrCreateTag(tag_object.text);
          }
          ui_selected_tags.push(tag_object.model);
        }
        ui_selected_tags = _.unique(ui_selected_tags);
        tags_to_add = [];
        items_to_remove = [];
        for (_j = 0, _len1 = ui_selected_tags.length; _j < _len1; _j++) {
          selected_tag = ui_selected_tags[_j];
          where = function(model) {
            return model.get(this.options.selected_obj_tag_key) === selected_tag;
          };
          if (!this.selectedTags.find(where, this)) {
            tags_to_add.push(selected_tag);
          }
        }
        _ref2 = this.selectedTags.models;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          selected = _ref2[_k];
          tag_model = selected.get(this.options.selected_obj_tag_key);
          if (_.indexOf(ui_selected_tags, tag_model) === -1) {
            items_to_remove.push(selected);
          }
        }
        for (_l = 0, _len3 = items_to_remove.length; _l < _len3; _l++) {
          item = items_to_remove[_l];
          item.destroy({
            changeSource: "ui"
          });
        }
        _results = [];
        for (_m = 0, _len4 = tags_to_add.length; _m < _len4; _m++) {
          item = tags_to_add[_m];
          attrs = {};
          attrs[this.options.selected_obj_tag_key] = item;
          new_selected = new this.options.selected_model_class(attrs);
          _results.push(this.selectedTags.add(new_selected, {
            changeSource: "ui"
          }));
        }
        return _results;
      } finally {
        this.applyingValue_finish();
      }
    };

    TagSelect.prototype.applyingValue_start = function() {
      if (this.EditorApplyingValue) {
        throw "asset_labels: applyingValue_start: Already applying value";
      }
      this.EditorApplyingValue = true;
      return this.trigger("applyingValue:start");
    };

    TagSelect.prototype.applyingValue_finish = function() {
      if (!this.EditorApplyingValue) {
        throw "slickgrid_view: applyingValue_finish: Not set";
      }
      this.EditorApplyingValue = false;
      return this.trigger("applyingValue:finish");
    };

    TagSelect.prototype.render = function() {
      return this;
    };

    return TagSelect;

  })(editors.Select2Base);

}).call(this);

;;
(function() {
  var editors, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  editors = Backbone.Edit.editors;

  Backbone.Edit.editors.Slickgrid = (function(_super) {
    __extends(Slickgrid, _super);

    function Slickgrid() {
      _ref = Slickgrid.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Slickgrid.prototype.enableAddRow = false;

    Slickgrid.prototype.enableDelete = false;

    Slickgrid.prototype.enableMove = false;

    Slickgrid.prototype.enableIndex = false;

    Slickgrid.prototype.initialize = function(options) {
      var editable;
      if (options == null) {
        options = {};
      }
      _.bindAll(this, 'on_addNewRow', 'on_Click', 'onBeforeMoveRows', 'onMoveRows', '_delayed_focus_click', 'on_document_event', 'on_BeforeEditCell', 'on_BeforeCellEditorDestroy');
      if (this.enableMove && !options.model) {
        throw "options.model is required";
      }
      if (_.isUndefined(options.autoHeight)) {
        options.autoHeight = true;
      }
      if (options.model) {
        if (!options.key) {
          throw "Missing option: 'key'";
        }
        this.model = options.model;
        this.key = options.key;
        this.collection = options.model.get(options.key);
      } else if (options.value) {
        this.collection = options.value;
      }
      this.form = options.form;
      this.editorSchema = options.schema || {};
      if (this.enableAddRow) {
        this.newModel = new this.collection.model();
      }
      if (this.key) {
        this.$el.attr('name', this.key);
      }
      if (this.editorSchema.editorClass) {
        this.$el.addClass(this.editorSchema.editorClass);
      }
      if (this.editorSchema.editorAttrs) {
        this.$el.attr(this.editorSchema.editorAttrs);
      }
      if (this.editorSchema.placeholder) {
        this.$el.attr("placeholder", this.editorSchema.placeholder);
      }
      Slickgrid.__super__.initialize.apply(this, arguments);
      editable = _.isUndefined(this.options.editable) ? false : this.options.editable;
      return this.setEditable(editable);
    };

    Slickgrid.prototype.getValue = function() {
      return this.collection;
    };

    Slickgrid.prototype.setValue = function(value) {
      return this.setCollection(value);
    };

    Slickgrid.prototype.setEditable = function(value) {
      if (this.editable !== value) {
        this.editable = value;
        if (this.grid) {
          this.removeGrid();
        }
        this.allColumns = this.getColumns();
        return this.on_CollectionChanged();
      }
    };

    Slickgrid.prototype._delayed_focus_click = function() {
      var cells, columns, index, selectableColumn;
      if (this.grid) {
        columns = this.grid.getColumns();
        selectableColumn = _.find(columns, function(item) {
          return item.editor;
        });
        index = _.indexOf(columns, selectableColumn);
        cells = this.$('.slick-cell');
        if (cells.length >= index) {
          return $(cells[index]).click();
        }
      }
    };

    Slickgrid.prototype.delayed_focus = function() {
      if (this.grid) {
        return window.setTimeout(this._delayed_focus_click, 0);
      }
    };

    Slickgrid.prototype.focus = function() {
      return this.$el.focus();
    };

    Slickgrid.prototype.triggerChanged = function() {};

    Slickgrid.prototype.commit = function() {};

    Slickgrid.prototype.gridOptions = function() {
      var options;
      options = Slickgrid.__super__.gridOptions.apply(this, arguments);
      options.editable = this.editable;
      options.enableAddRow = this.enableAddRow && this.editable;
      if (this.options.newEditorLock) {
        options.editorLock = new Slick.EditorLock;
      }
      return options;
    };

    Slickgrid.prototype._showGrid = function() {
      if (this.enableAddRow && this.editable) {
        return true;
      } else {
        return Slickgrid.__super__._showGrid.apply(this, arguments);
      }
    };

    Slickgrid.prototype.schema = function() {
      if (this.collection.model && this.collection.model.prototype.schema) {
        return this.collection.model.prototype.schema;
      } else {
        return null;
      }
    };

    Slickgrid.prototype.getColumns = function() {
      var column, columns;
      columns = Slickgrid.__super__.getColumns.apply(this, arguments);
      if (this.enableIndex) {
        column = this.specialColumn("index");
        columns = _.union([column], columns);
      }
      if (this.enableMove && this.editable) {
        column = this.specialColumn("move");
        columns = _.union([column], columns);
      }
      if (this.enableDelete && this.editable) {
        column = this.specialColumn("delete");
        columns = _.union(columns, [column]);
      }
      return columns;
    };

    Slickgrid.prototype.createGrid = function() {
      var grid;
      grid = Slickgrid.__super__.createGrid.apply(this, arguments);
      if (this.enableAddRow && this.editable) {
        grid.onAddNewRow.subscribe(this.on_addNewRow);
      }
      if (this.enableDelete && this.editable) {
        grid.onClick.subscribe(this.on_Click);
      }
      if (this.enableMove && this.editable) {
        grid.registerPlugin(this.newMoveManager());
      }
      grid.onBeforeEditCell.subscribe(this.on_BeforeEditCell);
      grid.onBeforeCellEditorDestroy.subscribe(this.on_BeforeCellEditorDestroy);
      return grid.setSelectionModel(new Slick.RowSelectionModel({
        selectActiveRow: true,
        multiSelect: false
      }));
    };

    Slickgrid.prototype.getItem = function(i) {
      if (this.enableAddRow && i === this.getLength() && this.editable) {
        return this.newModel;
      } else {
        return Slickgrid.__super__.getItem.apply(this, arguments);
      }
    };

    Slickgrid.prototype.setupCollectionBindings = function() {
      Slickgrid.__super__.setupCollectionBindings.apply(this, arguments);
      return this.bindToCollection("serverErrorsChanged clientErrorsChanged", this.on_ModelChanged, this);
    };

    Slickgrid.prototype.on_BeforeEditCell = function() {
      if (!this.listening_to_document) {
        $(document).on('click', this.on_document_event);
        $(document).on('focusin', this.on_document_event);
        return this.listening_to_document = true;
      }
    };

    Slickgrid.prototype.on_BeforeCellEditorDestroy = function() {
      return this.unbind_from_document();
    };

    Slickgrid.prototype.on_document_event = function(e) {
      var isActive;
      if (!this.listening_to_document) {
        return;
      }
      isActive = this.grid.getEditorLock().isActive();
      this.consoleLog("on_document_event: " + e.type + ", isActive = " + isActive);
      if (this.grid.DetachedEditor) {
        this.consoleLog("on_document_event: @grid.DetachedEditor = true - calling handle_document_event");
        this.grid.DetachedEditor.handle_document_event(e);
      }
      if (this.grid.DetachedEditor) {
        this.consoleLog("on_document_event: @grid.DetachedEditor still true - returning");
        return;
      }
      if ($.contains(this.el, e.target)) {
        this.consoleLog("on_document_event: this.el contains e.target - returning");
        return "contains";
      }
      if (this.grid.getEditorLock().isActive()) {
        this.consoleLog("on_document_event: @grid.getEditorLock().isActive() - calling commitCurrentEdit()");
        this.grid.getEditorLock().commitCurrentEdit();
      }
      if (isActive) {
        this.consoleLog("on_document_event: calling @grid.resetActiveCell()");
        return this.grid.resetActiveCell();
      }
    };

    Slickgrid.prototype.consoleLog = function(message) {};

    Slickgrid.prototype.unbind_from_document = function() {
      $(document).off('click', this.on_document_event);
      $(document).off('focusin', this.on_document_event);
      return this.listening_to_document = false;
    };

    Slickgrid.prototype.on_metadata = function(row, model, metadata) {
      var client_keys, key, server_keys, _i, _len, _ref1;
      Slickgrid.__super__.on_metadata.apply(this, arguments);
      metadata.cssCellClasses = {};
      client_keys = _.keys(model.clientErrors);
      server_keys = _.keys(model.serverErrors);
      _ref1 = _.union(client_keys, server_keys);
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        key = _ref1[_i];
        metadata.cssCellClasses[key] = "cellError";
      }
      metadata.cssPossibleCellClasses = "cellError";
      if (row < this.getLength() && this.editable) {
        if (this.enableDelete && !model.isDeleted()) {
          metadata.cssClasses += " deletable";
        }
        if (this.enableMove) {
          return metadata.cssClasses += " moveable";
        }
      }
    };

    Slickgrid.prototype.on_addNewRow = function(e, args) {
      try {
        this.applyingValue_start();
        this.collection.add(args.item, {
          changeSource: "ui"
        });
        this.newModel = new this.collection.model();
        return this.notifyCollectionChanged();
      } finally {
        this.applyingValue_finish();
      }
    };

    Slickgrid.prototype.on_Click = function(e, args) {
      var column, item;
      column = this.grid.getColumns()[args.cell];
      if (column.id === "_delete" && args.row < this.getLength()) {
        item = this.grid.getDataItem(args.row);
        return item.destroy({
          changeSource: "ui"
        });
      }
    };

    Slickgrid.prototype.specialColumn = function(type) {
      var column;
      column = {};
      column.id = "_" + type;
      column.field = "_" + type;
      column.name = "";
      column.visible = true;
      column.canHide = false;
      column.editor = null;
      if (type === "index") {
        column.formatter = this.formatter.rowIndexFormater;
        column.name = "#";
      } else {
        column.formatter = null;
      }
      if (type === "move") {
        column.width = 30;
        column.behavior = "selectAndMove";
      } else if (type === "delete") {
        column.width = 30;
      } else {
        column.width = 40;
      }
      column.selectable = true;
      column.resizable = false;
      column.cssClass = "cell-" + type;
      column.isSpecialColumn = true;
      return column;
    };

    Slickgrid.prototype.onBeforeMoveRows = function(e, data) {
      var i, row, _i, _len, _ref1;
      _ref1 = data.rows;
      for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
        row = _ref1[i];
        if (!((row === data.insertBefore) || (row === data.insertBefore - 1))) {
          continue;
        }
        e.stopPropagation();
        return false;
      }
      return true;
    };

    Slickgrid.prototype.onMoveRows = function(e, args) {
      var i, itemsAfter, itemsBefore, row, rows, rowsToMove, _i, _len;
      try {
        this.applyingValue_start();
        if (this.model.syncHelper().get("state") === "enabled") {
          this.model.syncHelper().suspendSave();
        }
        rowsToMove = (function() {
          var _i, _len, _ref1, _results;
          _ref1 = args.rows;
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            row = _ref1[_i];
            _results.push(this.getItem(row));
          }
          return _results;
        }).call(this);
        itemsBefore = this.collection.first(args.insertBefore);
        itemsAfter = this.collection.rest(args.insertBefore);
        itemsBefore = _.difference(itemsBefore, rowsToMove);
        itemsAfter = _.difference(itemsAfter, rowsToMove);
        rows = itemsBefore.concat(rowsToMove, itemsAfter);
        for (i = _i = 0, _len = rows.length; _i < _len; i = ++_i) {
          row = rows[i];
          row.set("position", i, {
            changeSource: "ui"
          });
        }
        this.grid.setSelectedRows([]);
        this.collection.sort();
        return this.notifyCollectionChanged();
      } finally {
        this.applyingValue_finish();
        if (this.model.syncHelper().get("state") === "enabled") {
          this.model.syncHelper().enableSave();
        }
      }
    };

    Slickgrid.prototype.newMoveManager = function() {
      var moveRowsPlugin;
      moveRowsPlugin = new Slick.RowMoveManager();
      moveRowsPlugin.onBeforeMoveRows.subscribe(this.onBeforeMoveRows);
      moveRowsPlugin.onMoveRows.subscribe(this.onMoveRows);
      return moveRowsPlugin;
    };

    return Slickgrid;

  })(Backbone.Slickgrid.View);

}).call(this);
