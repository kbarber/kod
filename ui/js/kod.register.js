(function($, undefined) {
  $.widget('kod.register', {
    version: "@VERSION",

    defaultElement: "<div>",

    options: {
      /* css classes that get applied to our element */
      cssClasses: 'kod-register kod-noboxmodel',
    },

    _create: function() {
      var self = this;

      /* Construct login form */
      var form = $('<form>');
      form.attr('id', 'registerForm');
      var fieldset = $('<fieldset>');
      fieldset.appendTo(form)
              .append('<label for="username">Email:</label>')
              .append('<input type="text" name="email" id="email" maxlength="50" />')
              .append('<label for="password">Password:</label>')
              .append('<input type="password" name="password" id="password" maxlength="50" />')
              .append('<label for="password">Repeat:</label>')
              .append('<input type="password" name="passwordRepeat" id="passwordRepeat" maxlength="50" />');

      this.element.addClass(this.options.cssClasses)
                  .css('margin', 'auto')
                  .append(form)
                  .dialog({
                    autoOpen: false,
                    modal: true,
                    closeOnEscape: true,
                    draggable: false,
                    resizable: false,
                    title: 'Register',
                    show: 'explode',
                    hide: 'explode',
                    buttons: [
                      {
                        text: "Register",
                        click: function () {
                          self._register();
                        }
                      }
                    ]
                  });

      /* Start watching resize events */
      $(window).resize(function() {
        self._resize();
      });
      this._resize();
    },

    _register: function() {
    },

    _setOption: function(name, value) {
      $.Widget.prototype._setOption.apply(this, arguments);
    },

    _resize: function() {
    },

    _destroy: function() {
      this.element.removeClass(this.options.cssClasses);
    }
  });
}(jQuery));
