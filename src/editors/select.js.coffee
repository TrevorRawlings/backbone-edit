editors = Backbone.Edit.editors

# Requires: http://harvesthq.github.com/chosen/

# SELECT
#
# Renders a <select> with given options
#
# Requires an 'options' value on the schema.
#  Can be an array of options, a function that calls back with the array of options, a string of HTML
#  or a Backbone collection. If a collection, the models must implement a toString() method
#
class editors.Select extends editors.Base
  tagName: 'select'
  events: {  'change': 'triggerChanged' }

  initialize: (options) ->
    super
    throw "Missing required 'schema.options'" if (!this.schema || !this.schema.options)


  # **
  # * Logic within chosen assumes that the select box has a parent element (see set_up_html() in chosen.jquery.js ).
  # * We could change the tag of this editor into a div and put the select within it.   Or the option used here
  # * is for the parent view to call onShow when it has appended us to a parent
  # */
  onShow: ->
    if @javascriptEditor()
      options = { search_contains: true }
      options.placeholder_text = this.schema.placeholder if this.schema.placeholder
      options.allow_single_deselect = true if @allow_deselect()
      this.$el.chosen(options)

  javascriptEditor: ->
    return @schema.javascriptEditor == true or _.isUndefined(@schema.javascriptEditor)

  allow_deselect: ->
    !Backbone.Validators.hasValidator(this.schema, "required")

  render: ->
    options = this.schema.options
    self = this

    # If a collection was passed, check if it needs fetching
    if (options instanceof Backbone.Collection)
      collection = options

      # Don't do the fetch if it's already populated
      if (collection.length > 0)
        self.setOptions(options)
      else
        success = ->
          self.setOptions(options);
        collection.fetch({ success: success })

      # If a function was passed, run it to get the options
    else if _.isFunction(options)
      callback = (result) ->
        self.setOptions(result);
      options(callback, self.model, self.schema)

      # Otherwise, ready to go straight to setOptions
    else
      self.setOptions(options)

    this

  # **
  # * Adds the <option> html to the DOM
  # * @param {Mixed}   Options as a simple array e.g. ['option1', 'option2']
  # *                      or as an array of objects e.g. [{val: 543, label: 'Title for object 543'}]
  # *                      or as a string of <option> HTML to insert into the <select>
  # */
  setOptions: (options) ->
    @$el.html('')

    if _.isString(options)
      @$el.html(options)

    else if _.isArray(options)
      this._arrayToHtml(@$el, options)

    else if (options instanceof Backbone.Collection) or ( options instanceof Backbone.Subset)
      this._collectionToHtml(@$el, options)

    else
      throw new Error("expected string, array or collection")

    this.setValue(this.value)


  # http://stackoverflow.com/questions/3149072/determine-if-html-select-contains-a-value-in-any-of-its-child-options
  optionExists: (val) ->
    # search = if (val == null) then "" else val.toString();
    search = val

    for option in @$("option") when $(option).data("value") == search
      return $(option)

    return false


  getValue: ->
    return @$('option:selected').data("value")


  setValue: (value) ->
    val = @getItemValue(value)
    new_selected = @optionExists(val)
    if !new_selected
      new_selected = this.createOption(@$el, value, 0)

    # Unselect all but the target element:
    for option in @$('option') when option != new_selected
      $(option).removeAttr("selected")

    new_selected.attr("selected", "selected");
    @$el.trigger("liszt:updated");


  setEditable: (value) ->
    super
    @$el.trigger("liszt:updated")


  # Transforms a collection into HTML ready to use in the setOptions method
  # @param {Backbone.Collection}
  # @return {String}
  #
  _collectionToHtml: (container, collection) ->

    # Now convert to HTML
    this._arrayToHtml(container, collection.models.slice(0));  # Not quite sure why we are cloneing the array here
    return collection

  # Create the <option> HTML
  # @param {Array}   Options as a simple array e.g. ['option1', 'option2']
  #                      or as an array of objects e.g. [{val: 543, label: 'Title for object 543'}]
  # @return {String} HTML
  #
  _arrayToHtml: (container, array) ->

    for option, index in array
      @createOption( container, option, index )

    return array

  createOption: (container, item, index) ->
    value = @getItemValue(item)
    label = @getItemLabel(item)
    valueAsString = @getItemValueAsString(item)

    if (label == null) or (label == undefined)
      label = ""

    option = $('<option/>', { value: valueAsString }).text(label).data("value", value)
    container.append(option)
    return option

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




# RADIO
#
# Renders a <ul> with given options represented as <li> objects containing radio buttons
#
# Requires an 'options' value on the schema.
#  Can be an array of options, a function that calls back with the array of options, a string of HTML
#  or a Backbone collection. If a collection, the models must implement a toString() method
#
class editors.Radio extends editors.Select
  tagName: 'div'
  className: 'bbf-radio'

  getValue: ->
    @$el.find('input[type=radio]:checked').data("value")

  setValue: (value) ->
    @$el.find('input[type=radio][value='+value+']').attr('checked', true)

  createOption: (container, item, index) ->
    val = @getItemValue(item)
    label = @getItemLabel(item)
    valueAsString = @getItemValueAsString(item)

    inputId = "" + this.id + '-' + index;
    label = $('<label/>',   { for: inputId, class: 'radio' }).text(label)
    input = $('<input/>', { type: 'radio', name: this.id, value: valueAsString, id: inputId }).data("value", val )
    label.prepend(input)
    container.append(label)



# CHECKBOXES
# Renders a <ul> with given options represented as <li> objects containing checkboxes
#
# Requires an 'options' value on the schema.
#  Can be an array of options, a function that calls back with the array of options, a string of HTML
#  or a Backbone collection. If a collection, the models must implement a toString() method
#
class editors.Checkboxes extends editors.Select
  tagName: 'ul'
  className: 'bbf-checkboxes'

  getValue: ->
    return (element.data("value") for element in @$el.find('input[type=checkbox]:checked'))

  setValue: (value) ->
    for val in value
      @$el.find('input[type=checkbox][value="'+val+'"]').attr('checked', true)

  createOption: (container, item, index) ->
    val = @getItemValue(item)
    label = @getItemLabel(item)
    valueAsString = @getItemValueAsString(item)

    listItem = $('<li/>')
    inputId = "" + this.id + '-' + index;
    listItem.append( $('<input/>', { type: 'checkbox', name: this.id, value: valueAsString, id: inputId }).data("value", val) );
    listItem.append( $('<label/>', { for: inputId }).text(label) );

    container.append(listItem);



class editors.GroupedSelect extends editors.Select

  setOptions: (groups) ->

    if (!_.isArray(groups))
      throw new Error("expected an array")

    if @allow_deselect()
      @createOption(this.$el, null)  # Adds '<option value=""></option>'

    for group in groups
      optgroup = $('<optgroup/>', { label: group.label });

      if _.isString(group.options)
        optgroup.html(group.options)
      else if _.isArray(group.options)
        this._arrayToHtml(optgroup, group.options)
      else if (group.options instanceof Backbone.Collection) or ( group.options instanceof Backbone.Subset)
        this._collectionToHtml(optgroup, group.options)
      else
        throw new Error("expected string, array or collection")

      this.$el.append(optgroup)

    this.setValue(this.value);
