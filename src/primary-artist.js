(function () {
  var updaters = {
    loader: function (element, value) {

    },

    artist: function (element, value) {
      element.textContent = value;
    },

    imageContainer: function (element, value) {
      element.style['background-image'] = 'url(' + value + ')';
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

  function wrap(root) {
    var artist = root.getElementsByClassName('artist-name')[0];
    var imageContainer = root.getElementsByClassName('artist-image-container')[0];
    var image = root.getElementsByTagName('img')[0];
    var followers = root.getElementsByClassName('artist-followers')[0];
    var view = root.getElementsByClassName('artist-link')[0];

    return {
      artist: artist,
      imageContainer: imageContainer,
      image: image,
      followers: followers,
      view: view
    };
  }

  function PrimaryArtist(root) {
    this._block = new app.Block();
    this._root = root;
    this._loader = app.elemental.create.loader();

    var bindPoints = wrap(this._root);
    for (var key in bindPoints) {
      this._block.setBinder(key, bindPoints[key], updaters[key]);
    }

    app.store.addListener(app.store.types.SWITCHING_ARTIST,
      this._handleSwitching.bind(this));
    app.store.addListener(app.store.types.RECEIVE_PRIMARY_ARTIST,
      this._handleArtistChange.bind(this));
  };

  PrimaryArtist.prototype._handleSwitching = function () {
    window.scrollTo(0, 0);
    this._root.appendChild(this._loader);
  };

  PrimaryArtist.prototype._handleArtistChange = function () {
    this._root.removeChild(this._loader);

    var data = app.store.getPrimaryArtist();
    var image = data.images.length > 0 ? data.images[0].url : '';
    this._block.updateProperties({
      artist: data.name,
      imageContainer: image,
      image: image,
      followers: data.followers.total,
      view: data.external_urls.spotify
    });
  };

  app.PrimaryArtist = PrimaryArtist;
})();
