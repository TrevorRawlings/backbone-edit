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
