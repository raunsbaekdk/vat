var express = require('express');
var app = express();
app.disable('etag');


// Create vies instance
var Vies = require('./vies.js');
var vies = new Vies();


// Cache
var NodeCache = require("node-cache");
var myCache = new NodeCache({stdTTL: 86400, checkperiod: 21600});





app.get('/', function(req, res)
{

	res.set('Content-Type', 'application/json');

	if(req.query.country === undefined || req.query.vat === undefined)
	{
		res.send
		({
			code: 400,
			msg: 'Missing parameters'
		});

	} else {

		var country = req.query.country.toUpperCase();
		var vat = req.query.vat;
		var cacheKey = country + "_" + vat;

		myCache.get(cacheKey, function(err, value)
		{
			if(value[cacheKey] !== undefined)
			{

				res.send(value[cacheKey]);

			} else {

				vies.lookup(country, vat, function(result)
				{
					myCache.set(cacheKey, result, function(err, success)
					{
						res.send(result);
					});
				});

			}
		});

	}

});





app.listen((process.env.PORT || 8000));