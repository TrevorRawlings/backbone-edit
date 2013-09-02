# Add soft delete to classes derived from Backbone.Model
class Backbone.Edit.SoftDeleteMixin extends Backbone.Edit.Mixin

  initializeSoftDelete: ->
    #Listen for changes that may effect isDeleted
    this.on('change:deleted_at change:_destroy', this.on_checkDeleted, this);

  isDeleted: ->
    (@has("deleted_at") or @has("_destroy"))

  isActive: ->
    !@isDeleted()

  on_checkDeleted: ->
    newValue = @isDeleted()
    if newValue != @previousDeleted
      @previousDeleted = newValue
      @trigger("change:isDeleted", this, newValue, {})

  # Override for method in backbone.js
  #
  # Eggrack models once saved to the server are never actually deleted.  As a result we
  # only want to trigger the 'destory' event for new unsaved models.
  destroy: (options)->
    if @isNew()
      # Backbone relational listens for this event and uses it as a signal to release
      # references to this model.  It will:
      #   * remove the model from the store
      #   * clear any relations that point to this model
      @trigger('destroy', this, this.collection, options);

    else
      # 'Destroy' needs to be forwarded to the server.  Server will then set the deleted_at
      # and deleted_by fields
      @set("_destroy", true, options)