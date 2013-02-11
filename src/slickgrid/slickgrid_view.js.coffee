
if !Backbone.Slickgrid
  Backbone.Slickgrid = {}


# defined in slickgrid_editors.js.coffee
SlickgridEditors = Backbone.Slickgrid.editors

if !Backbone.Slickgrid.formatter
  Backbone.Slickgrid.formatter = new Backbone.Slickgrid.FormatterBase()


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
class Backbone.Slickgrid.View extends Backbone.Marionette.ItemView
  className: "slickgrid"

  events:
    'resize' : 'on_resize'


  initialize: (options = {}) ->
    _.bindAll(@, "on_ContextMenu") #, "closeContextMenu"
    @allColumns = @getColumns()
    @autoHeight = @_autoHeight(@getLength())
    @setCollection(@collection, { force: true })

  initialEvents: ->
    # Initial events is called by the Marionette.View constructor and by default binds
    # this.collection "reset" to the render() method.  Since we already handle collection
    # changes with on_CollectionChanged() the initialEvents() can be left as an empty method

  gridOptions: ->
    gridOptions =
      formatterFactory: Backbone.Slickgrid.formatter
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
      column.field = key
      column.schema = value
      column.name = value.title
      column.visible = if _.isUndefined(value.visible) then true else value.visible
      column.canHide = if _.isUndefined(value.canHide) then true else value.canHide
      column.dataType = value.dataType
      column.editor = SlickgridEditors.getEditor(value) if !value.readOnly
      column.formatter = Backbone.Slickgrid.formatter.get(value.formatter) if value.formatter
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
  # Collection data
  #

  # stores collection bindings so that they can be released if the collection changes
  bindToCollection: (eventName, callback, context) ->
    @collectionBindings = [] if !@collectionBindings

    # Marionette.BindTo automatically stores binding and releases them when the view closes,
    # but we also store them here so that we can release them if the collection changes
    binding = @bindTo(@collection, eventName, callback, context)
    @collectionBindings.push( binding )
    return binding


  setupCollectionBindings:  ->
    @bindToCollection("add remove reset", @on_CollectionChanged, @);

    changes = ("change:#{column.id}" for column in @getVisibleColumns() when column.isSpecialColumn != true)
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

    if model and _.isFunction(model.isDeleted) and model.isDeleted()
      metadata.cssClasses += " model-isDeleted"


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

  on_ModelChanged: (model) ->
    @metadata_cache = null

    # Prevent circular calls if the orginal change was the result of a editor that is attached to
    # this instance of the grid
    return if !@grid or @grid.EditorApplyingValue

    index = @collection.indexOf(model)
    activeCell = @grid.getActiveCell()  # returns null if no active cell

    @grid.invalidateRow(index)
    @grid.autosizeColumns()
    @grid.render();


  on_CollectionChanged: ->
    @metadata_cache = null

    # Slick grid needs the parent element to be part of the document before it can be created:
    return if !@shown

    # Prevent circular calls if the orginal change was the result of a editor that is attached to
    # this instance of the grid
    return if @grid and @grid.EditorApplyingValue

    length = @getLength()            # Calling @getLength() here so that it can be overriden in derived classes
    if length != null and length != @previousLength
      @previousLength = length
      @on_LengthChanged(length)

    showGrid = @_showGrid( length )

    if showGrid == null
      @notifyCollectionChanged()
    else
      if !showGrid
        @removeGrid()
        @on_collectionEmpty() if @on_collectionEmpty
      else if showGrid and !@grid
        @createGrid()
      else
        @notifyCollectionChanged()


  applyingValue_start: ->
    throw "Already applying value" if @grid.EditorApplyingValue
    @grid.EditorApplyingValue = true

    # Notify our parent:
    if _.isFunction(@on_applyingValue_start)
      @on_applyingValue_start()


  applyingValue_finish: ->
    throw "Not set" if !@grid.EditorApplyingValue
    @grid.EditorApplyingValue = false

    # Notify our parent:
    if _.isFunction(@on_applyingValue_finish)
      @on_applyingValue_finish()

  notifyCollectionChanged: ->
    @metadata_cache = null

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
    @grid.autosizeColumns()
    @grid.parentView = this
    @trigger("grid:created")
    return @grid



  removeGrid: ->
    if @grid
      @grid.destroy()
      @grid = null
      @trigger("grid:removed")

  hasSlickgrid: ->
    return (!_.isNull(@grid) and !_.isUndefined(@grid))

  # ---------------------------------------------------------------------
  # --- Context menu
  # ---------------------------------------------------------------------
  # Pop up menu that is displayed when thr user clicks on the column header

  on_ContextMenu: (e, args) ->
    if !_.isUndefined(Backbone.Slickgrid.SlickgridColumnPicker)
      e.preventDefault();
      #e.stopPropagation()

      contextMenu = new Backbone.Slickgrid.SlickgridColumnPicker({ grid: this })
      contextMenu.openMenu(e)


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
    @shown = true
    # We only want to render the grid if onShow() has been been called and if the collection isn't empty
    @on_CollectionChanged()

  beforeClose: ->
    @removeGrid()

  onClose: ->
    if @contextMenu
      @contextMenu.close()

    if @resizeTimer
      clearTimeout(@resizeTimer);
      @resizeTimer = null

  render: ->
    # We only want to render the grid if onShow() has been been called and if the collection isn't empty
    @on_CollectionChanged()
    this


