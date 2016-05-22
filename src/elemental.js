/**
 * Factory for creating components.
 */
(function () {
  app.elemental = {
    create: {
      loader: function () {
        var root = document.createElement('ul');
        root.setAttribute('class', 'loader');
        root.appendChild(document.createElement('li'));
        root.appendChild(document.createElement('li'));

        return root;
      }
    }
  }
})();
