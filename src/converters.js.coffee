
Backbone.Edit = {}  if !Backbone.Edit
Backbone.Edit.converters = {} if !Backbone.Edit.converters
converters = Backbone.Edit.converters

# http://blogs.msdn.com/b/marcelolr/archive/2008/06/04/javascript-date-utc-and-local-times.aspx



class Backbone.Edit.dateConverter
  # Dates in javascript are a mess: http://blog.dygraphs.com/2012/03/javascript-and-dates-what-mess.html
  #
  # Rails by default seems to render dates (ie.not datetimes) as YYY-MM-DD. But this format isn't officilay
  # supported (only browser causing problems so far is Safari).  We could change the rails default  .. or could
  # let moment.js do the parsing instead:
  #

  string_check: /^(\d{4})[-\/](\d{2})[-\/](\d{2})$/

  # fromServerString
  # ----------------
  #
  # Expects: "2012-04-10" or null
  # Returns a javascript date object in the local timezone with the time set to 00:00:00
  #
  fromServerString: (string) ->
    return null if _.isNull(string)
    return @fromServerString_ToMoment(string).toDate();

  fromServerString_ToMoment: (string) ->
    return null if _.isNull(string)

    throw "dateConverter.fromServerString() expected a \"YYYY-MM-DD\" string but got #{string}" if !_.isString(string) or !@string_check.test(string)

    # Moment: "Unless you specify a timezone offset, parsing a string will create a date in the current timezone."
    m = moment(string, "YYYY-MM-DD")
    throw "date invalid" if !m.isValid()
    return m


  # toServerString
  # --------------
  # Expects a date object (or null)
  #
  # Assuming the date is assigned to the model using ActiveRecord.update_attributes then Date#_parse (http://apidock.com/ruby/Date/_parse/class)
  # will do the conversion to a ruby Date object
  #
  toServerString: (date) ->
    if _.isNull(date)
      return null
    else
      throw "dateConverter.toServerString() expected a date but got #{date}" if !_.isDate(date)
      return m = moment(date).local().format("YYYY-MM-DD")



class Backbone.Edit.dateTimerConverter

  # All datetimes are sent to/from the server as ISO-8601 (YYYY-MM-DDThh:mm:ss.sTZD)
  # .. which is defined here: http://www.w3.org/TR/NOTE-datetime
  #
  #  However native browser support is limited.  so we are using moment.js


  isoFormat: 'YYYY-MM-DDTHH:mm:ssZ'

  # fromServerString
  # ----------------
  #
  # Server format: "2012-11-28T12:36:15Z" or null
  # Returns a javascript date object in the local timezone. Time will be what ever is
  # specified in the supplied string but converted to the local timezone.
  #
  # Converting to the local timezone may cause the date to move forwards / backwards
  #
  fromServerString: (string) ->
    return null if _.isNull(string)
    return @fromServerString_ToMoment(string).toDate();


  fromServerString_ToMoment: (string) ->
    return null if _.isNull(string)
    throw "dateTimerConverter.fromServerString() expected a string but got #{string}" if !_.isString(string)

    m = moment( string, @isoFormat )
    throw "date invalid" if !m.isValid()
    return m


  toServerString: (date) ->
    if _.isNull(date)
      return null
    else
      throw "dateTimerConverter.toServerString() expected a date but got #{date}" if !_.isDate(date)
      return m = moment(date).local().format(@isoFormat)



converters.date = new Backbone.Edit.dateConverter()
converters.dateTime = new Backbone.Edit.dateTimerConverter()

# Add a format method to classes derived from Backbone.Model
class Backbone.Edit.ConverterMixin extends Backbone.Edit.Mixin

  # To do: This should be made more generic:
  convert: (attr, to) ->

    itemSchema = @schema[attr]
    if itemSchema.dataType == "Date"
      converter = converters.date
    else if itemSchema.dataType == "DateTime"
      converter = converters.dateTime
    else
      throw "ConverterMixin.convert, dataType #{itemSchema.dataType} is not supported"

    if to == "jsDate"
      method = "fromServerString"
    else if to == "Moment"
      method = "fromServerString_ToMoment"
    else
      throw "ConverterMixin.convert, to '#{to}' is not supported"

    return converter[method](@get(attr))
