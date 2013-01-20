editors = Backbone.Edit.editors

class editors.DateEditor extends editors.Base
  tagName: 'input'
  className: 'bbf-date'

  events: {  'change': 'triggerChanged' }



  initialize: (options) ->
    super
    @$el.attr('type', 'text');

  pickerType: ->
    #return "mobiscroll"
    return if categorizr.isDesktop then "jquery" else "mobiscroll"

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
      @$el.mobiscroll().date({ dateFormat: 'dd/mm/yyyy', dateOrder: 'D dMyy', maxDate: Landscape.Helpers.DateUtils.dateAdd( new Date(), 'Y', 10) });

    @$el.attr("placeholder", this.schema.placeholder) if (@schema.placeholder)

    @setValue(this.value)
    return this

  # Handling of dates
  # -----------------
  #
  # All dates will be sent to/from the server as ISO-8601 (YYYY-MM-DDThh:mm:ss.sTZD) .. which is defined here: http://www.w3.org/TR/NOTE-datetime
  #
  # However native browser support is limited.  so we need to use

  getValue: ->
    date = if @pickerType() == "jquery" then @$el.datepicker('getDate') else @$el.mobiscroll('getDate')

    # Datepicker returns midnight on the selected date for the local timezone.
    if (date == null)
      return null
    else
      return moment( date ).utc().format("YYYY-MM-DD")


  setValue: (value) ->
    if (value && !_.isDate(value))  # Cast to Date
      value = new Date(value)
      value.setMinutes(value.getMinutes() + value.getTimezoneOffset());

    if @pickerType() == "jquery"
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

editors["Date"] = editors.DateEditor



