# Slickgrid formatters
# ====================
#
# Used by slickgrid to render model attributes

if !Backbone.Slickgrid
  Backbone.Slickgrid = {}


class Backbone.Slickgrid.FormatterBase

  # Supported formatters  (dataType | Formatter name)
  formatters:
    "Date":       "dateFormater"
    "DateTime":   "dateTimeFormater"
    "Model":      "modelFormater"
    "Collection": "collectionFormater"
    "Array":      "arrayFormater"
    "Decimal":    "decimalFormater"
    "Text":       "textFormater"
    "Currency"   : "currencyFormatter"

  constructor: (view) ->
    @view = view
    @lazy_load_options = { lazy_load: { view: @view, callback: @view.on_row_data_loaded  } }
    @get_related_options = { return: "model", view: @view, callback: @view.on_row_data_loaded }

    # TODO: at the moment we are also using this formatter for ConsumableBatches: throw "expected a Backbone.Slickgrid.View" if !(@view instanceof Backbone.Slickgrid.View )
    throw "expected a Backbone.Slickgrid.View" if !(@view instanceof Backbone.Marionette.View )

    _.bindAll(@, "decimalFormater", "defaultFormater", "dateFormater", "currencyFormatter", "dateTimeFormater", "modelFormater", "collectionFormater", "arrayFormater")

  # Method called by slickgrid
  getFormatter:  (column) ->

    if column.schema and column.schema.formatter and @[column.schema.formatter]
      return @[column.schema.formatter]
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
    value = if _.isArray(col.field) then @loadNestedAttribute(col, data) else data.get(col.field)
    Backbone.Edit.formatters.defaultFormater( value )


  decimalFormater: (row,cell,value,col,data) ->
    value = if _.isArray(col.field) then @loadNestedAttribute(col, data) else data.get(col.field)
    Backbone.Edit.formatters.decimalFormater( value )

  textFormater: (row,cell,value,col,data) ->
    value = if _.isArray(col.field) then @loadNestedAttribute(col, data) else data.get(col.field)
    Backbone.Edit.formatters.textFormater( value )

  currencyFormatter:(row,cell,value,col,data) ->
    value = if _.isArray(col.field) then @loadNestedAttribute(col, data) else data.get(col.field)
    Backbone.Edit.formatters.currencyFormatter( value )


  # Slick grid calls this method with the 'this' variable set to window
  # as a result the @ sign doesn't work
  dateFormater: (row,cell,value,col,data) ->
    value = if _.isArray(col.field) then @loadNestedAttribute(col, data) else data.get(col.field)
    Backbone.Edit.formatters.dateFormater( value )

  # Slick grid calls this method with the 'this' variable set to window
  # as a result the @ sign doesn't work
  dateTimeFormater: (row,cell,value,col,data) ->
    value = if _.isArray(col.field) then @loadNestedAttribute(col, data) else data.get(col.field)
    Backbone.Edit.formatters.dateTimeFormater( value )


  modelFormater: (row,cell,value,col,data) ->
    if _.isArray(col.field)
      value =  @loadNestedAttribute(col, data)
    else if col.schema and col.schema.custom_get
      value = data.get(col.field)
    else
      value = data.getRelated(col.field, @get_related_options)
    Backbone.Edit.formatters.modelFormater( value, @lazy_load_options )


  collectionFormater: (row,cell,value,col,data) ->
    value = if _.isArray(col.field) then @loadNestedAttribute(col, data) else data.get(col.field)
    Backbone.Edit.formatters.collectionFormater( value, Backbone.Edit.formatters.modelFormater, @lazy_load_options )

  arrayFormater: (row,cell,value,col,data) ->
    value = if _.isArray(col.field) then @loadNestedAttribute(col, data) else data.get(col.field)
    Backbone.Edit.formatters.arrayFormater( value, Backbone.Edit.formatters.modelFormater, @lazy_load_options )


  # --------------------------------------------------------------

  loadNestedAttribute: (column, data) ->

    model = data
    last_i = (column.field.length - 1)
    for attr, i in column.field

      # we want to know if this attruibute changes (unless model is currently the 'root' model that we started with -
      # if its the root model then the containing collection will already be lsitening to all relivent events).
      @view.bindToModel(model, attr) if i > 0

      if i == last_i
        return model.get(attr)
      else
        # this should be a model
        model = model.getRelated(attr, @get_related_options)
        return null if model == null # relation isn't yet loaded

