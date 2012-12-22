(function($, undefined) {
  $.widget('kod.loginprompt', {
    version: "@VERSION",

    defaultElement: "<div>",

    options: {
      /* css classes that get applied to our element */
      cssClasses: 'kod-loginprompt kod-noboxmodel',
    },

    _create: function() {
      var self = this;

      /* Construct login form */
      var form = $('<form>');
      form.attr('id', 'loginForm');
      var fieldset = $('<fieldset>');
      fieldset.appendTo(form)
              .append('<label for="username">Username:</label>')
              .append('<input type="text" name="username" id="username" maxlength="50" />')
              .append('<label for="password">Password:</label>')
              .append('<input type="password" name="password" id="password" maxlength="50" />');

      this.element.addClass(this.options.cssClasses)
                  .css('margin', 'auto')
                  .append(form)
                  .dialog({
                    modal: true,
                    closeOnEscape: false,
                    draggable: false,
                    resizable: false,
                    title: 'Login',
                    open: function(event, ui) { // hide close button
                      $(".ui-dialog-titlebar-close", $(this).parent()).hide();
                    },
                    buttons: [
                      {
                        text: "Login",
                        click: function () {
                          self._login();
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

    _login: function() {
      var username = $('#username').val();
      var password = $('#password').val();
      log('login attempt', {username: username, password: password});

      // Call game login
      $(':kod-game').game('login', username, password);

      // Now close the dialog
      this.element.dialog('close');
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
