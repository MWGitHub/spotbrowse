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
