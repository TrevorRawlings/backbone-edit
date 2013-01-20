editors = Backbone.Edit.editors

# **
# * Base editor (interface). To be extended, not used directly
# *
# * @param {Object}  Options
# *      Optional:
# *         model   {Backbone.Model} : Use instead of value, and use commit().
# *         key     {String} : The model attribute key. Required when using 'model'
# *         value   {String} : When not using a model. If neither provided, defaultValue will be used.
# *         schema  {Object} : May be required by some editors
# */
class editors.Base extends Backbone.View

  defaultValue: null

  initialize: (options = {}) ->

    if (options.model)
      throw new Error("Missing option: 'key'") if (!options.key)

      @model = options.model
      @key = options.key
      @value = this.model.get(this.key)

    else if (options.value)
      @value = options.value;

    if (@value == undefined)
      @value = this.defaultValue

    @form = options.form;
    @schema = options.schema || {};

    if (@key)
      @$el.attr('name', @key)

    # Add custom CSS class names
    if (@schema.editorClass)
      @$el.addClass(@schema.editorClass)

    # Add custom attributes
    if (@schema.editorAttrs)
      @$el.attr(@schema.editorAttrs)

    if (@schema.placeholder)
      @$el.attr("placeholder", this.schema.placeholder)

    editable = if _.isUndefined(this.options.editable) then true else this.options.editable
    this.setEditable(editable)

  getValue: ->
    throw 'Not implemented. Extend and override this method.'

  setValue: ->
    throw 'Not implemented. Extend and override this method.';

  setEditable: (value) ->
    if (value)
      @$el.removeAttr("disabled")
    else
      @$el.attr({ "disabled": "disabled"})

  # /**
  # *  Used to notify listening objects that the value has been edited by the user.  The parent form should use the
  # *  event as trigger to copy the value into the underly model ... the model will then broadcast a changed event.
  # *
  # * @return {Boolean}
  # */
  triggerChanged: ->
    # I Tried adding a 0 second delay here so that the changed event happens after the jQuery trigger has returned.  I
    # haven't seen any problems but imagine that avoiding reentry into jQuery is probably a good idea
    # window.setTimeout( function () {  self.trigger('changed'); },  0);
    @trigger('changed')
    return true

  focus: ->
    @$el.focus()

  # /**
  # * Update the model with the current value
  # * NOTE: The method is defined on the editors so that they can be used independently of fields
  # *
  # * @return {Mixed} error
  # */
  commit: ->
    @model.set(@key, @getValue(), { changeSource: "ui" } )

  # To support a future change to backbone.marionette based editors
  close: ->
    @remove()



# HIDDEN
class editors.Hidden extends editors.Base
  defaultValue: ''

  initialize: (options) ->
    super # Was: editors.Text.prototype.initialize.call(this, options);
    this.$el.attr('type', 'hidden');

  getValue: ->
    return this.value;

  setValue: ->
    this.value = value;


# TEXT
class editors.Text extends editors.Base
  tagName: 'input'
  defaultValue: ''
  events: {  'change': 'triggerChanged' }

  initialize: (options) ->
    super

    # Allow customising text type (email, phone etc.) for HTML5 browsers
    if (@schema && @schema.editorAttrs && @schema.editorAttrs.type)
      type = schema.editorAttrs.type;
    else if (@schema && @schema.dataType)
      type = @schema.dataType;
    else
      type = 'text';
    @$el.attr('type', type);

  getValue: ->
    return @$el.val()

  setValue: (value) ->
    if _.isUndefined( value )
      value = ""

    @$el.val(value)

  render: ->
    @setValue(this.value)
    return this



# **
# * NUMBER
# * Normal text input that only allows a number. Letters etc. are not entered
# */
class editors.Number extends editors.Text
  defaultValue: 0,

  events: {
  'keypress': 'onKeyPress',
  'change': 'triggerChanged'
  }

  initialize: (options) ->
    super
    @$el.attr('type', 'number')

    if validator = @getValidator()
      @$el.attr('min', validator.min) if !_.isUndefined(validator.min)
      @$el.attr('max', validator.max) if !_.isUndefined(validator.max)


  # Check value is numeric
  onKeyPress: (event) ->
    # Allow backspace
    return if (event.charCode == 0)

    # Get the whole new value so that we can prevent things like double decimals points etc.
    newVal = @$el.val() + String.fromCharCode(event.charCode);
    numeric = /^[0-9]*\.?[0-9]*?$/.test(newVal);

    if (!numeric)
      event.preventDefault()

  getValidator: ->
    if @options.schema and @options.schema.validators
      for v in @options.schema.validators when (_.isObject(v) and v.type == "number")
        return v

  getValue: ->
    value = @$el.val()
    if value == ""
      return null
    else
      return parseFloat(value, 10)


  setValue: (value) ->
    if value != null
      value = parseFloat(value, 10);
    super(value)

# **
# * PASSWORD
# *
class editors.Password extends editors.Text

  initialize: (options) ->
    super
    @$el.attr('type', 'password');


# **
# * TEXTAREA
# *
class editors.TextArea extends editors.Text
  tagName: 'textarea'


# **
# * CHECKBOX
# *
class editors.Checkbox extends editors.Base
  defaultValue: false,
  tagName: 'input',
  events: {  'change': 'triggerChanged' },

  initialize: (options) ->
    super
    @$el.attr('type', 'checkbox')

  getValue: ->
    return if @$el.prop('checked') then true else false

  setValue: (value) ->
    @$el.prop('checked', value == true)

  render: ->
    @setValue(this.value)
    return this
