/* globals mmdbreader:true */

// Patch maxmind-db-reader node module 
// to support downloading maxmind database 
// and unzipping it

var fileLocation = '/tmp/GeoLite2-City.mmdb';
var zlib = Npm.require('zlib');
var fs = Npm.require('fs');
var urlRegExp = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?‌​(?:[\w]*))?)/;


mmdbreader = Npm.require('maxmind-db-reader');
var __open = mmdbreader.open;

var isUrl = function(path){
  return urlRegExp.exec(path);
};

var unzip = function(response, filePath, callback){
  try {
    var gunzip = zlib.createGunzip();            
    var file = fs.createWriteStream(filePath);
    response.pipe(gunzip);
    
    gunzip.on('data', function(data) {
      file.write(data);
    }).on("end", function() {
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
  if(!isUrl(database)){
    __open.call(this, fileLocation, callback);
  } else {
    var downloader = Npm.require(/^https/ig.exec(database) ?  'https' : 'http');
    downloader.get(database, function(res) {
      unzip(res, fileLocation, function(error, result){
        if(!error){
          __open.call(this, result, callback);  
        } else {
          callback.call(this,error);
        }
      });
    });
  }
};

mmdbreader.open = newOpen;