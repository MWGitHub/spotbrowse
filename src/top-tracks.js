(function () {
  var id = 'top-tracks';

  function handleTrackClick(id) {
    return function (e) {
      console.log(id);
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
    var name = document.createElement('p');
    name.textContent = track.name;
    list.appendChild(name);

    var play = document.createElement('button');
    play.textContent = 'Play';
    var clickFunction = handleTrackClick(track.id);
    play.addEventListener('click', clickFunction);
    play.addEventListener('touchend', clickFunction);
    list.appendChild(play);

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