const express = require('express');
const app = express();

const router = express.Router(); // eslint-disable-line new-cap

const MongoClient = require('mongodb').MongoClient;

const dbName = 'proxies';

const client = new MongoClient(`mongodb://proxies:scandal1@ds221095.mlab.com:21095/proxies`);

client.connect(function(err) {
		if (err) {
			return console.error(err)
		}
		
		const db = client.db(dbName);
		const collection = db.collection('proxies');
		
		console.log("Connected successfully to server");
        
    router.route('/proxies')
        .get((req, res) => {
            collection.find({}).toArray((err, docs) => {
                if (err) {
                    // Reject the Promise with an error
                    console.warn(err)
                }

                // Resolve (or fulfill) the promise with data
                res.json(docs);
            })
        })

        router.route('/proxies/country/:countryCode')
        .get((req, res) => {
            collection.find({country: req.params.countryCode}).toArray((err, docs) => {
                if (err) {
                    // Reject the Promise with an error
                    console.warn(err)
                }

                // Resolve (or fulfill) the promise with data
                res.json(docs);
            })
        })

        router.route('/proxies/type/:type')
        .get((req, res) => {
            collection.find({type: req.params.countryCode}).toArray((err, docs) => {
                if (err) {
                    // Reject the Promise with an error
                    console.warn(err)
                }

                // Resolve (or fulfill) the promise with data
                res.json(docs);
            })
        })
    
    app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept'
        );
        next();
    });

    app.use(router)

    app.listen(3000, () => console.log('Proxy api listening on port 3000!'));
});