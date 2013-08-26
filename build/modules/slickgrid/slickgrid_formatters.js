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
      } else {
        value = data.getRelated(col.field, this.get_related_options);
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
          model = model.getRelated(attr, this.get_related_options);
          if (model === null) {
            return null;
          }
        }
      }
    };

    return FormatterBase;

  })();

}).call(this);
