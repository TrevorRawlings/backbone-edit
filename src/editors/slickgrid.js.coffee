editors = Backbone.Edit.editors

# Backbone.Edit.editors.Slickgrid
# ---------------------------------
#
# Allows a slickgrid to be used as the editor of a Backbone model collection. Clicking in a cell will cause slickgrid
# cells to bereplaced with a nested editor.
#
# The schema of the model being edited will control the type of editor displayed when the user tries to edit a value.
#
# This requires Backbone.Slickgrid.View (which wraps https://github.com/mleibman/SlickGrid)
#

class Backbone.Edit.editors.Slickgrid extends Backbone.Slickgrid.View
  enableAddRow: false
  enableDelete: false
  enableMove: false
  enableIndex: false

  initialize: (options = {}) ->
    _.bindAll(@, 'on_addNewRow', 'on_Click', 'onBeforeMoveRows', 'onMoveRows', '_delayed_focus_click')
    throw "options.model is required" if @enableMove and !options.model

    if _.isUndefined(options.autoHeight)
      options.autoHeight = true

    if (options.model)
      throw "Missing option: 'key'" if !options.key
      @model = options.model
      @key = options.key
      @collection = options.model.get(options.key)

    else if options.value
      @collection = options.value

    @form = options.form
    @editorSchema = options.schema || {}
    @editable = if (@options.editable != undefined) then @options.editable else false

    if @enableAddRow
      # getItem() needs to return a new instance of a backbone model but we can't do 'new @collection.model()'
      # from within getItem() because getItem() is often called from within a Backbone-Relational (BR) change events
      @newModel = new @collection.model()

    @$el.attr('name', @key) if @key
    @$el.addClass(@editorSchema.editorClass)  if @editorSchema.editorClass
    @$el.attr(@editorSchema.editorAttrs) if @editorSchema.editorAttrs
    @$el.attr("placeholder", @editorSchema.placeholder) if (@editorSchema.placeholder)
    super

  # =====================================================================================
  # Methods required by Backbone.Edit.editor interface
  # (see editors.Base in base.js.coffee)
  #
  getValue: ->
    return @collection

  setValue: (value) ->
    @setCollection(value)


  setEditable: (value) ->
    if @editable != value
      @editable = value
      if @grid
        @removeGrid()
        @on_CollectionChanged()



  _delayed_focus_click: ->
    if @grid

      columns = @grid.getColumns()
      selectableColumn = _.find(columns, (item) ->  item.editor )
      index = _.indexOf( columns, selectableColumn )

      cells = @$('.slick-cell')
      if cells.length >=  index
        $(cells[index]).click()



  delayed_focus: ->
    if @grid
      window.setTimeout( @_delayed_focus_click,  0);


  focus: ->
    @$el.focus()

  triggerChanged: ->
    # Not required

  commit: ->
    # Not required

    # =====================================================================================
    # Overrides for methods in Backbone.Slickgrid.View
    #
  gridOptions: ->
    options = super
    options.editable = @editable
    options.enableAddRow = (@enableAddRow and @editable)
    if @options.newEditorLock
      options.editorLock = new Slick.EditorLock
    return options

  _showGrid: ->
    if @enableAddRow and @editable
      return true
    else
      return super

  # -------------------------------------------------------------------------------------
  # Slickgrid Columns
  #
  schema: ->
    if (@collection.model and @collection.model.prototype.schema)
      return @collection.model.prototype.schema
    else
      return null

  getColumns: ->
    columns = super
    if @enableIndex
      column = @specialColumn("index")
      columns = _.union([column], columns)

    if @enableMove and @editable
      column = @specialColumn("move")
      columns = _.union([column], columns)

    if @enableDelete and @editable
      column = @specialColumn("delete")
      columns = _.union(columns, [column])

    return columns


  createGrid: ->
    grid = super
    if @enableAddRow and @editable
      grid.onAddNewRow.subscribe( @on_addNewRow )

    if @enableDelete and @editable
      grid.onClick.subscribe( @on_Click )

    if @enableMove and @editable
      grid.registerPlugin( @newMoveManager() )


    grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: true, multiSelect: false}));


  getItem: (i) ->
    if @enableAddRow and i == @getLength() and @editable
      return @newModel
    else
      super

  setupCollectionBindings:  ->
    super

    # using bindToCollection() so that references are automatically released if the collection changes
    @bindToCollection("serverErrorsChanged clientErrorsChanged", @on_ModelChanged, @)


  # -----------------------------------------------------------------------
  # Validation support
  #
  #
  # on_metadata
  # -----------
  #
  # An override of the method in Backbone.Slickgrid.View. Used to pass extra information about the row
  # back to slickgrid. getItemMetadata() is called by slickgrid which in turn calls this method.
  #
  on_metadata: (row, model, metadata) ->
    super
    metadata.cssCellClasses = {}

    client_keys = _.keys(model.clientErrors)
    server_keys = _.keys(model.serverErrors)
    for key in _.union(client_keys, server_keys)
      metadata.cssCellClasses[key] = "cellError"

    # For performance slickgrid doesn't do a full redraw when a cell changes.  As result it needs
    # to calculate which css class should be add/removed.  cssPossibleCellClasses makes slickgrid's
    # job a little easier.
    #
    # Slickgrid will remove any classes listed in cssPossibleCellClasses and then reapply the ones
    # listed in cssCellClasses
    metadata.cssPossibleCellClasses = "cellError"

    if row < @getLength() and @editable
      if @enableDelete and !model.isDeleted()
        metadata.cssClasses += " deletable"

      if @enableMove
        metadata.cssClasses += " moveable"


  # -----------------------------------------------------------------------
  # Add row support
  #
  on_addNewRow: (e, args) ->

    try
      @applyingValue_start()  # the collection will automatically trigger an 'add' event
      # which will result in @notifyCollectionChanged() being called
      # Setting EditorApplyingValue causes the event to be ignored

      @collection.add( args.item,  {changeSource:"ui"} )
      @newModel = new @collection.model()

      @notifyCollectionChanged()

    finally
      @applyingValue_finish()


  # -----------------------------------------------------------------------
  # Delete support
  #
  on_Click: (e, args) ->
    column = @grid.getColumns()[args.cell]
    if column.id == "_delete" and args.row < @getLength()
      item = @grid.getDataItem(args.row);
      item.destroy({changeSource: "ui"})

  specialColumn: (type)  ->
    column = {}
    column.id = "_#{type}"
    column.field = "_#{type}"
    column.name = ""
    column.visible = true
    column.canHide = false

    column.editor = null

    if type == "index"
      column.formatter = Formatters.rowIndexFormater
    else
      column.formatter = null

    if type == "move"
      column.width = 30
      column.behavior = "selectAndMove"
    else
      column.width = 40

    column.selectable = true
    column.resizable = false
    column.cssClass = "cell-#{type}"

    return column

  # ------------------------------------------------------------------------------
  # Move support
  #
  onBeforeMoveRows: (e, data) ->
    for row, i in data.rows when (row == data.insertBefore) or (row == data.insertBefore - 1)
      # no point in moving before or after itself
      e.stopPropagation()
      return false
    return true

  # args = { "rows": dd.selectedRows, "insertBefore": dd.insertBefore }
  onMoveRows: (e, args) ->

    try
    # We are about to make changes to several models.  To avoid lots of screen redraws and multiple http save requests
    # we need to temporarily disable updates and suspend syncHelper()
      @applyingValue_start()
      if @model.syncHelper().get("state") == "enabled"
        @model.syncHelper().suspendSave()

      # get a reference to the rows being moved:
      rowsToMove = (@getItem(row) for row in args.rows)
      itemsBefore = @collection.first( args.insertBefore )
      itemsAfter = @collection.rest(args.insertBefore)

      itemsBefore = _.difference(itemsBefore, rowsToMove)  # removes any 'rowsToMove' from the itemsBefore array
      itemsAfter = _.difference(itemsAfter, rowsToMove)    # removes any 'rowsToMove' from the itemsAfter array
      rows = itemsBefore.concat(rowsToMove, itemsAfter)

      for row, i in rows
        row.set("position" , i, {changeSource:"ui"})

      @grid.setSelectedRows([]);
      @collection.sort();
      @notifyCollectionChanged()

    finally
      @applyingValue_finish()
      if @model.syncHelper().get("state") == "enabled"
        @model.syncHelper().enableSave()


  newMoveManager: ->
    moveRowsPlugin = new Slick.RowMoveManager();
    moveRowsPlugin.onBeforeMoveRows.subscribe(@onBeforeMoveRows)
    moveRowsPlugin.onMoveRows.subscribe(@onMoveRows)
    return moveRowsPlugin

