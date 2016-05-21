(function () {
  app.util = {
    /**
     * Merges two objects with the second overwriting similar properties and
     * returns a new object.
     */
    merge(obj1, obj2) {
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
    removeAllChildren(element) {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    }
  };
})();
