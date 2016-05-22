(function () {
  var id = 'player';

  var MESSAGE_TYPES = {
    PLAY: 'PLAY',
    PAUSE: 'PAUSE',
    DONE: 'DONE',
    CHANGE_ARTIST: 'CHANGE_ARTIST'
  }

  function Player() {
    this._root = document.getElementById(id);
    this._port = null;

    var store = app.store;
    store.addListener(store.types.PLAY_TRACK, this._handlePlay.bind(this));
    store.addListener(store.types.PAUSE_TRACK, this._handlePause.bind(this));

    this._connect();
  }

  /**
   * Connect with the player frame.
   */
  Player.prototype._connect = function () {
    var channel = new MessageChannel();
    var playerFrame = document.getElementById(id);
    var playerWindow = playerFrame.contentWindow;
    playerFrame.addEventListener('load', function () {
      playerWindow.postMessage('ping', '*', [channel.port2]);
    }, false);

    this._port = channel.port1;
    this._port.addEventListener('message', this._handleMessage.bind(this));
    this._port.start();
  };

  Player.prototype._handleMessage = function (e) {
    var data = e.data;
    switch (data.type) {
      case MESSAGE_TYPES.PLAY:
        app.apiUtil.playTrack(app.store.getPlayingTrack());
        break;
      case MESSAGE_TYPES.PAUSE:
        app.apiUtil.pauseTrack(app.store.getPlayingTrack());
        break;
      case MESSAGE_TYPES.DONE:
        app.apiUtil.pauseTrack(app.store.getPlayingTrack());
        break;
      case MESSAGE_TYPES.CHANGE_ARTIST:
        // Only change if primary is different
        if (app.store.getPrimaryArtist().id === data.id) {
          return;
        }
        
        app.apiUtil.fetchArtist(data.id);
        break;
    }
  };

  Player.prototype._handlePlay = function () {
    var track = app.store.getPlayingTrack();
    this._port.postMessage({
      type: MESSAGE_TYPES.PLAY,
      track: track
    });
  };

  Player.prototype._handlePause = function () {
    var track = app.store.getPlayingTrack();
    this._port.postMessage({ type: MESSAGE_TYPES.PAUSE });
  };

  app.Player = Player;
})();
