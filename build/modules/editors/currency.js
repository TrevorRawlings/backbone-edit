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
