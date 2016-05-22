(function () {

  app.util = {
    /**
     * Merges two objects with the second overwriting similar properties and
     * returns a new object.
     */
    merge: function (obj1, obj2) {
      var obj = {};
      var key;
      for (key in obj1) {
        obj[key] = obj1[key];
      }
      for (key in obj2) {
        obj[key] = obj2[key];
      }
      return obj;
    },

    /**
     * Removes all children from an element.
     */
    removeAllChildren: function (element) {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    },

    /**
     * Finds the first matching element with the given id namespace.
     * @return {string} the id without the namespace or null if none found.
     */
    getFirstMatching: function (element, namespace) {
      var current = element;
      while (current) {
        if (current.id) {
          var split = current.id.split('.');
          if (split[0] === namespace) {
            return split[1];
          }
        }

        current = current.parentNode;
      };
      return null;
    }
  };
})();
