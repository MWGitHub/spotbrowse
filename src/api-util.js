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
