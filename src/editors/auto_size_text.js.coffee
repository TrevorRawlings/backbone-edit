editors = Backbone.Edit.editors

# requires http://www.sitepoint.com/blogs/2009/07/29/build-auto-expanding-textarea-1/


class editors.AutoSizeTextArea extends editors.TextArea
  className: "autoSizeTextArea"

  render: ->
    super
    this.$el.TextAreaExpander(50, 200)
    return this;
