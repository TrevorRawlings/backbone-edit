#
#
# This code borrows a lot from the powmedia backbone-forms library: https://github.com/powmedia/backbone-forms
#
#

if !Backbone.Edit
  Backbone.Edit = {}

# ==================================================================================================
# HELPERS
# ==================================================================================================

if !Backbone.Edit.helpers
  Backbone.Edit.helpers = {}

helpers = Backbone.Edit.helpers

# **
# * This function is used to transform the key from a schema into the title used in a label.
# * (If a specific title is provided it will be used instead).
# *
# * @param {String}  Key
# * @return {String} Title
# */
helpers.keyToTitle = (str) ->
  str = _.string.humanize(str);
  str = _.string.titleize(str);
  return str;


# **
# * Helper to create a template with the {{mustache}} style tags. Template settings are reset
# * to user's settings when done to avoid conflicts.
# * @param {String}      Template string
# * @param {Object}      Optional; values to replace in template
# * @return {Template}   Compiled template
# *
helpers.createTemplate = (str, context) ->

  # Store user's template options
  _interpolateBackup = _.templateSettings.interpolate;

  # Set custom template settings
  _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;

  template = _.template(str);

  # Reset to users' template settings
  _.templateSettings.interpolate = _interpolateBackup;

  if !context
    return template
  else
    return template(context)


# **
# * Sets the templates to be used.
# *
# * If the templates passed in are strings, they will be compiled, expecting Mustache style tags,
# * i.e. <div>{{varName}}</div>
# *
# * You can also pass in previously compiled Underscore templates, in which case you can use any style
# * tags.
# *
# * @param {Object} templates
# * @param {Object} classNames
# *
helpers.setTemplates = (templates, classNames) ->
  createTemplate = helpers.createTemplate;

  Backbone.Edit.templates = Backbone.Edit.templates || {};
  Backbone.Edit.classNames = Backbone.Edit.classNames || {};

  # Set templates, compiling them if necessary
  for key, template of templates
    if _.isString(template)
      template = createTemplate(template)
    Backbone.Edit.templates[key] = template

  # Set class names
  _.extend(Backbone.Edit.classNames, classNames)


helpers.setSchemaDefaults = (schema, key) ->

 # Set schema defaults
  if !schema.type
    schema.type = switch (schema.dataType)
                    when 'Date'    then 'Date'
                    when 'Model'   then 'Select'
                    when 'Number'  then 'Number'
                    when 'Boolean' then 'Checkbox'
                    else 'Text'

  if !schema.title
    schema.title = helpers.keyToTitle(key)

  if !schema.template
    schema.template = 'field'

  if !schema.placeholder
    schema.placeholder = schema.title

    if (Backbone.Validators.hasValidator(schema, "required"))
      schema.placeholder += " (required)"

  if _.isUndefined(schema.readOnly)
    schema.readOnly = false


# Returns a new object that is the result of merging base and extend
helpers.mergeSchema = (base, extend) ->
  schema = {}

  for key in _.union(_.keys(base), _.keys(extend))
    b = base[key] || {}
    e = extend[key] || {}
    schema[key] = _.extend({}, b, e)

  return schema



# **
# * Return the editor constructor for a given schema 'type'.
# * Accepts strings for the default editors, or the reference to the constructor function
# * for custom editors
# *
# * @param {String|Function} The schema type e.g. 'Text', 'Select', or the editor constructor e.g. editors.Date
# * @param {Object}          Options to pass to editor, including required 'key', 'schema'
# * @return {Mixed}          An instance of the mapped editor
# */
helpers.createEditor = (schemaType, options) ->

  if (_.isString(schemaType))
    ConstructorFn = Backbone.Edit.editors[schemaType]
  else
    ConstructorFn = schemaType

  return new ConstructorFn(options)


Backbone.Edit.helpers = helpers


# A simple mixin implementation.
#
# Some more complex alteratives:
# * http://arcturo.github.com/library/coffeescript/03_classes.html
# * https://gist.github.com/993415
# * https://github.com/kmalakoff/mixin

class Backbone.Edit.Mixin

Backbone.Edit.Mixin.add_to = (object) ->
  for key, value of this.prototype when key not in ["constructor"]
    # Assign properties to the prototype
    object.prototype[key] = value


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
    @fieldsToRender = options.fields || _.keys(@schema);
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
      field = @addField(key)

      # Render the fields with editors, apart from Hidden fields
      if (options.schema.type == 'Hidden')
        field.editor = helpers.createEditor('Hidden', options)
      else
        $container.append(field.render().el)
        if (@_fieldsShown)
          field.onShow()

  showFields: ->
    @_fieldsShown = true
    @fields[key].onShow() for key of @fields


  setFocus: (field) ->
    throw "expected field to be a string" if !_.isString(field)
    throw "field #{field} not found"  if !@fields[field]

    @fields[field].editor.focus()


  optionsForField: (key) ->
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


  # **
  # * Returns new field, caller needs to append it to the document
  # * @param key
  # */
  addField: (key, options) ->
    throw new Error("already set") if !_.isUndefined(@fields[key])

    if (!options)
      options = this.optionsForField(key);

    field = new Backbone.Edit.Field(options);
    @fields[key] = field;
    return field

  beforeCloseFields: ->
    for key of @fields
      @fields[key].beforeClose();

  closeFields: ->
    for key of @fields
      @fields[key].close();
      delete @fields[key]





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

  # **
  # * @param {Object}  Options
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
    @key = options.key;
    @value = options.value;
    @model = options.model;

    # Get schema
    if _.isString(options.schema)
      @schema = { type: options.schema }  # Handle schema type shorthand where the editor name is passed instead of a schema config object
    else
      @schema = options.schema || {}
    helpers.setSchemaDefaults(@schema, @key); # Set schema defaults

    if (@model)
      @bindTo(@model, "serverErrorsChanged", @on_serverSideValidation)
      @bindTo(@model, "clientErrorsChanged", @on_clientSideValidation)
      @bindTo(@model, "change:"+this.key,    @on_modelChanged)
      @bindTo(@model, "change:canEdit",      @on_canEditChanged)


  render: ->
    templates = Backbone.Edit.templates

    # Render may have already been called - make sure we remove old versions of the editor:
    @_closeEditor()

    # Standard options that will go to all editors
    options =
      form: @form,
      key: @key,
      schema: @schema,
      idPrefix: this.options.idPrefix,
      id: this.generateId()


    # Decide on data delivery type to pass to editors
    if (@model)
      options.model = this.model;
      if (_.isFunction(this.model.canEdit))
        options.editable = this.model.canEdit()

    else
      options.value = this.value

    # Decide on the editor to use
    editor = helpers.createEditor(@schema.type, options)
    @_setEditor(editor)

    #Create the element
    field_options =
      key:    @key
      title:  @schema.title
      id:     editor.id
      type:   @schema.type
      editor: '<span class="bbf-placeholder-editor"></span>'
      help:   '<span class="bbf-placeholder-help"></span>'
    $field = $(templates[@schema.template](field_options ))

    # Render editor
    $editorPlaceholder = $('.bbf-placeholder-editor', $field);
    if (@schema.prepend)
      prepend = $('<span class="add-on"></span>');
      prepend.text(@schema.prepend);
      $editorPlaceholder.parent().addClass('input-prepend');
      $editorPlaceholder.parent().prepend(prepend);

    if (@schema.append)
      append = $('<span class="add-on"></span>');
      append.text(@schema.append);
      $editorPlaceholder.parent().addClass('input-append');
      $editorPlaceholder.parent().append(append)

    $editorPlaceholder.replaceWith(editor.render().el)


    # Set help text
    @$help = $('.bbf-placeholder-help', $field).parent();
    if @$help
      @$help.empty();

    # Add custom CSS class names
    if (@schema.fieldClass)
      $field.addClass(@schema.fieldClass)

    # Add custom attributes
    if (@schema.fieldAttrs)
      $field.attr(@schema.fieldAttrs)

    @setElement($field);
    @editor.onShow() if @shown && @editor && @editor.onShow

    #its possible the model may already have validation errors:
    if @$help
      if @model and @model.serverErrors and @model.serverErrors[@key]
        @on_serverSideValidation()
      else if @model and @model.clientErrors and @model.clientErrors[@key]
        @on_clientSideValidation()
      else
        @clearError()

    return this

  onShow: ->
    shown = true;
    if (@editor && @editor.onShow)
      @editor.onShow()

  # **
  # * Creates the ID that will be assigned to the editor
  # * @return {String}
  # */
  generateId: ->
    prefix = @options.idPrefix
    id = @key

    # If a specific ID prefix is set, use it
    if (_.isString(prefix) || _.isNumber(prefix))
      return prefix + id;
    if (_.isNull(prefix))
      return id;

    # Otherwise, if there is a model use it's CID to avoid conflicts when multiple forms are on the page
    if (@model)
      return "#{@model.cid}_#{id}";

    return id;


  formatErrors: (errors) ->
    if @schema.dataType == 'Collection'
      # we have an array of [{id = ,cid = , errors = { date=["can't be blank"], location=["can't be blank"] }
      allErrors = {};

      for item in errors
        keys = _.keys(item.errors);
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
        else
          list.append($("<li></li>").text(error))
      return list

    else
      return _.string.escapeHTML(errors.toString())

  # **
  # * If saving a model fails the validation errors in the http response will be added to a collection on the
  # * model.  The method reads the errors and updates the form with the new values
  # *
  # * @param {String} errMsg
  # *
  on_serverSideValidation: ->
    itemErrors = @model.serverErrors[@key]
    if (itemErrors)
      @setError(@formatErrors(itemErrors))
    else
      @clearError()

  on_clientSideValidation: ->
    itemErrors = @model.clientErrors[@key]
    if (itemErrors)
      @setError(@formatErrors(itemErrors))
    else
      @clearError()

  on_modelChanged: ->
    @setValue(@model.get(@key))

  on_canEditChanged: ->
    @editor.setEditable(@model.canEdit())

  # **
  # * Update the model with the current value
  # */
  on_editorChanged: ->
    @logValue()
    @editor.commit()

  # **
  # * Set the field into an error state, adding the error class and setting the error message
  # *
  # * @param {String} errMsg
  # *
  setError: (errHtml) ->
    errClass = Backbone.Edit.classNames.error
    @$el.addClass(errClass)
    @$help.html(errHtml) if @$help


  # **
  # * Clear the error state and reset the help message
  # *
  clearError: ->
    errClass = Backbone.Edit.classNames.error
    @$el.removeClass(errClass)

    # some fields (e.g., Hidden), may not have a help el
    @$help.empty() if @$help

    # Reset help text if available
    helpMsg = @schema.help;
    if (helpMsg)
      @$help.text(helpMsg)

  # **
  # * Update the model with the new value from the editor
  # *
  commit: ->
    return @editor.commit()


  #**
  # * Get the value from the editor
  # * @return {Mixed}
  # */
  getValue: ->
    return @editor.getValue()


  # **
  # * Set/change the value of the editor
  # *
  setValue: (value) ->
    @editor.setValue(value)


  logValue: ->
    return if !console or !console.log
    console.log(@getValue())

  _setEditor: (value) ->
    @_closeEditor()
    @editor = value;
    @editor.on('changed', this.on_editorChanged, this)


  _closeEditor: () ->
    if @editor
      @editor.off('change')

      # Call close if this is a Marionette view, otherwise call remove
      if (_.isFunction(@editor.close))
        @editor.close()
      else
        @editor.remove()
      @editor = null

  beforeClose: ->
    super
    @_closeEditor()

  #  onClose: ->
  #    @_closeEditor()



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




