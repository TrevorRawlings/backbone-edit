editors = Backbone.Edit.editors
converters = Backbone.Edit.converters

# This is a base class for the Date and the DateTime editor
class editors.Currency extends editors.Base
  tagName: 'input'

  events: {  'change': 'triggerChanged' }

  initialize: (options) ->
    super
    @$el.attr('type', 'text');


  getValueAsBaseUnit: ->
    val = @$el.val()
    if _.string.isBlank(val)
      return null
    else
      return numeral().unformat(val)


  # Pence (an integer) is returned by the server
  # but we want to allow editing in base units (pounds)
  setValueAsBaseUnit: (pounds) ->
    if _.isNull(pounds) or _.isUndefined(pounds)
      @$el.val('');
    else if _.isFinite(pounds)
      @$el.val(numeral(pounds).format('0.00'));
    else
      throw "setValueAsBaseUnit: invalid value"


  getValue: ->
    pounds = @getValueAsBaseUnit()
    return converters.currency.toServerValue_FromPounds(pounds)

  setValue: (value) ->
    pounds = converters.currency.fromServerValue_ToBaseUnit(value)
    @setValueAsBaseUnit(pounds)

  render: ->
    @setValue(this.value)
    return this
