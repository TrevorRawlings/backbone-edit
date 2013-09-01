
if !Backbone.Edit.TestHelpers
  Backbone.Edit.TestHelpers = {}

if !Backbone.Edit.TestHelpers.Forms
  Backbone.Edit.TestHelpers.Forms = {}

TestHelpers = Backbone.Edit.TestHelpers

# check_elements
# ------------
#
# details object
#   elements
#     []
#       tag         - html tag (input, textarea, ...)
#       name        - element name
#       placeholder - element placeholder text
#       count       - defaults to 1
#
TestHelpers.Forms.check_elements = (view, details) ->
  tag_types = ['select', 'input', 'textarea']

  #
  # check the details object
  #
  for key in ['elements'] when _.isUndefined(details[key])
    throw "expected key '#{key}'"

  # and check the element keys
  throw "expected an array" if !_.isArray(details.elements)
  for element in details.elements
    for key in ['tag', 'name', 'placeholder'] when !_.isString(element[key])
      throw "expected #{key} to be a string"

  #
  # Check that the form has the expected number of each kind of tag:
  #
  expected_count = {}
  expected_count[tag] = 0 for tag in tag_types

  for element in details.elements
    throw "expected tag type #{element.tag}" if _.indexOf(tag_types, element.tag) == -1
    expected_count[element.tag] = expected_count[element.tag] + 1


  for tag in tag_types
    # need to ignore inputs that have a parent '.select2-container'
    adjusted_count = 0
    $elements = view.$(tag)
    if tag == 'input'
      for element in $elements when $(element).closest('.select2-container').length == 0
        adjusted_count = adjusted_count + 1
    else
      adjusted_count = $elements.length

    if adjusted_count != expected_count[tag]
      expect( "expected #{expected_count[tag]} #{tag} elements but found #{adjusted_count}" ).toEqual(false)

  #
  # and now check each of the elements
  #
  for element in details.elements
    $element = view.$("#{element.tag}[name=#{element.name}]")
    expect( $element.length ).toEqual(element.count || 1)
    expect( $element.attr('placeholder') ).toEqual(element.placeholder)
    if element.name == 'asset_labels'
      TestHelpers.TagSelect.Element.check_selected_value($element, element.value)
    else
      expect( $element.val() ).toEqual(element.value)
    #    if $element.val() != element.value
    #      expect( false ).toEqual("expected element #{element.name} to equal #{element.value} but got #{$element.val()}")





  # details
  #   - text
  #   - isPlaceholder:  (defaults tofalse)
TestHelpers.Forms.check_js_select_text = (field, details) ->
    details = _.defaults(details, {isPlaceholder: false})

    if Backbone.Edit.categorizr.isDesktop
      expect( field.$('.select2-container').length ).toEqual( 1 )
      expect( field.$('.select2-container a.select2-choice span').text()).toEqual(details.text)

      # Makes the text appear grayed out
      expect( field.$('.select2-container a.select2-choice').hasClass('select2-default') ).toEqual(details.isPlaceholder)

    else
      expect( field.$('.select2-container').length ).toEqual( 0 )


TestHelpers.Forms.check_js_select_has_been_created = (field) ->
    $container = field.$('.select2-container')
    expect( $container.hasClass("select2-container-multi") ).toEqual(false)

    if Backbone.Edit.categorizr.isDesktop
      expect( $container.length ).toEqual(1)
    else
      expect( $container.length ).toEqual(0)


# ---------------------------------------------------------------------------
# Testing of selects
#
# editors.base
#  |->  OptionSelect
#  |     |->  Select2Base
#  |     |     |->  TagSelect             (asset labels)
#  |     |     |->  Select                (ordinary drop down - includes support for add new)
#  |     |           |->  GroupedSelect   (animal stock / breed )
#        |->  Radio


TestHelpers.Select = {} if !TestHelpers.Select
TestHelpers.Select.Field = {} if !TestHelpers.Select.Field
TestHelpers.Select.Element = {} if !TestHelpers.Select.Element



# Field.check_options
# -------------------
#
# details
#    { expected_options: [16, 17],         "model_class": "TestApp.Models.Label"  }
#    { expected_options: ["sell", "keep"]                                           }
#
TestHelpers.Select.Field.check_options = (field, details) ->

  TestHelpers.Select.Element.check_html_options(field.$('select'), details)

  if Backbone.Edit.categorizr.isDesktop
    TestHelpers.Select.Element.check_js_options(field.$('select'), details)



# details:
#  { expected_options: [16, 17],         "model_class": "TestApp.Models.Label"  }
#  { expected_options: ["sell", "keep"]                                           }
#
TestHelpers.Select.Element.check_html_options = ($select, details) ->

  if _.isNull(details)
    details = { expected_options: []}

  # If id's have been supplied then we need to turn them in model references
  details.expected_options = ids_to_models(details.model_class, details.expected_options)

  results_as_text = []
  results_as_models = []
  for option in $options = $select.find("option")
    $option = $(option)
    results_as_models.push($option.data("value"))
    results_as_text.push(_.string.clean($option.text()))

  expect( details.expected_options.length ).toEqual( results_as_text.length )
  expect( details.expected_options.length ).toEqual( results_as_models.length )

  for expected in details.expected_options
    if _.isString(expected)
      expect( _.contains(results_as_text, expected) or _.contains(results_as_text, "[#{expected}]") ).toEqual(true)
    else if expected instanceof Backbone.Model
      expect( _.contains(results_as_models, expected) ).toEqual(true)
    else
      "invalid type"

# details:
#  { expected_options: [16, 17],         "model_class": "TestApp.Models.Label"  }
#  { expected_options: ["sell", "keep"]                                           }
#
TestHelpers.Select.Element.check_js_options = ($select, details) ->

  if _.isNull(details)
    details = { expected_options: []}

  # If id's have been supplied then we need to turn them in model references
  details.expected_options = ids_to_models(details.model_class, details.expected_options)

  $select.select2("focus")
  $select.select2("open")

  $dropdown = $('.select2-drop.select2-drop-active')
  expect($dropdown.length).toEqual(1)

  results_as_text = []
  results_as_models = []
  for result in $dropdown.find('.select2-result')
    $result = $(result)
    if !$result.hasClass("select2-disabled") and !$result.hasClass("select2-no-results")
      results_as_models.push($(result).data("select2Data").model)
      results_as_text.push(_.string.clean($result.text()))

  expect( details.expected_options.length ).toEqual( results_as_text.length )
  expect( details.expected_options.length ).toEqual( results_as_models.length )

  for expected in details.expected_options
    if _.isString(expected)
      expect( _.contains(results_as_text, expected) ).toEqual(true)
    else if expected instanceof Backbone.Model
      expect( _.contains(results_as_models, expected) ).toEqual(true)
    else
      "invalid type"



TestHelpers.Select.Element.select_option = ($select, value) ->

  if Backbone.Edit.categorizr.isDesktop
    $select.select2('focus')
    $select.select2('open')

    $results = ($(result) for result in $('.select2-result'))
    for $result in $results when !$result.hasClass('select2-disabled') and $result.data('select2Data').id == value
      $result.click()
      return

    throw "value was not found"
  else
    $('select').val(value)
    $('select').change()


TestHelpers.TagSelect = {} if !TestHelpers.TagSelect
TestHelpers.TagSelect.Field = {} if !TestHelpers.TagSelect.Field
TestHelpers.TagSelect.Element = {} if !TestHelpers.TagSelect.Element


TestHelpers.TagSelect.Field.check_js_editor_has_been_created = (field) ->
    $container = field.$('.select2-container')
    expect( $container.length ).toEqual(1)
    expect( $container.hasClass("select2-container-multi") ).toEqual(true)



# Field.check_selected_value
# --------------------------
#
# details
#  {  expected_values: [16, 17],           "model_class": "TestApp.Models.Label" }
#  {  expected_values: ["sell", "keep"],                                           }
#
TestHelpers.TagSelect.Field.check_selected_value = (field, details) ->

  # (1) Check what has been rendered to screen:
  TestHelpers.TagSelect.Element.check_selected_value(field.$('input'), details)

  # (2) Check the items in the backbone collection
  selected_as_text = []
  selected_as_models = []
  for model in field.editors[0].getValue().models when !model.isDeleted()
    selected_as_text.push( field.editors[0].getItemLabel( model ) )
    selected_as_models.push( model.get("label") )

  expect( selected_as_text.length   ).toEqual( details.expected_values.length )
  expect( selected_as_models.length ).toEqual( details.expected_values.length )
  for expected in details.expected_values
    if _.isString(expected)
      expect( _.contains(selected_as_text, expected) ).toEqual(true)
    else if expected instanceof Backbone.Model
      expect( _.contains(selected_as_models, expected) ).toEqual(true)
    else
      "invalid type"


# Field.check_options
# -------------------
#
# details
#    { expected_options: [16, 17],         "model_class": "TestApp.Models.Label"  }
#    { expected_options: ["sell", "keep"]                                           }
#
TestHelpers.TagSelect.Field.check_options = (field, details) ->

  # (1) Check what has been rendered to screen:
  TestHelpers.TagSelect.Element.check_options(field.$('input'), details)

  # (2) Check the items in the backbone collection
  #  options_as_text = []
  #  options_as_models = []
  #  for model in field.editor.getTags().models when !model.isDeleted()
  #    selected_as_text.push( field.editor.getItemLabel( model ) )
  #    selected_as_models.push( model )




ids_to_models = (model_class, items) ->
  model_class = Backbone.Relational.store.getObjectByName(model_class) if _.isString(model_class)
  items = [items] if !_.isArray(items)

  converted = []
  for item in items
    if _.isNumber(item)
      converted.push(model_class.findOrCreate(item))
    else
      converted.push(item)
  return converted




# details:
#  { "model_class": "TestApp.Models.Label", expected_values: [16, 17] }
TestHelpers.TagSelect.Element.check_selected_value = ($input, details) ->
  $container = $input.closest('.controls').find('.select2-container.select2-container-multi')
  expect( $container.length ).toEqual(1)

  if _.isNull(details)
    details = { expected_values: []}

  # If id's have been supplied then we need to turn them in model references
  details.expected_values = ids_to_models(details.model_class, details.expected_values)


  selected_as_text = []
  selected_as_models = []
  for choice in $container.find('.select2-search-choice')
    $choice = $(choice)
    selected_as_text.push(   $choice.text() )
    selected_as_models.push( $choice.data("select2Data").model )

  expect( details.expected_values.length ).toEqual( selected_as_text.length )
  expect( details.expected_values.length ).toEqual( selected_as_models.length )

  for expected in details.expected_values
    if _.isString(expected)
      expect( _.contains(selected_as_text, expected) ).toEqual(true)
    else if expected instanceof Backbone.Model
      expect( _.contains(selected_as_models, expected) ).toEqual(true)
    else
      "invalid type"



# details:
#  { expected_options: [16, 17],         "model_class": "TestApp.Models.Label"  }
#  { expected_options: ["sell", "keep"]                                           }
#
TestHelpers.TagSelect.Element.check_options = ($input, details) ->
  $container = $input.closest('.controls').find('.select2-container.select2-container-multi')
  expect( $container.length ).toEqual(1)

  if _.isNull(details)
    details = { expected_options: []}

  # If id's have been supplied then we need to turn them in model references
  details.expected_options = ids_to_models(details.model_class, details.expected_options)


  $input.select2("focus")
  $input.select2("open")

  results_as_text = []
  results_as_models = []
  for result in $('.select2-result')
    $result = $(result)
    if !$result.hasClass("select2-disabled") and !$result.hasClass("select2-no-results")
      results_as_models.push($(result).data("select2Data").model)
      results_as_text.push($result.text())

  expect( details.expected_options.length ).toEqual( results_as_text.length )
  expect( details.expected_options.length ).toEqual( results_as_models.length )

  for expected in details.expected_options
    if _.isString(expected)
      expect( _.contains(results_as_text, expected) ).toEqual(true)
    else if expected instanceof Backbone.Model
      expect( _.contains(results_as_models, expected) ).toEqual(true)
    else
      "invalid type"



#  { "model_class": "TestApp.Models.Label", select: 18 }
#  { "model_class": "TestApp.Models.Label", select: [18] }
TestHelpers.TagSelect.Element.select_models = ($input, details) ->
  $input.select2("focus")

  # If id's have been supplied then we need to turn them in model references
  details.select = ids_to_models(details.model_class, details.select)

  for model in details.select
    found = false
    $input.select2("open")
    $results = ($(result) for result in $('.select2-result'))
    for $result in $results when !found and !$result.hasClass('select2-disabled') and $result.data('select2Data').model == model
      found = true
      $result.click()

    expect("results did not contain model #{model.id}").toEqual(0) if !found



#  { "model_class": "TestApp.Models.Label", unselect: 18 }
#  { "model_class": "TestApp.Models.Label", unselect: [18] }
TestHelpers.TagSelect.Element.unselect_models = ($input, details) ->

  # If id's have been supplied then we need to turn them in model references
  details.unselect = ids_to_models(details.model_class, details.unselect)

  selected = $($('.select2-search-choice')).data('select2Data')

  $container = $input.closest('.controls').find('.select2-container')
  expect( $container.length ).toEqual(1)

  $selected = ($(selected) for selected in $container.find('.select2-result'))

  for model in details.unselect
    found = false
    for choice in $container.find('.select2-search-choice') when !found
      $choice = $(choice)
      if $choice.data('select2Data').model == model
        $choice.find('.select2-search-choice-close').click()
        found = true

    expect("choices did not contain model #{model.id}" ).toEqual(0) if !found
