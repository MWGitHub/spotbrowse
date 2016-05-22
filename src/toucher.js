/**
 * Prevent touch and click emulation from both occuring.
 */
(function () {
  var lastClickTouch = Date.now();
  var grace = 10;

  app.toucher = {
    touch: function () {
      lastClickTouch = Date.now();
    },

    recentlyTouched: function () {
      return Date.now() - lastClickTouch <= grace;
    }
  }
})();
