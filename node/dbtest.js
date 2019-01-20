var Datastore = require('nedb')
  , db = new Datastore({ filename: 'datafile.db', autoload: true });


var doc = { hello: 'world 2'
               , n: 5
               , today: new Date()
               , nedbIsAwesome: true
               , notthere: null
               , notToBeSaved: undefined  // Will not be saved
               , fruits: [ 'apple', 'orange', 'pear' ]
               , infos: { name: 'nedb' }
               };

db.insert(doc, function (err, newDoc) {   // Callback is optional
  if (err) console.log(err);
  // newDoc is the newly inserted document, including its _id
  // newDoc has no key called notToBeSaved since its value was undefined
  console.log("newDoc", newDoc);

  db.find({}).sort({today:1}).exec(function (err, doc) {
    if (err) console.log(err);
    // doc is the document Mars
    // If no document is found, doc is null
    console.log("doc", doc);
  });

});
