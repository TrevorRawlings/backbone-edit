editors = Backbone.Edit.editors
converters = Backbone.Edit.converters

# This is a base class for the Date and the DateTime editor
class editors.DateTypeBase extends editors.Base
  tagName: 'input'
  className: 'bbf-date'

  events: {  'change': 'triggerChanged' }

  initialize: (options) ->
    super
    @$el.attr('type', 'text');

  pickerType: ->
    #return "mobiscroll"
    return if Backbone.Edit.categorizr.isDesktop then "jquery" else "mobiscroll"

  render: ->
    editor = this

    if @pickerType() == "jquery"
      # to ensure datePicker is drawn over the top of the slickgrid (http://forum.jquery.com/topic/z-index-1-datepicker-1-8)
      beforeShow = ->
        editor.css = editor.$el.css("z-index")
        editor.position = editor.$el.css("position")
        editor.$el.css({ "z-index": 2000, "position": "relative" })
      onClose = ->
        editor.$el.css({ "z-index": editor.css, "position": editor.position })

      @$el.datepicker({ dateFormat: 'dd/mm/yy', showButtonPanel: true, beforeShow: beforeShow, onClose: onClose })
    else
      @$el.mobiscroll().date({ dateFormat: 'dd/mm/yyyy', dateOrder: 'D dMyy', maxDate: moment().add('years', 10) });

    @setValue(this.value)
    return this


  getValueAsDate: ->
    return if @pickerType() == "jquery" then @$el.datepicker('getDate') else @$el.mobiscroll('getDate')


  setValueAsDate: (value) ->
    if @pickerType() == "jquery"
      # Work around for ie: Only do a set if the new value is different to the current
      current = @$el.datepicker('getDate')
      current_in_ms = if current then current.getTime() else null
      value_in_ms = if value then value.getTime() else null
      if current_in_ms != value_in_ms
        @$el.datepicker('setDate', value)
    else
      if value == null or value == ""
        @$el.val('');
      else
        # m = moment(value).format('dd/mm/yy')
        @$el.val(moment(value).format('DD/MM/YYYY'));
        @$el.mobiscroll('setDate', value)

  setEditable: (value) ->
    super
    if @pickerType() == "mobiscroll"
      if (value)
        @$el.addClass('mobiscroll')
      else
        @$el.removeClass('mobiscroll')


class editors.DateEditor extends editors.DateTypeBase

  getValue: ->
    date = @getValueAsDate()
    return converters.date.toServerString(date)


  setValue: (value) ->
    if (value && !_.isDate(value))  # Cast to Date
      value = converters.date.fromServerString(value)

    @setValueAsDate(value)


class editors.DateTimeEditor extends editors.DateTypeBase


  getValue: ->
    date = @getValueAsDate()
    return converters.dateTime.toServerString(date)


  setValue: (value) ->
    if (value && !_.isDate(value))  # Cast to Date
      value = converters.dateTime.fromServerString(value)

    @setValueAsDate(value)


editors["Date"] = editors.DateEditor
editors["DateTime"] = editors.DateTimeEditor



