if !Backbone.Slickgrid
  Backbone.Slickgrid = {}



class Backbone.Slickgrid.Formatter

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
    formatters.defaultFormater(data.get(col.field))


  # Slick grid calls this method with the 'this' variable set to window
  # as a result the @ sign doesn't work
  dateFormater: (row,cell,value,col,data) ->
    formatters.dateFormater( data.get(col.field) )


  taskStatusFormater: (row,cell,value,col,data) ->
    value = data.get(col.field)
    if _.isBoolean(value)
      if (value)
        array = ["Completed"]

        if date = data.get("completed_date")
          array.push( "(#{formatters.dateFormater(date)})" )

        return array.join(" ")
      else
        return "To Do"
    else
      return "?"

  # Slick grid calls this method with the 'this' variable set to window
  # as a result the @ sign doesn't work
  modelFormater: (row,cell,value,col,data) ->
    formatters.modelFormater( data.get(col.field) )


  # Slick grid calls this method with the 'this' variable set to window
  # as a result the @ sign doesn't work
  collectionFormater: (row,cell,value,col,data) ->
    formatters.collectionFormater( data.get(col.field) )



Formatters = new Backbone.Edit.Slickgrid.ModelFormatter()