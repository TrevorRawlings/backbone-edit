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
    if (value instanceof Backbone.Collection || value instanceof Landscape.Subset) {
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
