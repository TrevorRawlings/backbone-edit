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
    _.bindAll(@, 'on_addNewRow', 'on_Click', 'onBeforeMoveRows', 'onMoveRows', '_delayed_focus_click', 'on_document_event', 'on_BeforeEditCell', 'on_BeforeCellEditorDestroy')
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

    if @enableAddRow
      # getItem() needs to return a new instance of a backbone model but we can't do 'new @collection.model()'
      # from within getItem() because getItem() is often called from within a Backbone-Relational (BR) change events
      @newModel = new @collection.model()

    @$el.attr('name', @key) if @key
    @$el.addClass(@editorSchema.editorClass)  if @editorSchema.editorClass
    @$el.attr(@editorSchema.editorAttrs) if @editorSchema.editorAttrs
    @$el.attr("placeholder", @editorSchema.placeholder) if (@editorSchema.placeholder)
    super

    editable = if _.isUndefined(@options.editable) then false else @options.editable
    @setEditable(editable)



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

      @allColumns = @getColumns()  # the list of visible columns may have changed (the move & delete special columns are only displayed when the grid is editable)
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

    grid.onBeforeEditCell.subscribe( @on_BeforeEditCell )
    grid.onBeforeCellEditorDestroy.subscribe( @on_BeforeCellEditorDestroy )

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

  on_BeforeEditCell: ->
    if !@listening_to_document
      $(document).on('click', @on_document_event)
      $(document).on('focusin', @on_document_event)
      @listening_to_document = true

  on_BeforeCellEditorDestroy: ->
    @unbind_from_document()


  on_document_event: (e) ->
    #throw "!@listening_to_document" if !@listening_to_document
    return if !@listening_to_document

    isActive = @grid.getEditorLock().isActive()
    @consoleLog("on_document_event: #{e.type}, isActive = #{isActive}")

    if @grid.DetachedEditor
      @consoleLog("on_document_event: @grid.DetachedEditor = true - calling handle_document_event")
      # If the detached editor if another slickgird then it will have also
      # subscribed to $document click + focus events - but we we want the child
      # instance to re-act to the event first.  Once handle_document_event()
      # returns we can recheck if @grid has a DetachedEditor property.
      @grid.DetachedEditor.handle_document_event(e)

    if @grid.DetachedEditor
      @consoleLog("on_document_event: @grid.DetachedEditor still true - returning")
      return

    if $.contains(this.el, e.target)
      @consoleLog("on_document_event: this.el contains e.target - returning")
      return "contains"

    if @grid.getEditorLock().isActive()
      @consoleLog("on_document_event: @grid.getEditorLock().isActive() - calling commitCurrentEdit()")
      @grid.getEditorLock().commitCurrentEdit();

    if isActive
      @consoleLog("on_document_event: calling @grid.resetActiveCell()")
      @grid.resetActiveCell()

  consoleLog: (message) ->
    #console.log(message)



  unbind_from_document: ->
    $(document).off('click', @on_document_event)
    $(document).off('focusin', @on_document_event)
    @listening_to_document = false


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
      column.formatter = @formatter.rowIndexFormater
      column.name = "#"
    else
      column.formatter = null

    if type == "move"
      column.width = 30
      column.behavior = "selectAndMove"
    else if type == "delete"
      column.width = 30
    else
      column.width = 40

    column.selectable = true
    column.resizable = false
    column.cssClass = "cell-#{type}"
    column.isSpecialColumn = true

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

