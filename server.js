var express = require('express');
var app = express();
var mongo = require('mongodb').MongoClient;
var uri = 'mongodb://test:test@ds259105.mlab.com:59105/imgabstractionlayer';
var https = require('https');

//---------Start routers-----------
app.get('/', (req,res) => {
    res.sendFile(__dirname + '/views/index.html');
}  );

app.get('/new/search/:searchTerm*', (req, res) => {
    //get the parameters from the URL; if the user doesnt input an offset, set it to 1
    var { searchTerm } = req.params;
    var { offset } = req.query;
    if(offset === undefined) offset = 1;
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

          //get the collection to insert into
          var collection = db.collection('searches');

          //insert into the collection
          collection.insert(data);
          db.close();
      });
    }
/*
* @param searchTerm: The term the user inputted into the URL
* @param response: Http response object
* @param offset: Pagination index inputted by the user
* Description: Searches the Google custom search engine for the search term and defined offset. 
* Then send a http response
*/
function search(searchTerm, response, offset) {
  
  var url = `https://www.googleapis.com/customsearch/v1?key=AIzaSyD9DB0hR8qIDgQwL78PCyWHGPWjNMMIHew&cx=011932205558663984908:-rr339tmu_u&q=${searchTerm}&searchType=image&start=${offset}`;
  https.get(url, (res) => {
    var body = '';
    //As the data comes in, add it to the result body
    res.on('data', function(chunk) {
      body += chunk;
    });
    //Once all the data is done, parse it and send it to the page
    res.on('end', function() {
      response.send(JSON.parse(body).items);
    })
  });
}
/*
* @param res: HTTP response object
* Description: Get the recent searches from the database collection
*/
function get( res ) {
  mongo.connect(uri, (err, db) => {
  if(err) throw err;
  var collection = db.collection('searches');
  
  collection.find().toArray(function(err, doc) {
    res.send(doc);
  });
  db.close();
  
}) 
  
}

app.listen(3000, () => console.log("App listening on port 3000"));