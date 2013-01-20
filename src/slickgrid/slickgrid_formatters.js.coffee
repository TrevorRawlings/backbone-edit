if !Backbone.Edit
  Backbone.Edit = {}

if !Backbone.Edit.formatters
  Backbone.Edit.formatters = {}

formatters = Backbone.Edit.formatters




class Backbone.Edit.Slickgrid.ModelFormatter

  # Supported formatters  (dataType | Formatter name)
  formatters:
    "Date"    :    "dateFormater"
    "TaskStatus" : "taskStatusFormater"
    "Model" :      "modelFormater"
    "Collection" : "collectionFormater"


  # Method called by slickgrid
  getFormatter:  (column) ->

    if column.schema and column.schema.formatter and @formatters[column.schema.formatter]
      formatterName = @formatters[column.schema.formatter]
      return @get(formatterName)
    else if column.dataType and @formatters[column.dataType]
      formatterName = @formatters[column.dataType]
      return @get(formatterName)
    else
      return @defaultFormater


  get: (formatterName) ->
    return @[formatterName]

  rowIndexFormater: (row,cell,value,col,data) ->
    return (row + 1)

  defaultFormater: (row,cell,value,col,data) ->
    value = data.get(col.field)

    if _.isNull(value) or _.isUndefined(value)
      return ""

    else if value instanceof Backbone.Model
      return Formatters._formatModel(value)

    else if value instanceof Backbone.Collection
      return Formatters._formatCollection(value)

    else if _.isDate( value )
      return Formatters.dateFormater(row,cell,value,col,data)

    else
      return _.string.escapeHTML( value.toString() )


  # Slick grid calls this method with the 'this' variable set to window
  # as a result the @ sign doesn't work
  dateFormater: (row,cell,value,col,data) ->
    Formatters._formatDate( data.get(col.field) )

  _formatDate: (value ) ->
    if _.isDate( value )
      return moment( value ).utc().format("DD-MM-YYYY")
    else if _.isString( value )
      return moment( value, "YYYY-MM-DDTHH:mm:ss z" ).utc().format("DD-MM-YYYY")
    else if _.isNull(value) or _.isUndefined(value)
      return ""
    else
      return "?"


  taskStatusFormater: (row,cell,value,col,data) ->
    value = data.get(col.field)
    if _.isBoolean(value)
      if (value)
        array = ["Completed"]

        if date = data.get("completed_date")
          array.push( "(#{Formatters._formatDate(date)})" )

        return array.join(" ")
      else
        return "To Do"
    else
      return "?"

  # Slick grid calls this method with the 'this' variable set to window
  # as a result the @ sign doesn't work
  modelFormater: (row,cell,value,col,data) ->
    Formatters._formatModel( data.get(col.field) )


  _formatModel: ( value ) ->
    if value instanceof Backbone.Model
      text = _.string.escapeHTML( value.toString() )
      if value.isDeleted and value.isDeleted()
        text = "<del>#{text}</del>"
      return text
    else if _.isNull(value) or _.isUndefined(value)
      return ""
    else
      return "?"

  # Slick grid calls this method with the 'this' variable set to window
  # as a result the @ sign doesn't work
  collectionFormater: (row,cell,value,col,data) ->
    Formatters._formatCollection( data.get(col.field) )


  _formatCollection: (value) ->
    if value instanceof Backbone.Collection
      # Call _formatModel() for the first 10 models in the collection
      # Limiting to the first first 10 models in case its a massive collection with 100's of items
      values = (@_formatModel(model) for model in value.first(10) )
      values.push("...") if value.length > 10
      return values.join(", ")

    else if _.isNull(value) or _.isUndefined(value)
      return ""

    else
      return "?"


Formatters = new Landscape.Helpers.Slickgrid.ModelFormatter()