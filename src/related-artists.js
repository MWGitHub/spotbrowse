(function () {
  var id = 'related-artists';
  var idNamespace = 'related-artists-item-id';

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
    list.setAttribute('id', idNamespace + '.' + artist.id);
    list.setAttribute('class', 'group');

    var imageContainer = document.createElement('div');
    imageContainer.setAttribute('class', 'related-artists-image-container');
    list.appendChild(imageContainer);
    var image = document.createElement('img');
    var images = artist.images;
    var imageURL = images.length > 0 ? images[images.length - 1].url : '';
    imageContainer.style['background-image'] = 'url(' + imageURL + ')';
    image.setAttribute('src', imageURL);
    image.setAttribute('alt', 'related artist image');
    imageContainer.appendChild(image);

    var infoContainer = document.createElement('div');
    infoContainer.setAttribute('class', 'related-artists-info');
    list.appendChild(infoContainer);

    var name = document.createElement('p');
    name.textContent = artist.name;
    infoContainer.appendChild(name);

    var see = document.createElement('button');
    see.textContent = 'See';
    infoContainer.appendChild(see);

    return list;
  }

  function handleRelatedClick(e) {
    var target = e.target;
    if (target.tagName === 'LI' || target.tagName === 'DIV') {
      return;
    }

    var match = app.util.getFirstMatching(target, idNamespace);

    if (match) {
      app.apiUtil.fetchArtist(match);
    }
  }

  function RelatedArtists() {
    this._root = document.getElementById(id);
    this._root.addEventListener('click', handleRelatedClick);
    this._root.addEventListener('touchend', handleRelatedClick);
    this._block = new app.Block();
    this._block.setBinder('artists', this._root, updaters.artists);
    this._loader = app.elemental.create.loader();

    var store = app.store;
    app.store.addListener(app.store.types.SWITCHING_ARTIST,
      this._handleSwitching.bind(this));
    store.addListener(store.types.RECEIVE_PRIMARY_ARTIST,
      this._handleArtistChange.bind(this));
    store.addListener(store.types.RECEIVE_RELATED_ARTISTS,
      this._handleRelatedChange.bind(this));
  }

  RelatedArtists.prototype._handleSwitching = function () {
    this._root.appendChild(this._loader);
  };

  RelatedArtists.prototype._handleArtistChange = function () {
    var artist = app.store.getPrimaryArtist();
    app.apiUtil.fetchRelatedArtists(artist.id);
  };

  RelatedArtists.prototype._handleRelatedChange = function () {
    var artists = app.store.getRelatedArtists();
    this._block.updateProperties({
      artists: artists
    });
  };

  app.RelatedArtists = RelatedArtists;
})();
