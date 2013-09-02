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
  var hasMarionette, viewBase, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (_.isUndefined(Backbone.Marionette)) {
    hasMarionette = true;
    viewBase = Backbone.Marionette.View;
  } else {
    hasMarionette = false;
    viewBase = Backbone.View;
  }

  Backbone.Edit.View = (function(_super) {
    __extends(View, _super);

    function View() {
      _ref = View.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    View.prototype.onShow = function(wasAlreadyActive) {
      this._onShow_base_called = true;
      return this.trigger('view:onShow', wasAlreadyActive);
    };

    View.prototype.onDeactivate = function() {
      this._onDeactivate_base_called = true;
      return this.trigger('deactivate', this);
    };

    View.prototype.beforeClose = function() {};

    View.prototype.onClose = function() {
      return this._onClose_base_called = true;
    };

    View.prototype.show = function() {
      var wasAlreadyActive;
      if (hasMarionette) {
        this.isActive = false;
        return View.__super__.show.apply(this, arguments);
      } else {
        wasAlreadyActive = this.isActive;
        this.isActive = true;
        this._onShow_base_called = false;
        this.onShow(wasAlreadyActive);
        if (!this._onShow_base_called) {
          throw "onShow call chain is broken";
        }
        if (this.deactivated) {
          this.delegateEvents();
          return this.deactivated = false;
        }
      }
    };

    View.prototype.deactivate = function() {
      this.isActive = false;
      this._onDeactivate_base_called = false;
      this.onDeactivate();
      if (!this._onDeactivate_base_called) {
        throw "onDeactivate call chain is broken";
      }
      return this.deactivated = true;
    };

    View.prototype.close = function() {
      if (this.isActive) {
        this.deactivate();
      }
      if (hasMarionette) {
        View.__super__.close.apply(this, arguments);
        this.stopListening();
        return this.off();
      } else {
        this.trigger('before:close');
        if (this.beforeClose) {
          this.beforeClose();
        }
        this.remove();
        this.stopListening();
        this._onClose_base_called = false;
        this.onClose();
        if (!this._onClose_base_called) {
          throw "onClose call chain is broken";
        }
        this.trigger('close', this);
        return this.off();
      }
    };

    return View;

  })(viewBase);

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
      if (!(this.view instanceof Backbone.Edit.View)) {
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
      _.bindAll(this, "on_ContextMenu", 'on_item_click', 'on_Related_ModelChanged', 'on_CollectionChanged', 'on_ModelChanged');
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
          obj: model,
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
      this.listenTo(model, eventName, this.on_Related_ModelChanged);
      model_details.bindings.push({
        eventName: eventName
      });
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
            this.stopListening(item.obj, b.eventName, this.on_Related_ModelChanged);
          }
        }
        this.modelBindings = {};
      }
      return true;
    };

    View.prototype.bindToCollection = function(eventName, callback) {
      if (!this.collectionBindings) {
        this.collectionBindings = [];
      }
      this.listenTo(this.collection, eventName, callback);
      this.collectionBindings.push({
        obj: this.collection,
        eventName: eventName,
        callback: callback
      });
      return true;
    };

    View.prototype.setupCollectionBindings = function() {
      var changes, column, _i, _len, _ref1;
      this.bindToCollection("add remove reset", this.on_CollectionChanged);
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
        return this.bindToCollection(changes.join(" "), this.on_ModelChanged);
      }
    };

    View.prototype.unbindFromCollection = function() {
      var binding, _i, _len, _ref1;
      if (this.collectionBindings) {
        _ref1 = this.collectionBindings;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          binding = _ref1[_i];
          this.stopListening(binding.obj, binding.event, binding.callback);
        }
        return this.collectionBindings = [];
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

  })(Backbone.Edit.View);

}).call(this);
