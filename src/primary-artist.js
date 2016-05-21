(function () {
  var id = 'primary-artist';

  var updaters = {
    artist: function (element, value) {
      element.textContent = value;
    },

    image: function (element, value, properties) {
      element.setAttribute('src', value);
      element.setAttribute('alt', properties.artist + ' image');
    },

    followers: function (element, value) {
      var followers = value === 1 ? 'follower' : 'followers';
      element.textContent = value + ' ' + followers;
    },

    view: function (element, value) {
      element.setAttribute('href', value);
    }
  }

  function create(root) {
    var artist = document.createElement('h1');
    root.appendChild(artist);
    var image = document.createElement('img');
    root.appendChild(image);
    var followers = document.createElement('p');
    root.appendChild(followers);
    var viewWrapper = document.createElement('p');
    root.appendChild(viewWrapper);
    var view = document.createElement('a');
    viewWrapper.appendChild(view);

    return {
      artist: artist,
      image: image,
      followers: followers,
      view: view
    };
  }

  function PrimaryArtist() {
    this._block = new app.Block();
    this._root = null;

    app.store.addListener(app.store.types.RECEIVE_PRIMARY_ARTIST,
      this._handleArtistChange.bind(this));
  };

  PrimaryArtist.prototype._handleArtistChange = function () {
    // Create the element on first set
    if (!this._root) {
      this._root = document.getElementById(id);
      app.util.removeAllChildren(this._root);

      var bindPoints = create(this._root);
      for (var key in bindPoints) {
        this._block.setBinder(key, bindPoints[key], updaters[key]);
      }
    }

    var data = app.store.getPrimaryArtist();
    this._block.updateProperties({
      artist: data.name,
      image: data.images[0].url,
      followers: data.followers.total,
      view: data.href
    });
  };

  app.PrimaryArtist = PrimaryArtist;
})();
