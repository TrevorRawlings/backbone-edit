editors = Backbone.Edit.editors

# editors.base
#  |->  OptionSelect
#  |     |->  Select2Base
#  |     |     |->  TagSelect             (asset labels)
#  |     |     |->  Select                (ordinary drop down - includes support for add new)
#  |     |           |->  GroupedSelect   (animal stock / breed )
#        |->  Radio



# Requires: select2
#
class editors.Select2Base extends editors.OptionSelect


  # ------------------------------------------------------------------
  # jsEditor
  javascriptEditor: ->
    # On mobile devices the chosen dropdown doesn't really work - and most mobile browsers
    # have touch optimised interfaces for selecting from a dropdown
    return false if !categorizr.isDesktop

    # In a modal the chosen dropdown effects the sizing of the modal and it all looks a bit average
    return false if @isInModal()

    return @schema.javascriptEditor == true or _.isUndefined(@schema.javascriptEditor)

  jsEditor_options: ->
    options = { search_contains: true }
    options.placeholder = this.schema.placeholder if this.schema.placeholder
    options.allowClear = true if @allow_deselect()
    #options.width = "#{@$el.outerWidth()}px"
    options.formatResult = @jsEditor_formatResult
    options.formatSelection = @jsEditor_formatResult
    return options

  jsEditor_construct: ->
    @$el.select2(@jsEditor_options())

  jsEditor_initialise: ->
    if !@jsEditor_initialised and @javascriptEditor()
      @jsEditor_construct()
      @jsEditor_initialised = true

  jsEditor_destroy: ->
    if @jsEditor_initialised
      @jsEditor_initialised = false
      #@$el.select2("close")
      @$el.select2("destroy")


  jsEditor_handleChange: (type) ->
    switch (type)
      when "selected"
        @$el.trigger("change")
      when "options"
        @jsEditor_destroy()
        @jsEditor_initialise()
      else
        throw "jsEditor_notifyChange: unexpected change type #{type}"


  jsEditor_notifyChange: (type) ->
    return if !@jsEditor_initialised

    try
      @updatingJavascriptEditor = true
      @jsEditor_handleChange(type)

    finally
      @updatingJavascriptEditor = false

  jsEditor_setEditable: (canEdit) ->
    return if !@jsEditor_initialised

    if canEdit
      @$el.select2("enable")
    else
      @$el.select2("disable")

  # jsEditor_formatResult
  # ---------------------
  #
  # Function used to render a result that the user can select.
  #
  # args:
  #  result  - One of the result objects returned from the query function
  # <returns>	string	Html that represents the result
  #
  jsEditor_formatResult: (result) ->
    _.string.escapeHTML( result.text )

  # ----------------------------------------------------

  # override of method in editors.Base
  focus: ->
    if @jsEditor_initialised
      @$el.select2("focus")
    else
      @$el.focus()

  setEditable: (canEdit) ->
    super
    @jsEditor_setEditable(canEdit)


  # ----------------------------------------------------
  # Life cycle

  # **
  # * Logic within chosen assumes that the select box has a parent element (see set_up_html() in chosen.jquery.js ).
  # * We could change the tag of this editor into a div and put the select within it.   Or the option used here
  # * is for the parent view to call onShow when it has appended us to a parent
  # */
  onShow: ->
    super
    @jsEditor_initialise()


  onDeactivate: ->
    super
    @jsEditor_destroy()





