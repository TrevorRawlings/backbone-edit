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
