(function() {
  var SlickgridEditors, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (!Backbone.Slickgrid) {
    Backbone.Slickgrid = {};
  }

  SlickgridEditors = Backbone.Slickgrid.editors;

  if (!Backbone.Slickgrid.formatter) {
    Backbone.Slickgrid.formatter = Backbone.Slickgrid.FormatterBase;
  }

  Backbone.Slickgrid.View = (function(_super) {
    __extends(View, _super);

    function View() {
      _ref = View.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    View.prototype.className = "slickgrid";

    View.prototype.enableItemClick = false;

    View.prototype.enableCellClick = false;

    View.prototype.events = {
      'resize': 'on_resize'
    };

    View.prototype.initialize = function(options) {
      if (options == null) {
        options = {};
      }
      _.bindAll(this, "on_ContextMenu", 'on_item_click', 'on_Related_ModelChanged', 'on_CollectionChanged', 'on_ModelChanged');
      this.formatter = new Backbone.Slickgrid.formatter(this);
      this.allColumns = this.getColumns();
      this.autoHeight = this._autoHeight(this.getLength());
      this.setCollection(this.collection, {
        force: true
      });
      this.toolTipEnabled = false;
      return View.__super__.initialize.apply(this, arguments);
    };

    View.prototype.gridOptions = function() {
      var gridOptions;
      gridOptions = {
        formatterFactory: this.formatter,
        autoHeight: this.autoHeight,
        fullWidthRows: true,
        forceFitColumns: true
      };
      return gridOptions;
    };

    View.prototype.schema = function() {
      if (this.options.schema) {
        return this.options.schema;
      } else if (this.collection.model && this.collection.model.prototype.schema) {
        return this.collection.model.prototype.schema;
      } else {
        return null;
      }
    };

    View.prototype.getColumns = function() {
      var column, columns, key, modelSchema, schema, value, _ref1;
      columns = [];
      modelSchema = this.schema();
      if (!modelSchema) {
        throw new Error('Could not find schema');
      }
      if (this.columns) {
        schema = {};
        _ref1 = this.columns;
        for (key in _ref1) {
          column = _ref1[key];
          column = _.clone(column);
          schema[key] = _.defaults(column, modelSchema[key], {
            visible: true
          });
        }
      } else {
        schema = modelSchema;
      }
      for (key in schema) {
        value = schema[key];
        value = _.clone(value);
        Backbone.Edit.helpers.setSchemaDefaults(value, key);
        column = {};
        column.id = key;
        column.schema = value;
        column.field = value.source ? value.source.split('.') : key;
        column.name = value.title;
        column.visible = _.isUndefined(value.visible) ? true : value.visible;
        column.canHide = _.isUndefined(value.canHide) ? true : value.canHide;
        column.dataType = value.dataType;
        if (!value.readOnly) {
          column.editor = SlickgridEditors.getEditor(value);
        }
        column.formatter = value.formatter ? this.formatter.get(value.formatter) : this.formatter.getFormatter(column);
        column.sortable = this.columnSupportsOrderBy(column);
        columns.push(column);
      }
      return columns;
    };

    View.prototype.columnSupportsOrderBy = function() {
      return false;
    };

    View.prototype.getVisibleColumns = function() {
      var column, visibleColumns, _i, _len, _ref1;
      visibleColumns = [];
      _ref1 = this.allColumns;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        column = _ref1[_i];
        if (column.visible) {
          visibleColumns.push(column);
        }
      }
      return visibleColumns;
    };

    View.prototype._findColumn = function(key) {
      var column, _i, _len, _ref1;
      _ref1 = this.allColumns;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        column = _ref1[_i];
        if (column.id === key) {
          return column;
        }
      }
      return null;
    };

    View.prototype._updateVisible = function() {
      if (this.grid) {
        this.grid.setColumns(this.getVisibleColumns());
        return this.grid.autosizeColumns();
      }
    };

    View.prototype.showColumn = function(key) {
      var column;
      if (column = this._findColumn(key)) {
        if (column.visible !== true) {
          column.visible = true;
          this._updateVisible();
          return this.updateCollectionBindings();
        }
      }
    };

    View.prototype.hideColumn = function(key) {
      var column;
      if ((column = this._findColumn(key)) && (this.getVisibleColumns().length > 1) && column.canHide) {
        if (column.visible !== false) {
          column.visible = false;
          this._updateVisible();
          return this.updateCollectionBindings();
        }
      }
    };

    View.prototype.columnIsVisible = function(key) {
      var column;
      if ((column = this._findColumn(key))) {
        return column.visible;
      } else {
        return false;
      }
    };

    View.prototype.bindToModel = function(model, attribute) {
      var binding, eventName, model_details, _i, _len, _ref1;
      if (!this.modelBindings) {
        this.modelBindings = {};
      }
      if (!(model_details = this.modelBindings[model.cid])) {
        model_details = {
          obj: model,
          bindings: []
        };
        this.modelBindings[model.cid] = model_details;
      }
      eventName = "change:" + attribute;
      _ref1 = model_details.bindings;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        binding = _ref1[_i];
        if (binding.eventName === eventName) {
          return true;
        }
      }
      this.listenTo(model, eventName, this.on_Related_ModelChanged);
      model_details.bindings.push({
        eventName: eventName
      });
      return true;
    };

    View.prototype.unbindFromModels = function() {
      var b, cid, item, _i, _len, _ref1, _ref2;
      if (this.modelBindings) {
        _ref1 = this.modelBindings;
        for (cid in _ref1) {
          item = _ref1[cid];
          _ref2 = item.bindings;
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            b = _ref2[_i];
            this.stopListening(item.obj, b.eventName, this.on_Related_ModelChanged);
          }
        }
        this.modelBindings = {};
      }
      return true;
    };

    View.prototype.bindToCollection = function(eventName, callback) {
      if (!this.collectionBindings) {
        this.collectionBindings = [];
      }
      this.listenTo(this.collection, eventName, callback);
      this.collectionBindings.push({
        obj: this.collection,
        eventName: eventName,
        callback: callback
      });
      return true;
    };

    View.prototype.setupCollectionBindings = function() {
      var changes, column, _i, _len, _ref1;
      this.bindToCollection("add remove reset", this.on_CollectionChanged);
      changes = [];
      _ref1 = this.getVisibleColumns();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        column = _ref1[_i];
        if (column.isSpecialColumn !== true) {
          if (column.schema.dataType === "Collection") {
            changes.push("change:" + column.id + " change:childCollection:" + column.id);
          } else {
            changes.push("change:" + column.id);
          }
        }
      }
      if (changes.length > 0) {
        return this.bindToCollection(changes.join(" "), this.on_ModelChanged);
      }
    };

    View.prototype.unbindFromCollection = function() {
      var binding, _i, _len, _ref1;
      if (this.collectionBindings) {
        _ref1 = this.collectionBindings;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          binding = _ref1[_i];
          this.stopListening(binding.obj, binding.event, binding.callback);
        }
        return this.collectionBindings = [];
      }
    };

    View.prototype.updateCollectionBindings = function() {
      this.unbindFromCollection();
      return this.setupCollectionBindings();
    };

    View.prototype.setCollection = function(value, options) {
      if (this.collection !== value || (options && options.force)) {
        this.unbindFromCollection();
        this.unbindFromModels();
        this.collection = value;
        this.setupCollectionBindings();
        if (this.grid) {
          this.removeGrid();
          return this.on_CollectionChanged();
        }
      }
    };

    View.prototype.getLength = function() {
      return this.collection.models.length;
    };

    View.prototype.getItem = function(i) {
      return this.collection.models[i];
    };

    View.prototype.on_metadata = function(row, model, metadata) {
      if (model) {
        if (_.isFunction(model.isDeleted) && model.isDeleted()) {
          metadata.cssClasses += " model-isDeleted";
        }
        if (this.enableItemClick) {
          if (_.isFunction(model.user_can_access) && !model.user_can_access()) {
            return metadata.cssClasses += " slick-row-not-selectable";
          } else {
            return metadata.cssClasses += " slick-row-selectable";
          }
        }
      }
    };

    View.prototype.getItemMetadata = function(row) {
      var metadata, model;
      if (metadata = this._metadata_cache_get(row)) {
        return metadata;
      } else {
        metadata = {
          cssClasses: ""
        };
      }
      if (row !== null) {
        model = this.getItem(row);
        this.on_metadata(row, model, metadata);
      }
      this._metadata_cache_save(row, metadata);
      return metadata;
    };

    View.prototype._metadata_cache_save = function(row, value) {
      if (row !== null) {
        return this.metadata_cache = {
          row: row,
          value: value
        };
      }
    };

    View.prototype._metadata_cache_get = function(row, value) {
      if (this.metadata_cache && (this.metadata_cache.row === row)) {
        return this.metadata_cache.value;
      }
    };

    View.prototype._showGrid = function(length) {
      if (length === null) {
        return null;
      }
      if (length === 0) {
        return false;
      } else {
        return true;
      }
    };

    View.prototype.on_Related_ModelChanged = function(model) {
      this.metadata_cache = null;
      if (!this.grid || this.grid.EditorApplyingValue) {
        return;
      }
      return this.notifyCollectionChanged();
    };

    View.prototype.on_ModelChanged = function(model) {
      var activeCell, columnIndex, key, rowindex;
      this.metadata_cache = null;
      if (!this.grid || this.grid.EditorApplyingValue) {
        return;
      }
      rowindex = this.collection.indexOf(model);
      activeCell = this.grid.getActiveCell();
      if (activeCell && activeCell.row === rowindex) {
        for (key in model.changedAttributes()) {
          columnIndex = this.grid.getColumnIndex(key);
          if (_.isNumber(columnIndex)) {
            this.grid.updateCell(rowindex, columnIndex);
          }
        }
      } else {
        this.grid.invalidateRow(rowindex);
      }
      this.grid.autosizeColumns();
      return this.grid.render();
    };

    View.prototype.on_CollectionChanged = function() {
      var length, showGrid;
      this.metadata_cache = null;
      if (!this.isActive) {
        return;
      }
      if (this.grid && this.grid.EditorApplyingValue) {
        return;
      }
      length = this.getLength();
      if (length === null) {
        this.trigger("collection:length:unknown", length);
      }
      if (length !== null && length !== this.previousLength) {
        this.previousLength = length;
        this.on_LengthChanged(length);
      }
      showGrid = this._showGrid(length);
      if (showGrid === null) {
        return this.notifyCollectionChanged();
      } else {
        if (!showGrid) {
          this.removeGrid();
          this.unbindFromModels();
          if (this.on_collectionEmpty) {
            return this.on_collectionEmpty();
          }
        } else if (showGrid && !this.grid) {
          return this.createGrid();
        } else {
          return this.notifyCollectionChanged();
        }
      }
    };

    View.prototype.on_row_data_loaded = function() {
      if (!this.isActive) {
        return;
      }
      return this.notifyCollectionChanged();
    };

    View.prototype.applyingValue_start = function() {
      if (this.grid.EditorApplyingValue) {
        throw "slickgrid_view: applyingValue_start: Already applying value";
      }
      this.grid.EditorApplyingValue = true;
      return this.trigger("applyingValue:start");
    };

    View.prototype.applyingValue_finish = function() {
      if (!this.grid.EditorApplyingValue) {
        throw "slickgrid_view: applyingValue_finish: Not set";
      }
      this.grid.EditorApplyingValue = false;
      return this.trigger("applyingValue:finish");
    };

    View.prototype.notifyCollectionChanged = function() {
      this.metadata_cache = null;
      this.unbindFromModels();
      if (this.grid) {
        this.grid.updateRowCount();
        this.grid.invalidateAllRows();
        this.grid.autosizeColumns();
        return this.grid.render();
      }
    };

    View.prototype.on_LengthChanged = function(length) {
      var newAutoHeight;
      this.trigger("collection:length:changed", length);
      newAutoHeight = this._autoHeight(length);
      if (newAutoHeight !== this.autoHeight) {
        this.autoHeight = newAutoHeight;
        if (this.grid) {
          this.removeGrid();
          if (this._showGrid()) {
            return this.createGrid();
          }
        }
      }
    };

    View.prototype._autoHeight = function(length) {
      var newAutoHeight;
      if (this.options.maxHeight && (this.options.maxHeight > 0)) {
        newAutoHeight = (length * 20) < this.options.maxHeight;
        if (newAutoHeight) {
          this.$el.height('auto');
        } else {
          this.$el.height(this.options.maxHeight);
        }
        return newAutoHeight;
      } else {
        return this.options.autoHeight || false;
      }
    };

    View.prototype.createGrid = function() {
      if (this.grid) {
        this.removeGrid();
      }
      this.grid = new Slick.Grid(this.el, this, this.getVisibleColumns(), this.gridOptions());
      this.grid.onHeaderContextMenu.subscribe(this.on_ContextMenu);
      if (this.enableItemClick || this.enableCellClick) {
        this.grid.onClick.subscribe(this.on_item_click);
      }
      this.grid.autosizeColumns();
      this.grid.parentView = this;
      if (this.enableItemClick) {
        this.grid.setSelectionModel(new Slick.RowSelectionModel({
          selectActiveRow: true,
          multiSelect: false
        }));
      }
      if (this.previousGrid) {
        if (this.previousGrid.selectedRows) {
          this.grid.setSelectedRows(this.previousGrid.selectedRows);
        }
        if (this.previousGrid.viewport) {
          this.grid.scrollRowToTop(this.previousGrid.viewport.top);
        }
      }
      this.trigger("grid:created");
      return this.grid;
    };

    View.prototype.removeGrid = function() {
      if (this.grid) {
        this.previousGrid = {};
        if (this.enableItemClick) {
          this.previousGrid.selectedRows = this.grid.getSelectedRows();
        }
        this.previousGrid.viewport = this.grid.getViewport();
        this.grid.destroy();
        this.grid = null;
        return this.trigger("grid:removed");
      } else {
        return this.previousGrid = null;
      }
    };

    View.prototype.hasSlickgrid = function() {
      return !_.isNull(this.grid) && !_.isUndefined(this.grid);
    };

    View.prototype.on_ContextMenu = function(e, args) {
      if (!_.isUndefined(Backbone.Slickgrid.SlickgridColumnPicker)) {
        e.preventDefault();
        if (this.contextMenu) {
          this.contextMenu.close();
        }
        this.contextMenu = new Backbone.Slickgrid.SlickgridColumnPicker({
          grid: this
        });
        return this.contextMenu.openMenu(e);
      }
    };

    View.prototype.newButtonsView = function() {
      if (!_.isUndefined(Backbone.Slickgrid.SlickgridButtons)) {
        return new Backbone.Slickgrid.SlickgridButtons({
          grid: this
        });
      } else {
        return null;
      }
    };

    View.prototype.getTooltip = function(model) {
      var toolTipClass;
      if (!this.toolTip) {
        toolTipClass = "Landscape.Views." + (_.string.classify(model.paramRoot)) + "Tooltip";
        toolTipClass = Backbone.Edit.helpers.getObjectByName(toolTipClass);
        this.toolTip = new toolTipClass();
        if (this.getVisibleColumns().length === 1) {
          this.toolTip.setAlignment("center");
        } else {
          this.toolTip.setAlignment("right");
        }
        $('body').append(this.toolTip.render().$el);
        if (this.isActive) {
          this.toolTip.show();
        }
      }
      return this.toolTip;
    };

    View.prototype.setTooltipEnabled = function(value) {
      if (!_.isBoolean(value)) {
        throw "setTooltipEnabled: expected a boolean";
      }
      if (this.toolTipEnabled !== value) {
        return this.toolTipEnabled = value;
      }
    };

    View.prototype.getTooltipEnabled = function() {
      return this.toolTipEnabled;
    };

    View.prototype.on_item_click = function(e, args) {
      var cellNode, column, item, toolTip, tooltipEnabled, tooltipTarget;
      if (this.grid) {
        item = this.grid.getDataItem(args.row);
        if (!item) {
          return;
        }
        tooltipEnabled = this.getTooltipEnabled();
        tooltipTarget = $(e.target);
        if (this.enableCellClick) {
          column = this.grid.getColumns()[args.cell];
          if (column.schema.tooltip && column.schema.dataType === 'Model') {
            tooltipEnabled = true;
            if (cellNode = this.grid.getCellNode(args.row, args.cell)) {
              tooltipTarget = $(cellNode);
            }
            e.preventDefault();
            item = item.get(column.id);
            if (!item) {
              return;
            }
          } else {
            if (!this.enableItemClick) {
              return;
            }
          }
        }
        args = {
          selected_item: item,
          display_item: item
        };
        this.trigger("before:item:clicked", args);
        if (!(item = args.display_item)) {
          return;
        }
        if (item && _.isFunction(item.user_can_access) && !item.user_can_access()) {
          toolTip = this.getTooltip(item);
          return toolTip.click({
            view: this,
            $el: tooltipTarget,
            model: item
          });
        } else if (item && tooltipEnabled === true) {
          toolTip = this.getTooltip(item);
          return toolTip.click({
            view: this,
            $el: tooltipTarget,
            model: item
          });
        } else {
          this.grid.setSelectedRows([args.row]);
          return this.trigger("item:clicked", item);
        }
      }
    };

    View.prototype.on_resize = function() {
      var f, self, width;
      width = this.$el.width();
      if (this.oldWidth !== width) {
        this.oldWidth = width;
        if (this.resizeTimer) {
          clearTimeout(this.resizeTimer);
          this.resizeTimer = null;
        }
        if (this.grid) {
          self = this;
          f = function() {
            console.log("resize");
            return self.grid.autosizeColumns();
          };
          return this.resizeTimer = window.setTimeout(f, 300);
        }
      }
    };

    View.prototype.onShow = function() {
      View.__super__.onShow.apply(this, arguments);
      this.on_CollectionChanged();
      if (this.toolTip) {
        return this.toolTip.show();
      }
    };

    View.prototype.onDeactivate = function() {
      View.__super__.onDeactivate.apply(this, arguments);
      this.removeGrid();
      this.unbindFromModels();
      if (this.contextMenu) {
        this.contextMenu.close();
      }
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = null;
      }
      if (this.toolTip) {
        this.toolTip.close();
        return this.toolTip = null;
      }
    };

    View.prototype.render = function() {
      this.on_CollectionChanged();
      return this;
    };

    return View;

  })(Backbone.Edit.View);

}).call(this);
