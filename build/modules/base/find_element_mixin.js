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
