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
