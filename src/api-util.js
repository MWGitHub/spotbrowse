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
      app.store.receive(app.store.types.SWITCHING_ARTIST);
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
