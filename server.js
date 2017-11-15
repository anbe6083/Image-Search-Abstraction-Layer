var express = require('express');
var app = express();
var mongo = require('mongodb').MongoClient;
var uri = 'mongodb://test:test@ds259105.mlab.com:59105/imgabstractionlayer';
var https = require('https');

//---------Start routers-----------
app.get('/', (req,res) => {
    res.send("Hello world!");
}  );

app.get('/new/search/:searchTerm*', (req, res) => {
    //get the parameters form the URL
    var { searchTerm } = req.params;
    var { offset } = req.query;
    //get the date
    var date = new Date();
    var currDate = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();    
    
    //insert the time and search term into Mongo
    var json = {
        search_term: searchTerm,
        time_of_search: currDate
        
    };
    
    insert(json);
    //do the search and print it to the page
    search(searchTerm, res, offset);
} );

app.get('/recentsearches/', (req , res) => {
      get(res);
});
//-------End routers------------------------

//insert the data into the DB
function insert(data) {
      mongo.connect(uri, function(err, db) {
          if(err) throw err;
          console.log('connected to db');

          //get the collection to insert into
          var collection = db.collection('searches');

          //insert into the collection
          console.log("Inserting: " +data);
          collection.insert(data);
          db.close();
      });
    }

function search(searchTerm, response, offset) {
  
  var url = `https://www.googleapis.com/customsearch/v1?key=AIzaSyD9DB0hR8qIDgQwL78PCyWHGPWjNMMIHew&cx=011932205558663984908:-rr339tmu_u&q=${searchTerm}&searchType=image&start=${offset}`;
  https.get(url, (res) => {
    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      //var searchResult = JSON.stringify(body);
      console.log(JSON.parse(body));
      response.send(JSON.parse(body).items);
    })
  });
}

function get(res) {
  mongo.connect(uri, function(err, db) {
    if(err) throw err;
    console.log('connected to db');
    var collection = db.collection('searches');
    console.log('collection is: ' +collection);
    var result = collection.find().toArray();
    res.json(result);
    db.close();
  })
}

app.listen(3000, () => console.log("App listening on port 3000"));