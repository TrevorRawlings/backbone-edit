(function() {
  var editors, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  editors = Backbone.Edit.editors;

  Backbone.Edit.editors.Slickgrid = (function(_super) {
    __extends(Slickgrid, _super);

    function Slickgrid() {
      _ref = Slickgrid.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Slickgrid.prototype.enableAddRow = false;

    Slickgrid.prototype.enableDelete = false;

    Slickgrid.prototype.enableMove = false;

    Slickgrid.prototype.enableIndex = false;

    Slickgrid.prototype.initialize = function(options) {
      var editable;
      if (options == null) {
        options = {};
      }
      _.bindAll(this, 'on_addNewRow', 'on_Click', 'onBeforeMoveRows', 'onMoveRows', '_delayed_focus_click', 'on_document_event', 'on_BeforeEditCell', 'on_BeforeCellEditorDestroy');
      if (this.enableMove && !options.model) {
        throw "options.model is required";
      }
      if (_.isUndefined(options.autoHeight)) {
        options.autoHeight = true;
      }
      if (options.model) {
        if (!options.key) {
          throw "Missing option: 'key'";
        }
        this.model = options.model;
        this.key = options.key;
        this.collection = options.model.get(options.key);
      } else if (options.value) {
        this.collection = options.value;
      }
      this.form = options.form;
      this.editorSchema = options.schema || {};
      if (this.enableAddRow) {
        this.newModel = new this.collection.model();
      }
      if (this.key) {
        this.$el.attr('name', this.key);
      }
      if (this.editorSchema.editorClass) {
        this.$el.addClass(this.editorSchema.editorClass);
      }
      if (this.editorSchema.editorAttrs) {
        this.$el.attr(this.editorSchema.editorAttrs);
      }
      if (this.editorSchema.placeholder) {
        this.$el.attr("placeholder", this.editorSchema.placeholder);
      }
      Slickgrid.__super__.initialize.apply(this, arguments);
      editable = _.isUndefined(this.options.editable) ? false : this.options.editable;
      return this.setEditable(editable);
    };

    Slickgrid.prototype.getValue = function() {
      return this.collection;
    };

    Slickgrid.prototype.setValue = function(value) {
      return this.setCollection(value);
    };

    Slickgrid.prototype.setEditable = function(value) {
      if (this.editable !== value) {
        this.editable = value;
        if (this.grid) {
          this.removeGrid();
        }
        this.allColumns = this.getColumns();
        return this.on_CollectionChanged();
      }
    };

    Slickgrid.prototype._delayed_focus_click = function() {
      var cells, columns, index, selectableColumn;
      if (this.grid) {
        columns = this.grid.getColumns();
        selectableColumn = _.find(columns, function(item) {
          return item.editor;
        });
        index = _.indexOf(columns, selectableColumn);
        cells = this.$('.slick-cell');
        if (cells.length >= index) {
          return $(cells[index]).click();
        }
      }
    };

    Slickgrid.prototype.delayed_focus = function() {
      if (this.grid) {
        return window.setTimeout(this._delayed_focus_click, 0);
      }
    };

    Slickgrid.prototype.focus = function() {
      return this.$el.focus();
    };

    Slickgrid.prototype.triggerChanged = function() {};

    Slickgrid.prototype.commit = function() {};

    Slickgrid.prototype.gridOptions = function() {
      var options;
      options = Slickgrid.__super__.gridOptions.apply(this, arguments);
      options.editable = this.editable;
      options.enableAddRow = this.enableAddRow && this.editable;
      if (this.options.newEditorLock) {
        options.editorLock = new Slick.EditorLock;
      }
      return options;
    };

    Slickgrid.prototype._showGrid = function() {
      if (this.enableAddRow && this.editable) {
        return true;
      } else {
        return Slickgrid.__super__._showGrid.apply(this, arguments);
      }
    };

    Slickgrid.prototype.schema = function() {
      if (this.collection.model && this.collection.model.prototype.schema) {
        return this.collection.model.prototype.schema;
      } else {
        return null;
      }
    };

    Slickgrid.prototype.getColumns = function() {
      var column, columns;
      columns = Slickgrid.__super__.getColumns.apply(this, arguments);
      if (this.enableIndex) {
        column = this.specialColumn("index");
        columns = _.union([column], columns);
      }
      if (this.enableMove && this.editable) {
        column = this.specialColumn("move");
        columns = _.union([column], columns);
      }
      if (this.enableDelete && this.editable) {
        column = this.specialColumn("delete");
        columns = _.union(columns, [column]);
      }
      return columns;
    };

    Slickgrid.prototype.createGrid = function() {
      var grid;
      grid = Slickgrid.__super__.createGrid.apply(this, arguments);
      if (this.enableAddRow && this.editable) {
        grid.onAddNewRow.subscribe(this.on_addNewRow);
      }
      if (this.enableDelete && this.editable) {
        grid.onClick.subscribe(this.on_Click);
      }
      if (this.enableMove && this.editable) {
        grid.registerPlugin(this.newMoveManager());
      }
      grid.onBeforeEditCell.subscribe(this.on_BeforeEditCell);
      grid.onBeforeCellEditorDestroy.subscribe(this.on_BeforeCellEditorDestroy);
      return grid.setSelectionModel(new Slick.RowSelectionModel({
        selectActiveRow: true,
        multiSelect: false
      }));
    };

    Slickgrid.prototype.getItem = function(i) {
      if (this.enableAddRow && i === this.getLength() && this.editable) {
        return this.newModel;
      } else {
        return Slickgrid.__super__.getItem.apply(this, arguments);
      }
    };

    Slickgrid.prototype.setupCollectionBindings = function() {
      Slickgrid.__super__.setupCollectionBindings.apply(this, arguments);
      return this.bindToCollection("serverErrorsChanged clientErrorsChanged", this.on_ModelChanged, this);
    };

    Slickgrid.prototype.on_BeforeEditCell = function() {
      if (!this.listening_to_document) {
        $(document).on('click', this.on_document_event);
        $(document).on('focusin', this.on_document_event);
        return this.listening_to_document = true;
      }
    };

    Slickgrid.prototype.on_BeforeCellEditorDestroy = function() {
      return this.unbind_from_document();
    };

    Slickgrid.prototype.on_document_event = function(e) {
      var isActive;
      if (!this.listening_to_document) {
        return;
      }
      isActive = this.grid.getEditorLock().isActive();
      this.consoleLog("on_document_event: " + e.type + ", isActive = " + isActive);
      if (this.grid.DetachedEditor) {
        this.consoleLog("on_document_event: @grid.DetachedEditor = true - calling handle_document_event");
        this.grid.DetachedEditor.handle_document_event(e);
      }
      if (this.grid.DetachedEditor) {
        this.consoleLog("on_document_event: @grid.DetachedEditor still true - returning");
        return;
      }
      if ($.contains(this.el, e.target)) {
        this.consoleLog("on_document_event: this.el contains e.target - returning");
        return "contains";
      }
      if (this.grid.getEditorLock().isActive()) {
        this.consoleLog("on_document_event: @grid.getEditorLock().isActive() - calling commitCurrentEdit()");
        this.grid.getEditorLock().commitCurrentEdit();
      }
      if (isActive) {
        this.consoleLog("on_document_event: calling @grid.resetActiveCell()");
        return this.grid.resetActiveCell();
      }
    };

    Slickgrid.prototype.consoleLog = function(message) {};

    Slickgrid.prototype.unbind_from_document = function() {
      $(document).off('click', this.on_document_event);
      $(document).off('focusin', this.on_document_event);
      return this.listening_to_document = false;
    };

    Slickgrid.prototype.on_metadata = function(row, model, metadata) {
      var client_keys, key, server_keys, _i, _len, _ref1;
      Slickgrid.__super__.on_metadata.apply(this, arguments);
      metadata.cssCellClasses = {};
      client_keys = _.keys(model.clientErrors);
      server_keys = _.keys(model.serverErrors);
      _ref1 = _.union(client_keys, server_keys);
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        key = _ref1[_i];
        metadata.cssCellClasses[key] = "cellError";
      }
      metadata.cssPossibleCellClasses = "cellError";
      if (row < this.getLength() && this.editable) {
        if (this.enableDelete && !model.isDeleted()) {
          metadata.cssClasses += " deletable";
        }
        if (this.enableMove) {
          return metadata.cssClasses += " moveable";
        }
      }
    };

    Slickgrid.prototype.on_addNewRow = function(e, args) {
      try {
        this.applyingValue_start();
        this.collection.add(args.item, {
          changeSource: "ui"
        });
        this.newModel = new this.collection.model();
        return this.notifyCollectionChanged();
      } finally {
        this.applyingValue_finish();
      }
    };

    Slickgrid.prototype.on_Click = function(e, args) {
      var column, item;
      column = this.grid.getColumns()[args.cell];
      if (column.id === "_delete" && args.row < this.getLength()) {
        item = this.grid.getDataItem(args.row);
        return item.destroy({
          changeSource: "ui"
        });
      }
    };

    Slickgrid.prototype.specialColumn = function(type) {
      var column;
      column = {};
      column.id = "_" + type;
      column.field = "_" + type;
      column.name = "";
      column.visible = true;
      column.canHide = false;
      column.editor = null;
      if (type === "index") {
        column.formatter = this.formatter.rowIndexFormater;
        column.name = "#";
      } else {
        column.formatter = null;
      }
      if (type === "move") {
        column.width = 30;
        column.behavior = "selectAndMove";
      } else if (type === "delete") {
        column.width = 30;
      } else {
        column.width = 40;
      }
      column.selectable = true;
      column.resizable = false;
      column.cssClass = "cell-" + type;
      column.isSpecialColumn = true;
      return column;
    };

    Slickgrid.prototype.onBeforeMoveRows = function(e, data) {
      var i, row, _i, _len, _ref1;
      _ref1 = data.rows;
      for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
        row = _ref1[i];
        if (!((row === data.insertBefore) || (row === data.insertBefore - 1))) {
          continue;
        }
        e.stopPropagation();
        return false;
      }
      return true;
    };

    Slickgrid.prototype.onMoveRows = function(e, args) {
      var i, itemsAfter, itemsBefore, row, rows, rowsToMove, _i, _len;
      try {
        this.applyingValue_start();
        if (this.model.syncHelper().get("state") === "enabled") {
          this.model.syncHelper().suspendSave();
        }
        rowsToMove = (function() {
          var _i, _len, _ref1, _results;
          _ref1 = args.rows;
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            row = _ref1[_i];
            _results.push(this.getItem(row));
          }
          return _results;
        }).call(this);
        itemsBefore = this.collection.first(args.insertBefore);
        itemsAfter = this.collection.rest(args.insertBefore);
        itemsBefore = _.difference(itemsBefore, rowsToMove);
        itemsAfter = _.difference(itemsAfter, rowsToMove);
        rows = itemsBefore.concat(rowsToMove, itemsAfter);
        for (i = _i = 0, _len = rows.length; _i < _len; i = ++_i) {
          row = rows[i];
          row.set("position", i, {
            changeSource: "ui"
          });
        }
        this.grid.setSelectedRows([]);
        this.collection.sort();
        return this.notifyCollectionChanged();
      } finally {
        this.applyingValue_finish();
        if (this.model.syncHelper().get("state") === "enabled") {
          this.model.syncHelper().enableSave();
        }
      }
    };

    Slickgrid.prototype.newMoveManager = function() {
      var moveRowsPlugin;
      moveRowsPlugin = new Slick.RowMoveManager();
      moveRowsPlugin.onBeforeMoveRows.subscribe(this.onBeforeMoveRows);
      moveRowsPlugin.onMoveRows.subscribe(this.onMoveRows);
      return moveRowsPlugin;
    };

    return Slickgrid;

  })(Backbone.Slickgrid.View);

}).call(this);
