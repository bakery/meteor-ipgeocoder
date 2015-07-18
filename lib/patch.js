// Patch maxmind-db-reader node module 
// to support downloading maxmind database 
// and unzipping it

var fileLocation = '/tmp/GeoLite2-City.mmdb';
var zlib = Npm.require('zlib');
var fs = Npm.require('fs');
var urlRegExp = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:ww‌​w.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?‌​(?:[\w]*))?)/;
var gzRegExp = /\.gz$/ig;


mmdbreader = Npm.require('maxmind-db-reader');
var __open = mmdbreader.open;

var isUrl = function(path){
  return urlRegExp.exec(path);
};

var isGunzip = function(path){
  return gzRegExp.exec(path);
};

var unzip = function(response, filePath, callback){
  try {
    var gunzip = zlib.createGunzip();            
    var file = fs.createWriteStream(filePath);
    response.pipe(gunzip);
    
    gunzip.on('data', function(data) {
      console.log('.');
      file.write(data);
    }).on("end", function() {
      console.log('done unzipping...');
      file.end();
      if(callback){
        callback.call(this,null,filePath);
      }
    }).on("error", function(e) {
      if(callback){
        callback.call(this,e);
      }
    });  
  } catch(e) {
    if(callback){
      callback.call(this,e);
    }
  }
};

var newOpen = function(database, callback){
  console.log('running patched version of open');

  if(!isUrl(database)){
    console.log('database is a local file, using standard open file');
    __open.call(this, fileLocation, callback);
  } else {
    console.log('database is a url, downloading it from', database);
    var downloader = Npm.require(/^https/ig.exec(database) ?  'https' : 'http');
    downloader.get(database, function(res) {
      unzip(res, fileLocation, function(error, result){
        if(!error){
          console.log('calling open', result);
          __open.call(this, result, callback);  
        } else {
          console.error('error unzipping', error);
        }
      });
    });
  }
};

mmdbreader.open = newOpen;