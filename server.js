var express = require("express");
var mongo = require("mongodb").MongoClient;
var validUrl = require("valid-url");
var shortId = require("shortid");
var port = process.env.PORT || 8080;
var dbUrl = 'mongodb://amk:W4UY|c-_hyJc7nJ@ds013222.mlab.com:13222/shorten_url';
var app = express();
app.use('/',express.static('public'));
app.get('/new/:url(*)',function(req,res){
    var url = req.params.url;
    if(validUrl.isUri(url)){
        mongo.connect(dbUrl,function(err,db){
            if(err){
                res.end('Wait, what?');
                return console.log(err);
            } else {
                var urlList = db.collection('urlList');
                var short = shortId.generate();
                urlList.insert([{url: url, short: short}],function(){
                    var data = {
                        original_url: url,
                        short_url: 'http://'+req.headers['host']+'/'+short
                    }
                    db.close();
                    res.send(data);
                });
            }
        });
    } else {
        var data = {
            error:'Haha, no'
        }
        res.json(data);
    }
});
app.get('/:id',function(req,res){
  var id = req.params.id;
  mongo.connect(dbUrl,function(err,db){
      if(err){
          return console.log(err);
      } else {
          var urlList = db.collection('urlList');
          urlList.find({short:id}).toArray(function(err,docs){
              if(err){
                  res.end('Why would you even')
                  return console.log('read',err);
              } else {
                    if(docs.length>0){
                        db.close();
                        res.redirect(docs[0].url);
                    } else {
                        db.close();
                        res.end('No. Just no')
                    }
              }
          })
      }
  })
});
app.listen(port,function(){
    console.log('Thats cool');
})
