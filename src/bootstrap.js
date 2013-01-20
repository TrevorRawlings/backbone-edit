;(function() {
  var templates = {
    form: '\
      <form class="form-horizontal">{{fieldsets}}</form>\
    ',

    fieldset: '\
      <fieldset>\
        {{legend}}\
        {{fields}}\
      </fieldset>\
    ',

    field: '\
      <div class="control-group">\
        <label class="control-label" for="{{id}}">{{title}}</label>\
        <div class="controls">\
          <div class="input-xlarge">{{editor}}</div>\
          <div class="help-block">{{help}}</div>\
        </div>\
      </div>\
    ',

    list_field: '\
      <div class="control-group" style="margin-bottom: 0px; margin-top: 0px;">\
        <label class="control-label" for="{{id}}">{{title}}</label>\
        <div class="controls">\
          <div class="input-xlarge">{{editor}}</div>\
          <div class="help-block" style="margin-bottom: 0px; margin-top: 0px;">{{help}}</div>\
        </div>\
      </div>\
    ',


      floating_field: '\
      <div class="control-group floating_form_item">\
        <label class="control-label" for="{{id}}">{{title}}</label>\
        <div class="controls">\
            {{editor}}\
            <div class="help-block">{{help}}</div>\
        </div>\
      </div>\
    ',

    floating_inline_checkbox: '\
      <div class="control-group floating_form_item">\
        <div class="controls checkbox inline">\
            {{editor}}\
            <label class="control-label" for="{{id}}">{{title}}</label>\
            <div class="help-block">{{help}}</div>\
        </div>\
      </div>\
    ',

    slickgrid: '\
      <div class="control-group floating_form_item">\
        <label class="control-label" for="{{id}}">{{title}}</label>\
        <div class="controls">\
            {{editor}}\
            <div class="help-block">{{help}}</div>\
        </div>\
      </div>\
    ',

    without_label: '\
      <div class="control-group">\
        <div class="controls">\
          {{editor}}\
          <div class="help-block">{{help}}</div>\
        </div>\
      </div>\
    ',

    invitation_role: '\
      <div class="control-group large-text">\
        <div class="controls">\
          New user is a \
          {{editor}}\
          of the business \
          <div class="help-block">{{help}}</div>\
        </div>\
      </div>\
    ',


  };
  
  var classNames = {
    error: 'error'
  };

  Backbone.Edit.helpers.setTemplates(templates, classNames);
})();
