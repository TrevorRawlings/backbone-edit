editors = Backbone.Edit.editors

class editors.DateEditor extends editors.Base
  tagName: 'input'
  className: 'bbf-date'

  events: {  'change': 'triggerChanged' }

  initialize: (options) ->
    super
    @$el.attr('type', 'text');


  render: ->
    editor = this

    # to ensure datePicker is drawn over the top of the slickgrid (http://forum.jquery.com/topic/z-index-1-datepicker-1-8)
    beforeShow = ->
      editor.css = editor.$el.css("z-index")
      editor.position = editor.$el.css("position")
      editor.$el.css({ "z-index": 2000, "position": "relative" })
    onClose = ->
      editor.$el.css({ "z-index": editor.css, "position": editor.position })

    @$el.datepicker({ dateFormat: 'dd/mm/yy', showButtonPanel: true, beforeShow: beforeShow, onClose: onClose })
    @$el.attr("placeholder", this.schema.placeholder) if (@schema.placeholder)

    @setValue(this.value)
    return this


  getValue: ->
    date = this.$el.datepicker('getDate');

    # Datepicker returns midnight on the selected date for the local timezone.
    #
    # But the user thinks he is selecting a date (i.e. Year, Month & Day) - the time and timezone will
    # just cause problems so converting back to a string:
    if (date == null)
      return null
    else
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      return moment( date ).utc().format("YYYY-MM-DD")


  setValue: (value) ->
    if (value && !_.isDate(value))  # Cast to Date
      value = new Date(value)
      value.setMinutes(value.getMinutes() + value.getTimezoneOffset());

    @$el.datepicker('setDate', value)


editors["Date"] = editors.DateEditor

