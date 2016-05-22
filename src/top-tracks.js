(function () {
  var id = 'top-tracks';
  var idNamespace = 'top-tracks-item';

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
    list.setAttribute('id', idNamespace + '.' + track.id);
    list.setAttribute('class', 'group');

    var play = document.createElement('button');
    play.setAttribute('class', 'track-neutral');
    play.innerHTML = '&#9658;';
    list.appendChild(play);

    var name = document.createElement('p');
    name.textContent = track.name;
    list.appendChild(name);

    return list;
  }

  function handleTrackClick(e) {
    if (app.toucher.recentlyTouched()) {
      return;
    }
    app.toucher.touch();

    var target = e.target;
    if (target.tagName !== 'BUTTON') {
      return;
    }

    var match = app.util.getFirstMatching(target, idNamespace);

    if (match) {
      var current = app.store.getPlayingTrack();
      var next = app.store.getTrack(match);
      if (app.store.getIsTrackPlaying() && current.id === next.id) {
        app.apiUtil.pauseTrack(next);
      } else {
        app.apiUtil.playTrack(next);
      }
    }
  }

  function TopTracks() {
    this._root = document.getElementById(id);
    this._root.addEventListener('click', handleTrackClick);
    this._root.addEventListener('touchend', handleTrackClick);

    this._block = new app.Block();
    this._block.setBinder('tracks', this._root, updaters.tracks);

    this._loader = app.elemental.create.loader();

    var store = app.store;
    app.store.addListener(app.store.types.SWITCHING_ARTIST,
      this._handleSwitching.bind(this));
    store.addListener(store.types.RECEIVE_PRIMARY_ARTIST,
      this._handleArtistChange.bind(this));
    store.addListener(store.types.RECEIVE_TOP_TRACKS,
      this._handleTracksChange.bind(this));
    store.addListener(store.types.PLAY_TRACK,
      this._handlePlayTrack.bind(this));
    store.addListener(store.types.PAUSE_TRACK,
      this._handlePauseTrack.bind(this));
  }

  TopTracks.prototype._handleSwitching = function () {
    this._root.appendChild(this._loader);
  };

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

  /**
   * Stop tracks and play the current one.
   */
  TopTracks.prototype._handlePlayTrack = function () {
    var current = app.store.getPlayingTrackId();
    var tracks = this._root.children;
    for (var i = 0; i < tracks.length; ++i) {
      var track = tracks[i];
      var button = track.children[0]
      var id = app.util.extractId(track.id);
      if (id !== current) {
        button.setAttribute('class', 'track-neutral');
        button.innerHTML = '&#9658;';
      } else {
        button.setAttribute('class', 'track-playing');
        button.innerHTML = '&#10073;&#10073;';
      }
    }
  };

  /**
   * Pause the current playing track.
   */
  TopTracks.prototype._handlePauseTrack = function () {
    var current = app.store.getPlayingTrackId();
    var tracks = this._root.children;
    for (var i = 0; i < tracks.length; ++i) {
      var track = tracks[i];
      var id = app.util.extractId(track.id);
      if (id === current) {
        var button = track.children[0]
        button.setAttribute('class', 'track-neutral');
        button.innerHTML = '&#9658;';
      }
    }
  };

  app.TopTracks = TopTracks;
})();
