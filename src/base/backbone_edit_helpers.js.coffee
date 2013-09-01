#
#
# This code borrows a lot from the powmedia backbone-forms library: https://github.com/powmedia/backbone-forms
#
#

Backbone.Edit = {} if !Backbone.Edit

# ==================================================================================================
# Enum
# ==================================================================================================

Backbone.Edit.enum = {} if !Backbone.Edit.options

Backbone.Edit.enum.DefaultValue = { backbone_edit_enum: "DefaultValue" }   # use the default value as the placeholder

# ==================================================================================================
# HELPERS
# ==================================================================================================

Backbone.Edit.helpers = {} if !Backbone.Edit.helpers

helpers = Backbone.Edit.helpers


helpers.dom = {} if !helpers.dom

helpers.dom.element_equal_or_contains = (element, target) ->
  throw "arg should be a dom element" if !_.isElement(element) or !_.isElement(target)
  return element == target or $.contains(element, target)


# getObjectByName
# ---------------
# Find a model type on one of the modelScopes by name. Names are split on dots.
# A replacement for the method in backbone-relational
#
# @param {String} name
# @return {Object}
#
helpers.getObjectByName = (name) ->
  return name if _.isFunction(name) or _.isObject(name)

  parts = name.split( '.' )
  object = window[parts.shift()];
  while obj and parts.length
    object = object[parts.shift()]

  throw "failed to find object #{name}" if !object
  return object


helpers.isCollection = (object) ->
  return (object instanceof Backbone.Collection) or (Backbone.Subset and object instanceof Backbone.Subset)

#
# This function is used to transform the key from a schema into the title used in a label.
# (If a specific title is provided it will be used instead).
#
# @param {String}  Key
# @return {String} Title
#
helpers.keyToTitle = (str) ->
  str = _.string.humanize(str);
  str = _.string.titleize(str);
  return str;


#
# Helper to create a template with the {{mustache}} style tags. Template settings are reset
# to user's settings when done to avoid conflicts.
#
# @param {String}      Template string
# @param {Object}      Optional; values to replace in template
# @return {Template}   Compiled template
#
helpers.createTemplate = (str, context) ->

  # Store user's template options
  _interpolateBackup = _.templateSettings.interpolate;

  # Set custom template settings
  # By default underscore uses erb style templates - switch to  Mustache.js style templating
  _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;

  template = _.template(str);

  # Reset to users' template settings
  _.templateSettings.interpolate = _interpolateBackup;

  if !context
    return template
  else
    return template(context)


#
# Sets the templates to be used.
#
# If the templates passed in are strings, they will be compiled, expecting Mustache style tags,
# i.e. <div>{{varName}}</div>
#
# You can also pass in previously compiled Underscore templates, in which case you can use any style
# tags.
#
# @param {Object} templates
# @param {Object} classNames
#
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
      when 'Date'     then 'Date'
      when 'DateTime' then 'DateTime'
      when 'Model'    then 'Select'
      when 'Number'   then 'Number'
      when 'Boolean'  then 'Checkbox'
      when 'Decimal'  then 'Text'
      when 'Currency' then 'Currency'
      else 'Text'

  if !schema.title
    schema.title = helpers.keyToTitle(key)

  if !schema.template
    schema.template = 'field'

  if !schema.placeholder
    schema.placeholder = schema.title

    if (Backbone.Validators and Backbone.Validators.hasValidator(schema, "required"))
      schema.placeholder += " (required)"

  if _.isUndefined(schema.readOnly)
    schema.readOnly = false

  if !schema.field
    schema.field = Backbone.Edit.Field


# Returns a new object that is the result of merging base and extend
helpers.mergeSchema = (base, extend...) ->
  schema = {}

  # keys will be an array of arrays:
  # [['a', 'b'], ['a'], ['a', 'c']]
  keys = [_.keys(base)]
  keys.push(_.keys(e)) for e in extend

  for key in _.union.apply(_, keys)
    schema_row = [{}, (base[key] || {})]
    for e in extend
      schema_row.push( e[key] || {}  )

    # schema_row will be an array of objects:
    # [{}, {a: 1}, {b: 2}, {a: '3', c:[67] }]
    schema[key] = _.extend.apply(_, schema_row)
  return schema



#
# Return the editor constructor for a given schema 'type'.
# Accepts strings for the default editors, or the reference to the constructor function
# for custom editors
#
# @param {String|Function} The schema type e.g. 'Text', 'Select', or the editor constructor e.g. editors.Date
# @param {Object}          Options to pass to editor, including required 'key', 'schema'
# @return {Mixed}          An instance of the mapped editor
#
helpers.createEditor = (schemaType, options) ->

  if (_.isString(schemaType))
    if _.isFunction(Backbone.Edit.editors[schemaType])
      ConstructorFn = Backbone.Edit.editors[schemaType]
    else
      throw "#{schemaType} is not a Backbone.Edit editor"
  else
    ConstructorFn = schemaType

  return new ConstructorFn(options)


# ==================================================================================================
# categorizr: https://github.com/Skookum/categorizr.js
# ==================================================================================================

if _.isUndefined(window.categorizr)
  helpers.categorizr = { isDesktop: true }
else
  helpers.categorizr = categorizr




