
# Slickgrid editors
# ====================
#
# Used by slickgrid to edit model attributes.  For the most part theses editors just act as a wrapper around the
# Backbone.Edit.editors


if !Backbone.Slickgrid
  Backbone.Slickgrid = {}

if !Backbone.Slickgrid.editors
  Backbone.Slickgrid.editors = {}

editors = Backbone.Slickgrid.editors


editors.getEditor_default = (schema) ->
  if ((schema.type == 'Select') or (schema.type == 'GroupedSelect'))
    return editors.SelectEditor
  else
    return editors.DefaultEditor

# Backbone.Slickgrid.editors.getEditor()
# ======================================
#
# A Reference to this method is passed to slickgrid by Backbone.Slickgrid.View when the grid is created
# Provided the column is editable this method will be called if the user tries to edit the value.
#
editors.getEditor = editors.getEditor_default

class editors.Base

  # args
  #   grid, gridPosition, position, container, column, item, commitChanges, cancelChanges
  constructor: (args) ->
    @args = args
    @column = args.column
    @item = args.item
    @grid = args.grid

    throw "argument missing" if !@column or !@item or !@grid
    @valueBeforeEdit = @item.get(@column.field)

    @constructEditor()
    @appendEditor(args)
    @editorFocus()


  editorOptions: () ->
    options = { }
    options.schema = _.clone( @column.schema )
    options.model = @item
    options.key = @column.field
    options.editable = true
    return options

  constructEditor: () ->
    throw "already set" if @editor

    editorOptions = @editorOptions()
    @editor = Backbone.Edit.helpers.createEditor( @column.schema.type, editorOptions );
    @editor.on('changed', @on_editorChanged, @)
    return @editor

  editorFocus: ->
    @editor.focus()

  # args
  #   grid, gridPosition, position, container, column, item, commitChanges, cancelChanges
  appendEditor: (args) ->
    throw "not implemented "


  on_editorChanged: ->
    if @item instanceof Backbone.Model
      state = @serializeValue()
      @applyValue(@item, state)


  # /*********** REQUIRED METHODS ***********/

  #  remove all data, events & dom elements created in the constructor
  destroy: ->
    if @editor
      @editor.off('change');

      if _.isFunction(@editor.close)
        @editor.close()     # To support a future change to backbone.marionette based editors
      else
        @editor.remove()
      @editor = null

  # set the focus on the main input control (if any)
  focus: ->
    @editor.focus()


  # return true if the value(s) being edited by the user has/have been changed
  isValueChanged: ->
    return (@valueBeforeEdit != @editor.getValue())


  # return the value(s) being edited by the user in a serialized form
  # can be an arbitrary object
  # the only restriction is that it must be a simple object that can be passed around even
  # when the editor itself has been destroyed
  serializeValue: ->
    if @editor
      return @editor.getValue()
    else
      return ""


  # load the value(s) from the data item and update the UI
  # this method will be called immediately after the editor is initialized
  # it may also be called by the grid if if the row/cell being edited is updated via grid.updateRow/updateCell
  loadValue: ->
    @valueBeforeEdit = @item.get(@column.field)
    @editor.setValue(@valueBeforeEdit)

    if @valueBeforeEdit == undefined
      @valueBeforeEdit = @editor.getValue()


  applyingValue_start: ->
    @grid.parentView.applyingValue_start()    # forward notification down to parent grid


  applyingValue_finish: ->
    @grid.parentView.applyingValue_finish()   # forward notification down to parent grid


  # deserialize the value(s) saved to "state" and apply them to the data item
  # this method may get called after the editor itself has been destroyed
  # treat it as an equivalent of a Java/C# "static" method - no instance variables should be accessed
  applyValue: (item, state) ->
    if item instanceof Backbone.Model
      try
        @applyingValue_start()
        item.set(@column.field, state, {changeSource:"ui"})
      finally
        @applyingValue_finish()

    else
      # slickgrid has a slightly backward approach to adding new records
      # here we just need to set the value to the empty 'item' object
      item[@column.field] = state


  # validate user input and return the result along with the validation message, if any
  # if the input is valid, return {valid:true,msg:null}
  validate: ->
    # return { valid: false, msg: "This field is required" };
    return { valid: true, msg: null }





class editors.InlineEditor extends editors.Base

  editorAttrs: ->
    if !@_editorAttrs
      attrs = []
      attrs.push( 'border: none;' )
      attrs.push( 'box-shadow: none;' )
      attrs.push( 'display: inline;' )
      attrs.push( 'font-size: 14px;' )
      attrs.push( 'margin: 0px;' )
      attrs.push( 'padding: 0px;' )
      attrs.push( 'width: 100%;'  )
      attrs.push( 'height: 100%;' )
      @_editorAttrs = { style: attrs.join(" ") }
    return @_editorAttrs

  editorOptions: () ->
    options = super
    options.schema.editorAttrs = @editorAttrs()
    return options

  # args
  #   grid, gridPosition, position, container, column, item, commitChanges, cancelChanges
  appendEditor: (args) ->
    throw "@editor not set" if !@editor

    $(args.container).append(@editor.render().el)
    #    if _.isFunction(@editor.onShow)
    #      @editor.onShow()


# From https://github.com/mleibman/SlickGrid/wiki/Writing-custom-cell-editors
# Default editor for slickgrid columns, wraps a Backbone.Edit editor
class editors.DefaultEditor extends editors.InlineEditor


class editors.SelectEditor extends editors.InlineEditor

  constructor: (args) ->
    _.bindAll(this, '_handleKeyDown')
    super

  constructEditor: () ->
    editor = super
    @editor.$el.keydown( @_handleKeyDown )
    return editor

  destroy: ->
    if @editor
      @editor.$el.unbind('keydown')
    super

  _handleKeyDown: (e) ->
    if (e.which == $.ui.keyCode.UP) or (e.which == $.ui.keyCode.DOWN) or (e.which == $.ui.keyCode.RIGHT) or (e.which == $.ui.keyCode.LEFT)
      e.preventDefault()
      e.stopPropagation()


class editors.DetachedEditor extends editors.Base

  constructor: (args) ->
    _.bindAll(this, '_setup_click',  '_handleKeyDown') #'_document_click',
    super
    @updateValue()

    throw "already has a DetachedEditor" if !_.isUndefined(@grid.DetachedEditor)
    @grid.DetachedEditor = this  # this need to be set before we call focus()
    @wrapper.focus()





  updateValue: ->
    # new Landscape.Helpers.Slickgrid.ModelFormatter()
    if @args.column.formater
      formatter = @args.column.formater
    else
      formatter = @grid.getOptions().formatterFactory.getFormatter(@args.column)

    activeCell = @grid.getActiveCell()
    # Formaters expect: row,cell,value,col,data
    # but I don't think we have access to row, cell or value here:
    html = formatter(activeCell.row, activeCell.cell, 0, @args.column, @args.item)
    $(@args.container).html(html)


  # args
  #   grid, gridPosition, position, container, column, item, commitChanges, cancelChanges
  appendEditor: (args) ->
    throw "@editor not set" if !@editor

    $(@args.container).css("border-color", "transparent silver silver transparent")
    $(@args.container).css("border-style", "solid dotted solid solid")
    $(@args.container).css("background-color", "#FCF8E3")
    $(@args.container).css("color", "#C09853")

    wrapper = @getWrapper()
    wrapper.append(@editor.render().el)
    @editor.onShow()
    @position(args.position)

  editorFocus: ->
    # @editor.delayed_focus()

  getWrapper: ->
    self = this

    if !@wrapper
      @wrapper = $("<div>", { "tabindex": -1, class: "detached-editor" })

      @wrapper.appendTo(document.body);
      @wrapper.click(@_wrapper_click)
      @wrapper.keydown( @_handleKeyDown )
      window.setTimeout( @_setup_click,  0);
    return @wrapper

  _wrapper_click: (e) ->
    # We don't want click events the occur within @wrapper to propogate up to  _document_click() we use document
    # clicks as a signal to hide the editor
    e.stopPropagation();

  _setup_click: ->
    @ready_for_click = true
    #    if @wrapper
    #
    #      $("body").click(@_document_click)

  #  _document_click: (e) ->
  #    if @wrapper
  #      @cancel();
  #    $(@).unbind(e)

  # this event may or maynot be within @wrapper
  # see on_document_event() in Backbone.Edit.editors.Slickgrid
  handle_document_event: (e) ->
    return if !@wrapper or !@ready_for_click

    if $.contains(@wrapper[0], e.target) or @wrapper[0] == e.target
      return "contains"
    else
      @focus_lost = true
      @cancel();

  _handleKeyDown: (e) ->
    if (e.which == $.ui.keyCode.ENTER && e.ctrlKey)
      @save()
    else if (e.which == $.ui.keyCode.ENTER)
      e.preventDefault();
      @editor.delayed_focus()
    else if (e.which == $.ui.keyCode.ESCAPE)
      e.preventDefault();
      @cancel()
    else if (e.which == $.ui.keyCode.TAB && e.shiftKey) or (e.which == $.ui.keyCode.LEFT)
      e.preventDefault()
      @grid.navigatePrev()
    else if (e.which == $.ui.keyCode.TAB) or (e.which == $.ui.keyCode.RIGHT)
      e.preventDefault();
      @grid.navigateNext()
    else if (e.which == $.ui.keyCode.UP)
      e.preventDefault()
      @grid.navigateUp()
    else if (e.which == $.ui.keyCode.DOWN)
      e.preventDefault();
      @grid.navigateDown()


  destroy: ->
    super
    $(@args.container).removeAttr( 'style' ); # Removes the css attributes added in appendEditor()
    if @wrapper
      @wrapper.remove()
      @wrapper = null

    throw "DetachedEditor not defined" if _.isUndefined(@grid.DetachedEditor)
    delete @grid.DetachedEditor




  # /*********** OPTIONAL METHODS***********/

  # if implemented, this will be called if the cell being edited is scrolled out of the view
  # implement this is your UI is not appended to the cell itself or if you open any secondary
  # selector controls (like a calendar for a datepicker input)
  #
  hide: ->
    if @wrapper
      @wrapper.addClass('hide')


  # pretty much the opposite of hide
  #
  show: ->
    if @wrapper
      @wrapper.removeClass('hide')


  # if implemented, this will be called by the grid if any of the cell containers are scrolled
  # and the absolute position of the edited cell is changed
  # if your UI is constructed as a child of document BODY, implement this to update the
  # position of the elements as the position of the cell changes
  #
  # the cellBox: { top, left, bottom, right, width, height, visible }
  #
  position: (cellBox) ->
    if @wrapper
      args =
        of: @args.container
        my: "center top"
        at: "center bottom"
        offset: "0 -1"
        collision: "fit flip"
      @wrapper.position(args)

  cancel: ->
    if @focus_lost
      # User has clicked outside the detached editor.  We don't want to steal the focus back to the
      # parent grid so just cancel the current edit session
      @grid.getEditorLock().cancelCurrentEdit()
    else
      @args.cancelChanges();



class editors.DetachedSlickgrid extends editors.DetachedEditor

  constructor: ->
    _.bindAll(this, 'applyingValue_start', 'applyingValue_finish')
    super


  constructEditor: ->
    editor = super
    editor.on_applyingValue_start = @applyingValue_start
    editor.on_applyingValue_finish = @applyingValue_finish
    return editor

  editorAttrs: ->
    width = $(@args.container).width()
    width = 400 if width < 400

    if !@_editorAttrs
      attrs = []
      attrs.push( "width: #{width}px;"  )
      # attrs.push( 'width: 100%;'  )
      @_editorAttrs = { style: attrs.join(" ") }
    return @_editorAttrs

  editorOptions: () ->
    options = super
    options.schema.editorAttrs = @editorAttrs()
    options.newEditorLock = true
    return options

  # see on_document_event() in Backbone.Edit.editors.Slickgrid for an explination of this function
  handle_document_event: (e) ->

    if @editor
      # IE generates an unwanted focusin event when clearing the text selection.  Observed on IE9 but I
      # assume it effects all versions of IE
      return if @editor.grid and @editor.grid.clearingTextSelection

      @editor.on_document_event(e)
    super


