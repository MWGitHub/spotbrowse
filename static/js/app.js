(function() {
  "use strict";
  
  var app = {};
(function() {
  var SEED_ARTIST = "4dpARuHxo51G3z768sgnrY";

  function request(inputOptions) {
    var options = app.util.merge({
      url: '',
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
      var uri = 'https://api.spotify.com/v1/artists/{id}';
      request({
        url: parse(uri, { id: id }),
        onLoad: function (data) {
          app.store.receive(app.store.types.RECEIVE_PRIMARY_ARTIST, data);
        },
        onError: function () {
          app.store.receive(app.store.types.ERROR_PRIMARY_ARTISTS);
        }
      });
    },

    fetchRelatedArtists: function (id) {
      var uri = 'https://api.spotify.com/v1/artists/{id}/related-artists';
      request({
        url: parse(uri, { id: id }),
        onLoad: function (data) {
          app.store.receive(app.store.types.RECEIVE_RELATED_ARTISTS, data);
        },
        onError: function () {
          app.store.receive(app.store.types.ERROR_RELATED_ARTISTS);
        }
      });
    },

    fetchTopTracks: function (id) {
      var uri = 'https://api.spotify.com/v1/artists/{id}/top-tracks?country=US';
      request({
        url: parse(uri, { id: id }),
        onLoad: function (data) {
          app.store.receive(app.store.types.RECEIVE_TOP_TRACKS, data);
        },
        onError: function () {
          app.store.receive(app.store.types.ERROR_TOP_TRACKS);
        }
      });
    },

    playTrack: function (id) {
      app.store.receive(app.store.types.PLAY_TRACK, id);
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
      var primaryArtist = new app.PrimaryArtist(
        document.getElementById('primary-artist')
      );
      var relatedArtists = new app.RelatedArtists();
      var topTracks = new app.TopTracks();
      var player = new app.Player();

      apiUtil.fetchArtist(apiUtil.SEED_ARTIST);
    }
  }
})();
(function () {
  var id = 'player';

  var updaters = {
    player: function (element, value) {
      // var src = 'https://embed.spotify.com/?uri=' + value;
      // src += '&view=coverart'
      // element.setAttribute('src', src);
      var playerFrame = document.getElementById(id);
      playerFrame.contentWindow.postMessage(value.preview_url, '*');
    }
  }

  function Player() {
    this._root = document.getElementById(id);
    this._block = new app.Block();
    this._block.setBinder('player', this._root, updaters.player);

    var store = app.store;
    var handleChange = this._handleChange.bind(this);
    store.addListener(store.types.RECEIVE_PRIMARY_ARTIST, handleChange);
    store.addListener(store.types.PLAY_TRACK, this._handlePlay.bind(this));
  }

  Player.prototype._handleChange = function () {
    // this._root.setAttribute('src', '');
  };

  Player.prototype._handlePlay = function () {
    var track = app.store.getPlayingTrack();
    this._block.updateProperties({
      player: track
    });
  };

  app.Player = Player;
})();
(function () {
  var updaters = {
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

    var bindPoints = wrap(this._root);
    for (var key in bindPoints) {
      this._block.setBinder(key, bindPoints[key], updaters[key]);
    }

    app.store.addListener(app.store.types.RECEIVE_PRIMARY_ARTIST,
      this._handleArtistChange.bind(this));
  };

  PrimaryArtist.prototype._handleArtistChange = function () {
    window.scrollTo(0, 0);
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
  var relatedArtists = [];
  var topTracks = [];
  var playingTrackId = null;

  app.store = {
    types: {
      RECEIVE_PRIMARY_ARTIST: 'RECEIVE_PRIMARY_ARTIST',
      ERROR_PRIMARY_ARTISTS: 'ERROR_PRIMARY_ARTISTS',
      RECEIVE_RELATED_ARTISTS: 'RECEIVE_RELATED_ARTISTS',
      ERROR_RELATED_ARTISTS: 'ERROR_RELATED_ARTISTS',
      RECEIVE_TOP_TRACKS: 'RECEIVE_TOP_TRACKS',
      ERROR_TOP_TRACKS: 'ERROR_TOP_TRACKS',
      PLAY_TRACK: 'PLAY_TRACK'
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
        case types.RECEIVE_TOP_TRACKS:
          topTracks = data.tracks.slice(0, 10);
          break;
        case types.PLAY_TRACK:
          playingTrackId = data;
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
    },

    getTopTracks: function () {
      return topTracks.slice();
    },

    getTrack: function (id) {
      for (var i = 0; i < topTracks.length; ++i) {
        if (topTracks[i].id === id) return topTracks[i];
      }
      return null;
    },

    getPlayingTrack: function () {
      return app.store.getTrack(playingTrackId);
    }
  };
})();
(function () {
  var id = 'top-tracks';

  function handleTrackClick(id) {
    return function (e) {
      app.apiUtil.playTrack(id);
    };
  }

  var updaters = {
    tracks: function (element, value) {
      app.util.removeAllChildren(element);

      // Display no tracks found
      if (value.length === 0) {
        var message = document.createElement('p');
        message.textContent = 'No tracks found.';
        element.appendChild(message);
        return;
      }

      for (var i = 0; i < value.length; ++i) {
        var track = value[i];
        element.appendChild(create(track));
      }
    }
  }

  function create(track) {
    var list = document.createElement('li');
    list.setAttribute('class', 'group');

    var play = document.createElement('button');
    play.innerHTML = '&#9658;';
    var clickFunction = handleTrackClick(track.id);
    play.addEventListener('click', clickFunction);
    play.addEventListener('touchend', clickFunction);
    list.appendChild(play);

    var name = document.createElement('p');
    name.textContent = track.name;
    list.appendChild(name);

    return list;
  }

  function TopTracks() {
    this._root = document.getElementById(id);
    this._block = new app.Block();
    this._block.setBinder('tracks', this._root, updaters.tracks);

    var store = app.store;
    store.addListener(store.types.RECEIVE_PRIMARY_ARTIST,
      this._handleArtistChange.bind(this));
    store.addListener(store.types.RECEIVE_TOP_TRACKS,
      this._handleTracksChange.bind(this));
  }

  TopTracks.prototype._handleArtistChange = function () {
    var artist = app.store.getPrimaryArtist();
    app.apiUtil.fetchTopTracks(artist.id);
  };

  TopTracks.prototype._handleTracksChange = function () {
    var tracks = app.store.getTopTracks();
    this._block.updateProperties({
      tracks: tracks
    });
  };

  app.TopTracks = TopTracks;
})();
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
  document.addEventListener('DOMContentLoaded', function () {
    var main = app.main;
    main.start();
  });
})();
