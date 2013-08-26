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
