(function() {
  var converters, editors, _ref, _ref1, _ref2,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  editors = Backbone.Edit.editors;

  converters = Backbone.Edit.converters;

  editors.DateTypeBase = (function(_super) {
    __extends(DateTypeBase, _super);

    function DateTypeBase() {
      _ref = DateTypeBase.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    DateTypeBase.prototype.tagName = 'input';

    DateTypeBase.prototype.className = 'bbf-date';

    DateTypeBase.prototype.events = {
      'change': 'triggerChanged'
    };

    DateTypeBase.prototype.initialize = function(options) {
      DateTypeBase.__super__.initialize.apply(this, arguments);
      return this.$el.attr('type', 'text');
    };

    DateTypeBase.prototype.pickerType = function() {
      if (Backbone.Edit.categorizr.isDesktop) {
        return "jquery";
      } else {
        return "mobiscroll";
      }
    };

    DateTypeBase.prototype.render = function() {
      var beforeShow, editor, onClose;
      editor = this;
      if (this.pickerType() === "jquery") {
        beforeShow = function() {
          editor.css = editor.$el.css("z-index");
          editor.position = editor.$el.css("position");
          return editor.$el.css({
            "z-index": 2000,
            "position": "relative"
          });
        };
        onClose = function() {
          return editor.$el.css({
            "z-index": editor.css,
            "position": editor.position
          });
        };
        this.$el.datepicker({
          dateFormat: 'dd/mm/yy',
          showButtonPanel: true,
          beforeShow: beforeShow,
          onClose: onClose
        });
      } else {
        this.$el.mobiscroll().date({
          dateFormat: 'dd/mm/yyyy',
          dateOrder: 'D dMyy',
          maxDate: moment().add('years', 10)
        });
      }
      this.setValue(this.value);
      return this;
    };

    DateTypeBase.prototype.getValueAsDate = function() {
      if (this.pickerType() === "jquery") {
        return this.$el.datepicker('getDate');
      } else {
        return this.$el.mobiscroll('getDate');
      }
    };

    DateTypeBase.prototype.setValueAsDate = function(value) {
      var current, current_in_ms, value_in_ms;
      if (this.pickerType() === "jquery") {
        current = this.$el.datepicker('getDate');
        current_in_ms = current ? current.getTime() : null;
        value_in_ms = value ? value.getTime() : null;
        if (current_in_ms !== value_in_ms) {
          return this.$el.datepicker('setDate', value);
        }
      } else {
        if (value === null || value === "") {
          return this.$el.val('');
        } else {
          this.$el.val(moment(value).format('DD/MM/YYYY'));
          return this.$el.mobiscroll('setDate', value);
        }
      }
    };

    DateTypeBase.prototype.setEditable = function(value) {
      DateTypeBase.__super__.setEditable.apply(this, arguments);
      if (this.pickerType() === "mobiscroll") {
        if (value) {
          return this.$el.addClass('mobiscroll');
        } else {
          return this.$el.removeClass('mobiscroll');
        }
      }
    };

    return DateTypeBase;

  })(editors.Base);

  editors.DateEditor = (function(_super) {
    __extends(DateEditor, _super);

    function DateEditor() {
      _ref1 = DateEditor.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    DateEditor.prototype.getValue = function() {
      var date;
      date = this.getValueAsDate();
      return converters.date.toServerString(date);
    };

    DateEditor.prototype.setValue = function(value) {
      if (value && !_.isDate(value)) {
        value = converters.date.fromServerString(value);
      }
      return this.setValueAsDate(value);
    };

    return DateEditor;

  })(editors.DateTypeBase);

  editors.DateTimeEditor = (function(_super) {
    __extends(DateTimeEditor, _super);

    function DateTimeEditor() {
      _ref2 = DateTimeEditor.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    DateTimeEditor.prototype.getValue = function() {
      var date;
      date = this.getValueAsDate();
      return converters.dateTime.toServerString(date);
    };

    DateTimeEditor.prototype.setValue = function(value) {
      if (value && !_.isDate(value)) {
        value = converters.dateTime.fromServerString(value);
      }
      return this.setValueAsDate(value);
    };

    return DateTimeEditor;

  })(editors.DateTypeBase);

  editors["Date"] = editors.DateEditor;

  editors["DateTime"] = editors.DateTimeEditor;

}).call(this);
