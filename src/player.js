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
