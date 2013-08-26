#
#
# This code borrows a lot from the powmedia backbone-forms library: https://github.com/powmedia/backbone-forms
#
#

Backbone.Edit = {} if !Backbone.Edit

# ==================================================================================================
# FORM
# ==================================================================================================

class Backbone.Edit.FormMixin extends Backbone.Edit.Mixin

  # **
  # * @param {Object}  Options
  # *      Required:
  # *          schema  {Array}
  # *      Optional:
  # *          model   {Backbone.Model} : Use instead of data, and use commit().
  # *          data    {Array} : Pass this when not using a model. Use getValue() to get out value
  # *          fields  {Array} : Keys of fields to include in the form, in display order (default: all fields)
  # *          fieldsets {Array} : Allows choosing and ordering fields within fieldsets.
  #                                A fieldset is either a list of field names, or an object with legend and fields attributes.
  #                                The legend will be inserted at the top of the fieldset inside a <legend> tag; the list of
  #                                fields will be treated as fields is below. fieldsets takes priority over fields.
  # *          idPrefix {String} : Prefix for editor IDs. If undefined, the model's CID is used.
  # *          template {String} : Template to use. Default to 'form'.
  # *
  initializeForm: (options) ->
    # Get the schema
    if options.schema
      @schema = options.schema
    else
      model = options.model;
      throw new Error('Could not find schema') if (!model || !model.schema)
      @schema = _.result(model, 'schema')

    # Handle other options
    @model = options.model;
    @data = options.data;

    @fieldsToRender = @fieldsToRender || @options.fields #|| _.keys(@schema);
    throw "expected an array" if @fieldsToRender and !_.isArray(@fieldsToRender)


    @fieldsets = options.fieldsets;
    @templateName = options.template || 'form';

    # Stores all Field views
    @fields = {}


  # **
  # * Renders the form and all fields
  # *
  renderForm: ->
    fieldsToRender = @fieldsToRender
    fieldsets = @fieldsets
    templates = Backbone.Edit.templates

    # This view might have already been rendered - make sure we clean up previous instances
    @closeFields()

    # Create el from template
    $form = $(templates[@templateName]({ fieldsets: '<div class="bbf-placeholder"></div>' }))

    # Get a reference to where fieldsets should go and remove the placeholder
    $fieldsetContainer = $('.bbf-placeholder', $form).parent();
    $fieldsetContainer.html('');

    if (fieldsets)
      throw "expected fieldsets to be an array" if !_.isArray(@fieldsets)
      # TODO: Update handling of field sets

      for fs in fieldsets
        if _(fs).isArray()
          fs = {'fields': fs}

        $fieldset = @renderFieldset( fieldsToRender, fs.legend );
        $fieldsetContainer.append($fieldset)
    else
      $fieldset = @renderFieldset( fieldsToRender, '' )
      $fieldsetContainer.append($fieldset)

    @setElement($form)
    return this

  renderFieldset: ( fields, legend ) ->

    # Concatenating HTML as strings won't work so we need to insert field elements into a placeholder
    options =
      legend: if (legend) then "<legend>#{legend}</legend>" else ''
      fields: '<div class="bbf-placeholder"></div>'
    $fieldset = $(Backbone.Edit.templates.fieldset(options));

    $fieldsContainer = $('.bbf-placeholder', $fieldset).parent();
    $fieldsContainer.html('');

    @renderFields( fields, $fieldsContainer );
    return $fieldset


  # **
  # * Render a list of fields. Returns the rendered Field object.
  # * @param {Array}           Fields to render
  # * @param {jQuery}          Wrapped DOM element where field elemends will go
  # *
  renderFields: (fieldsToRender, $container) ->

    # Create form fields
    for key in fieldsToRender
      throw "key is undefined" if (_.isUndefined(key) || _.isNull(key))
      options = @optionsForField(key)
      field = @addField(key, options)

      # Render the fields with editors, apart from Hidden fields
      #      if (options.schema.type == 'Hidden')
      #        field.editor = helpers.createEditor('Hidden', options)
      #      else
      $container.append(field.render().el)
      if (@_fieldsShown)
        field.show()

  showFields: ->
    @_fieldsShown = true
    @fields[key].show() for key of @fields


  setFocus: (field) ->
    throw "expected field to be a string" if !_.isString(field)
    throw "field #{field} not found"  if !@fields[field]

    @fields[field].setFocus()


  optionsForFieldEditor: (key) ->
    throw "expected key to be a string" if !_.isString(key)
    throw "expected this.schema to be an object" if !_.isObject(@schema)

    # Support for nested schema removed as I don't think we are using it
    itemSchema = @schema[key]
    throw "Field '#{key}' not found in schema" if (!itemSchema)

    options =
      form: this
      key: key
      schema: itemSchema
      idPrefix: @options.idPrefix

    if (@model)
      options.model = @model
    else if (@data)
      options.value = @data[key];
    else
      options.value = null
    return options


  optionsForField: (key) ->
    options =
      form: this
      idPrefix: @options.idPrefix
      model: @model

    if _.isArray(key)
      options.editors = (@optionsForFieldEditor(k) for k in key)
    else
      options.editors = [@optionsForFieldEditor(key)]
    return options


  # **
  # * Returns new field, caller needs to append it to the document
  # * @param key
  # */
  addField: (key, options) ->
    throw new Error("already set") if !_.isUndefined(@fields[key])

    if (!options)
      options = this.optionsForField(key);

    field_class = if options.schema then options.schema.field else options.editors[0].schema.field
    field = new (field_class || Backbone.Edit.Field)(options);
    throw "expected a Backbone.Edit.Field" if !(field instanceof Backbone.Edit.Field)

    @fields[key] = field;
    return field

  beforeCloseFields: ->
    for key of @fields
      @fields[key].beforeClose();

  closeFields: ->
    for key of @fields
      @fields[key].close();
      delete @fields[key]

  deactivateFields: ->
    for key of @fields
      @fields[key].deactivate();



class Backbone.Edit.Form extends Backbone.Marionette.ItemView
  Backbone.Edit.FormMixin.add_to(@)

  initialize: (options) ->
    super
    @initializeForm(options)


  render: () ->
    @renderForm()
    return this


  onShow: ->
    super
    @showFields()

  onDeactivate: ->
    super
    @deactivateFields()

  beforeClose: ->
    super
    @beforeCloseFields()

  # **
  # * Override default remove function in order to remove embedded views
  #
  onClose: ->
    super
    @closeFields()




# ==================================================================================================
# FIELD
# ==================================================================================================

class Backbone.Edit.Field extends Backbone.Marionette.View
  Backbone.Edit.FindElementMixin.add_to(@)
  Backbone.Edit.OnContainerResizeMixin.add_to(@)

  # Backbone.Edit.Field
  # * @param {Object}  Options
  #
  # *      Required:
  # *          key     {String} : The model attribute key
  # *      Optional:
  # *          schema  {Object} : Schema for the field
  # *          value       {Mixed} : Pass value when not using a model. Use getValue() to get out value
  # *          model       {Backbone.Model} : Use instead of value, and use commit().
  # *          idPrefix    {String} : Prefix to add to the editor DOM element's ID
  # *
  initialize: (options) ->
    @form = options.form
    @model = options.model
    @editors = []

    if  options.key or options.errors_key or options.value or options.schema
      throw "argument error" if options.editors
      options.editors = [_.pick(options, 'key', 'errors_key', 'value', 'schema')]

    @error_keys = []
    change_keys = []   # change events that we want to bind to
    for editor in options.editors
      throw "Backbone.Edit.Field: key is required" if !_.isString(editor.key)
      change_keys.push("change:#{editor.key}")

      editor.errors_key = editor.errors_key || editor.key # properties within serverErrors & clientErrors that we want to watch for, by
                                                          # default this will be a list of editor keys
      # schema
      if _.isString(editor.schema)  # Get schema
        editor.schema = { type: editor.schema }  # Handle schema type shorthand where the editor name is passed instead of a schema config object
      else
        editor.schema = _.extend({}, editor.schema || {})    # Create a (shallow) clone to avoid modifcation of shared data structures:
      helpers.setSchemaDefaults(editor.schema, editor.key); # Set schema defaults


    if (@model)
      @bindTo(@model, "serverErrorsChanged", @on_serverSideValidation)
      @bindTo(@model, "clientErrorsChanged", @on_clientSideValidation)
      @bindTo(@model, change_keys.join(" "), @on_modelChanged)
      @bindTo(@model, "change:canEdit",      @on_canEditChanged)




  # **
  # * Creates the ID that will be assigned to the editor
  # * @return {String}
  # */
  generateId: (id) ->
    prefix = @options.idPrefix

    # If a specific ID prefix is set, use it
    if (_.isString(prefix) || _.isNumber(prefix))
      return prefix + id;
    if (_.isNull(prefix))
      return id;

    # Otherwise, if there is a model use it's CID to avoid conflicts when multiple forms are on the page
    if (@model)
      return "#{@model.cid}_#{id}";

    return id;


  formatErrors: (schema, errors) ->
    if schema.dataType == 'Collection'
      # we have an array of [{id = ,cid = , errors = { date=["can't be blank"], location=["can't be blank"] }
      allErrors = {};

      for item in errors
        if _.isObject(item.errors)
          for key in _.keys(item.errors)
            allErrors[key] = _.union( (allErrors[key] || []), item.errors[key] )

      errors = [];
      for key in _.keys(allErrors)
        errors.push(helpers.keyToTitle(key) + " " + allErrors[key])

    if (errors instanceof Array)
      list = $("<ul></ul>");
      for error in errors
        if _.isObject(error) and !_.isUndefined(error.message)
          list.append($("<li></li>").text(error.message))
        else if _.isBoolean(error)
          # we know an error occured but don't have text to display
        else
          list.append($("<li></li>").text(error.toString()))
      return list.html()

    else
      return _.string.escapeHTML(errors.toString())

  # Limit what errors are shown to the user
  filter_errors: (itemErrors) ->
    return itemErrors

  # **
  # * If saving a model fails the validation errors in the http response will be added to a collection on the
  # * model.  The method reads the errors and updates the form with the new values
  # *
  # * @param {String} errMsg
  # *
  hasErrors: (errorType) ->
    throw "invalid type #{errorType}" if errorType != "serverErrors" and errorType != "clientErrors"

    errorsHtml = []
    for editor in @options.editors
      filtered = @filter_errors(@model[errorType][editor.errors_key])
      if filtered
        errorsHtml.push(@formatErrors(editor.schema, filtered))

    return if errorsHtml.length > 0 then errorsHtml.join('') else null

  hasServerSideErrors: ->
    return @hasErrors("serverErrors")

  hasClientSideErrors: ->
    return @hasErrors("clientErrors")

  on_serverSideValidation: ->
    itemErrors = @hasErrors("serverErrors")
    if _.isString(itemErrors)
      @setError(itemErrors)
    else
      @clearError()

  on_clientSideValidation: ->
    itemErrors = @hasErrors("clientErrors")
    if _.isString(itemErrors)
      @setError(itemErrors)
    else
      @clearError()

  on_modelChanged: (model, value, options) ->
    changed = @model.changedAttributes()
    for editor in @editors
      key = editor.field_editor_options.key
      _.has(changed, key)
      editor.setValue(@model.get(key))

  # --------------------------------------------------------------
  # editable

  getCanEdit: ->
    if _.isFunction(@model.canEdit)
      @model.canEdit()
    else
      return true

  on_canEditChanged: (model, newValue) ->
    @setEditable(newValue)

  setEditable: (canEdit) ->
    throw "setEditable: expected a boolean" if !_.isBoolean(canEdit)

    for editor in @editors
      editor.setEditable(canEdit)

  # --------------------------------------------------------------

  # **
  # * Update the model with the current value
  # */
  on_editorChanged: (editor) ->
    throw "expected an editor" if !(editor instanceof Backbone.Marionette.View)
    @logValue()
    editor.commit()


  findErrorClassElement: ->
    $element = if @$el.hasClass('control-group') then @$el else @$el.find('.control-group')
    throw "field.setError: control-group element was not found" if  $element == 0
    return $element


  # **
  # * Set the field into an error state, adding the error class and setting the error message
  # *
  # * @param {String} errMsg
  # *
  setError: (errHtml) ->
    errClass = Backbone.Edit.classNames.error
    $element = @findErrorClassElement().addClass(errClass)
    @$help.html(errHtml) if @$help


  # **
  # * Clear the error state and reset the help message
  # *
  clearError: ->
    errClass = Backbone.Edit.classNames.error
    @findErrorClassElement().removeClass(errClass)

    # some fields (e.g., Hidden), may not have a help el
    @$help.empty() if @$help

    # Reset help text if available
    helpMsg = @options.editors[0].schema.help;
    if (helpMsg)
      @$help.text(helpMsg)

  # **
  # * Update the model with the new value from the editor
  # *
  commit: (editor) ->
    throw "expected an editor" if !(editor instanceof Backbone.Marionette.View)
    return editor.commit()


  #**
  # * Get the value from the editor
  # * @return {Mixed}
  # */
  getValue: () ->
    if @editors.length == 1
      return @editors[0].getValue()
    else
      throw "getValue: not supported"

  # **
  # * Set/change the value of the editor
  # *
  setValue: (value) ->
    if @editors.length == 1
      @editors[0].setValue(value)
    else
      throw "setValue: not supported"

  setFocus: ->
    if @editors.length >= 1
      @editors[0].focus()


  logValue: ->
    return if !console or !console.log
    # console.log(@getValue())



  _closeEditors: () ->
    for editor in @editors
      editor.off('change')
      editor.close()
    @editors = []

  # -------------------------------------------------
  # Autosize
  # A Javscript method of setting the editor's width

  on_container_resize: (details) ->
    if details.widthChanged
      @setAutosizedWidth()

  setAutosizedWidth: ->

    if @isAutosized() and @editors.length == 1
      editor = @editors[0]

      $parent = editor.$el.parent()
      addOnWidth = 0
      for element in $parent.find('.add-on')
        addOnWidth = addOnWidth + $(element).outerWidth()

      if addOnWidth > 0
        editor.$el.css('width', '')
        input_padding = editor.$el.outerWidth() - editor.$el.width()
        inputWidth = editor.$el.outerWidth()
        editor.$el.css('width', "#{inputWidth - addOnWidth - input_padding}px")

  isAutosized: ->
    schema = @options.editors[0].schema
    return (schema.append or schema.prepend) and !schema.editorAttrs



  # --------------------------------------------------------
  # form lifecycle events

  beforeClose: ->
    super
    @_closeEditors()

  onShow: (wasAlreadyActive) ->
    super
    if @isAutosized() and !wasAlreadyActive
      @setContainer(@$el.parent())  # provided by OnContainerResizeMixin

    editor.show() for editor in @editors

  onDeactivate: ->
    super
    editor.deactivate() for editor in @editors

    if @isAutosized()
      @setContainer(null)  # provided by OnContainerResizeMixin

  onClose: ->
    super
    editor.close() for editor in @editors

  # --------------------------------------------------------

  render: ->
    templates = Backbone.Edit.templates

    # Render may have already been called - make sure we remove old versions of the editor:
    @_closeEditors()

    template_args = { help: '<div class="bbf-placeholder-help"></div>' }

    for editor_options, i in @options.editors

      # Standard options that will go to all editors
      options =
        form: @form,
        key:      editor_options.key,
        schema:   editor_options.schema,
        idPrefix: this.options.idPrefix,
        id:       @generateId(editor_options.key)

      # Decide on data delivery type to pass to editors
      if (@model)
        options.model = @model;
        options.editable = @getCanEdit()
      else
        options.value = editor_options.value

      editor_object = helpers.createEditor(editor_options.schema.type, options)
      editor_object.field_editor_options = editor_options
      editor_object.on('changed', this.on_editorChanged, this)
      @editors.push(editor_object)

      attr_index = if i == 0 then "" else "_#{i}"
      template_args["key#{attr_index}"] =    editor_options.key
      template_args["title#{attr_index}"] =  editor_options.schema.title
      template_args["id#{attr_index}"] =     editor_object.id
      template_args["type#{attr_index}"] =   editor_options.schema.type
      template_args["editor#{attr_index}"] = "<div class=\"bbf-placeholder-editor#{attr_index}\"></div>"

    # Render the template
    template_name = @options.editors[0].schema.template
    $field = $(_.string.trim(templates[template_name](template_args)))

    # Embed the editor(s) within the template
    for editor_options, i in @options.editors
      editor_object = @editors[i]
      attr_index = if i == 0 then "" else "_#{i}"

      $editorPlaceholder = $(".bbf-placeholder-editor#{attr_index}", $field);
      if editor_options.schema.prepend or editor_options.schema.append
        # we need to put the editor within a containing div so that the css classes used to round the borders of the control
        # work correctly.
        #
        # We could create another div ... or we could reuse $editorPlaceholder
        $inputContainer = $editorPlaceholder
        $inputContainer.removeClass('bbf-placeholder-editor')

        $editorPlaceholder = $("<div class=\"bbf-placeholder-editor#{attr_index}\"></div>")
        $inputContainer.append($editorPlaceholder)
        if editor_options.schema.prepend
          prepend = $('<span class="add-on"></span>');
          prepend.text(editor_options.schema.prepend);
          $inputContainer.addClass('input-prepend');
          prepend.insertBefore($editorPlaceholder)

        if editor_options.schema.append
          append = $('<span class="add-on"></span>');
          append.text(editor_options.schema.append);
          $inputContainer.addClass('input-append');
          append.insertAfter($editorPlaceholder)

      $editorPlaceholder.replaceWith(editor_object.render().el)

      $field.addClass(editor_options.schema.fieldClass) if (editor_options.schema.fieldClass)  # Add custom CSS class names
      $field.attr(editor_options.schema.fieldAttrs) if (editor_options.schema.fieldAttrs)  # Add custom attributes


    # Set help text
    @$help = $('.bbf-placeholder-help', $field).parent();
    if @$help
      @$help.empty();


    @setElement($field);
    if @isActive
      editor_object.show() for editor_object in @editors

    #its possible the model may already have validation errors:
    if @$help
      if @model and @model.serverErrors and @hasErrors("serverErrors")
        @on_serverSideValidation()
      else if @model and @model.clientErrors and @hasErrors("clientErrors")
        @on_clientSideValidation()
      else
        @clearError()

    return this


Backbone.Edit.editors = {}
Backbone.Edit.setTemplates = helpers.setTemplates;


# ==================================================================================================
# DEFAULT TEMPLATES
# ==================================================================================================

#
# These templates aren't used. LandscapeBackbone.js includes /assets/javascripts/application/backbone-forms/bootstrap.js which
# replaces these.  These are left for debug / diagnostic purposes only. The 'bbf-form' css classes are in /vendor/assets/stylesheets/application/backbone-forms/backbone-forms.css
# have been comented out.
#

templates =
  form: '<form class="bbf-form">{{fieldsets}}</form>'
  fieldset: '<fieldset>{{legend}}<ul>{{fields}}</ul></fieldset>'
  field: `'<li class="bbf-field bbf-field{{type}}">' +
          '<label for="{{id}}">{{title}}</label>' +
          '<div class="bbf-editor bbf-editor{{type}}">{{editor}}</div>' +
          '<div class="bbf-help">{{help}}</div>' +
          '</li>'`

classNames = { error: 'bbf-error' };

# Make default templates active
Backbone.Edit.setTemplates(templates, classNames);




