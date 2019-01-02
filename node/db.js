
var r = require('rethinkdb');
var c;

r.connect({ db: 'vinsch' }).then(conn => {
  c = conn;

  console.log("Connected to rethinkdb");

  r.dbCreate('vinsch').run(conn).then(res => {
    console.log('Database `vinsch` was created');

    r.tableCreate('shows').run(conn, console.log);
    r.tableCreate('layout').run(conn, console.log);

  }).catch(err => {
    console.log(err.msg);
  });

}).catch(console.log);

module.exports.create_show = function (name) {
  r.table('shows').insert({
    name: name,
    created: new Date(),
    modified: new Date()
  }).run(c, console.log);
};

module.exports.on_shows_changes = function (callback) {
  r.table('shows')/*.withFields('id', 'name', 'modified', 'created')*/.changes().run(c, function (err, cursor) {
    console.log("CHANGES", err, cursor);
    cursor.each(callback);
  });
};
