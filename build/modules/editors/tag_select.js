(function() {
  var editors, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  editors = Backbone.Edit.editors;

  editors.TagSelect = (function(_super) {
    __extends(TagSelect, _super);

    function TagSelect() {
      _ref = TagSelect.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    TagSelect.prototype.tagName = 'input';

    TagSelect.prototype.events = {
      'change': 'on_ui_selection_changed'
    };

    TagSelect.prototype.initialize = function(options) {
      _.bindAll(this, 'getTags_query', 'jsEditor_initSelection', 'createSearchChoice');
      this.check_options(options);
      TagSelect.__super__.initialize.apply(this, arguments);
      return this.setValue(this.value);
    };

    TagSelect.prototype.check_options = function(options) {
      var key, required, _i, _j, _len, _len1, _ref1, _ref2;
      _ref1 = ['tag_collection_class', 'selected_collection_class'];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        required = _ref1[_i];
        if (!this.options[required]) {
          throw "options." + required + " is required";
        }
      }
      _ref2 = ['tag_collection_class', 'selected_collection_class', 'tag_model_class', 'selected_model_class'];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        key = _ref2[_j];
        if (_.isString(this.options[key])) {
          this.options[key] = Backbone.Edit.helpers.getObjectByName(this.options[key]);
        }
      }
      if (!this.options.tag_model_class) {
        this.options.tag_model_class = this.options.tag_collection_class.prototype.model;
      }
      if (!this.options.selected_model_class) {
        this.options.selected_model_class = this.options.selected_collection_class.prototype.model;
      }
      if (!this.options.selected_obj_tag_key) {
        return this.options.selected_obj_tag_key = this.options.tag_model_class.prototype.modelType("singular");
      }
    };

    TagSelect.prototype.javascriptEditor = function() {
      return true;
    };

    TagSelect.prototype.allow_deselect = function() {
      return false;
    };

    TagSelect.prototype.jsEditor_options = function() {
      var options;
      options = TagSelect.__super__.jsEditor_options.apply(this, arguments);
      options.multiple = true;
      options.query = this.getTags_query;
      options.createSearchChoice = this.createSearchChoice;
      options.initSelection = this.jsEditor_initSelection;
      return options;
    };

    TagSelect.prototype.jsEditor_construct = function() {
      this.$el.val("");
      TagSelect.__super__.jsEditor_construct.apply(this, arguments);
      return this.$el.select2("val", this.getSelectedTags_js());
    };

    TagSelect.prototype.jsEditor_initSelection = function(element) {
      throw "jsEditor_initSelection: not expecting this to get called";
    };

    TagSelect.prototype.jsEditor_handleChange = function(type) {
      if (type === "selected") {
        return this.$el.select2("val", this.getSelectedTags_js(), {
          silent: this.$el.select2("isFocused")
        });
      } else {
        return TagSelect.__super__.jsEditor_handleChange.apply(this, arguments);
      }
    };

    TagSelect.prototype.setOptions = function(tags) {
      return this.setTags(tags);
    };

    TagSelect.prototype.setTags = function(value, options) {
      if (options == null) {
        options = {};
      }
      if (!(value instanceof this.options.tag_collection_class)) {
        throw "setTags: expected an Backbone.Collection";
      }
      if ((this.tags !== value) || options.force) {
        if (this.tags) {
          this.tags.off(null, this.on_tagsChanged, this);
        }
        this._tags_js = null;
        this.tags = value;
        return this.tags.on('add remove reset change', this.on_tagsChanged, this);
      }
    };

    TagSelect.prototype.on_tagsChanged = function() {
      return this._tags_js = null;
    };

    TagSelect.prototype.getTags_query = function(query) {
      var filtered, tab_object, term;
      term = _.string.trim(query.term);
      filtered = {};
      filtered.results = (function() {
        var _i, _len, _ref1, _results;
        _ref1 = this.getTagObjects();
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          tab_object = _ref1[_i];
          if (term === "" || query.matcher(term, tab_object.text)) {
            _results.push(tab_object);
          }
        }
        return _results;
      }).call(this);
      return query.callback(filtered);
    };

    TagSelect.prototype.getTagObjects = function() {
      var model, _i, _len, _ref1;
      if (!this._tags_js) {
        this._tags_js = [];
        if (!this.tags || !this.selectedTags) {
          throw "@tags or @selectedTags not set";
        }
        _ref1 = this.tags.models;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          model = _ref1[_i];
          if (!model.isDeleted()) {
            this._tags_js.push(this.getTagObject(model));
          }
        }
      }
      return this._tags_js;
    };

    TagSelect.prototype.getTagObject = function(model) {
      if (!(model instanceof this.options.tag_model_class)) {
        throw "getTag_object: model is not of the correct type";
      }
      return {
        id: model.cid,
        text: this.getItemLabel(model),
        model: model
      };
    };

    TagSelect.prototype.findOrCreateTagObject = function(model) {
      var iterator, object;
      iterator = function(item) {
        return item.model === model;
      };
      object = _.find(this._tags_js, iterator);
      if (!object) {
        object = this.getTagObject(model);
      }
      return object;
    };

    TagSelect.prototype.createTag = function(text) {
      return new this.options.tag_model_class({
        name: text,
        asset_type: "Animal"
      });
    };

    TagSelect.prototype.findTag = function(text) {
      var model, search, _i, _len, _ref1;
      search = _.string.trim(text).toLowerCase();
      _ref1 = this.tags.models;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        model = _ref1[_i];
        if (_.string.trim(model.get("name")).toLowerCase() === search) {
          return model;
        }
      }
      return null;
    };

    TagSelect.prototype.findOrCreateTag = function(text) {
      var tag;
      tag = this.findTag(text);
      if (!tag) {
        tag = this.createTag(_.string.trim(text));
      }
      return tag;
    };

    TagSelect.prototype.createSearchChoice = function(term, results) {
      var text;
      text = _.string.trim(term).substring(0, 50);
      if (text === "") {
        return null;
      }
      if (this.findTag(text) !== null) {
        return null;
      } else {
        return {
          id: _.uniqueId('c'),
          text: text
        };
      }
    };

    TagSelect.prototype.getValue = function() {
      return this.selectedTags;
    };

    TagSelect.prototype.setValue = function(value) {
      return this.setSelectedTags(value);
    };

    TagSelect.prototype.setSelectedTags = function(value, options) {
      if (options == null) {
        options = {};
      }
      if (!(value instanceof this.options.selected_collection_class)) {
        throw "setSelectedTags: expected an Backbone.Collection";
      }
      if ((this.selectedTags !== value) || options.force) {
        if (this.selectedTags) {
          this.selectedTags.off(null, this.on_selectedTagsChanged, this);
        }
        this._selectedTags_js = null;
        this._tags_js = null;
        this.selectedTags = value;
        this.selectedTags.on('add remove reset change', this.on_selectedTagsChanged, this);
        return this.jsEditor_notifyChange("selected");
      }
    };

    TagSelect.prototype.getSelectedTags_js = function() {
      var selected, tag_model, tag_object, _i, _len, _ref1;
      if (!this._selectedTags_js) {
        this._selectedTags_js = [];
        if (!this.selectedTags) {
          throw "@selectedTags not set";
        }
        _ref1 = this.selectedTags.models;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          selected = _ref1[_i];
          if (!(!selected.isDeleted())) {
            continue;
          }
          tag_model = selected.get(this.options.selected_obj_tag_key);
          tag_object = this.findOrCreateTagObject(tag_model);
          tag_object.sortBy = selected.id;
          this._selectedTags_js.push(tag_object);
        }
        _.sortBy(this._selectedTags_js, 'sortBy');
        this._selectedTags_js.reverse();
      }
      return this._selectedTags_js;
    };

    TagSelect.prototype.on_selectedTagsChanged = function() {
      if (this.EditorApplyingValue) {
        return;
      }
      this._selectedTags_js = null;
      return this.jsEditor_notifyChange("selected");
    };

    TagSelect.prototype.on_ui_selection_changed = function() {
      if (this.updatingJavascriptEditor) {
        return;
      }
      return this.updateCollection();
    };

    TagSelect.prototype.updateCollection = function() {
      var attrs, choice, item, items_to_remove, new_selected, selected, selected_tag, tag_model, tag_object, tags_to_add, ui_selected_tags, where, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref1, _ref2, _results;
      if (this.EditorApplyingValue) {
        throw "Already applying value";
      }
      try {
        this.applyingValue_start();
        ui_selected_tags = [];
        _ref1 = this.$el.select2('container').find('.select2-search-choice');
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          choice = _ref1[_i];
          tag_object = $(choice).data("select2Data");
          if (!tag_object.model) {
            tag_object.model = this.findOrCreateTag(tag_object.text);
          }
          ui_selected_tags.push(tag_object.model);
        }
        ui_selected_tags = _.unique(ui_selected_tags);
        tags_to_add = [];
        items_to_remove = [];
        for (_j = 0, _len1 = ui_selected_tags.length; _j < _len1; _j++) {
          selected_tag = ui_selected_tags[_j];
          where = function(model) {
            return model.get(this.options.selected_obj_tag_key) === selected_tag;
          };
          if (!this.selectedTags.find(where, this)) {
            tags_to_add.push(selected_tag);
          }
        }
        _ref2 = this.selectedTags.models;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          selected = _ref2[_k];
          tag_model = selected.get(this.options.selected_obj_tag_key);
          if (_.indexOf(ui_selected_tags, tag_model) === -1) {
            items_to_remove.push(selected);
          }
        }
        for (_l = 0, _len3 = items_to_remove.length; _l < _len3; _l++) {
          item = items_to_remove[_l];
          item.destroy({
            changeSource: "ui"
          });
        }
        _results = [];
        for (_m = 0, _len4 = tags_to_add.length; _m < _len4; _m++) {
          item = tags_to_add[_m];
          attrs = {};
          attrs[this.options.selected_obj_tag_key] = item;
          new_selected = new this.options.selected_model_class(attrs);
          _results.push(this.selectedTags.add(new_selected, {
            changeSource: "ui"
          }));
        }
        return _results;
      } finally {
        this.applyingValue_finish();
      }
    };

    TagSelect.prototype.applyingValue_start = function() {
      if (this.EditorApplyingValue) {
        throw "asset_labels: applyingValue_start: Already applying value";
      }
      this.EditorApplyingValue = true;
      return this.trigger("applyingValue:start");
    };

    TagSelect.prototype.applyingValue_finish = function() {
      if (!this.EditorApplyingValue) {
        throw "slickgrid_view: applyingValue_finish: Not set";
      }
      this.EditorApplyingValue = false;
      return this.trigger("applyingValue:finish");
    };

    TagSelect.prototype.render = function() {
      return this;
    };

    return TagSelect;

  })(editors.Select2Base);

}).call(this);
