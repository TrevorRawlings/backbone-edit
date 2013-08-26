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
