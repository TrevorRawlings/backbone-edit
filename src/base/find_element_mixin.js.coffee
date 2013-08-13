Backbone.Edit = {} if !Backbone.Edit

# A simple mixin implementation.
#
# Some more complex alteratives:
# * http://arcturo.github.com/library/coffeescript/03_classes.html
# * https://gist.github.com/993415
# * https://github.com/kmalakoff/mixin

class Backbone.Edit.Mixin

Backbone.Edit.Mixin.add_to = (object) ->
  for key, value of this.prototype when key not in ["constructor"]
    # Assign properties to the prototype
    object.prototype[key] = value


class Backbone.Edit.FindElementMixin extends Backbone.Edit.Mixin

  # Searches the tree of html nodes below the view item. An error is raised if the number found is not equal to 1
  # http://api.jquery.com/find/
  findElement: (search) ->
    elements = @$(search)
    if elements.length != 1
      throw "element #{search} found #{elements.length} times (expected 1 instance)"
    else
    return $(elements[0])

  # Searches on the direct children of the current node. An error is raised if the number found is not equal to 1
  # http://api.jquery.com/children/
  findChildElement: (search) ->
    elements = @$el.children(search)
    if elements.length != 1
      throw "element #{search} found #{elements.length} times (expected 1 instance)"
    else
    return $(elements[0])