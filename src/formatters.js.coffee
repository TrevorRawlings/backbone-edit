if !Backbone.Edit
  Backbone.Edit = {}

if !Backbone.Edit.formatters
  Backbone.Edit.formatters = {}

formatters = Backbone.Edit.formatters
converters = Backbone.Edit.converters

# Supported formatters  (dataType | Formatter name)
formatters.dataTypes =
  "Date"       : "dateFormater"
  "DateTime"   : "dateTimeFormater"
  "Model"      : "modelFormater"
  "Collection" : "collectionFormater"

formatters.find_by_data_type = (type) ->
  if formatterName = formatters.dataTypes[type]
    return formatters[formatterName]
  else
    return null


formatters.defaultFormater = (value) ->
  if _.isNull(value) or _.isUndefined(value)
    return ""

  else if value instanceof Backbone.Model
    return formatters.modelFormater(value)

  else if value instanceof Backbone.Collection
    return formatters.collectionFormater(value)

  else if _.isDate( value )
    return formatters.dateFormater(value)

  else
    return _.string.escapeHTML( value.toString() )


formatters.dateFormater = (value) ->
  if _.isDate( value )
    return moment( value ).format("DD-MM-YYYY")
  else if _.isString( value )
    date = converters.date.fromServerString(value)
    return moment( date ).format("DD-MM-YYYY")
  else if _.isNull(value) or _.isUndefined(value)
    return ""
  else
    return "?"

formatters.dateTimeFormater = (value) ->
  if _.isDate( value )
    return moment( value ).format("DD-MM-YYYY")
  else if _.isString( value )
    date = converters.dateTime.fromServerString(value)
    return moment( date ).format("DD-MM-YYYY")
  else if _.isNull(value) or _.isUndefined(value)
    return ""
  else
    return "?"


formatters.modelFormater = ( value ) ->
  if value instanceof Backbone.Model
    text = _.string.escapeHTML( value.toString() )
    if value.isDeleted and value.isDeleted()
      text = "<del>#{text}</del>"
    return text
  else if _.isNull(value) or _.isUndefined(value)
    return ""
  else
    return "?"

formatters.collectionFormater = (value) ->
  if value instanceof Backbone.Collection
    # Call modelFormater() for the first 10 models in the collection
    # Limiting to the first first 10 models in case its a massive collection with 100's of items
    values = (formatters.modelFormater(model) for model in value.first(10) )
    values.push("...") if value.length > 10
    return values.join(", ")

  else if _.isNull(value) or _.isUndefined(value)
    return ""

  else
    return "?"

# Add a format method to classes derived from Backbone.Model
class Backbone.Edit.FormatterMixin extends Backbone.Edit.Mixin

  format: (attr) ->
    itemSchema = @schema[attr]
    formatter = formatters.find_by_data_type(itemSchema.dataType)
    return formatter(@get(attr))
