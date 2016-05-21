(function () {
  app.main = {
    start: function () {
      var apiUtil = app.apiUtil;
      var primaryArtist = new app.PrimaryArtist();
      var relatedArtists = new app.RelatedArtists();

      apiUtil.fetchArtist(apiUtil.SEED_ARTIST);
    }
  }
})();
