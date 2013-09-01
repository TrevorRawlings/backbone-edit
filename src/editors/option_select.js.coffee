editors = Backbone.Edit.editors

# editors.base
#  |->  OptionSelect
#  |     |->  Select2Base
#  |     |     |->  TagSelect             (asset labels)
#  |     |     |->  Select                (ordinary drop down - includes support for add new)
#  |     |           |->  GroupedSelect   (animal stock / breed )
#        |->  Radio


# editors.OptionSelect
#
# Used by the Select2 drop dorwn and radio options editor
#
class editors.OptionSelect extends editors.Base

  events: {  'change': 'on_ui_selection_changed' }

  initialize: (options) ->
    super
    @evaluateSchemaOptions()

  # ----------------------------------------
  # Value
  #

  # Public method
  getValue: ->
    return @value

  # Public method
  setValue: (value) ->
    if @value != value
      @value = value

      if @_optionSelect_rendered
        if @extraOptionCreated
          # last time we set the value an extra option had to be created because it was missing from the
          # list of options. We presumably don't need that option anymore so re-render the list.
          # renderOptions() will call applyValue() when it's done.
          @renderOptions(@select_options)
        else
          @applyValue(value)

  # copies @value to the ui element
  applyValue: (value) ->
    throw "not implemented"

  # copies the value selected in the ui element back into @value
  updateCachedValue: (value) ->
    throw "not implemented"

  on_ui_selection_changed: ->
    return if @updatingJavascriptEditor

    old_cached_value = @value
    @updateCachedValue()
    if old_cached_value != @value
      @triggerChanged()


  # ------------------------------------------------------------------
  # Options
  #

  # **
  # * @param {Mixed}   Options as a simple array e.g. ['option1', 'option2']
  # *                  or as an array of objects e.g. [{val: 543, label: 'Title for object 543'}]
  # *                  or as a string of <option> HTML to insert into the <select>
  # */
  setOptions: (options) ->
    if @select_options != options
      @check_options_valid(options)
      @select_options = options

      if Backbone.Edit.helpers.isCollection(options)
        @unbindFromCollection()
        @bindToCollection(options)

      if @_optionSelect_rendered
        @renderOptions()


  check_options_valid: (options) ->
    if !_.isArray(options) and !Backbone.Edit.helpers.isCollection(options)
      throw new Error("expected string, array or collection")


  evaluateSchemaOptions: ->
    throw "Missing required 'schema.options'" if (!this.schema || !this.schema.options)

    options = this.schema.options
    self = this

    # If a function was passed, run it to get the options
    if _.isFunction(options)
      callback = (result) ->
        self.setOptions(result);
      options(callback, self.model, self.schema)
    else
      self.setOptions(options)


  # Transforms a collection into HTML ready to use in the setOptions method
  # @param {Backbone.Collection}
  # @return {String}
  #
  _collectionToHtml: (container, collection) ->
    for model, index in collection.models when !model.isNew()
      @createOption( container, model, index )


  # Create the <option> HTML
  # @param {Array}   Options as a simple array e.g. ['option1', 'option2']
  #                      or as an array of objects e.g. [{val: 543, label: 'Title for object 543'}]
  # @return {String} HTML
  #
  _arrayToHtml: (container, array) ->
    @createOption( container, option, index ) for option, index in array


  renderOptions: (options) ->
    @$el.html('')
    @extraOptionCreated = false

    if @allow_deselect()
      @createOption(this.$el, null) # Adds '<option value=""></option>'

    if _.isArray(options)
      @_arrayToHtml(@$el, options)
    else if Backbone.Edit.helpers.isCollection(options)
      @_collectionToHtml(@$el, options)
    else
      throw new Error("renderOptions: expected an array or collection: #{options}")

    @applyValue(@value)

  # ------------------------------------------------------------------

  allow_deselect: ->
    !Backbone.Validators.hasValidator(this.schema, "required")


  # ------------------------------------------------------------------
  # Collection binding

  # bindToCollection
  # ----------------
  #
  # stores collection bindings so that they can be released if the collection changes
  #
  # Marionette.BindTo automatically stores binding and releases them when the view closes,
  # but we also store them here so that we can release them if the collection changes
  bindToCollection: (collection, eventName = "add remove reset change", callback = @on_CollectionChanged, context = @) ->
    @collectionBindings = [] if !@collectionBindings

    binding = @bindTo(collection, eventName, callback, context)
    @collectionBindings.push( binding )
    return binding

  unbindFromCollection: ->
    if @collectionBindings
      @unbindFrom(binding) for binding in @collectionBindings

  on_CollectionChanged: ->
    if @_optionSelect_rendered
      @renderOptions(@select_options)
      @jsEditor_notifyChange("options")


  # ----------------------------------------------------------------
  # getItemValue / getItemLabel
  #

  # getItemValue()
  # --------------
  #
  # The actual value returned when editor.getValue() is called.  This can be a simple type like string or integer
  # or it can be a javascript object.  The returned value is stored as a jquery data attribute (http://api.jquery.com/data/)
  getItemValue: (item) ->
    if (this.schema.getItemValue) then this.schema.getItemValue(item) else this._getItemValue(item)

  _getItemValue:  (item)  ->
    if _.isObject(item)
      if (item instanceof Backbone.Model)
        return item
      else
        return if !_.isUndefined(item.val) then item.val else item
    else if _.isNull(item) or _.isUndefined(item)
      return null
    else
      item

  # getItemValueAsString()
  # ----------------------
  #
  # HTML option elements can contain a value attribute:
  #   <option value="16" selected="selected">keep</option>')
  #
  # This is only for debug and rspec tests.  Behaviour of the editor isn't affected by the value returned.
  getItemValueAsString: (item) ->
    value = @getItemValue(item)
    if (value instanceof Backbone.Model)
      return value.id
    else if _.isUndefined(item) or _.isNull(item)
      return ""
    else
      return value.toString()

  getItemLabel: (item)  ->
    if (this.schema.getItemLabel) then this.schema.getItemLabel(item) else this._getItemLabel(item)

  _getItemLabel: (item)  ->
    if _.isObject(item)
      if item instanceof Backbone.Model
        return item.toString()
      else
        return item.label
    else if _.isNull(item) or _.isUndefined(item)
      return null
    else
      item.toString()

  # -----------------------------------------------------------

  render: ->
    if !@_optionSelect_rendered
      @_optionSelect_rendered = true
      @renderOptions(@select_options)
    this

