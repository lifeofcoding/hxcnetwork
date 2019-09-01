'use strict';
let http       = require('http');
let https      = require('https');
let fs         = require('fs');
let express    = require('express');
let cheerio    = require('cheerio');

let youtubeStream = require('youtube-audio-stream');

let app    = express();
app.server = http.createServer(app);

app.use(express.static('static'));

app.get('/', (req, res) => {
	res.sendFile(`${__dirname}/static/index.html`);
});

app.get('/query', (req, res) => {
	console.log(`Querying for '${req.query.term}'...`);

	https.get('https://www.youtube.com/results?search_query=' + req.query.term, (resp) => {
		let body = '';

		resp.on('data', (chunk) => {
			body += chunk;
		});

		resp.on('end', () => {
			let $ = cheerio.load(body);

			let videoLink = null;
			let videoTitle = null;

			$('a[rel="spf-prefetch"]').each((i, elem) => {
				if ($(elem).attr('href').toString().indexOf('ad') === -1) {
          //videoLink = `https://www.youtube.com${$(elem).attr('href')}`;
          videoLink = $(elem).attr('href');
          videoTitle = $(elem).attr('title');

					console.log(`Found match: '${videoTitle}'! Redirecting...`);

          res.redirect('/' + videoLink + '/' + videoTitle)

					return false;
				}
			});
		});

	});
});

app.get('/download', (req, res) => {
	console.log(`Downloading '${req.query.title}'...`)

	let stream = fs.createWriteStream('static/resources/music.mp3');

	youtubeStream(req.query.url)
		.pipe(stream);

	stream.on('finish', () => {
		console.log('Finished download!')

		res.download(`static/resources/music.mp3`, req.query.title);
	});
});

app.server.listen(process.env.PORT || 3000, () => {
    console.log(`Server running @: http://127.0.0.1:${(process.env.PORT) ? process.env.port : 3000}`);
});
