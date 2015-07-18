# IP Address Geocoder for Meteor

Geocode IP addresses using [MaxMind](https://www.maxmind.com/) IP database. Here's a [demo](https://ipgeocoder.herokuapp.com/).

## Install

```
meteor add thebakery:ipgeocoder
```

## Use (server only)

```
// you can do it synchronously 
var geoData = IPGeocoder.geocode('82.124.236.10');

// or asynchronously
IPGeocoder.geocode('82.124.236.10', function(error, result){
	if(!error){
		// good to go
	}
});
```

**Note**: IPGeocoder downloads and parses IP database in the background. You can either explicitly ask for the data to be downloaded or let IPGeocoder do it once the first call to geocode arrives. If the lib is busy downloading the database, it will throw an exception saying 'the database is not ready'. So it might be a good idea to load data on server startup

```
// somewhere on the server
Meteor.startup(function(){
  IPGeocoder.load();
});
```

## Data Format

By default, IPGeocoder.geocode will return data in the following format (which is probably sufficient for most cases)

```
{
	city: {
		name: "Neuilly-sur-Seine"
	},
	continent: {
		name: "Europe",
		code: "EU"
	},
	country: {
		name: "France",
		code: "FR"
	},
	location: {
		latitude: 48.8833,
		longitude: 2.2667,
		time_zone: "Europe/Paris"
	}
}
``` 

You can also ask for verbose output based on MaxMind's [spec](http://dev.maxmind.com/geoip/geoip2/web-services/)

```
var verbose = true;

// you can do it synchronously 
var geoData = IPGeocoder.geocode('82.124.236.10', null, verbose);

// or asynchronously
IPGeocoder.geocode('82.124.236.10', function(error, result){
	if(!error){
		// good to go
	}
}, verbose);
```    

## Configure

By default, geocoder will download data from [http://geolite.maxmind.com/download/geoip/database/GeoLite2-City.mmdb.gz](http://geolite.maxmind.com/download/geoip/database/GeoLite2-City.mmdb.gz). You can adjust this in 2 ways:

```
//ask for specific version to be loaded explicitly
IPGeocoder.load('http://geolite.maxmind.com/download/geoip/database/GeoLite2-City.mmdb.gz');
``` 

Or adjust the path in Meteor.settings 

```
{
	"IPGeocoder" : {
		"databaseUrl" : "https://dl.dropboxusercontent.com/u/9224326/geogit/GeoLite2-City.mmdb.gz"
	}
}
```
