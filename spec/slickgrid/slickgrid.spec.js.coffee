
window.TestApp = {} if !window.TestApp
window.TestApp.Models = {} if !window.TestApp.Models
window.TestApp.Collections = {} if !window.TestApp.Collections

class TestApp.Models.Crop extends Backbone.Model
    urlRoot : '/crop'
    paramRoot: 'crop'

class TestApp.Collections.Crop extends Backbone.Collection
    model:  TestApp.Models.Crop
    url: '/crops'


describe "slickgrid", ->
  view = null
  collection = null


  class TestOtherModel extends Backbone.Model
    Backbone.Edit.SoftDeleteMixin.add_to(this)
    urlRoot : '/test'
    paramRoot: 'test'

    initialize: ->
      super
      @initializeSoftDelete()

    toString: ->
      @get('to_string_val')

  class TestOtherCollection extends Backbone.Collection
    model: TestOtherModel
    url: '/tests'


  class TestModel extends Backbone.Model
    Backbone.Edit.SoftDeleteMixin.add_to(this)
    urlRoot : '/test'
    paramRoot: 'test'

    relations: [{
                  type: Backbone.HasOne
                  key: 'enterprise'
                  relatedModel: 'TestApp.Models.Crop'
                  includeInJSON: Backbone.Model.prototype.idAttribute
                  collectionType: 'TestApp.Collections.Crop'            }]

    initialize: ->
      super
      @initializeSoftDelete()

    schema:
      title:        { dataType: 'Text' }
      due_date:     { dataType: 'Date',    title: 'Due' }
      due_date_time:{ dataType: 'DateTime',    title: 'Due' }
      enterprise:   { dataType: 'Model' }
      collection:   { dataType: 'Collection' }
      completed:    { dataType: 'Boolean', title: "Status", formatter: "taskStatusFormater" }
      untyped:      { } # no data type specified - as a result the default formatter will be used
      completed_date: { dataType: 'DateTime',    title: 'Date completed' }

  # TestModel.setup() <-- setup is required by backbone-relational

  class TestCollection extends Backbone.Collection
    model: TestModel
    url: '/tests'


  class TestModel2 extends Backbone.Model
    Backbone.Edit.SoftDeleteMixin.add_to(this)
    urlRoot : '/test2'
    paramRoot: 'test2'

    schema:
      cost:           { dataType: 'Currency', prepend: "£" }
  # TestModel2.setup()  <-- setup is required by backbone-relational

    initialize: ->
      super
      @initializeSoftDelete()

  class TestCollection2 extends Backbone.Collection
    model: TestModel2
    url: '/tests2'


  create_and_show_view = (collection) ->
    if view
      view.close()

    view = new Backbone.Slickgrid.View(collection: collection)
    $('body').prepend(view.render().el)
    view.show()


  beforeEach ->
    #Backbone.Edit.TestHelpers.before_each_test()
    #Landscape.Data.Business = Landscape.Models.Business.findOrCreate({ id: 1, name: "business 1" })


  afterEach ->
    view.close()

  describe "empty collection", ->
    beforeEach ->
      collection = new TestCollection()
      create_and_show_view(collection)

    it "should not show the slickgrid", ->
      expect( view.$('.slick-header').length ).toEqual(0)

  describe "collection with item", ->
    beforeEach ->
      collection = new TestCollection()
      create_and_show_view(collection)

      collection.add({})

    it "should show the slickgrid", ->
      expect( view.$('.slick-header').length ).toEqual(1)
      expect( view.$('.slick-row').length ).toEqual(1)

    it "should have correct column headings", ->
      headings = view.$('.slick-header-column')
      expect( $(headings[0]).text()).toEqual("Title")
      expect( $(headings[1]).text()).toEqual("Due")
      expect( $(headings[2]).text()).toEqual("Due")
      expect( $(headings[3]).text()).toEqual("Enterprise")
      expect( $(headings[4]).text()).toEqual("Collection")

  describe "format items", ->
    model = null

    beforeEach ->
      collection = new TestCollection()
      create_and_show_view(collection)
      model = new TestModel()
      collection.add(model)

    describe "Text", ->
      setValue = (value) ->    model.set("title", value)
      getCell = () ->          $(view.$('.slick-cell')[0])

      it "should escape text strings", ->
        setValue("<b>a title</b>")
        cell = getCell()
        expect( getCell().text()).toEqual("<b>a title</b>")

      it "should handle null values", ->
        setValue(null)
        cell = getCell()
        expect(cell.text()).toEqual("")

      it "should handle undefined values", ->
        setValue(undefined)
        expect( getCell().text()).toEqual("")


    describe "Date", ->
      setValue = (value) ->    model.set("due_date", value)
      getCell = () ->          $(view.$('.slick-cell')[1])

      it "should render dates", ->
        setValue("2012-03-15")
        expect( getCell().text()).toEqual("15-03-2012")

      it "should handle null values", ->
        setValue(null)
        expect( getCell().text()).toEqual("")

      it "should handle undefined values", ->
        setValue(undefined)
        expect( getCell().text()).toEqual("")

      it "should handle invalid values", ->
        setValue({})
        expect( getCell().text()).toEqual("?")

      it "should error if it contains the wrong type of string", ->
        test = ->
          setValue("2012-08-19T22:38:37Z")
        expect(test).toThrow("dateConverter.fromServerString() expected a \"YYYY-MM-DD\" string but got 2012-08-19T22:38:37Z");


    describe "DateTime", ->
      setValue = (value) ->    model.set("due_date_time", value)
      getCell = () ->          $(view.$('.slick-cell')[2])

      it "should render date strings in the correct format", ->
        setValue("2012-08-19T22:38:37Z")
        expect( getCell().text()).toEqual("19-08-2012")

      it "should handle null values", ->
        setValue(null)
        expect( getCell().text()).toEqual("")

      it "should handle undefined values", ->
        setValue(undefined)
        expect( getCell().text()).toEqual("")

      it "should handle invalid values", ->
        setValue({})
        expect( getCell().text()).toEqual("?")

      it "should error if it contains the wrong type of string", ->
        test = ->
          setValue("2012-08-19")
        expect(test).toThrow("dateTimerConverter.fromServerString() expected a string but got 2012-08-19");



    describe "Model", ->
      setValue = (value) ->    model.set("enterprise", value)
      setValue_direct = (value) ->
        model.schema = _.extend({}, model.constructor.prototype.schema)
        model.schema.enterprise = _.extend({}, model.constructor.prototype.schema.enterprise)
        model.schema.enterprise.custom_get = true
        model.attributes["enterprise"] = value
        view._findColumn("enterprise").schema.custom_get = true;
        view.on_CollectionChanged()
        #create_and_show_view(collection)
      getCell = () ->          $(view.$('.slick-cell')[3])

      it "should call toString on model", ->
        otherModel = new TestOtherModel({to_string_val: "to_string"})
        setValue_direct(otherModel)
        expect( getCell().text()).toEqual("to_string")

      it "should escape toString", ->
        otherModel = new TestOtherModel({to_string_val: "<b>to_string</b>"})
        setValue_direct(otherModel)
        expect( getCell().text()).toEqual("<b>to_string</b>")

      it "should display deleted models with del tags", ->
        otherModel = new TestOtherModel({to_string_val: "to_string", deleted_at: "a value"})
        setValue_direct(otherModel)
        expect( getCell().text()).toEqual("to_string")
        expect( getCell().html()).toEqual("<del>to_string</del>")

      it "should escape text of deleted models", ->
        otherModel = new TestOtherModel({to_string_val: "<b>to_string</b>", deleted_at: "a value"})
        setValue_direct(otherModel)
        expect( getCell().text()).toEqual("<b>to_string</b>")
        expect( getCell().html()).toEqual("<del>&lt;b&gt;to_string&lt;/b&gt;</del>")

      it "should handle null values", ->
        setValue_direct(null)
        expect( getCell().text()).toEqual("")

      it "should handle undefined values", ->
        setValue_direct(undefined)
        expect( getCell().text()).toEqual("")

      it "should handle invalid values (object)", ->
        setValue_direct({})
        expect( getCell().text()).toEqual("?")

      it "should handle invalid values (String)", ->
        setValue_direct("hello")
        expect( getCell().text()).toEqual("?")

      #      describe "should try and lazy load", ->
      #        server = null
      #
      #        beforeEach ->
      #          server = sinon.fakeServer.create();
      #          value_model = Landscape.Models.Crop.findOrCreate({ id: 1 })
      #          expect( value_model.isLoaded() ).toEqual( false)
      #          setValue(value_model)
      #
      #        afterEach ->
      #          server.respond()
      #          server.restore()
      #
      #        it "should try and load the model", ->
      #          expect( getCell().text()).toEqual("loading...")
      #
      #          expect( server.requests.length).toEqual(1)
      #          expect( server.requests[0].url ).toEqual( "/crops/multiple?business=1&ids=1" )
      #
      #        describe "request returns", ->
      #          beforeEach ->
      #            crop1 = `{"crops":[{"id":1,"cid":null,"created_at":"2013-04-11T12:33:48+01:00","deleted_at":null,"name":"crop 1","notes":"Some notes","valid_from_date":"2011-01-06","valid_to_date":"2011-04-23","created_by":4,"deleted_by":null,"enterprise":40,"location":157}],
      #                   "multiple_crops":{"crops":[1]}}`
      #
      #            server.respondWith("GET", "/crops/multiple?business=1&ids=1", [200, {"Content-Type": "application/json"}, JSON.stringify(crop1)])
      #            server.respondOnce()
      #
      #          it "should have updated", ->
      #            expect( getCell().text()).toEqual("crop 1")
      #
      #            # it should not have sent another request
      #            expect( server.requests.length).toEqual(1)


    describe "Collection", ->
      subCollection = null
      setValue = (value) ->    model.set("collection", value)
      getCell = () ->          $(view.$('.slick-cell')[4])

      beforeEach ->
        subCollection = new TestOtherCollection()
        for i in [0...3]
          subModel = new TestOtherModel({to_string_val: "item_#{i}"})
          subCollection.add(subModel)

      it "calls tostring on each model", ->
        setValue(subCollection)
        expect( getCell().text()).toEqual("item_0, item_1, item_2")

      it "escapes values", ->
        firstModel = subCollection.at(0)
        firstModel.set("to_string_val", "<B>item_0</B>")

        setValue(subCollection)
        expect( getCell().text()).toEqual("<B>item_0</B>, item_1, item_2")
        expect( getCell().html()).toEqual("&lt;B&gt;item_0&lt;/B&gt;, item_1, item_2")

      it "shows items as deleted", ->
        firstModel = subCollection.at(0)
        firstModel.set("to_string_val", "<B>item_0</B>")
        firstModel.set( deleted_at: "a value")

        secondModel = subCollection.at(1)
        secondModel.set( deleted_at: "a value")

        setValue(subCollection)
        expect( getCell().text()).toEqual("<B>item_0</B>, item_1, item_2")
        expect( getCell().html()).toEqual("<del>&lt;B&gt;item_0&lt;/B&gt;</del>, <del>item_1</del>, item_2")

      describe "limits to 10 items", ->
        beforeEach ->
          subCollection = new TestOtherCollection()
          for i in [0...15]
            subModel = new TestOtherModel({to_string_val: "item_#{i}"})
            subCollection.add(subModel)

        it "only shows the first 10", ->
          setValue(subCollection)
          expect( getCell().text()).toEqual("item_0, item_1, item_2, item_3, item_4, item_5, item_6, item_7, item_8, item_9, ...")

      #      describe "should try and lazy load", ->
      #        server = null
      #
      #        beforeEach ->
      #          server = sinon.fakeServer.create();
      #          subCollection = new Landscape.Collections.Crop()
      #          for i in [1...4]
      #            subModel = Landscape.Models.Crop.findOrCreate({ id: i })
      #            expect( subModel.isLoaded() ).toEqual( false )
      #            subCollection.add(subModel)
      #          setValue(subCollection)
      #
      #        afterEach ->
      #          server.respond()
      #          server.restore()
      #
      #        it "should try and load the models", ->
      #          expect( getCell().text()).toEqual("loading..., loading..., loading...")
      #
      #          expect( server.requests.length).toEqual(1)
      #          expect( server.requests[0].url ).toEqual( "/crops/multiple?business=1&ids=1" )
      #
      #        describe "request returns", ->
      #          beforeEach ->
      #            crop1 = `{"crops":[{"id":1,"cid":null,"created_at":"2013-04-11T12:33:48+01:00","deleted_at":null,"name":"crop 1","notes":"Some notes","valid_from_date":"2011-01-06","valid_to_date":"2011-04-23","created_by":4,"deleted_by":null,"enterprise":40,"location":157}],
      #                   "multiple_crops":{"crops":[1]}}`
      #
      #            server.respondWith("GET", "/crops/multiple?business=1&ids=1", [200, {"Content-Type": "application/json"}, JSON.stringify(crop1)])
      #            server.respondOnce()
      #
      #          it "should have updated", ->
      #            expect( getCell().text()).toEqual("crop 1, loading..., loading...")
      #
      #            # it should have sent another request
      #            expect( server.requests.length ).toEqual(2)
      #            expect( server.requests[1].url ).toEqual( "/crops/multiple?business=1&ids=2%2C3" )



    describe "defaultFormater", ->
      subCollection = null
      setValue = (value) ->    model.set("untyped", value)
      getCell = () ->          $(view.$('.slick-cell')[6])

      it "should escape text strings", ->
        setValue("<b>a string</b>")
        expect( getCell().text()).toEqual("<b>a string</b>")

      it "should render strings as strings", ->
        setValue("2012-08-19T22:38:37Z")
        expect( getCell().text()).toEqual("2012-08-19T22:38:37Z")

      it "should handle null values", ->
        setValue(null)
        expect(getCell().text()).toEqual("")

      it "should handle undefined values", ->
        setValue(undefined)
        expect( getCell().text()).toEqual("")

      it "should render dates", ->
        m = moment("2012-03-15", "YYYY-MM-DD")
        setValue(m.toDate())
        expect( getCell().text()).toEqual("15-03-2012")

      it "should render models", ->
        otherModel = new TestOtherModel({to_string_val: "to_string", deleted_at: "a value"})
        setValue(otherModel)
        expect( getCell().text()).toEqual("to_string")
        expect( getCell().html()).toEqual("<del>to_string</del>")

      it "should render collections", ->
        subCollection = new TestOtherCollection()
        for i in [0...3]
          subModel = new TestOtherModel({to_string_val: "item_#{i}"})
          subCollection.add(subModel)

        firstModel = subCollection.at(0)
        firstModel.set("to_string_val", "<B>item_0</B>")
        firstModel.set( deleted_at: "a value")

        secondModel = subCollection.at(1)
        secondModel.set( deleted_at: "a value")

        setValue(subCollection)
        expect( getCell().text()).toEqual("<B>item_0</B>, item_1, item_2")
        expect( getCell().html()).toEqual("<del>&lt;B&gt;item_0&lt;/B&gt;</del>, <del>item_1</del>, item_2")


  describe "format items 2", ->
    model = null

    beforeEach ->
      collection = new TestCollection2()
      create_and_show_view(collection)
      model = new TestModel2()
      collection.add(model)

    describe "Currency", ->
      setValue = (value) ->    model.set("cost", value)
      getCell = () ->          $(view.$('.slick-cell')[0])

      it "should render Currency", ->
        setValue(1)
        expect( getCell().text()).toEqual("£ 0.01")

        setValue(100)
        expect( getCell().text()).toEqual("£ 1.00")

        setValue(89197)
        expect( getCell().text()).toEqual("£ 891.97")

        setValue(-89197)
        expect( getCell().text()).toEqual("£ -891.97")

      it "should handle null values", ->
        setValue(null)
        expect( getCell().text()).toEqual("")

      it "should handle undefined values", ->
        setValue(undefined)
        expect( getCell().text()).toEqual("")

      it "should handle invalid values", ->
        setValue({})
        expect( getCell().text()).toEqual("?")

        setValue("")
        expect( getCell().text()).toEqual("?")

        setValue(NaN)
        expect( getCell().text()).toEqual("?")

