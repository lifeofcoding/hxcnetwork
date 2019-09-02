var getArtist = (req, res) => {
  return new Promise(function(resolve, reject) {
    let artists = [];
    let artistId = '';
    let artistData = '';
    spotifyApi
      .searchArtists(req.params.terms)
      .then(function(data) {
        //console.log('Search artists ' + req.params.terms, data.body);
        artists = data.body.artists;
        //console.log(JSON.stringify(artists));
        //console.log(artists.items[0])
        artistId = artists.items[0].id;
        console.log('grabbing data for id' + artistId);
        return spotifyApi.getArtist(artistId);
      })
      .then(function(data) {
        artistData = data;
        return spotifyApi.getArtistRelatedArtists(artistId);
      })
      .then(function(data) {
        resolve({...artistData, ...data.body});
      });
  });
};

module.exports = {
  getArtist
};