(function () {
  var listeners = {};

  var primaryArtist = null;
  var relatedArtists = [];
  var topTracks = [];
  var currentTrack = null;
  var isTrackPlaying = false;

  app.store = {
    types: {
      SWITCHING_ARTIST: 'SWITCHING_ARTIST',
      RECEIVE_PRIMARY_ARTIST: 'RECEIVE_PRIMARY_ARTIST',
      ERROR_PRIMARY_ARTISTS: 'ERROR_PRIMARY_ARTISTS',
      RECEIVE_RELATED_ARTISTS: 'RECEIVE_RELATED_ARTISTS',
      ERROR_RELATED_ARTISTS: 'ERROR_RELATED_ARTISTS',
      RECEIVE_TOP_TRACKS: 'RECEIVE_TOP_TRACKS',
      ERROR_TOP_TRACKS: 'ERROR_TOP_TRACKS',
      PLAY_TRACK: 'PLAY_TRACK',
      PAUSE_TRACK: 'PAUSE_TRACK'
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
          isTrackPlaying = true;
          currentTrack = data;
          break;
        case types.PAUSE_TRACK:
          isTrackPlaying = false;
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

    getPlayingTrackId: function () {
      return currentTrack.id;
    },

    getPlayingTrack: function () {
      return currentTrack;
    },

    getIsTrackPlaying: function () {
      return isTrackPlaying;
    }
  };
})();
