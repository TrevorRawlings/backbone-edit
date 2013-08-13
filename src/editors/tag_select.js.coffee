editors = Backbone.Edit.editors

# Requires: http://harvesthq.github.com/chosen/

# SELECT
#
# Renders a <select> with given options
#
# Requires an 'options' value on the schema.
#  Can be an array of options, a function that calls back with the array of options, a string of HTML
#  or a Backbone collection. If a collection, the models must implement a toString() method
#
class editors.TagSelect extends editors.Select2Base
  tagName: 'input'

  events: { 'change': 'on_ui_selection_changed' }

  initialize: (options) ->
    _.bindAll(this, 'getTags_query', 'jsEditor_initSelection', 'createSearchChoice')
    @check_options(options)
    super
    @setValue(@value)


  check_options: (options) ->
    for required in ['tag_collection_class', 'selected_collection_class']
      throw "options.#{required} is required" if !@options[required]

    for key in ['tag_collection_class', 'selected_collection_class', 'tag_model_class', 'selected_model_class'] when _.isString(@options[key])
      @options[key] = Backbone.Edit.helpers.getObjectByName(@options[key])

    @options.tag_model_class = @options.tag_collection_class.prototype.model if !@options.tag_model_class
    @options.selected_model_class = @options.selected_collection_class.prototype.model if !@options.selected_model_class

    @options.selected_obj_tag_key = @options.tag_model_class.prototype.modelType("singular") if !@options.selected_obj_tag_key


  # ------------------------------------------------------------------
  # jsEditor
  javascriptEditor: ->
    return true

  allow_deselect: ->
    return false

  jsEditor_options: ->
    options = super
    options.multiple = true
    options.query = @getTags_query
    options.createSearchChoice = @createSearchChoice
    options.initSelection = @jsEditor_initSelection
    return options

  jsEditor_construct: ->
    @$el.val("")
    super
    @$el.select2("val", @getSelectedTags_js())


  # called when Select2 is created to allow the user to initialize the selection based
  # on the value of the element select2 is attached to. --BUT only called if element.val() is not empty
  jsEditor_initSelection: (element) ->
    throw "jsEditor_initSelection: not expecting this to get called"
    #return @getSelectedTags_js()


  jsEditor_handleChange: (type) ->
    if type == "selected"
      @$el.select2("val", @getSelectedTags_js(), {silent: @$el.select2("isFocused")})
    else
      super

  # --------------------------------------------------------
  # Tags
  # Expects a backbone collection of tag options that can be selected by the user
  #

  setOptions: (tags) ->
    @setTags(tags)

  setTags: (value, options = {}) ->
    throw "setTags: expected an Backbone.Collection" if !(value instanceof  @options.tag_collection_class)

    if (@tags != value) or options.force
      @tags.off(null, @on_tagsChanged, @) if @tags

      @_tags_js = null
      @tags = value
      @tags.on('add remove reset change', @on_tagsChanged, @)
      # Don't need to raise an event here as @_tags_js will automatically
      # get calculated next time it is required

  on_tagsChanged: ->
    # Don't need to raise an event here as @_tags_js will automatically
    # get recalucated next time it is required
    @_tags_js = null


  # getTags_query
  # -------------
  #
  # Called by select2 when user starts typing into the input box.  For speed uses a cached copy of the avaliable tags.
  # query.matcher() is provided by select2.
  #
  getTags_query: (query) ->
    term = _.string.trim(query.term)
    filtered = {}
    filtered.results = (tab_object for tab_object in @getTagObjects() when term == "" or query.matcher(term, tab_object.text) )
    query.callback(filtered);


  # getTagObjects
  # --------------
  #
  # A cached copy of @tags in the format required by getTags_query()
  getTagObjects: ->
    if !@_tags_js
      @_tags_js = []

      throw "@tags or @selectedTags not set" if !@tags or !@selectedTags
      for model in @tags.models when !model.isDeleted()
        @_tags_js.push(@getTagObject(model))

    return @_tags_js


  # returns a javascript object in the format expected by select2
  getTagObject: (model) ->
    throw "getTag_object: model is not of the correct type" if !(model instanceof @options.tag_model_class)
    return { id: model.cid, text: @getItemLabel(model), model: model }



  findOrCreateTagObject: (model) ->
    iterator = (item) -> item.model == model
    object = _.find(@_tags_js, iterator)        # first search the existing items
    object = @getTagObject(model) if !object
    return object


  # createTag
  # ----------
  #
  # helper method for findOrCreateTag(). Override if special handing is required when creating tags.
  #
  createTag: (text) ->
    return new @options.tag_model_class({ name: text, asset_type: "Animal" })


  findTag: (text) ->
    search = _.string.trim(text).toLowerCase()
    for model in @tags.models when _.string.trim(model.get("name")).toLowerCase() == search
      return model
    return null

  # findOrCreateTag
  # ---------------
  #
  # returns a backbone model of type @options.tag_model_class. Used by updateCollection when updaing the backbone
  # collection after the user has added a tag through the user interface
  #
  findOrCreateTag: (text) ->
    tag = @findTag(text)
    tag = @createTag(_.string.trim(text)) if !tag
    return tag


  # createSearchChoice
  # ------------------
  #
  # Called by select2, creates a new selectable choice from user's search term. Allows creation of choices not available
  # via the query function.
  #
  # args:
  #   term	string	Search string entered by user
  #   <returns>	object (optional)	Object representing the new choice. Must at least contain an id attribute.
  #
  # If the function returns undefined or null no choice will be created. If a new choice is created it is displayed first
  # in the selection list so that user may select it by simply pressing enter.
  #
  createSearchChoice: (term, results)   ->
    text = _.string.trim(term).substring(0, 50)
    if text == ""
      return null  # Prevent creation of empty tages
    if @findTag(text) != null
      return null  # Prevent duplicate menu items
    else
      return { id: _.uniqueId('c'), text: text }


  # ------------------------------------------------------------------
  # Selected tags
  # Expects a backbone collection

  getValue: ->
    return @selectedTags

  setValue: (value) ->
    @setSelectedTags(value)

  setSelectedTags: (value, options = {}) ->
    throw "setSelectedTags: expected an Backbone.Collection" if !(value instanceof @options.selected_collection_class)

    if (@selectedTags != value) or options.force
      @selectedTags.off(null, @on_selectedTagsChanged, @) if @selectedTags

      # also need to clear @_tags_js here bacause some of the items may have been
      # dummy items that are missing from the actual @tags collection
      @_selectedTags_js = null
      @_tags_js = null

      @selectedTags = value
      @selectedTags.on('add remove reset change', @on_selectedTagsChanged, @)
      @jsEditor_notifyChange("selected")

  # returns an array in the format expected by select2
  getSelectedTags_js: ->
    if !@_selectedTags_js
      @_selectedTags_js = []

      throw "@selectedTags not set" if !@selectedTags
      for selected in @selectedTags.models when !selected.isDeleted()
        tag_model = selected.get(@options.selected_obj_tag_key)
        tag_object = @findOrCreateTagObject(tag_model)
        tag_object.sortBy = selected.id
        @_selectedTags_js.push(tag_object)

      _.sortBy(@_selectedTags_js, 'sortBy')
      @_selectedTags_js.reverse()

    return @_selectedTags_js


  on_selectedTagsChanged: ->
    return if @EditorApplyingValue
    @_selectedTags_js = null

    @jsEditor_notifyChange("selected")


  # ------------------------------------------------------------------
  # Events

  on_ui_selection_changed: ->
    return if @updatingJavascriptEditor
    @updateCollection()


  # -----------------------------------------------------------------------
  # updateCollection
  # Called when the ui changes, copies changes into backbone collection
  #

  updateCollection: ->
    throw "Already applying value" if @EditorApplyingValue

    try
      @applyingValue_start()

      ui_selected_tags = []

      for choice in @$el.select2('container').find('.select2-search-choice')
        tag_object = $(choice).data("select2Data")
        tag_object.model = @findOrCreateTag(tag_object.text) if !tag_object.model
        ui_selected_tags.push(tag_object.model)

      ui_selected_tags = _.unique(ui_selected_tags) # Produces a duplicate-free version of the array
      tags_to_add = []      # an array of tag_model_class items
      items_to_remove = []   # an array of selected_model_class items

      # loop through items in ui_selected_tags looking for items that are missing from @selectedTags.
      # Missing items need to be added to tags_to_add
      for selected_tag in ui_selected_tags
        where = (model) ->
          return model.get(@options.selected_obj_tag_key) == selected_tag
        if !@selectedTags.find(where, this)
          tags_to_add.push(selected_tag)

      # loop through all the items in the backbone collection looking for items nolonger selected by the ui.  missing
      # items need to be removed from the collection
      for selected in @selectedTags.models
        tag_model = selected.get(@options.selected_obj_tag_key)
        items_to_remove.push(selected) if _.indexOf(ui_selected_tags, tag_model) == -1

      # todo: it would be good to suspend save while we do the next part:
      for item in items_to_remove
        item.destroy({changeSource: "ui"})

      for item in tags_to_add
        attrs = {}
        attrs[@options.selected_obj_tag_key] = item
        new_selected = new @options.selected_model_class(attrs)
        @selectedTags.add(new_selected, {changeSource: "ui"})

    finally
      @applyingValue_finish()

  applyingValue_start: ->
    throw "asset_labels: applyingValue_start: Already applying value" if @EditorApplyingValue

    # the collection will automatically trigger an 'add' event
    # which will result in @on_assetLabelsChanged() being called
    # Setting EditorApplyingValue causes the event to be ignored
    @EditorApplyingValue = true

    # Notify our parent - this will stop circular calls if this editor is being used within a slickgrid
    @trigger("applyingValue:start")


  applyingValue_finish: ->
    throw "slickgrid_view: applyingValue_finish: Not set" if !@EditorApplyingValue
    @EditorApplyingValue = false

    # Notify our parent:
    @trigger("applyingValue:finish")


  # --------------------------------------------------------------------

  render: ->
    this
