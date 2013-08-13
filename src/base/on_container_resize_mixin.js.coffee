class Backbone.Edit.OnContainerResizeMixin extends Backbone.Edit.Mixin

  # on_container_resize()
  # ---------------------
  #
  # details
  #   widthChanged:  true / false
  #   heightChanged: true / false
  #
  # on_container_resize: (details) ->

  _container_resize: ->
    details = { widthChanged: false, heightChanged: false }

    if @container_previous_width != @container.width()
      details.widthChanged  = true
      details.previous_width = @container_previous_width
      details.new_width = @container.width()
      @container_previous_width = details.new_width


    if @container_previous_height != @container.height()
      details.heightChanged = true
      details.previous_height = @container_previous_height
      details.new_height = @container.height()
      @container_previous_height = details.new_height


    if details.widthChanged or details.heightChanged
      @on_container_resize(details)


  setContainer: (value) ->
    if !@_container_bindAll
      @_container_bindAll = true
      _.bindAll(this, '_container_resize')

    if @container != value
      if @container
        @container.off('resize', @_container_resize)

      @container = value
      if @container
        @container_previous_width = null
        @container_previous_height = null
        @container.on('resize', @_container_resize)
        @_container_resize()
