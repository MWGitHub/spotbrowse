(function () {
  app.main = {
    start: function () {
      var apiUtil = app.apiUtil;
      var primaryArtist = new app.PrimaryArtist();
      var relatedArtists = new app.RelatedArtists();
      var topTracks = new app.TopTracks();
      var player = new app.Player();

      apiUtil.fetchArtist(apiUtil.SEED_ARTIST);
    }
  }
})();
