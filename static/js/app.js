(function() {
  "use strict";
  
  var app = {};
(function() {
  var SEED_ARTIST = "4dpARuHxo51G3z768sgnrY";

  function request(inputOptions) {
    var options = app.util.merge({
      url: '',
      data: {},
      method: 'GET',
      onLoad: null,
      onError: null,
      onComplete: null,
    }, inputOptions);

    var req = new XMLHttpRequest();
    req.open(options.method, options.url, true);
    req.onreadystatechange = function () {
      if (req.readyState === XMLHttpRequest.DONE) {
        if (req.status === 200) {
          options.onLoad && options.onLoad(JSON.parse(req.responseText));
        } else {
          options.onError && options.onError();
        }
        options.onComplete && options.onComplete();
      }
    };
    req.send();
  }

  function parse(uri, data) {
    var output = uri;
    for (var key in data) {
      output = uri.replace('{' + key + '}', data[key]);
    }
    return output;
  }

  app.apiUtil = {
    SEED_ARTIST: SEED_ARTIST,

    fetchArtist: function (id) {
      request({
        url: parse('https://api.spotify.com/v1/artists/{id}', { id: id }),
        onLoad: function (data) {
          app.store.receive(app.store.types.RECEIVE_PRIMARY_ARTIST, data);
        },
        onError: function () {
          app.store.receive(app.store.types.ERROR_PRIMARY_ARTISTS);
        }
      });
    },

    fetchRelatedArtists: function (id) {
      request({
        url: parse(
          'https://api.spotify.com/v1/artists/{id}/related-artists', { id: id }
        ),
        onLoad: function (data) {
          app.store.receive(app.store.types.RECEIVE_RELATED_ARTISTS, data);
        },
        onError: function () {
          app.store.receive(app.store.types.ERROR_RELATED_ARTISTS);
        }
      });
    }
  };
})();
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
(function () {
  app.main = {
    start: function () {
      var apiUtil = app.apiUtil;
      var primaryArtist = new app.PrimaryArtist();
      var relatedArtists = new app.RelatedArtists();

      apiUtil.fetchArtist(apiUtil.SEED_ARTIST);
    }
  }
})();
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
(function () {
  var listeners = {};

  var primaryArtist = null;
  var relatedArtists = null;

  app.store = {
    types: {
      RECEIVE_PRIMARY_ARTIST: 'RECEIVE_PRIMARY_ARTIST',
      ERROR_PRIMARY_ARTISTS: 'ERROR_PRIMARY_ARTISTS',
      RECEIVE_RELATED_ARTISTS: 'RECEIVE_RELATED_ARTISTS',
      ERROR_RELATED_ARTISTS: 'ERROR_RELATED_ARTISTS'
    },

    addListener: function (type, callback) {
      if (!listeners[type]) listeners[type] = [];

      listeners[type].push(callback);
    },

    receive: function (type, data) {
      // Update the store if needed
      var types = app.store.types;
      switch (type) {
        case types.RECEIVE_PRIMARY_ARTIST:
          primaryArtist = data;
          break;
        case types.RECEIVE_RELATED_ARTISTS:
          relatedArtists = data.artists;
          break;
      }

      // Run all callbacks matching the type
      var callbacks = listeners[type];
      if (!callbacks) return;

      for (var i = 0; i < callbacks.length; ++i) {
        callbacks[i]();
      }
    },

    getPrimaryArtist: function () {
      return primaryArtist;
    },

    getRelatedArtists: function () {
      return relatedArtists.slice();
    },

    getRelatedArtist: function (id) {
      for (var i = 0; i < relatedArtists.length; ++i) {
        if (relatedArtists[i].id === id) return relatedArtists[i];
      }
      return null;
    }
  };
})();
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

    removeAllChildren(element) {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    }
  };
})();
  document.addEventListener('DOMContentLoaded', function () {
    var main = app.main;
    main.start();
  });
})();
