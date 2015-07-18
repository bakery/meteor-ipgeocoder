var defaultDatabaseUrl = 'http://geolite.maxmind.com/download/geoip/database/GeoLite2-City.mmdb.gz';

var DatabaseState = {
  NotLoaded: 'not-loaded',
  Loading: 'loading',
  Loaded: 'loaded',
  LoadFailed: 'failed' 
};

IPGeocoder = {

  /**
   * Load IP database (asynchronously)
   * @param  {String} databaseUrl location of the IP database
   */
  load : function(databaseUrl){
    var geocoderSettings = Meteor.settings && Meteor.settings.IPGeocoder;
    var url = databaseUrl || (geocoderSettings && geocoderSettings.databaseUrl) || 
      defaultDatabaseUrl;
    var self = this;

    if(self.databaseState !== DatabaseState.NotLoaded){
      return;
    }

    self.databaseState = DatabaseState.Loading;
    
    mmdbreader.open(url,function(err,data){
      console.error('finished loading data', err, data);

      if(!err){
        self.databaseState = DatabaseState.Loaded;
        self.database = data;
      } else {
        self.databaseState = DatabaseState.LoadFailed;
      }
    });
  },

  /**
   * Geocode an IP   
   * @param  {String}   ip       IP address to geocode
   * @param  {Function} callback Optional callback. If nothing is specified, the function is run synchronously
   * @param  {Boolean}  verbose  If set to true, return a full version of the result, else simplify the structure 
   * @return {Object}            Returns geocoding result if no callback if provided 
   */
  geocode : function(ip, callback, verbose){
    var self = this;
    console.log('database state is', this.databaseState);    

    if(this.databaseState === DatabaseState.Loaded){
      console.error('this.database.getGeoData', this.database.getGeoData);

      return callback ? this.database.getGeoData(ip, function(err, result){
        callback.call(self, err, self.formatResponse(result));
      }) : self.formatResponse(this.database.getGeoDataSync(ip), verbose);
    } else {
      var e; 

      switch(this.databaseState){
        case DatabaseState.NotLoaded:
        case DatabaseState.Loading:
          e = new Error('Database is not ready yet');
          this.load();
          if(callback){
            callback.call(this, e);
          } else {
            throw e;
          }
          break;
        case DatabaseState.LoadFailed:
          e = new Error('Failed to load database'); 
          if(callback){
            callback.call(this, e);
          } else {
            throw e; 
          }
          break;
      }
    }
  },

  formatResponse : function(r, verbose){
    return verbose ? r : (r ? {
      city : {
        name : r.city && r.city.names && r.city.names.en
      },
      continent : {
        name : r.continent && r.continent.names && r.continent.names.en,
        code : r.continent && r.continent.code
      },
      country : {
        name : r.country && r.country.names && r.country.names.en,
        code : r.country && r.country.iso_code
      },
      location : r.location
    } : response); 
  }, 

  databaseState : DatabaseState.NotLoaded,
  database : null
};