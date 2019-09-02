const CONCURRENCY = process.env.WEB_CONCURRENCY || 1;

const _ = require('lodash');
const http = require('http');
const https = require('https');
const path = require('path');
const express = require('express');
const app = express();
const appDir = path.resolve(__dirname, 'dist');
const pingmydyno = require('pingmydyno');
const router = express.Router();
const axios = require('axios');
const request = require('request');
const isHeroku = require('is-heroku');
const vhost = require('vhost');
const fs = require('fs');
const shell = require('shelljs');
const readline = require('readline');
const stream = require('stream');
const upload = require('./upload');
const cheerio = require('cheerio');
const server = http.createServer(app);

const SpotifyWebApi = require('spotify-web-api-node');

const PORT = process.env.PORT || 3000;

console.log(process.cwd());
const songSearch = require(path.join(process.cwd(), './search/main'));
const youtubeAPIKey = 'AIzaSyBKMRMYEiUIePp2IKzBNgCaxVLgFhjMSlQ';

const spotifyApi = new SpotifyWebApi({
  clientId: '2dc9424b5b0941f98e93d79db282c8ff',
  clientSecret: 'fc511781fcf14cf8af2f26423c14cd9b',
  redirectUri: 'http://hxcnetwork.com/spotifyCallback',
});

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.use(express.json());

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

  app.use('/api', router);

  app.all('*', function(req, res) {
    if (isHeroku) {
      res.sendFile(path.join(appDir, 'index.html'));
    } else {
      //console.log('sending request')
      request(`http://127.0.0.1:8011/${req.url}`).pipe(res);
    }
  });

  router.get('/search/:search', function(req, res) {
    let {search} = req.params;
    // print the args out
    console.log('Searching for songs...');
    console.log('Search: ' + search);

    songSearch.search(
      {
        search: search,
        limit: 50, // defaults to 50
        itunesCountry: 'us', // defaults to 'us'
        youtubeAPIKey: youtubeAPIKey,
      },
      function(err, songs) {
        console.log([err, songs]);

        if (!err) {
          res.json(songs);
        } else {
          res.json({error: err});
        }
      }
    );
  });

  router.get('/download/:videoId', function(req, res) {
    request(`https://jewtube.herokuapp.com/${req.params.videoId}`).pipe(res);
  });

  router.get('/artists/:terms', (req, res) => {
    console.log('search artists');
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
        //console.log(data)
        artistData.related = data.body.artists;
        res.json(artistData);
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

  const io = require('socket.io')(server);

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
  });

  server.listen(PORT, function() {
    console.log('Server listening on port ' + PORT);
    pingmydyno('https://hxcnet.herokuapp.com/');
  });
});
