/**
 * Represents a block of data with updatable elements.
 */
(function () {
  function Block() {
    this._binders = {};
  }

  /**
   * Set a binder for the block to run when updating.
   * @param {string}      property     the name of the property.
   * @param {HTMLElement} element      the element to update from.
   * @param {function(HTMLElement, *, *)} handleChange the function to run on
   *                                   property change.
   */
  Block.prototype.setBinder = function (property, element, handleChange) {
    this._binders[property] = {
      element: element,
      onChange: handleChange
    };
  };

  Block.prototype.removeBinder = function (property) {
    delete this._binders[property];
  }

  /**
   * Updates the properties if they are changed.
   * @param  {Object} properties the properties with keys as property names and
   *                             values as the new values.
   */
  Block.prototype.updateProperties = function (properties) {
    for (var key in this._binders) {
      var binder = this._binders[key];
      binder.onChange(binder.element, properties[key], properties);
    }
  };

  app.Block = Block;
})();
