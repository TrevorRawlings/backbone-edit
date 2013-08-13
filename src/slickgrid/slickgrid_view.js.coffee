
if !Backbone.Slickgrid
  Backbone.Slickgrid = {}


# defined in slickgrid_editors.js.coffee
SlickgridEditors = Backbone.Slickgrid.editors

if !Backbone.Slickgrid.formatter
  Backbone.Slickgrid.formatter = Backbone.Slickgrid.FormatterBase


# Backbone.Slickgrid.View
# =======================
#
# Wraps https://github.com/mleibman/SlickGrid
#
# Handles
# -------
# - autosizing the columns when the view is resized
#
# - binding to the backbone collection
#   Listens for collection reset, add, remove events and forwards to the slickgrid
#
# - Construction / destruction of the slickgrid
#   * Only creates the slickgrid if the datasource has at least one item
#   * Delays Construction of the grid until onShow() has been called
#   * Removes the grid when onClose() is called
#
# - The maximum height the slickgrid can grow to
#   If the number of items in the grid is small we let slickgrid's autoHeight option control slickgrid's height. But
#   when it grows above maxHeight we can fix the height of this element so that a vertical scroll bar is added
#
# - Caching of row metadata
#
class Backbone.Slickgrid.View extends Backbone.Marionette.View
  className: "slickgrid"
  enableItemClick: false
  enableCellClick: false

  events:
    'resize' : 'on_resize'

  initialize: (options = {}) ->
    _.bindAll(@, "on_ContextMenu", 'on_item_click') #, "closeContextMenu"
    @formatter = new Backbone.Slickgrid.formatter(this)
    @allColumns = @getColumns()
    @autoHeight = @_autoHeight(@getLength())
    @setCollection(@collection, { force: true })
    @toolTipEnabled = false
    super


  gridOptions: ->
    gridOptions =
      formatterFactory: @formatter
      autoHeight: @autoHeight
      fullWidthRows: true
      forceFitColumns: true
    return gridOptions

  # -----------------------------------
  # Columns
  #
  schema: ->
    if (@options.schema)
      return @options.schema
    else if (@collection.model and @collection.model.prototype.schema)
      return @collection.model.prototype.schema
    else
      return null

  getColumns: ->
    columns = []
    modelSchema = @schema()
    if !modelSchema
      throw new Error('Could not find schema')

    # if a columns array has been supplied then use that to filter the list of visible columns:
    if @columns
      schema = {}
      for key, column of @columns
        column = _.clone(column)  # Make a local copy so that we don't modify shared data structures:
        schema[key] = _.defaults( column, modelSchema[key], { visible: true } )   # Copy values form modelSchema
    else
      schema = modelSchema

    for key, value of schema
      # Create a (shallow) clone to avoid modifcation of shared data structures:
      value = _.clone(value);
      Backbone.Edit.helpers.setSchemaDefaults(value, key)

      column = {}
      column.id = key
      column.schema = value
      column.field = if value.source then value.source.split('.') else key
      column.name = value.title
      column.visible = if _.isUndefined(value.visible) then true else value.visible
      column.canHide = if _.isUndefined(value.canHide) then true else value.canHide
      column.dataType = value.dataType
      column.editor = SlickgridEditors.getEditor(value) if !value.readOnly
      column.formatter = if value.formatter then @formatter.get(value.formatter) else @formatter.getFormatter(column)
      column.sortable = @columnSupportsOrderBy(column)

      columns.push(column)
    return columns

  columnSupportsOrderBy: ->
    return false


  getVisibleColumns: ->
    visibleColumns = []
    for column in @allColumns when column.visible
      visibleColumns.push(column)
    return visibleColumns


  _findColumn: (key) ->
    for column in @allColumns when (column.id == key)
      return column
    return null

  _updateVisible: ->
    if @grid
      @grid.setColumns(@getVisibleColumns())
      @grid.autosizeColumns()

  showColumn: (key) ->
    if column = @_findColumn(key)
      if column.visible != true
        column.visible = true;
        @_updateVisible()
        @updateCollectionBindings()

  hideColumn: (key) ->
    if (column = @_findColumn(key)) and (@getVisibleColumns().length > 1) and (column.canHide)
      if column.visible != false
        column.visible = false;
        @_updateVisible()
        @updateCollectionBindings()

  columnIsVisible: (key) ->
    if (column = @_findColumn(key))
      return column.visible
    else
      return false

  # -----------------------------------
  # Model bindings
  #
  bindToModel: (model, attribute) ->
    @modelBindings = {} if !@modelBindings

    # Marionette.BindTo automatically stores bindings and releases them when the view closes,
    # but we also store them here so that we can release them if the collection changes
    if !model_details = @modelBindings[model.cid]
      model_details = { bindings: [] }
      @modelBindings[model.cid] = model_details

    eventName = "change:#{attribute}"
    for binding in model_details.bindings when binding.eventName == eventName
      return true

    binding = @bindTo(model, eventName, @on_Related_ModelChanged, this)
    model_details.bindings.push(binding)
    return true

  unbindFromModels: ->
    if @modelBindings
      for cid, item of @modelBindings
        @unbindFrom(b) for b in item.bindings
      @modelBindings = {}
    return true


  # -----------------------------------
  # Collection data
  #

  # stores collection bindings so that they can be released if the collection changes
  bindToCollection: (eventName, callback, context) ->
    @collectionBindings = [] if !@collectionBindings

    # Marionette.BindTo automatically stores bindings and releases them when the view closes,
    # but we also store them here so that we can release them if the collection changes
    binding = @bindTo(@collection, eventName, callback, context)
    @collectionBindings.push( binding )
    return binding


  setupCollectionBindings:  ->
    @bindToCollection("add remove reset", @on_CollectionChanged, @);

    changes = []
    for column in @getVisibleColumns() when column.isSpecialColumn != true
      if column.schema.dataType == "Collection"
        changes.push("change:#{column.id} change:childCollection:#{column.id}")
      else
        changes.push("change:#{column.id}")

    if changes.length > 0
      @bindToCollection(changes.join(" "), @on_ModelChanged, @);


  unbindFromCollection: ->
    if @collectionBindings
      @unbindFrom(binding) for binding in @collectionBindings

  updateCollectionBindings: ->
    @unbindFromCollection()
    @setupCollectionBindings()

  setCollection: (value, options) ->
    if @collection != value or (options and options.force)
      @unbindFromCollection()
      @unbindFromModels()
      @collection = value
      @setupCollectionBindings()

      if @grid
        @removeGrid()
        @on_CollectionChanged()


  getLength: ->
    @collection.models.length


  getItem: (i) ->
    @collection.models[i]


  # on_metadata
  # -----------
  #
  # An overrideable method called by getItemMetadata() - its only called if we
  # don't already have a cached copy of the metadata for the row
  #
  # row      - the slickgrid row
  # model    - the backbone model for this row (may be null)
  # metadata - an empty metadata object to pass back to the slickgrid
  #
  on_metadata: (row, model, metadata) ->

    if model
      if _.isFunction(model.isDeleted) and model.isDeleted()
        metadata.cssClasses += " model-isDeleted"

      if @enableItemClick
        if _.isFunction(model.user_can_access) and !model.user_can_access()
          metadata.cssClasses += " slick-row-not-selectable"
        else
          metadata.cssClasses += " slick-row-selectable"


  # getItemMetadata
  # ---------------
  #
  # getItemMetadata() is called by slickgrid while rendering the grid. This method manages the saving of
  # metadata to a cache.  As result it'll normally be easier to override on_metadata()
  #
  getItemMetadata: (row) ->
    if metadata = @_metadata_cache_get(row)
      return metadata
    else
      metadata = { cssClasses: "" }

    if row != null
      model = @getItem(row)
      @on_metadata(row, model, metadata)

    @_metadata_cache_save(row, metadata)
    return metadata


  # slick grid calls getItemMetadata() multiple time while rendering each row, to speed things up the
  # most recently requested item is cached
  _metadata_cache_save: (row, value) ->
    if row != null
      @metadata_cache = { row: row, value: value }

  _metadata_cache_get: (row, value) ->
    if (@metadata_cache) and (@metadata_cache.row == row)
      return @metadata_cache.value


  # By default grid is only displayed if there are > 0 items
  _showGrid: (length) ->
    if length == null
      return null          # Resultsets will return null if they don't yet know the collection length
    if length == 0
      return false
    else
      return true

  # on_Related_ModelChanged
  # -----------------------
  #
  # A model accessed by the formatter while rendering a cell value changed
  #
  # TODO: when we support the reference counting / model unloading we will need to register an interest in the model here
  #
  on_Related_ModelChanged: (model) ->
    @metadata_cache = null

    # Prevent circular calls if the orginal change was the result of a editor that is attached to
    # this instance of the grid
    return if !@grid or @grid.EditorApplyingValue

    @notifyCollectionChanged()



  # on_ModelChanged
  # ---------------                                  onClick
  #
  # A model that is part of @collection changed
  on_ModelChanged: (model) ->
    @metadata_cache = null

    # Prevent circular calls if the orginal change was the result of a editor that is attached to
    # this instance of the grid
    return if !@grid or @grid.EditorApplyingValue

    rowindex = @collection.indexOf(model)
    activeCell = @grid.getActiveCell()  # returns null if no active cell

    # if its the active thats changed then lets try to up date the row without closing the editor
    if activeCell and activeCell.row == rowindex
      for key of model.changedAttributes()
        columnIndex = this.grid.getColumnIndex(key)
        if _.isNumber(columnIndex)
          this.grid.updateCell(rowindex, columnIndex)
    else
      @grid.invalidateRow(rowindex)
    @grid.autosizeColumns()
    @grid.render();


  on_CollectionChanged: ->
    @metadata_cache = null

    # Slick grid needs the parent element to be part of the document before it can be created:
    return if !@isActive

    # Prevent circular calls if the orginal change was the result of a editor that is attached to
    # this instance of the grid
    return if @grid and @grid.EditorApplyingValue

    length = @getLength()            # Calling @getLength() here so that it can be overriden in derived classes
    if length == null
      @trigger("collection:length:unknown", length);

    if length != null and length != @previousLength
      @previousLength = length
      @on_LengthChanged(length)

    showGrid = @_showGrid( length )

    if showGrid == null
      @notifyCollectionChanged()
    else
      if !showGrid
        @removeGrid()
        @unbindFromModels()
        @on_collectionEmpty() if @on_collectionEmpty
      else if showGrid and !@grid
        @createGrid()
      else
        @notifyCollectionChanged()

  # on_row_data_loaded
  # ------------------
  #
  # Callback from the formatter / lazy loader when data that was missing gets returned
  on_row_data_loaded: ->
    # Slick grid needs the parent element to be part of the document before it can be created:
    return if !@isActive
    @notifyCollectionChanged()


  applyingValue_start: ->
    throw "slickgrid_view: applyingValue_start: Already applying value" if @grid.EditorApplyingValue
    @grid.EditorApplyingValue = true

    # Notify our parent - if this grid is a child of another grid then we'll want to prevent the othergrid from trying
    # to redraw itself (the redraw would cause the edit operation to end and this editor would get closed)
    @trigger("applyingValue:start")


  applyingValue_finish: ->
    throw "slickgrid_view: applyingValue_finish: Not set" if !@grid.EditorApplyingValue
    @grid.EditorApplyingValue = false

    # Notify our parent:
    @trigger("applyingValue:finish")


  notifyCollectionChanged: ->
    @metadata_cache = null

    @unbindFromModels()
    if @grid
      @grid.updateRowCount();
      @grid.invalidateAllRows()
      @grid.autosizeColumns()
      @grid.render()


  # ----------------------------------
  # View max height
  #
  on_LengthChanged: (length) ->
    @trigger("collection:length:changed", length);

    newAutoHeight = @_autoHeight(length)
    if newAutoHeight != @autoHeight
      @autoHeight = newAutoHeight
      if @grid  # need to recreate the grid for new autoHeight value to be applied
        @removeGrid()
        @createGrid() if @_showGrid()


  _autoHeight: (length) ->
    if (@options.maxHeight) and (@options.maxHeight > 0)
      # If the number of items in the grid is small we let slickgrid's autoHeight option
      # control slickgrid's height. But when it grows above maxHeight we need to fix the height of this element
      # and recreate the grid with options.autoHeight set to false
      newAutoHeight = ( (length * 20) < @options.maxHeight )
      if newAutoHeight
        @$el.height('auto')
      else
        @$el.height(@options.maxHeight)
      return newAutoHeight
    else
      return @options.autoHeight || false


  # -----------------------------------
  # Create / free grid
  #
  createGrid: ->
    if @grid
      @removeGrid()
    @grid = new Slick.Grid(@el, @, @getVisibleColumns(), @gridOptions())
    @grid.onHeaderContextMenu.subscribe(@on_ContextMenu);
    @grid.onClick.subscribe( @on_item_click )   if @enableItemClick or @enableCellClick
    @grid.autosizeColumns()
    @grid.parentView = this

    if @enableItemClick
      @grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: true, multiSelect: false}));

    if @previousGrid
      @grid.setSelectedRows(@previousGrid.selectedRows) if @previousGrid.selectedRows
      @grid.scrollRowToTop(@previousGrid.viewport.top)  if @previousGrid.viewport

    @trigger("grid:created")
    return @grid



  removeGrid: ->
    if @grid
      # First lets save the current selected row and scroll position in case we want to restore the grid in the future:
      @previousGrid = {}
      if @enableItemClick
        @previousGrid.selectedRows = @grid.getSelectedRows()
      @previousGrid.viewport = @grid.getViewport()

      @grid.destroy()
      @grid = null
      @trigger("grid:removed")
    else
      @previousGrid = null

  hasSlickgrid: ->
    return (!_.isNull(@grid) and !_.isUndefined(@grid))

  # ---------------------------------------------------------------------
  # --- Context menu
  # ---------------------------------------------------------------------
  # Pop up menu that is displayed when the user clicks on the column header

  on_ContextMenu: (e, args) ->
    if !_.isUndefined(Backbone.Slickgrid.SlickgridColumnPicker)
      e.preventDefault();
      #e.stopPropagation()
      if @contextMenu
        @contextMenu.close()

      @contextMenu = new Backbone.Slickgrid.SlickgridColumnPicker({ grid: this })
      @contextMenu.openMenu(e)


  # ---------------------------------------------------------------------
  # --- Buttons View
  # ---------------------------------------------------------------------
  # buttons that are displayed above the slickgrid

  newButtonsView: ->
    if !_.isUndefined(Backbone.Slickgrid.SlickgridButtons)
      return new Backbone.Slickgrid.SlickgridButtons({grid: this})
    else
      return null

  # ---------------------------------------------------------------------
  # Tooltip
  #
  getTooltip: (model) ->

    if !@toolTip
      toolTipClass = "Landscape.Views.#{_.string.classify(model.paramRoot)}Tooltip"
      toolTipClass = Backbone.Edit.helpers.getObjectByName(toolTipClass)
      @toolTip = new toolTipClass()
      if @getVisibleColumns().length == 1
        @toolTip.setAlignment("center")
      else
        @toolTip.setAlignment("right")
      $('body').append(@toolTip.render().$el)
      @toolTip.show() if @isActive
    return @toolTip

  setTooltipEnabled: (value) ->
    throw "setTooltipEnabled: expected a boolean" if !_.isBoolean(value)

    if @toolTipEnabled != value
      @toolTipEnabled = value

  getTooltipEnabled: ->
    return @toolTipEnabled


  # ----------------------------------
  # select item
  #
  # args:
  #   row
  #   cell
  #
  on_item_click: (e, args) ->
    if @grid
      item = @grid.getDataItem(args.row)
      return if !item       # If the user clicked a row before the resultset has loaded the row
                            # then we'll get null returned.

      tooltipEnabled = @getTooltipEnabled()
      tooltipTarget = $(e.target)

      if @enableCellClick
        column = @grid.getColumns()[args.cell]
        if column.schema.tooltip and column.schema.dataType == 'Model'
          tooltipEnabled = true
          tooltipTarget = $(cellNode) if cellNode = @grid.getCellNode(args.row, args.cell)
          e.preventDefault()
          item = item.get(column.id)
          return if !item
        else
          return if !@enableItemClick


      # when displaying a list of task assets we want the tooltip
      # to display the related task instead of the task_asset
      args =
        selected_item: item
        display_item: item
      @trigger("before:item:clicked", args)
      return if !item = args.display_item


      if item and _.isFunction(item.user_can_access) and !item.user_can_access()
        # For now we can assume that item must be an Animal / Crop or Task and the thing stopping the user
        # accessing it is that they are not a member of the parent enterprise ... although that might change
        # in the future if our implementation of memberships change
        toolTip = @getTooltip(item)
        toolTip.click({view: this, $el: tooltipTarget, model: item})
      else if item and tooltipEnabled == true
        toolTip = @getTooltip(item)
        toolTip.click({view: this, $el: tooltipTarget, model: item})
      else
        @grid.setSelectedRows([args.row])
        @trigger("item:clicked", item)



  # -----------------------------------

  # on_resize()
  # -------
  #
  # When this elements div changes size
  on_resize: ->
    width = @$el.width()
    if @oldWidth != width
      @oldWidth = width

      if @resizeTimer
        clearTimeout(@resizeTimer);
        @resizeTimer = null

      if @grid
        self = @
        f = ->
          console.log( "resize" )
          self.grid.autosizeColumns()
        @resizeTimer = window.setTimeout( f,  300);


  # onShow()
  # -------
  #
  # Called by the parent view when this view is added to the document
  onShow: ->
    super
    # We only want to render the grid if onShow() has been been called and if the collection isn't empty
    @on_CollectionChanged()
    if @toolTip
      @toolTip.show()

  onDeactivate: ->
    super
    @removeGrid()
    @unbindFromModels()

    if @contextMenu
      @contextMenu.close()

    if @resizeTimer
      clearTimeout(@resizeTimer);
      @resizeTimer = null

    if @toolTip
      @toolTip.close()
      @toolTip = null


  render: ->
    # We only want to render the grid if onShow() has been been called and if the collection isn't empty
    @on_CollectionChanged()
    this


