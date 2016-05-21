(function () {
  var id = 'related-artists';

  function handleArtistClick(id) {
    return function (e) {
      app.apiUtil.fetchArtist(id);
    };
  }

  var updaters = {
    artists: function (element, value) {
      app.util.removeAllChildren(element);

      // Display no artists found
      if (value.length === 0) {
        var message = document.createElement('p');
        message.textContent = 'No related artists found.';
        element.appendChild(message);
        return;
      }

      for (var i = 0; i < value.length; ++i) {
        var artist = value[i];
        element.appendChild(create(artist));
      }
    }
  }

  function create(artist) {
    var list = document.createElement('li');
    var name = document.createElement('p');
    name.textContent = artist.name;
    list.appendChild(name);

    var image = document.createElement('img');
    var images = artist.images;
    image.setAttribute('src', images[images.length - 1].url);
    image.setAttribute('alt', 'related artist image');
    list.appendChild(image);

    var see = document.createElement('button');
    see.textContent = 'See';
    var clickFunction = handleArtistClick(artist.id);
    see.addEventListener('click', clickFunction);
    see.addEventListener('touchend', clickFunction);
    list.appendChild(see);

    return list;
  }

  function RelatedArtists() {
    this._artists = [];
    this._root = document.getElementById(id);
    this._block = new app.Block();
    this._block.setBinder('artists', this._root, updaters.artists);

    var store = app.store;
    store.addListener(store.types.RECEIVE_PRIMARY_ARTIST,
      this._handleArtistChange.bind(this));
    store.addListener(store.types.RECEIVE_RELATED_ARTISTS,
      this._handleRelatedChange.bind(this));
  }

  RelatedArtists.prototype._handleArtistChange = function () {
    var artist = app.store.getPrimaryArtist();
    app.apiUtil.fetchRelatedArtists(artist.id);
  };

  RelatedArtists.prototype._handleRelatedChange = function () {
    this._root = document.getElementById(id);

    var artists = app.store.getRelatedArtists();
    this._block.updateProperties({
      artists: artists
    });
  };

  app.RelatedArtists = RelatedArtists;
})();
