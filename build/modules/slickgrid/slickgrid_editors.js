(function() {
  var editors, _ref, _ref1, _ref2, _ref3,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (!Backbone.Slickgrid) {
    Backbone.Slickgrid = {};
  }

  if (!Backbone.Slickgrid.editors) {
    Backbone.Slickgrid.editors = {};
  }

  editors = Backbone.Slickgrid.editors;

  editors.getEditor_default = function(schema) {
    if ((schema.type === 'Select') || (schema.type === 'GroupedSelect')) {
      return editors.SelectEditor;
    } else if ((schema.dataType === 'Text') && (schema.type === 'AutoSizeTextArea')) {
      return editors.Detached.MultiLineText;
    } else {
      return editors.DefaultEditor;
    }
  };

  editors.getEditor = editors.getEditor_default;

  editors.Base = (function() {
    function Base(args) {
      this.args = args;
      this.column = args.column;
      this.item = args.item;
      this.grid = args.grid;
      if (!this.column || !this.item || !this.grid) {
        throw "argument missing";
      }
      this.valueBeforeEdit = this.item.get(this.column.field);
      this.constructEditor();
      this.appendEditor(args);
      this.editorFocus();
    }

    Base.prototype.editorAttrs = function(currentAttrs) {
      return currentAttrs;
    };

    Base.prototype.editorOptions = function() {
      var options;
      options = {};
      options.schema = _.clone(this.column.schema);
      options.schema.editorAttrs = this.editorAttrs(options.schema.editorAttrs);
      options.model = this.item;
      options.key = this.column.field;
      options.editable = true;
      return options;
    };

    Base.prototype.constructEditor = function() {
      var editorOptions;
      if (this.editor) {
        throw "already set";
      }
      editorOptions = this.editorOptions();
      this.editor = Backbone.Edit.helpers.createEditor(this.column.schema.type, editorOptions);
      this.editor.on('changed', this.on_editorChanged, this);
      this.editor.on('applyingValue:start', this.applyingValue_start, this);
      this.editor.on('applyingValue:finish', this.applyingValue_finish, this);
      return this.editor;
    };

    Base.prototype.editorFocus = function() {
      return this.editor.focus();
    };

    Base.prototype.appendEditor = function(args) {
      throw "not implemented ";
    };

    Base.prototype.on_editorChanged = function() {
      var state;
      if (this.item instanceof Backbone.Model) {
        state = this.serializeValue();
        return this.applyValue(this.item, state);
      }
    };

    Base.prototype.destroy = function() {
      if (this.editor) {
        this.editor.off('changed', this.on_editorChanged, this);
        this.editor.off('applyingValue:start', this.applyingValue_start, this);
        this.editor.off('applyingValue:finish', this.applyingValue_finish, this);
        this.editor.close();
        return this.editor = null;
      }
    };

    Base.prototype.focus = function() {
      return this.editor.focus();
    };

    Base.prototype.isValueChanged = function() {
      return this.valueBeforeEdit !== this.editor.getValue();
    };

    Base.prototype.serializeValue = function() {
      if (this.editor) {
        return this.editor.getValue();
      } else {
        return "";
      }
    };

    Base.prototype.loadValue = function() {
      this.valueBeforeEdit = this.item.get(this.column.field);
      this.editor.setValue(this.valueBeforeEdit);
      if (this.valueBeforeEdit === void 0) {
        return this.valueBeforeEdit = this.editor.getValue();
      }
    };

    Base.prototype.applyingValue_start = function() {
      return this.grid.parentView.applyingValue_start();
    };

    Base.prototype.applyingValue_finish = function() {
      return this.grid.parentView.applyingValue_finish();
    };

    Base.prototype.applyValue = function(item, state) {
      if (item instanceof Backbone.Model) {
        try {
          this.applyingValue_start();
          return item.set(this.column.field, state, {
            changeSource: "ui"
          });
        } finally {
          this.applyingValue_finish();
        }
      } else {
        return item[this.column.field] = state;
      }
    };

    Base.prototype.validate = function() {
      return {
        valid: true,
        msg: null
      };
    };

    return Base;

  })();

  editors.InlineEditor = (function(_super) {
    __extends(InlineEditor, _super);

    function InlineEditor() {
      _ref = InlineEditor.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    InlineEditor.prototype.editorAttrs = function() {
      var attrs;
      if (!this._editorAttrs) {
        attrs = [];
        attrs.push('border: none;');
        attrs.push('box-shadow: none;');
        attrs.push('display: inline;');
        attrs.push('font-size: 14px;');
        attrs.push('margin: 0px;');
        attrs.push('padding: 0px;');
        attrs.push('width: 100%;');
        attrs.push('height: 100%;');
        this._editorAttrs = {
          style: attrs.join(" ")
        };
      }
      return this._editorAttrs;
    };

    InlineEditor.prototype.editorOptions = function() {
      var options;
      options = InlineEditor.__super__.editorOptions.apply(this, arguments);
      options.schema.editorAttrs = this.editorAttrs();
      return options;
    };

    InlineEditor.prototype.appendEditor = function(args) {
      if (!this.editor) {
        throw "@editor not set";
      }
      return $(args.container).append(this.editor.render().el);
    };

    return InlineEditor;

  })(editors.Base);

  editors.DefaultEditor = (function(_super) {
    __extends(DefaultEditor, _super);

    function DefaultEditor() {
      _ref1 = DefaultEditor.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    return DefaultEditor;

  })(editors.InlineEditor);

  editors.SelectEditor = (function(_super) {
    __extends(SelectEditor, _super);

    function SelectEditor(args) {
      _.bindAll(this, '_handleKeyDown');
      SelectEditor.__super__.constructor.apply(this, arguments);
    }

    SelectEditor.prototype.constructEditor = function() {
      var editor;
      editor = SelectEditor.__super__.constructEditor.apply(this, arguments);
      this.editor.$el.keydown(this._handleKeyDown);
      return editor;
    };

    SelectEditor.prototype.destroy = function() {
      if (this.editor) {
        this.editor.$el.unbind('keydown');
      }
      return SelectEditor.__super__.destroy.apply(this, arguments);
    };

    SelectEditor.prototype._handleKeyDown = function(e) {
      if ((e.which === $.ui.keyCode.UP) || (e.which === $.ui.keyCode.DOWN) || (e.which === $.ui.keyCode.RIGHT) || (e.which === $.ui.keyCode.LEFT)) {
        e.preventDefault();
        return e.stopPropagation();
      }
    };

    return SelectEditor;

  })(editors.InlineEditor);

  editors.DetachedEditor = (function(_super) {
    __extends(DetachedEditor, _super);

    function DetachedEditor(args) {
      _.bindAll(this, '_setup_click', '_handleKeyDown');
      DetachedEditor.__super__.constructor.apply(this, arguments);
      this.updateValue();
      if (!_.isUndefined(this.grid.DetachedEditor)) {
        throw "already has a DetachedEditor";
      }
      this.grid.DetachedEditor = this;
      this.wrapper.focus();
    }

    DetachedEditor.prototype.updateValue = function() {
      var activeCell, formatter, html;
      if (this.args.column.formater) {
        formatter = this.args.column.formater;
      } else {
        formatter = this.grid.getOptions().formatterFactory.getFormatter(this.args.column);
      }
      activeCell = this.grid.getActiveCell();
      html = formatter(activeCell.row, activeCell.cell, 0, this.args.column, this.args.item);
      return $(this.args.container).html(html);
    };

    DetachedEditor.prototype.appendEditor = function(args) {
      var wrapper;
      if (!this.editor) {
        throw "@editor not set";
      }
      $(this.args.container).css("border-color", "transparent silver silver transparent");
      $(this.args.container).css("border-style", "solid dotted solid solid");
      $(this.args.container).css("background-color", "#FCF8E3");
      $(this.args.container).css("color", "#C09853");
      wrapper = this.getWrapper();
      wrapper.append(this.editor.render().el);
      this.editor.show();
      return this.position(args.position);
    };

    DetachedEditor.prototype.editorAttrs = function() {
      var attrs, width;
      if (!this._editorAttrs) {
        width = $(this.args.container).width();
        if (width < 400) {
          width = 400;
        }
        attrs = [];
        attrs.push("width: " + width + "px;");
        this._editorAttrs = {
          style: attrs.join(" ")
        };
      }
      return this._editorAttrs;
    };

    DetachedEditor.prototype.editorFocus = function() {};

    DetachedEditor.prototype.getWrapper = function() {
      var self;
      self = this;
      if (!this.wrapper) {
        this.wrapper = $("<div>", {
          "tabindex": -1,
          "class": "detached-editor"
        });
        this.wrapper.appendTo(document.body);
        this.wrapper.click(this._wrapper_click);
        this.wrapper.keydown(this._handleKeyDown);
        window.setTimeout(this._setup_click, 0);
      }
      return this.wrapper;
    };

    DetachedEditor.prototype._wrapper_click = function(e) {
      return e.stopPropagation();
    };

    DetachedEditor.prototype._setup_click = function() {
      return this.ready_for_click = true;
    };

    DetachedEditor.prototype.handle_document_event = function(e) {
      if (!this.wrapper || !this.ready_for_click) {
        return;
      }
      if (this._equal_or_contains(this.wrapper[0], e.target) || this.isEditorElement(e.target)) {
        return "contains";
      } else {
        this.focus_lost = true;
        return this.cancel();
      }
    };

    DetachedEditor.prototype._equal_or_contains = function(contains, target) {
      return Backbone.Edit.helpers.dom.element_equal_or_contains(contains, target);
    };

    DetachedEditor.prototype.isEditorElement = function(target) {
      return this._equal_or_contains(this.editor.el, target);
    };

    DetachedEditor.prototype._handleKeyDown = function(e) {
      if (e.which === $.ui.keyCode.ENTER) {
        e.preventDefault();
        if (_.isFunction(this.editor.delayed_focus)) {
          return this.editor.delayed_focus();
        } else {
          return this.editor.focus();
        }
      } else if (e.which === $.ui.keyCode.ESCAPE && this.isEditorElement(e.target)) {
        this.wrapper.focus();
        this.updateValue();
        return e.preventDefault();
      } else if (e.which === $.ui.keyCode.ESCAPE) {
        e.preventDefault();
        return this.cancel();
      } else if ((e.which === $.ui.keyCode.TAB && e.shiftKey) || (e.which === $.ui.keyCode.LEFT)) {
        e.preventDefault();
        return this.grid.navigatePrev();
      } else if ((e.which === $.ui.keyCode.TAB) || (e.which === $.ui.keyCode.RIGHT)) {
        e.preventDefault();
        return this.grid.navigateNext();
      } else if (e.which === $.ui.keyCode.UP) {
        e.preventDefault();
        return this.grid.navigateUp();
      } else if (e.which === $.ui.keyCode.DOWN) {
        e.preventDefault();
        return this.grid.navigateDown();
      }
    };

    DetachedEditor.prototype.destroy = function() {
      DetachedEditor.__super__.destroy.apply(this, arguments);
      $(this.args.container).removeAttr('style');
      if (this.wrapper) {
        this.wrapper.remove();
        this.wrapper = null;
      }
      if (_.isUndefined(this.grid.DetachedEditor)) {
        throw "DetachedEditor not defined";
      }
      return delete this.grid.DetachedEditor;
    };

    DetachedEditor.prototype.hide = function() {
      if (this.wrapper) {
        return this.wrapper.addClass('hide');
      }
    };

    DetachedEditor.prototype.show = function() {
      if (this.wrapper) {
        return this.wrapper.removeClass('hide');
      }
    };

    DetachedEditor.prototype.position = function(cellBox) {
      var args;
      if (this.wrapper) {
        args = {
          of: this.args.container,
          my: "center top",
          at: "center bottom",
          offset: "0 -1",
          collision: "fit flip"
        };
        return this.wrapper.position(args);
      }
    };

    DetachedEditor.prototype.cancel = function() {
      if (this.focus_lost) {
        return this.grid.getEditorLock().cancelCurrentEdit();
      } else {
        return this.args.cancelChanges();
      }
    };

    return DetachedEditor;

  })(editors.Base);

  if (!editors.Detached) {
    editors.Detached = {};
  }

  editors.Detached.MultiLineText = (function(_super) {
    __extends(MultiLineText, _super);

    function MultiLineText() {
      _ref2 = MultiLineText.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    MultiLineText.prototype._handleKeyDown = function(e) {
      if (this.editor.el === e.target) {
        switch (e.which) {
          case $.ui.keyCode.ENTER:
          case $.ui.keyCode.UP:
          case $.ui.keyCode.DOWN:
          case $.ui.keyCode.LEFT:
          case $.ui.keyCode.RIGHT:
            return;
        }
      }
      return MultiLineText.__super__._handleKeyDown.apply(this, arguments);
    };

    return MultiLineText;

  })(editors.DetachedEditor);

  editors.Detached.Slickgrid = (function(_super) {
    __extends(Slickgrid, _super);

    function Slickgrid() {
      _ref3 = Slickgrid.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    Slickgrid.prototype.editorOptions = function() {
      var options;
      options = Slickgrid.__super__.editorOptions.apply(this, arguments);
      options.newEditorLock = true;
      return options;
    };

    Slickgrid.prototype.handle_document_event = function(e) {
      if (this.editor) {
        if (this.editor.grid && this.editor.grid.clearingTextSelection) {
          return;
        }
        this.editor.on_document_event(e);
      }
      return Slickgrid.__super__.handle_document_event.apply(this, arguments);
    };

    return Slickgrid;

  })(editors.DetachedEditor);

}).call(this);
