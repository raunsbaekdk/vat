var request = require('request');

function Vies() {}

Vies.prototype.lookup = function(country, vat, callback)
{
	var options =
	{
		headers:
		{
			'User-Agent': 'mit projekt'
		}
	};

	try
	{

		if(country == 'DK')
		{

			request('http://cvrapi.dk/api?vat=' + vat + '&country=' + country.toLowerCase(), options, function(error, response, result)
			{
				if(response.statusCode == 200)
				{
					result = JSON.parse(result);

					if(result.error !== undefined)
					{

						callback
						({
							code: 400,
							msg: result.message
						});

					} else {

						callback
						({
							error: null,
							result:
							{
								countryCode: country,
								vatNumber: result.vat,
								requestDate: +new Date(),
								valid: true,
								name: result.name,
								address: result.address + "\n" + result.zipcode + " " + result.city,
								street: result.address,
								zipcode: result.zipcode + " " + result.city
							}
						});

					}
				}
			});

		} else {

			var soap = require('soap');

			soap.createClient('http://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl', function(err, client)
			{
				client.checkVat({countryCode: country, vatNumber: vat}, function(err, result)
				{
					if(err)
					{

						callback
						({
							code: 400,
							msg: 'Invalid request'
						});

					} else {

						var street = {};

						if(typeof result.address == 'string')
							street = result.address.split(/\n/);

						callback
						({
							error: null,
							result:
							{
								countryCode: result.countryCode,
								vatNumber: result.vatNumber,
								requestDate: +new Date(),
								valid: result.valid,
								name: result.name,
								address: result.address,
								street: street[0],
								zipcode: street[1]
							}
						});

					}
				});
			});

		}

	} catch (e) {

		callback
		({
			code: 400,
			msg: 'Invalid request'
		});

	}
}

module.exports = Vies;