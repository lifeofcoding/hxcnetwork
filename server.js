const _ = require('lodash');
const http = require('http');
const https = require('https');
const path = require('path');
const express = require('express');
const app = express();
const appDir = path.resolve(__dirname, 'dist');
const pingmydyno = require('pingmydyno');
const router = express.Router();
const spotifyRoute = express.Router();
const axios = require('axios');
const geoip = require('geoip-lite');
const request = require('request');
const isHeroku = require('is-heroku');
const vhost = require('vhost');
const fs = require('fs');
const shell = require('shelljs');
var readline = require('readline');
var stream = require('stream');
var upload = require('./upload');
const cheerio = require('cheerio');
const Spotify = require('node-spotify-api');
var path = require('path');
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

const Sentry = require('@sentry/node');
Sentry.init({
  dsn: 'https://58ee016bc0c74fbe99eb5604ff5eaca4@sentry.io/1447987',
});

// credentials are optional
/*
const spotifyApi = new SpotifyWebApi({
  clientId: '2dc9424b5b0941f98e93d79db282c8ff',
  clientSecret: 'fc511781fcf14cf8af2f26423c14cd9b',
  redirectUri: 'http://hxcnetwork.com/spotifyCallback',
});
*/
var homeIp = 'http://lifeofcoding.ddns.net';
/*
spotifyApi.clientCredentialsGrant().then(
  function(data) {
    console.log('The access token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);
  },
  function(err) {
    console.log(
      'Something went wrong when retrieving an access token',
      err.message
    );
  }
);
*/
function getProxies(callback) {
  axios
    .get('https://freevpn.zone/config/?id=ogojkdkkcopeepagdlddbninobfhfbcb')
    .then(res => {
      let locations = res.data.locations;

      var proxies = [];
      locations.forEach(l => {
        proxies = proxies.concat(l.nodes);
      });

      if (callback) {
        callback(proxies);
      }
    });
}

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.use(express.json());
spotifyRoute.use(express.json());

app.use(
  vhost('machine.hxcnetwork.com', (req, res) => {
    console.log('Sending request to laptop:', 'http://' + homeIp + req.path);
    request('http://' + homeIp + req.path).pipe(res);
  })
);

if (isHeroku) {
  app.use(express.static(appDir));
}

const MongoClient = require('mongodb').MongoClient;

const dbName = 'heroku_3xj7kmcz';

const client = new MongoClient(
  'mongodb://jimmy:rousseau1@ds145456.mlab.com:45456/heroku_3xj7kmcz'
);

client.connect(function(err) {
  if (err) {
    return console.error(err);
  }

  const db = client.db(dbName);
  const collection = db.collection('proxies');

  console.log('Connected successfully to server');

  router.use('/spotify', spotifyRoute);
  app.use('/api', router);
  //app.use("/spotify",spotifyRoute);

//   spotifyRoute.get('/search/:terms', (req, res) => {
//     console.log('search spotifyRoute');
//     let artists = [];
//     let artistId = '';
//     let artistData = '';
//     spotifyApi
//       .searchArtists(req.params.terms)
//       .then(function(data) {
//         //console.log('Search artists ' + req.params.terms, data.body);
//         artists = data.body.artists;
//         //console.log(JSON.stringify(artists));
//         //console.log(artists.items[0])
//         artistId = artists.items[0].id;
//         console.log('grabbing data for id' + artistId);
//         return spotifyApi.getArtist(artistId);
//       })
//       .then(function(data) {
//         artistData = data;
//         return spotifyApi.getArtistRelatedArtists(artistId);
//       })
//       .then(function(data) {
//         //console.log(data)
//         artistData.related = data.body.artists;
//         res.json(artistData);
//       });
//   });

  app.all('*', function(req, res) {
    if (isHeroku) {
      res.sendFile(path.join(appDir, 'index.html'));
    } else {
      //console.log('sending request')
      request(`http://127.0.0.1:8011/${req.url}`).pipe(res);
    }
  });

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

  router.get('/search/:search', function(req, res) {
    res.type('application/json');

    console.log('search spotifier for ', req.params.search);

    let results = [];
    /*
    var client = spotifier({
      albumUrl: 'https://api.spotify.com/v1/albums',
      authorizationUrl: 'https://accounts.spotify.com/api/token',
      clientId: '2dc9424b5b0941f98e93d79db282c8ff',
      clientSecret: 'fc511781fcf14cf8af2f26423c14cd9b',
      searchResultLimit: 30,
      searchUrl: 'https://api.spotify.com/v1/search',
      timeout: 10000,
    });
    */

    var spotify = new Spotify({
      id: '2dc9424b5b0941f98e93d79db282c8ff',
      secret: 'fc511781fcf14cf8af2f26423c14cd9b',
      limit: 50
    });
/*
var SpotifyModule = require('spotify-middleware-webapi');
var spotifyModule = new SpotifyModule({
  "credentials": {
    "clientId": "[clientId]",
    "clientSecret": "[clientSecret]",
    "redirect_uri": "http://localhost:3000/auth/callback"
  }
});

var q = req.params.search;
var opts = {
  limit: 20,
  offset: 0,
  market: 'US',
  type: ['album', 'artist', 'track', 'playlist']
};

spotifyModule.search(q, opts, {
  accessToken: accessToken,
  refreshToken: refreshToken
}, function(err, results, accessToken) {
  console.log(results);
  res.json(results);
});
*/


    var songSearch = require(path.resolve('/song-search/main.js'));
    
    songSearch.search({
      search: req.params.search,
      limit: 50, // defaults to 50
      itunesCountry: 'us', // defaults to 'us'
      youtubeAPIKey: 'AIzaSyBKMRMYEiUIePp2IKzBNgCaxVLgFhjMSlQ',
    }, function(err, songs) {
      console.log(songs); // will print out the 50 most
        res.json(songs);
    });
/*
    spotify.search({type: 'track', query: req.params.search}, function(
      err,
      data
    ) {
      if (err) {
        return console.log('Error occurred: ' + err);
      }
        //console.log(data);


        let tracks = data.tracks.items;
        let filteredResponse = [];

        tracks.forEach ((track) => {
            console.log(track);
            const filteredTrack = {
                album: {
                    name: track.album.name,
                    uri: track.album.uri,
                    image: track.album.images[0].url
                },
                artist: track.artists.map (x => x.name)[0],
                duration: track.duration_ms,
                uri: track.uri,
                popularity: track.popularity,
                track: track.name,
                url: `/api/query/${track.artists.map (x => x.name)[0]} - ${track.name}`
            };
            filteredResponse.push (filteredTrack);
        });

        res.json(filteredResponse);
    });
*/

    /*
    client.search(params, function(err, result) {
      // work with results here...
  //res.json(result);
  if (err) console.log(err)
      res.json({results: result});
    });
    */
    /*
    request(`http://127.0.0.1:8011/${req.url}`).pipe(res);
    //https://api.spotify.com/v1/search
    spotifyApi
      .searchTracks(req.params.search)
      .then(function(data) {
        console.log('I got ' + data.body.tracks.total + ' results!');

        var firstPage = data.body.tracks.items;
        console.log(
          'The tracks in the first page are.. (popularity in parentheses)'
        );

        results = [];
        firstPage.forEach(function(track, index) {
          track.artist = track.artists[track.arists.length - 1].name;

          console.log(index + ': ' + track.artist + ' ' + track.name + '');

          track.downloadUrl = '/query/' + track.artist + ' - ' + track.name;

          results.push(track);
        });

        res.json(results);
      })
      .catch(function(err) {
        console.log('Something went wrong:', err.message);
      });
      */
    /*
     request(`https://jewtube.herokuapp.com/search/${req.params.search}`).pipe(
      res
    );
    */
  });
  router.get('/query/:term', (req, res) => {
    let { term } = req.params;
    console.log(`Querying for '${req.params.term}'...`);
var songSearch = require('./song-search/main.js');

songSearch.search({
  search: term,
  limit: 50, // defaults to 50
  itunesCountry: 'us', // defaults to 'us'
  youtubeAPIKey: 'AIzaSyBKMRMYEiUIePp2IKzBNgCaxVLgFhjMSlQ',
}, function(err, songs) {
  console.log(songs); // will print out the 50 most
  // res.send(results);
      let vid = songs.items[0];
      res.setHeader(
        'content-disposition',
        'attachment; filename=' +
          _.replace(vid.snippet.title, ' ', '_') +
          '.mp3'
      );
      request(`/${req.params.videoId}`).pipe(res);
})
});

  router.get('/query2/:term', (req, res) => {
    let { term } = req.query;
    term = decodeURIComponent(term);
    console.log(`Querying for '${req.params.term}'...`);

    https.get(
      'https://www.youtube.com/results?search_query=' + req.query.term,
      resp => {
        let body = '';

        resp.on('data', chunk => {
          body += chunk;
        });

        resp.on('end', () => {
          let $ = cheerio.load(body);

          let videoLink = null;
          let videoTitle = null;
          let videoId = null;

          $('a[rel="spf-prefetch"]').each((i, elem) => {
            if (
              $(elem)
                .attr('href')
                .toString()
                .indexOf('ad') === -1
                 && _.includes($(elem).text(), term)
            ) {
              videoId = $(elem)
                .attr('href')
                .replace('/watch?v=', '');
              //videoLink = `https://www.youtube.com${$(elem).attr('href')}`;
              videoTitle = $(elem).attr('title');

              console.log(`Found match: '${videoTitle}'! Redirecting...`);
              //console.log(`redirecting to /download/${videoId}`);
              //res.redirect(`/download/${videoId}`);

              res.setHeader(
                'content-disposition',
                'attachment; filename=' +
                  _.replace(videoTitle, ' ', '_') +
                  '.mp3'
              );
              request(`http://jewtube.herokuapp.com/${videoId}`).pipe(res);

              return false;
            }
          });
        });
      }
    );
  });

  router.get('/localLink/:code', function(req, res) {
    if (req.params.code === 'jew') {
      let IP = req.connection.remoteAddress;
      homeIp = IP.split(':')[3];
      res.json({success: true, ip: homeIp});
    } else {
      res.json({success: false});
    }
  });

  router.get('/download/:videoId', function(req, res) {
    axios.get(`/get/${req.params.videoId}`).then(ress => {
      let vid = ress.data.items[0];
      res.setHeader(
        'content-disposition',
        'attachment; filename=' +
          _.replace(vid.snippet.title, ' ', '_') +
          '.mp3'
      );
      request(`/${req.params.videoId}`).pipe(res);
    });
  });

  var _sources = [];
  var _readSourcesFromFile = function(file, callback) {
    var instream = fs.createReadStream(file);
    var outstream = new stream();
    var rl = readline.createInterface(instream, outstream);

    rl.on('line', function(line) {
      _sources.push(line);
    });
    rl.on('close', function(line) {
      callback(_sources);
    });
  };

  router.get('/sources', function(req, res) {
    console.log('get sources');
    _readSourcesFromFile('./proxyfarm/sources.txt', function(sourcesArr) {
      console.log(sourcesArr);
      res.json(sourcesArr);
    });
  });

  router.post('/upload', upload);

  router.get('/proxies', function(req, res) {
    collection.find({}).toArray(function(err, docs) {
      res.json({proxies: docs});
    });
    /*
      let proxies = [];
      getProxies((results) => {
        results.map((p) => {
          let geo = geoip.lookup(p.ip);

          proxies.push({
            type: p.schema,
            address: p.ip,
            port: p.port,
            city: geo.city,
            country: geo.country
          })
        })
        res.json({proxies: proxies})
      })
      */
  });

  var io = require('socket.io')(server);

  io.on('connection', function(socket) {
    console.log('a user connected');

    socket.on('getProxies', () => {
      console.log('getProxies called');
      shell
        .exec('python3 ./ProxyBroker/examples/custom.py', {async: true})
        .stdout.on('data', function(data) {
          console.log('' + data);
          socket.emit('scrapeOutput', '' + data);
        });
    });

    //       shell.exec('screen -r', {async:true}).stdout.on('data', function(data) {
    //         //console.log('' + data);
    //         socket.emit('output', '' + data);
    //       });
  });

  server.listen(PORT, function() {
    console.log('Server listening on port ' + PORT);
    console.log('http://www.HXCNetwork.com:' + PORT);

    pingmydyno('https://hxcnet.herokuapp.com/');
  });
});
