editors = Backbone.Edit.editors

# editors.base
#  |->  OptionSelect
#  |     |->  Select2Base
#  |     |     |->  TagSelect             (asset labels)
#  |     |     |->  Select                (ordinary drop down - includes support for add new)
#  |     |           |->  GroupedSelect   (animal stock / breed )
#        |->  Radio







# SELECT
#
# Renders a <select> with given options
#
# Requires an 'options' value on the schema.
#  Can be an array of options, a function that calls back with the array of options, a string of HTML
#  or a Backbone collection. If a collection, the models must implement a toString() method
#
class editors.Select extends editors.Select2Base
  tagName: 'select'

  initialize: (options) ->
    super
    @initialize_addNew()


  modelType: (form) ->
    return @options.model_class.prototype.modelType(form)


  # ------------------------------------------------------------------
  # jsEditor

  jsEditor_formatResult: (result) ->
    if result.create_new
      return '<i class="icon-plus"></i> ' + result.create_new.message
    else
      return super

  # --------------------------------------------------------------
  # addNewValues
  #
  initialize_addNew: ->
    if @options.allowNewValues
      throw "options.model_class is required" if !@options.model_class
      @options.model_class = Backbone.Edit.helpers.getObjectByName(@options.model_class)

      modelType_singular = _.string.capitalize(@modelType("singular"))
      modelType_plural = _.string.capitalize(@modelType("plural"))

      @options.newModelView = "Landscape.Views.New#{modelType_singular}"  if !@options.newModelView
      @options.newValueMessage = "Create a new #{@modelType("singular")}"

      @options.newModelView = Backbone.Edit.helpers.getObjectByName(@options.newModelView)


  unbindFromNewModel: ->
    @newModelBindings = [] if !@newModelBindings
    @unbindFrom(binding) for binding in @newModelBindings

  add_new_selected: (selected_value) ->
    @unbindFromNewModel()

    if @jsEditor_initialised
      term = @$el.select2("lastSearchTerm")

    model = @buildNewModel(selected_value, term)
    view = @buildNewModelView(selected_value, model )

    @newModelBindings.push( @bindTo(view, "save:success", @on_modelCreated) )
    @newModelBindings.push( @bindTo(view, "close",        @on_viewClosed) )
    Landscape.App.showModal(view)

  buildNewModel: (selected_value, term) ->
    model = new @options.model_class(business: window.Landscape.Data.Business, name: term)
    model.setModelDefaults(Landscape.Data.Business)
    return model

  buildNewModelView: (selected_value, model) ->
    return new @options.newModelView({ model: model  })

  on_modelCreated: (model) ->
    @unbindFromNewModel()
    @value = @getItemValue(model)
    @applyValue( model )  # copies @value to the ui element
    @triggerChanged()


  on_viewClosed: ->
    @unbindFromNewModel()
    @applyValue( @value )  # the drop down will be displaying [addd new enterprise] we need
                          # to set it back to the previous value


  # --------------------------------------------------------------
  # Get / Set value


  updateCachedValue: ->
    selected_value = @$('option:selected').data("value")
    if @options.allowNewValues and _.isString(selected_value) and _.string.startsWith(selected_value, "create_new")
      @add_new_selected(selected_value)
    else
      @value = selected_value


  applyValue: (value) ->
    optionCreated = false
    val = @getItemValue(value)

    new_selected = @optionExists(val)
    if !new_selected
      new_selected = this.createOption(@$el, value, 0)
      optionCreated = true

    # Unselect all but the target element:
    for option in @$('option') when option != new_selected
      $(option).removeAttr("selected")

    new_selected.attr("selected", "selected");

    if optionCreated
      @jsEditor_notifyChange("options")
    else
      @jsEditor_notifyChange("selected")

    @extraOptionCreated = @extraOptionCreated || optionCreated


  # ------------------------------------------------------------------
  # Options
  #

  # http://stackoverflow.com/questions/3149072/determine-if-html-select-contains-a-value-in-any-of-its-child-options
  optionExists: (val) ->
    for option in @$("option") when $(option).data("value") == val
      return $(option)
    return false

  createOption: (container, item, index) ->
    value = @getItemValue(item)
    label = @getItemLabel(item)
    valueAsString = @getItemValueAsString(item)

    if (label == null) or (label == undefined)
      label = ""

    option = $('<option/>', { value: valueAsString }).text(label).data("value", value)

    # To make the placeholder appear when using select2 the null item needs to be the first item:
    #   Note that because browsers assume the first option element is selected in non-multi-value select boxes an
    #   empty first option element must be provided (<option></option>) for the placeholder to work.
    if _.isNull(item)
      container.prepend(option)
    else
      container.append(option)
    return option

  renderOptions_append_CreateNewOption: ->
    message = @options.newValueMessage
    $option = @createOption( @$el, { val: "create_new", label: "[#{@options.newValueMessage}]" }, _.uniqueId('i') )
    $option.data("create_new", { message: message })


  renderOptions: (options) ->
    super
    if @options.allowNewValues
      @renderOptions_append_CreateNewOption()




# RADIO
#
# Renders a <ul> with given options represented as <li> objects containing radio buttons
#
# Requires an 'options' value on the schema.
#  Can be an array of options, a function that calls back with the array of options, a string of HTML
#  or a Backbone collection. If a collection, the models must implement a toString() method
#
# Used by CompleteTaskDetails
#
class editors.Radio extends editors.Select
  tagName: 'div'
  className: 'bbf-radio'

  allow_deselect: ->
    false

  updateCachedValue: ->
    @value = @$el.find('input[type=radio]:checked').data("value")
    return @value

  applyValue: (value) ->
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
#class editors.Checkboxes extends editors.Select
#  tagName: 'ul'
#  className: 'bbf-checkboxes'
#
#  getValue: ->
#    return (element.data("value") for element in @$el.find('input[type=checkbox]:checked'))
#
#  setValue: (value) ->
#    for val in value
#      @$el.find('input[type=checkbox][value="'+val+'"]').attr('checked', true)
#
#  createOption: (container, item, index) ->
#    val = @getItemValue(item)
#    label = @getItemLabel(item)
#    valueAsString = @getItemValueAsString(item)
#
#    listItem = $('<li/>')
#    inputId = "" + this.id + '-' + index;
#    listItem.append( $('<input/>', { type: 'checkbox', name: this.id, value: valueAsString, id: inputId }).data("value", val) );
#    listItem.append( $('<label/>', { for: inputId }).text(label) );
#
#    container.append(listItem);
#






class editors.GroupedSelect extends editors.Select


  initialize: ->
    @options.group_children = "options" if !@options.group_children
    super


  getGroupChildren: (group) ->
    if group instanceof Backbone.Model
      return group.get(@options.group_children)
    else
      return group[@options.group_children]

  # activeStock.attributes.name
  getGroupLabel: (group) ->
    if (group instanceof Backbone.Model)
      return group.get("name")   #
    else if _.isString(group.label)
      return group.label
    else
      return group


  renderOptions: (groups) ->
    @extraOptionCreated = false
    @$el.html('')

    # We need to redo the collection bindings each time we render (incase the groups have changed since last time)
    @unbindFromCollection()

    if @allow_deselect()
      @createOption(this.$el, null) # Adds '<option value=""></option>'

    if (groups instanceof Backbone.Collection) or ( groups instanceof Landscape.Subset)
      bindTo = groups
      groups = (group for group in groups.models when !group.isNew())

    for group in groups
      groupChildren = @getGroupChildren(group)

      if groupChildren.length > 0
        optgroup = $('<optgroup/>', { label: @getGroupLabel(group) });

        if _.isArray(groupChildren)
          @_arrayToHtml(optgroup, groupChildren)
        else if (groupChildren instanceof Backbone.Collection) or ( groupChildren instanceof Landscape.Subset)
          @_collectionToHtml(optgroup, groupChildren)
        else
          throw new Error("expected an array or collection")
        this.$el.append(optgroup)

      if (groupChildren instanceof Backbone.Collection) or ( groupChildren instanceof Landscape.Subset)
        @bindToCollection(groupChildren)

    @renderOptions_append_CreateNewOption() if @options.allowNewValues
    @applyValue(@value)
    @bindToCollection(bindTo) if bindTo
