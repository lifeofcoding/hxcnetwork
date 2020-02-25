const shell = require('shelljs');
const path = require('path');
const ProxyVerifier = require('proxy-verifier');
const fs = require('fs');
const async = require('async');
const readline = require('readline');
const stream = require('stream');
const request = require('request');
const geoip = require('geoip-lite');

const MongoClient = require('mongodb').MongoClient;

const dbName = 'proxies';

const client = new MongoClient(`mongodb://proxies:scandal1@ds221095.mlab.com:21095/proxies`, {useNewUrlParser: true});

var scraped = [];
var proxyCount = 0;
var checked = 0;

const q = async.queue(function(proxy, callback) {

    return ProxyVerifier.testProtocols(proxy, function(error, results) {
        ++checked;
    
        if (error) {
            // Some unusual error occurred.
            //console.log(error);
            callback({passed: false, error: error});
        } else if (results['socks4'].ok || results['socks5'].ok) {
            // The results object contains a result object for each protocol.
    
    	        let geo = geoip.lookup(proxy.ipAddress);
    
    	        if (geo) {
        		    	var found = {
        		    	  type: results['socks5'].ok ? 'socks5' : 'socks4',
        		    	  address: proxy.ipAddress,
        		    	  port: proxy.port,
        		    	  city: geo.city,
        		    	  country: geo.country
        		    	};
    		    	    //console.log(found, results);
                 //console.log(`Found ${scraped.length + 1} proxies`);
    		    	    scraped.push(found);
                callback({passed: true, proxy: found});
    	        }
        } else {
            callback({passed: false, results: results});
        }
    })
}, 25);

client.connect(function(err) {
	if (err) {
		return console.error(err)
	}
	
	const db = client.db(dbName);
	const collection = db.collection('proxies');
	
	console.log("Connected successfully to server");

    q.drain(function() {
        console.log('Done');
        client.close();
    });

    var child = shell.exec(`node ${path.resolve(process.cwd(), './proxyfarm/proxyfarm.js')} --in ${path.resolve(process.cwd(), './sources.txt')}`, {async:true});

    child.stdout.on('data', function(data) {
        //console.log('' + data);
    });
    
    child.on('exit', function() {
        var readProxiesFromFile = function(file, callback) {
            	var instream = fs.createReadStream(file);
            	var outstream = new stream;
            	var rl = readline.createInterface(instream, outstream);
            
            	rl.on('line', function(line) {
            		if( !/^#/.exec(line) ) {
            			var elts = line.split(':');
            			var host = elts[0];
            			var port = elts[1];
            			if( host && port )
            				callback(host, port);
            		}
            	});
        }
        
        
        var checkProxiesFromFile = function(file, options, callback) {
            collection.deleteMany({}, function(err, r) {
            	readProxiesFromFile(file, function(host, port) {

            		var proxy = {
                        ipAddress: host,
                        port: port,
                        protocols: ['socks4', 'socks5']
                    };

                   ++proxyCount;

                    q.push(proxy, function(results) {
                        if (results.passed) {
                            try {
                               collection.insertOne(results.proxy, {unique : true, dropDups : true}, function(err, res) {
                               //collection.insertOne(results.proxy, function(err, res) {
                					if (err) return console.error(err);
                                 console.log(`Added ${results.proxy.type}://${results.proxy.address}:${results.proxy.port} located in ${results.proxy.city} ${results.proxy.country} to database`);
                    			  });
                            } catch (e) {
                               console.warn(e);
                            }
                        }
                    });
            	});
            });
        }
        
        checkProxiesFromFile('./out.txt', {}, function() {
            console.log('done');
        });
    });
});
