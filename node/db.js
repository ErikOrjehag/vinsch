
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

module.exports.create_show = function (name, callback) {
  r.table('shows').insert({
    name: name,
    default: false,
    created: new Date()
  }).run(c, function (err) {
    if (err) callback(err);
    else module.exports.get_shows(callback);
  });
};

module.exports.delete_show = function (id, callback) {
  r.table('shows').get(id).delete().run(c, function (err) {
    if (err) callback(err);
    else module.exports.get_shows(callback);
  })
}

module.exports.get_shows = function (callback) {
  r.table('shows').withFields('id', 'name', 'created').orderBy(r.desc('created')).run(c, function (err, cursor) {
    if (err) callback(err);
    else cursor.toArray(callback);
  })
}

module.exports.on_shows_changes = function (callback) {
  r.table('shows').withFields('id', 'name', 'created').changes().run(c, function (err, cursor) {
    console.log("CHANGES", err, cursor);
    cursor.each(function (err, row) {
      console.log("err", err);
      callback(row);
    });
  });
};
