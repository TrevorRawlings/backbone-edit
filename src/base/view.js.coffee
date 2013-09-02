

if _.isUndefined(Backbone.Marionette)
  hasMarionette = true
  viewBase = Backbone.Marionette.View
else
  hasMarionette = false
  viewBase = Backbone.View


# The view life cycle:
#
# 1) initialize:   View is created by calling the constructor which in turn calls initialize()
#
# 2) render:       render() in most cases should do most of the rendering of HTML elements and will normally be called
#                  before the element is added to the DOM
#
# 3) onShow:       Once added to the DOM show() should be called ... which in turn will call onShow(). Any extra setup
#                  that couldn't be done in render can be done in onShow().  Containers for UI components like SlickGrid
#                  have to be part of the DOM before they can be initialized and so are created in onShow().
#
# 4) onDeactivate: onDeactivate() Is called before the view is removed from the DOM.  This gives an opportunity for components
#                  like SlickGrid to be shutdown cleanly.  In this state the view may still be holding onto resources and
#                  listening to events. show() can be used to reactivate the view or close() can be called to cleanup
#                  resources the view is holding.
#
# 5) onClose:      Called in response to the close() method.  If the view is currently active then onDeactivate will be called
#                  before onClose.
#
#  Example usage
# --------------
#
#  view = new MyView()                     # constructor() ->  initialize()
#  $element.append(view.render().$el)      # render()
#  view.show()                             # show() --calls--> onShow()
#
#  <...application runs for a while...>
#
#  view.deactivate()                       # deactivate() --calls-->  onDeactivate(),
#  view.$el.detach()                       # view is still connected to rest of the app but isn't in the DOM. Can call show() or close()
#
#  <...application runs for a while...>
#
#  $element.append(view.$el)
#  view.show()                             # show() -> onShow()
#                                          # View is reactived
#
#  view.close()                            # close() -> onDeactivate()
#                                          #         -> onClose()
#
class Backbone.Edit.View extends viewBase

  # A method that can be overridden in derived classes
  onShow: (wasAlreadyActive) ->
    @_onShow_base_called = true             # Useful to detect when derrived classes forget to call super
    @trigger('view:onShow', wasAlreadyActive)

  # A method that can be overridden in derived classes
  onDeactivate: ->
    @_onDeactivate_base_called = true;     # Useful to detect when derrived classes forget to call super
    @trigger('deactivate', this);

  # A method that can be overridden in derived classes
  beforeClose: ->

  # A method that can be overridden in derived classes
  onClose: ->
    @_onClose_base_called = true



  show: ->
    if hasMarionette
      @isActive = false
      super
    else
      wasAlreadyActive = this.isActive
      @isActive = true;
      @_onShow_base_called = false;
      @onShow(wasAlreadyActive);
      if (!@_onShow_base_called)
        throw "onShow call chain is broken"

      if this.deactivated
        @delegateEvents()
        @deactivated = false


  deactivate: ->
    @isActive = false
    @_onDeactivate_base_called = false
    @onDeactivate()
    throw "onDeactivate call chain is broken" if !@_onDeactivate_base_called
    @deactivated = true


  close: ->
    @deactivate() if @isActive

    if hasMarionette
      super
      # Marionette allows closed views to be rendered .. which implies we don't want
      # stopListening() or off() calls here - but a lot of the views in Backbone.Edit
      # (e.g. the editors) rely on automatic releasing of events.
      @stopListening()
      @off()
    else
      @trigger('before:close')
      @beforeClose() if @beforeClose

      @remove();
      @stopListening()

      @_onClose_base_called = false;
      @onClose()
      throw "onClose call chain is broken" if !@_onClose_base_called

      @trigger('close', this)
      @off()