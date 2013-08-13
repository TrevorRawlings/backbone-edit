editors = Backbone.Edit.editors

# requires http://www.sitepoint.com/blogs/2009/07/29/build-auto-expanding-textarea-1/


class editors.AutoSizeTextArea extends editors.TextArea
  className: "autoSizeTextArea"

  updateHeight: ->
    if @isActive
      @$el.TextAreaExpander(50, 200)

  onShow: ->
    super
    @updateHeight()

  setValue: ->
    super
    @updateHeight()

  render: ->
    super
    @updateHeight()
    return this;
