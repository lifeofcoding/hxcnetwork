/*
const MongoClient = require('mongodb').MongoClient;
// Connection url
const url = `mongodb://hxc:hxc!@#29JR@ds145456.mlab.com:45456`;
// Database Name
const dbName = 'heroku_3xj7kmcz';
// Connect using MongoClient
MongoClient.connect(url, function(err, client) {
  const col = client.db(dbName).collection('proxies');
 
 	col.insert(proxy, function(err, result) {
 	
 	});
});
*/

async function main() {
  const instance = await phantom.create(['--ignore-ssl-errors=yes']);
  const page = await instance.createPage();

  await page.setting('userAgent', 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36')

  for (const source of proxyListSources) {
    try {
      console.log(`Requesting page ${source}...`);
      const status = await page.open(source);
      console.log(`Page status: ${status}`);
      if (status !== 'success')
        throw new Error('Request failed');

      const jsEnabled = await page.setting('javascriptEnabled');
      console.log(`Javascript enabled: ${jsEnabled}`);
      if (!jsEnabled)
        throw new Error('Javascript disabled');

      const niceText = await page.evaluateJavaScript(GET_NICE_TEXT_JS);
      const matches = niceText.match(re) || [];
      console.log(`Proxies found on page: ${matches.length}`);

      const proxies = matches.map(s => s.replace(/\s+/, ':')).filter(l => !!l.trim());

      fs.appendFileSync(outputPath || DEFAULT_OUT, proxies.join('\n') + '\n');
      console.log('Proxies successfully written to: ' + (outputPath || DEFAULT_OUT));
    } catch(e) {
      console.error(`An error occurred while scraping ${source}. Skipping.`);
      continue;
    }
  }

  await instance.exit();
}

const axios = require('axios');
const geoip = require('geoip-lite');
const fs = require('fs');
const async = require('async');
const path = require('path');
const fetch = require('node-fetch');

const scraped = [];

function one(callback) {
	axios.get(`https://freevpn.zone/config/?id=ogojkdkkcopeepagdlddbninobfhfbcb`).then(res => {
		let locations = res.data.locations;
		
		var proxies = [];
		locations.forEach((l) => {
			proxies = proxies.concat(l.nodes);
		})
		
		if (callback) {
			callback(proxies)
		}
	});
}


function two(callback) {
	axios({
		method: 'post',
		url: 'https://api.uvpn.me/user/get-pac',
		"headers":{
			"accept":`*/*`,
			"authorization":"5xbhvsah7jura821ggflhuiabneinr0o",
			"content-type":"application/x-www-form-urlencoded; charset=UTF-8"
		},
		data: {
		  id: 'coahpcpgfnnaddeelpphpifmgfobflog',
		  t: '1555440054303',
		  mt: '1555440054303',
		  lt: `580583380`,
		  vpn: `1`,
		  uid: `2028d641-2596-4292-a339-9d625634c076`,
		  hash: `966347e682082d03d71d67d765909a596cbcaf29`
		}
	}).then(res => {
		let locations = res.data.locations;
		
		var proxies = [];
		locations.forEach((l) => {
			proxies = proxies.concat(l.nodes);
		})
		
		if (callback) {
			callback(proxies);
		}
	});
}

function three(callback) {

	fetch("https://base9-hx.diltwo.com/client/rest/config/extension", {
		  "credentials": "omit",
		  "headers": {
		      "content-type": "application/x-www-form-urlencoded"
		  },
		  "referrerPolicy": "no-referrer-when-downgrade",
		  "body": "u=lifeofcoding%40gmail.com&hpassword=9235a263f90dcbdd2c61c1747c8cfd53d4fa115473968fb11356a656cff4ce53196155ba86602d1e00ac0041e77a301e0fe2d1d7044a223fbbc2b8d205a964cb&cv=3.6.0&lan=en-US&lser=36&lang=en&h=login&platform=chrome&base=https://base9-hx.diltwo.com/client/&ua=Mozilla%2F5.0%20(X11%3B%20Linux%20x86_64)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F73.0.3683.103%20Safari%2F537.36&lid=14bef058-d13b-4228-94f0-687cce2fdd2f&os=linux",
		  "method": "POST",
		  "mode": "cors"
	}).then(res => res.json()).then(res => {
		//console.log(res.data.SERVERS);
		let locations = Object.values(res.data.SERVERS);
		
		var proxies = [];
		locations.forEach((l) => {
			proxies.push({ip:l.Ip, port:l.Port, schema: l.Scheme});
		})
		
		if (callback) {
			callback(proxies);
		}
	});
}

var q = async.queue(function(task, callback) {
  task(function(proxies) {
  	//console.log(proxies);
			proxies.map((p) => {
				let geo = geoip.lookup(p.ip);

				if (geo) {
		    	var found = {
		    	  type: p.schema,
		    	  address: p.ip,
		    	  port: p.port,
		    	  city: geo.city,
		    	  country: geo.country
		    	};
		    	//console.log(found);
		    	scraped.push(found)
		    }
		  })
		  
		  if (callback) {
				callback(scraped);
			}
	});
}, 20);

const MongoClient = require('mongodb').MongoClient;

const dbName = 'heroku_3xj7kmcz';

const client = new MongoClient(`mongodb://jimmy:rousseau1@ds145456.mlab.com:45456/heroku_3xj7kmcz`);

client.connect(function(err) {
		if (err) {
			return console.error(err)
		}
		
		const db = client.db(dbName);
		const collection = db.collection('proxies');
		
		console.log("Connected successfully to server");
		
		collection.deleteMany({}, function(err, r) {
			q.drain = function() {
			  console.log('all items have been processed');
			  collection.insertMany(scraped, function(err, result) {
					if (err) return console.error(err);
					console.log(result);
					
					client.close();
				});
			};
		
			q.push([one, two, three], function(results) {
				console.log('Scraped: '+scraped.length);
				//client.close();
				/*collection.insertMany(scraped, function(err, result) {
					if (err) return console.error(err);
					console.log(result);
					
					client.close();
				});
				*/
			});
    });
});


