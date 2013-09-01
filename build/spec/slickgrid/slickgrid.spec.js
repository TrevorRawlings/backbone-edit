(function() {
  var _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (!window.TestApp) {
    window.TestApp = {};
  }

  if (!window.TestApp.Models) {
    window.TestApp.Models = {};
  }

  if (!window.TestApp.Collections) {
    window.TestApp.Collections = {};
  }

  TestApp.Models.Crop = (function(_super) {
    __extends(Crop, _super);

    function Crop() {
      _ref = Crop.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Crop.prototype.urlRoot = '/crop';

    Crop.prototype.paramRoot = 'crop';

    return Crop;

  })(Backbone.Model);

  TestApp.Collections.Crop = (function(_super) {
    __extends(Crop, _super);

    function Crop() {
      _ref1 = Crop.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    Crop.prototype.model = TestApp.Models.Crop;

    Crop.prototype.url = '/crops';

    return Crop;

  })(Backbone.Collection);

  describe("slickgrid", function() {
    var TestCollection, TestCollection2, TestModel, TestModel2, TestOtherCollection, TestOtherModel, collection, create_and_show_view, view, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
    view = null;
    collection = null;
    TestOtherModel = (function(_super) {
      __extends(TestOtherModel, _super);

      function TestOtherModel() {
        _ref2 = TestOtherModel.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      Backbone.Edit.SoftDeleteMixin.add_to(TestOtherModel);

      TestOtherModel.prototype.urlRoot = '/test';

      TestOtherModel.prototype.paramRoot = 'test';

      TestOtherModel.prototype.initialize = function() {
        TestOtherModel.__super__.initialize.apply(this, arguments);
        return this.initializeSoftDelete();
      };

      TestOtherModel.prototype.toString = function() {
        return this.get('to_string_val');
      };

      return TestOtherModel;

    })(Backbone.Model);
    TestOtherCollection = (function(_super) {
      __extends(TestOtherCollection, _super);

      function TestOtherCollection() {
        _ref3 = TestOtherCollection.__super__.constructor.apply(this, arguments);
        return _ref3;
      }

      TestOtherCollection.prototype.model = TestOtherModel;

      TestOtherCollection.prototype.url = '/tests';

      return TestOtherCollection;

    })(Backbone.Collection);
    TestModel = (function(_super) {
      __extends(TestModel, _super);

      function TestModel() {
        _ref4 = TestModel.__super__.constructor.apply(this, arguments);
        return _ref4;
      }

      Backbone.Edit.SoftDeleteMixin.add_to(TestModel);

      TestModel.prototype.urlRoot = '/test';

      TestModel.prototype.paramRoot = 'test';

      TestModel.prototype.relations = [
        {
          type: Backbone.HasOne,
          key: 'enterprise',
          relatedModel: 'TestApp.Models.Crop',
          includeInJSON: Backbone.Model.prototype.idAttribute,
          collectionType: 'TestApp.Collections.Crop'
        }
      ];

      TestModel.prototype.initialize = function() {
        TestModel.__super__.initialize.apply(this, arguments);
        return this.initializeSoftDelete();
      };

      TestModel.prototype.schema = {
        title: {
          dataType: 'Text'
        },
        due_date: {
          dataType: 'Date',
          title: 'Due'
        },
        due_date_time: {
          dataType: 'DateTime',
          title: 'Due'
        },
        enterprise: {
          dataType: 'Model'
        },
        collection: {
          dataType: 'Collection'
        },
        completed: {
          dataType: 'Boolean',
          title: "Status",
          formatter: "taskStatusFormater"
        },
        untyped: {},
        completed_date: {
          dataType: 'DateTime',
          title: 'Date completed'
        }
      };

      return TestModel;

    })(Backbone.Model);
    TestCollection = (function(_super) {
      __extends(TestCollection, _super);

      function TestCollection() {
        _ref5 = TestCollection.__super__.constructor.apply(this, arguments);
        return _ref5;
      }

      TestCollection.prototype.model = TestModel;

      TestCollection.prototype.url = '/tests';

      return TestCollection;

    })(Backbone.Collection);
    TestModel2 = (function(_super) {
      __extends(TestModel2, _super);

      function TestModel2() {
        _ref6 = TestModel2.__super__.constructor.apply(this, arguments);
        return _ref6;
      }

      Backbone.Edit.SoftDeleteMixin.add_to(TestModel2);

      TestModel2.prototype.urlRoot = '/test2';

      TestModel2.prototype.paramRoot = 'test2';

      TestModel2.prototype.schema = {
        cost: {
          dataType: 'Currency',
          prepend: "£"
        }
      };

      TestModel2.prototype.initialize = function() {
        TestModel2.__super__.initialize.apply(this, arguments);
        return this.initializeSoftDelete();
      };

      return TestModel2;

    })(Backbone.Model);
    TestCollection2 = (function(_super) {
      __extends(TestCollection2, _super);

      function TestCollection2() {
        _ref7 = TestCollection2.__super__.constructor.apply(this, arguments);
        return _ref7;
      }

      TestCollection2.prototype.model = TestModel2;

      TestCollection2.prototype.url = '/tests2';

      return TestCollection2;

    })(Backbone.Collection);
    create_and_show_view = function(collection) {
      if (view) {
        view.close();
      }
      view = new Backbone.Slickgrid.View({
        collection: collection
      });
      $('body').prepend(view.render().el);
      return view.show();
    };
    beforeEach(function() {});
    afterEach(function() {
      return view.close();
    });
    describe("empty collection", function() {
      beforeEach(function() {
        collection = new TestCollection();
        return create_and_show_view(collection);
      });
      return it("should not show the slickgrid", function() {
        return expect(view.$('.slick-header').length).toEqual(0);
      });
    });
    describe("collection with item", function() {
      beforeEach(function() {
        collection = new TestCollection();
        create_and_show_view(collection);
        return collection.add({});
      });
      it("should show the slickgrid", function() {
        expect(view.$('.slick-header').length).toEqual(1);
        return expect(view.$('.slick-row').length).toEqual(1);
      });
      return it("should have correct column headings", function() {
        var headings;
        headings = view.$('.slick-header-column');
        expect($(headings[0]).text()).toEqual("Title");
        expect($(headings[1]).text()).toEqual("Due");
        expect($(headings[2]).text()).toEqual("Due");
        expect($(headings[3]).text()).toEqual("Enterprise");
        return expect($(headings[4]).text()).toEqual("Collection");
      });
    });
    describe("format items", function() {
      var model;
      model = null;
      beforeEach(function() {
        collection = new TestCollection();
        create_and_show_view(collection);
        model = new TestModel();
        return collection.add(model);
      });
      describe("Text", function() {
        var getCell, setValue;
        setValue = function(value) {
          return model.set("title", value);
        };
        getCell = function() {
          return $(view.$('.slick-cell')[0]);
        };
        it("should escape text strings", function() {
          var cell;
          setValue("<b>a title</b>");
          cell = getCell();
          return expect(getCell().text()).toEqual("<b>a title</b>");
        });
        it("should handle null values", function() {
          var cell;
          setValue(null);
          cell = getCell();
          return expect(cell.text()).toEqual("");
        });
        return it("should handle undefined values", function() {
          setValue(void 0);
          return expect(getCell().text()).toEqual("");
        });
      });
      describe("Date", function() {
        var getCell, setValue;
        setValue = function(value) {
          return model.set("due_date", value);
        };
        getCell = function() {
          return $(view.$('.slick-cell')[1]);
        };
        it("should render dates", function() {
          setValue("2012-03-15");
          return expect(getCell().text()).toEqual("15-03-2012");
        });
        it("should handle null values", function() {
          setValue(null);
          return expect(getCell().text()).toEqual("");
        });
        it("should handle undefined values", function() {
          setValue(void 0);
          return expect(getCell().text()).toEqual("");
        });
        it("should handle invalid values", function() {
          setValue({});
          return expect(getCell().text()).toEqual("?");
        });
        return it("should error if it contains the wrong type of string", function() {
          var test;
          test = function() {
            return setValue("2012-08-19T22:38:37Z");
          };
          return expect(test).toThrow("dateConverter.fromServerString() expected a \"YYYY-MM-DD\" string but got 2012-08-19T22:38:37Z");
        });
      });
      describe("DateTime", function() {
        var getCell, setValue;
        setValue = function(value) {
          return model.set("due_date_time", value);
        };
        getCell = function() {
          return $(view.$('.slick-cell')[2]);
        };
        it("should render date strings in the correct format", function() {
          setValue("2012-08-19T22:38:37Z");
          return expect(getCell().text()).toEqual("19-08-2012");
        });
        it("should handle null values", function() {
          setValue(null);
          return expect(getCell().text()).toEqual("");
        });
        it("should handle undefined values", function() {
          setValue(void 0);
          return expect(getCell().text()).toEqual("");
        });
        it("should handle invalid values", function() {
          setValue({});
          return expect(getCell().text()).toEqual("?");
        });
        return it("should error if it contains the wrong type of string", function() {
          var test;
          test = function() {
            return setValue("2012-08-19");
          };
          return expect(test).toThrow("dateTimerConverter.fromServerString() expected a string but got 2012-08-19");
        });
      });
      describe("Model", function() {
        var getCell, setValue, setValue_direct;
        setValue = function(value) {
          return model.set("enterprise", value);
        };
        setValue_direct = function(value) {
          model.schema = _.extend({}, model.constructor.prototype.schema);
          model.schema.enterprise = _.extend({}, model.constructor.prototype.schema.enterprise);
          model.schema.enterprise.custom_get = true;
          model.attributes["enterprise"] = value;
          view._findColumn("enterprise").schema.custom_get = true;
          return view.on_CollectionChanged();
        };
        getCell = function() {
          return $(view.$('.slick-cell')[3]);
        };
        it("should call toString on model", function() {
          var otherModel;
          otherModel = new TestOtherModel({
            to_string_val: "to_string"
          });
          setValue_direct(otherModel);
          return expect(getCell().text()).toEqual("to_string");
        });
        it("should escape toString", function() {
          var otherModel;
          otherModel = new TestOtherModel({
            to_string_val: "<b>to_string</b>"
          });
          setValue_direct(otherModel);
          return expect(getCell().text()).toEqual("<b>to_string</b>");
        });
        it("should display deleted models with del tags", function() {
          var otherModel;
          otherModel = new TestOtherModel({
            to_string_val: "to_string",
            deleted_at: "a value"
          });
          setValue_direct(otherModel);
          expect(getCell().text()).toEqual("to_string");
          return expect(getCell().html()).toEqual("<del>to_string</del>");
        });
        it("should escape text of deleted models", function() {
          var otherModel;
          otherModel = new TestOtherModel({
            to_string_val: "<b>to_string</b>",
            deleted_at: "a value"
          });
          setValue_direct(otherModel);
          expect(getCell().text()).toEqual("<b>to_string</b>");
          return expect(getCell().html()).toEqual("<del>&lt;b&gt;to_string&lt;/b&gt;</del>");
        });
        it("should handle null values", function() {
          setValue_direct(null);
          return expect(getCell().text()).toEqual("");
        });
        it("should handle undefined values", function() {
          setValue_direct(void 0);
          return expect(getCell().text()).toEqual("");
        });
        it("should handle invalid values (object)", function() {
          setValue_direct({});
          return expect(getCell().text()).toEqual("?");
        });
        return it("should handle invalid values (String)", function() {
          setValue_direct("hello");
          return expect(getCell().text()).toEqual("?");
        });
      });
      describe("Collection", function() {
        var getCell, setValue, subCollection;
        subCollection = null;
        setValue = function(value) {
          return model.set("collection", value);
        };
        getCell = function() {
          return $(view.$('.slick-cell')[4]);
        };
        beforeEach(function() {
          var i, subModel, _i, _results;
          subCollection = new TestOtherCollection();
          _results = [];
          for (i = _i = 0; _i < 3; i = ++_i) {
            subModel = new TestOtherModel({
              to_string_val: "item_" + i
            });
            _results.push(subCollection.add(subModel));
          }
          return _results;
        });
        it("calls tostring on each model", function() {
          setValue(subCollection);
          return expect(getCell().text()).toEqual("item_0, item_1, item_2");
        });
        it("escapes values", function() {
          var firstModel;
          firstModel = subCollection.at(0);
          firstModel.set("to_string_val", "<B>item_0</B>");
          setValue(subCollection);
          expect(getCell().text()).toEqual("<B>item_0</B>, item_1, item_2");
          return expect(getCell().html()).toEqual("&lt;B&gt;item_0&lt;/B&gt;, item_1, item_2");
        });
        it("shows items as deleted", function() {
          var firstModel, secondModel;
          firstModel = subCollection.at(0);
          firstModel.set("to_string_val", "<B>item_0</B>");
          firstModel.set({
            deleted_at: "a value"
          });
          secondModel = subCollection.at(1);
          secondModel.set({
            deleted_at: "a value"
          });
          setValue(subCollection);
          expect(getCell().text()).toEqual("<B>item_0</B>, item_1, item_2");
          return expect(getCell().html()).toEqual("<del>&lt;B&gt;item_0&lt;/B&gt;</del>, <del>item_1</del>, item_2");
        });
        return describe("limits to 10 items", function() {
          beforeEach(function() {
            var i, subModel, _i, _results;
            subCollection = new TestOtherCollection();
            _results = [];
            for (i = _i = 0; _i < 15; i = ++_i) {
              subModel = new TestOtherModel({
                to_string_val: "item_" + i
              });
              _results.push(subCollection.add(subModel));
            }
            return _results;
          });
          return it("only shows the first 10", function() {
            setValue(subCollection);
            return expect(getCell().text()).toEqual("item_0, item_1, item_2, item_3, item_4, item_5, item_6, item_7, item_8, item_9, ...");
          });
        });
      });
      return describe("defaultFormater", function() {
        var getCell, setValue, subCollection;
        subCollection = null;
        setValue = function(value) {
          return model.set("untyped", value);
        };
        getCell = function() {
          return $(view.$('.slick-cell')[6]);
        };
        it("should escape text strings", function() {
          setValue("<b>a string</b>");
          return expect(getCell().text()).toEqual("<b>a string</b>");
        });
        it("should render strings as strings", function() {
          setValue("2012-08-19T22:38:37Z");
          return expect(getCell().text()).toEqual("2012-08-19T22:38:37Z");
        });
        it("should handle null values", function() {
          setValue(null);
          return expect(getCell().text()).toEqual("");
        });
        it("should handle undefined values", function() {
          setValue(void 0);
          return expect(getCell().text()).toEqual("");
        });
        it("should render dates", function() {
          var m;
          m = moment("2012-03-15", "YYYY-MM-DD");
          setValue(m.toDate());
          return expect(getCell().text()).toEqual("15-03-2012");
        });
        it("should render models", function() {
          var otherModel;
          otherModel = new TestOtherModel({
            to_string_val: "to_string",
            deleted_at: "a value"
          });
          setValue(otherModel);
          expect(getCell().text()).toEqual("to_string");
          return expect(getCell().html()).toEqual("<del>to_string</del>");
        });
        return it("should render collections", function() {
          var firstModel, i, secondModel, subModel, _i;
          subCollection = new TestOtherCollection();
          for (i = _i = 0; _i < 3; i = ++_i) {
            subModel = new TestOtherModel({
              to_string_val: "item_" + i
            });
            subCollection.add(subModel);
          }
          firstModel = subCollection.at(0);
          firstModel.set("to_string_val", "<B>item_0</B>");
          firstModel.set({
            deleted_at: "a value"
          });
          secondModel = subCollection.at(1);
          secondModel.set({
            deleted_at: "a value"
          });
          setValue(subCollection);
          expect(getCell().text()).toEqual("<B>item_0</B>, item_1, item_2");
          return expect(getCell().html()).toEqual("<del>&lt;B&gt;item_0&lt;/B&gt;</del>, <del>item_1</del>, item_2");
        });
      });
    });
    return describe("format items 2", function() {
      var model;
      model = null;
      beforeEach(function() {
        collection = new TestCollection2();
        create_and_show_view(collection);
        model = new TestModel2();
        return collection.add(model);
      });
      return describe("Currency", function() {
        var getCell, setValue;
        setValue = function(value) {
          return model.set("cost", value);
        };
        getCell = function() {
          return $(view.$('.slick-cell')[0]);
        };
        it("should render Currency", function() {
          setValue(1);
          expect(getCell().text()).toEqual("£ 0.01");
          setValue(100);
          expect(getCell().text()).toEqual("£ 1.00");
          setValue(89197);
          expect(getCell().text()).toEqual("£ 891.97");
          setValue(-89197);
          return expect(getCell().text()).toEqual("£ -891.97");
        });
        it("should handle null values", function() {
          setValue(null);
          return expect(getCell().text()).toEqual("");
        });
        it("should handle undefined values", function() {
          setValue(void 0);
          return expect(getCell().text()).toEqual("");
        });
        return it("should handle invalid values", function() {
          setValue({});
          expect(getCell().text()).toEqual("?");
          setValue("");
          expect(getCell().text()).toEqual("?");
          setValue(NaN);
          return expect(getCell().text()).toEqual("?");
        });
      });
    });
  });

}).call(this);
