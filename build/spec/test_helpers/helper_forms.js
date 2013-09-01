(function() {
  var TestHelpers, ids_to_models;

  if (!Backbone.Edit.TestHelpers) {
    Backbone.Edit.TestHelpers = {};
  }

  if (!Backbone.Edit.TestHelpers.Forms) {
    Backbone.Edit.TestHelpers.Forms = {};
  }

  TestHelpers = Backbone.Edit.TestHelpers;

  TestHelpers.Forms.check_elements = function(view, details) {
    var $element, $elements, adjusted_count, element, expected_count, key, tag, tag_types, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _len7, _m, _n, _o, _p, _ref, _ref1, _ref2, _ref3, _ref4, _results;
    tag_types = ['select', 'input', 'textarea'];
    _ref = ['elements'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      if (_.isUndefined(details[key])) {
        throw "expected key '" + key + "'";
      }
    }
    if (!_.isArray(details.elements)) {
      throw "expected an array";
    }
    _ref1 = details.elements;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      element = _ref1[_j];
      _ref2 = ['tag', 'name', 'placeholder'];
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        key = _ref2[_k];
        if (!_.isString(element[key])) {
          throw "expected " + key + " to be a string";
        }
      }
    }
    expected_count = {};
    for (_l = 0, _len3 = tag_types.length; _l < _len3; _l++) {
      tag = tag_types[_l];
      expected_count[tag] = 0;
    }
    _ref3 = details.elements;
    for (_m = 0, _len4 = _ref3.length; _m < _len4; _m++) {
      element = _ref3[_m];
      if (_.indexOf(tag_types, element.tag) === -1) {
        throw "expected tag type " + element.tag;
      }
      expected_count[element.tag] = expected_count[element.tag] + 1;
    }
    for (_n = 0, _len5 = tag_types.length; _n < _len5; _n++) {
      tag = tag_types[_n];
      adjusted_count = 0;
      $elements = view.$(tag);
      if (tag === 'input') {
        for (_o = 0, _len6 = $elements.length; _o < _len6; _o++) {
          element = $elements[_o];
          if ($(element).closest('.select2-container').length === 0) {
            adjusted_count = adjusted_count + 1;
          }
        }
      } else {
        adjusted_count = $elements.length;
      }
      if (adjusted_count !== expected_count[tag]) {
        expect("expected " + expected_count[tag] + " " + tag + " elements but found " + adjusted_count).toEqual(false);
      }
    }
    _ref4 = details.elements;
    _results = [];
    for (_p = 0, _len7 = _ref4.length; _p < _len7; _p++) {
      element = _ref4[_p];
      $element = view.$("" + element.tag + "[name=" + element.name + "]");
      expect($element.length).toEqual(element.count || 1);
      expect($element.attr('placeholder')).toEqual(element.placeholder);
      if (element.name === 'asset_labels') {
        _results.push(TestHelpers.TagSelect.Element.check_selected_value($element, element.value));
      } else {
        _results.push(expect($element.val()).toEqual(element.value));
      }
    }
    return _results;
  };

  TestHelpers.Forms.check_js_select_text = function(field, details) {
    details = _.defaults(details, {
      isPlaceholder: false
    });
    if (Backbone.Edit.categorizr.isDesktop) {
      expect(field.$('.select2-container').length).toEqual(1);
      expect(field.$('.select2-container a.select2-choice span').text()).toEqual(details.text);
      return expect(field.$('.select2-container a.select2-choice').hasClass('select2-default')).toEqual(details.isPlaceholder);
    } else {
      return expect(field.$('.select2-container').length).toEqual(0);
    }
  };

  TestHelpers.Forms.check_js_select_has_been_created = function(field) {
    var $container;
    $container = field.$('.select2-container');
    expect($container.hasClass("select2-container-multi")).toEqual(false);
    if (Backbone.Edit.categorizr.isDesktop) {
      return expect($container.length).toEqual(1);
    } else {
      return expect($container.length).toEqual(0);
    }
  };

  if (!TestHelpers.Select) {
    TestHelpers.Select = {};
  }

  if (!TestHelpers.Select.Field) {
    TestHelpers.Select.Field = {};
  }

  if (!TestHelpers.Select.Element) {
    TestHelpers.Select.Element = {};
  }

  TestHelpers.Select.Field.check_options = function(field, details) {
    TestHelpers.Select.Element.check_html_options(field.$('select'), details);
    if (Backbone.Edit.categorizr.isDesktop) {
      return TestHelpers.Select.Element.check_js_options(field.$('select'), details);
    }
  };

  TestHelpers.Select.Element.check_html_options = function($select, details) {
    var $option, $options, expected, option, results_as_models, results_as_text, _i, _j, _len, _len1, _ref, _ref1, _results;
    if (_.isNull(details)) {
      details = {
        expected_options: []
      };
    }
    details.expected_options = ids_to_models(details.model_class, details.expected_options);
    results_as_text = [];
    results_as_models = [];
    _ref = $options = $select.find("option");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      option = _ref[_i];
      $option = $(option);
      results_as_models.push($option.data("value"));
      results_as_text.push(_.string.clean($option.text()));
    }
    expect(details.expected_options.length).toEqual(results_as_text.length);
    expect(details.expected_options.length).toEqual(results_as_models.length);
    _ref1 = details.expected_options;
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      expected = _ref1[_j];
      if (_.isString(expected)) {
        _results.push(expect(_.contains(results_as_text, expected) || _.contains(results_as_text, "[" + expected + "]")).toEqual(true));
      } else if (expected instanceof Backbone.Model) {
        _results.push(expect(_.contains(results_as_models, expected)).toEqual(true));
      } else {
        _results.push("invalid type");
      }
    }
    return _results;
  };

  TestHelpers.Select.Element.check_js_options = function($select, details) {
    var $dropdown, $result, expected, result, results_as_models, results_as_text, _i, _j, _len, _len1, _ref, _ref1, _results;
    if (_.isNull(details)) {
      details = {
        expected_options: []
      };
    }
    details.expected_options = ids_to_models(details.model_class, details.expected_options);
    $select.select2("focus");
    $select.select2("open");
    $dropdown = $('.select2-drop.select2-drop-active');
    expect($dropdown.length).toEqual(1);
    results_as_text = [];
    results_as_models = [];
    _ref = $dropdown.find('.select2-result');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      result = _ref[_i];
      $result = $(result);
      if (!$result.hasClass("select2-disabled") && !$result.hasClass("select2-no-results")) {
        results_as_models.push($(result).data("select2Data").model);
        results_as_text.push(_.string.clean($result.text()));
      }
    }
    expect(details.expected_options.length).toEqual(results_as_text.length);
    expect(details.expected_options.length).toEqual(results_as_models.length);
    _ref1 = details.expected_options;
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      expected = _ref1[_j];
      if (_.isString(expected)) {
        _results.push(expect(_.contains(results_as_text, expected)).toEqual(true));
      } else if (expected instanceof Backbone.Model) {
        _results.push(expect(_.contains(results_as_models, expected)).toEqual(true));
      } else {
        _results.push("invalid type");
      }
    }
    return _results;
  };

  TestHelpers.Select.Element.select_option = function($select, value) {
    var $result, $results, result, _i, _len;
    if (Backbone.Edit.categorizr.isDesktop) {
      $select.select2('focus');
      $select.select2('open');
      $results = (function() {
        var _i, _len, _ref, _results;
        _ref = $('.select2-result');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          result = _ref[_i];
          _results.push($(result));
        }
        return _results;
      })();
      for (_i = 0, _len = $results.length; _i < _len; _i++) {
        $result = $results[_i];
        if (!(!$result.hasClass('select2-disabled') && $result.data('select2Data').id === value)) {
          continue;
        }
        $result.click();
        return;
      }
      throw "value was not found";
    } else {
      $('select').val(value);
      return $('select').change();
    }
  };

  if (!TestHelpers.TagSelect) {
    TestHelpers.TagSelect = {};
  }

  if (!TestHelpers.TagSelect.Field) {
    TestHelpers.TagSelect.Field = {};
  }

  if (!TestHelpers.TagSelect.Element) {
    TestHelpers.TagSelect.Element = {};
  }

  TestHelpers.TagSelect.Field.check_js_editor_has_been_created = function(field) {
    var $container;
    $container = field.$('.select2-container');
    expect($container.length).toEqual(1);
    return expect($container.hasClass("select2-container-multi")).toEqual(true);
  };

  TestHelpers.TagSelect.Field.check_selected_value = function(field, details) {
    var expected, model, selected_as_models, selected_as_text, _i, _j, _len, _len1, _ref, _ref1, _results;
    TestHelpers.TagSelect.Element.check_selected_value(field.$('input'), details);
    selected_as_text = [];
    selected_as_models = [];
    _ref = field.editors[0].getValue().models;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      model = _ref[_i];
      if (!(!model.isDeleted())) {
        continue;
      }
      selected_as_text.push(field.editors[0].getItemLabel(model));
      selected_as_models.push(model.get("label"));
    }
    expect(selected_as_text.length).toEqual(details.expected_values.length);
    expect(selected_as_models.length).toEqual(details.expected_values.length);
    _ref1 = details.expected_values;
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      expected = _ref1[_j];
      if (_.isString(expected)) {
        _results.push(expect(_.contains(selected_as_text, expected)).toEqual(true));
      } else if (expected instanceof Backbone.Model) {
        _results.push(expect(_.contains(selected_as_models, expected)).toEqual(true));
      } else {
        _results.push("invalid type");
      }
    }
    return _results;
  };

  TestHelpers.TagSelect.Field.check_options = function(field, details) {
    return TestHelpers.TagSelect.Element.check_options(field.$('input'), details);
  };

  ids_to_models = function(model_class, items) {
    var converted, item, _i, _len;
    if (_.isString(model_class)) {
      model_class = Backbone.Relational.store.getObjectByName(model_class);
    }
    if (!_.isArray(items)) {
      items = [items];
    }
    converted = [];
    for (_i = 0, _len = items.length; _i < _len; _i++) {
      item = items[_i];
      if (_.isNumber(item)) {
        converted.push(model_class.findOrCreate(item));
      } else {
        converted.push(item);
      }
    }
    return converted;
  };

  TestHelpers.TagSelect.Element.check_selected_value = function($input, details) {
    var $choice, $container, choice, expected, selected_as_models, selected_as_text, _i, _j, _len, _len1, _ref, _ref1, _results;
    $container = $input.closest('.controls').find('.select2-container.select2-container-multi');
    expect($container.length).toEqual(1);
    if (_.isNull(details)) {
      details = {
        expected_values: []
      };
    }
    details.expected_values = ids_to_models(details.model_class, details.expected_values);
    selected_as_text = [];
    selected_as_models = [];
    _ref = $container.find('.select2-search-choice');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      choice = _ref[_i];
      $choice = $(choice);
      selected_as_text.push($choice.text());
      selected_as_models.push($choice.data("select2Data").model);
    }
    expect(details.expected_values.length).toEqual(selected_as_text.length);
    expect(details.expected_values.length).toEqual(selected_as_models.length);
    _ref1 = details.expected_values;
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      expected = _ref1[_j];
      if (_.isString(expected)) {
        _results.push(expect(_.contains(selected_as_text, expected)).toEqual(true));
      } else if (expected instanceof Backbone.Model) {
        _results.push(expect(_.contains(selected_as_models, expected)).toEqual(true));
      } else {
        _results.push("invalid type");
      }
    }
    return _results;
  };

  TestHelpers.TagSelect.Element.check_options = function($input, details) {
    var $container, $result, expected, result, results_as_models, results_as_text, _i, _j, _len, _len1, _ref, _ref1, _results;
    $container = $input.closest('.controls').find('.select2-container.select2-container-multi');
    expect($container.length).toEqual(1);
    if (_.isNull(details)) {
      details = {
        expected_options: []
      };
    }
    details.expected_options = ids_to_models(details.model_class, details.expected_options);
    $input.select2("focus");
    $input.select2("open");
    results_as_text = [];
    results_as_models = [];
    _ref = $('.select2-result');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      result = _ref[_i];
      $result = $(result);
      if (!$result.hasClass("select2-disabled") && !$result.hasClass("select2-no-results")) {
        results_as_models.push($(result).data("select2Data").model);
        results_as_text.push($result.text());
      }
    }
    expect(details.expected_options.length).toEqual(results_as_text.length);
    expect(details.expected_options.length).toEqual(results_as_models.length);
    _ref1 = details.expected_options;
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      expected = _ref1[_j];
      if (_.isString(expected)) {
        _results.push(expect(_.contains(results_as_text, expected)).toEqual(true));
      } else if (expected instanceof Backbone.Model) {
        _results.push(expect(_.contains(results_as_models, expected)).toEqual(true));
      } else {
        _results.push("invalid type");
      }
    }
    return _results;
  };

  TestHelpers.TagSelect.Element.select_models = function($input, details) {
    var $result, $results, found, model, result, _i, _j, _len, _len1, _ref, _results;
    $input.select2("focus");
    details.select = ids_to_models(details.model_class, details.select);
    _ref = details.select;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      model = _ref[_i];
      found = false;
      $input.select2("open");
      $results = (function() {
        var _j, _len1, _ref1, _results1;
        _ref1 = $('.select2-result');
        _results1 = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          result = _ref1[_j];
          _results1.push($(result));
        }
        return _results1;
      })();
      for (_j = 0, _len1 = $results.length; _j < _len1; _j++) {
        $result = $results[_j];
        if (!(!found && !$result.hasClass('select2-disabled') && $result.data('select2Data').model === model)) {
          continue;
        }
        found = true;
        $result.click();
      }
      if (!found) {
        _results.push(expect("results did not contain model " + model.id).toEqual(0));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  TestHelpers.TagSelect.Element.unselect_models = function($input, details) {
    var $choice, $container, $selected, choice, found, model, selected, _i, _j, _len, _len1, _ref, _ref1, _results;
    details.unselect = ids_to_models(details.model_class, details.unselect);
    selected = $($('.select2-search-choice')).data('select2Data');
    $container = $input.closest('.controls').find('.select2-container');
    expect($container.length).toEqual(1);
    $selected = (function() {
      var _i, _len, _ref, _results;
      _ref = $container.find('.select2-result');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        selected = _ref[_i];
        _results.push($(selected));
      }
      return _results;
    })();
    _ref = details.unselect;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      model = _ref[_i];
      found = false;
      _ref1 = $container.find('.select2-search-choice');
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        choice = _ref1[_j];
        if (!(!found)) {
          continue;
        }
        $choice = $(choice);
        if ($choice.data('select2Data').model === model) {
          $choice.find('.select2-search-choice-close').click();
          found = true;
        }
      }
      if (!found) {
        _results.push(expect("choices did not contain model " + model.id).toEqual(0));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

}).call(this);
