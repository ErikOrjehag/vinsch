
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
    created: new Date(),
    keyframes: []
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
};

module.exports.make_default_show = function (id, callback) {
  r.table('shows').update({ default: false }).run(c, function (err) {
    if (err) callback(err);
    else r.table('shows').get(id).update({ default: true }).run(c, function (err) {
      if (err) callback(err);
      else module.exports.get_shows(callback);
    });
  });
};

module.exports.get_shows = function (callback) {
  r.table('shows').withFields('id', 'name', 'default', 'created').orderBy(r.desc('created')).run(c, function (err, cursor) {
    if (err) callback(err);
    else cursor.toArray(callback);
  })
};

module.exports.copy_show = function (id, name, callback) {
  r.table('shows').get(id).run(c, function (err, show) {
    if (err) callback(err);
    else {
      delete show["id"];
      show.default = false;
      show.created = new Date();
      show.name = name;
      r.table('shows').insert(show).run(c, function (err) {
        if (err) callback(err);
        else module.exports.get_shows(callback);
      });
    }
  });
};

module.exports.rename_show = function (id, name, callback) {
  r.table('shows').get(id).update({ name: name }).run(c, function (err) {
    if (err) callback(err);
    else module.exports.get_shows(callback);
  });
};

module.exports.get_show = function (id, callback) {
  r.table("shows").get(id).run(c, function (err, show) {
    callback(err, show);
  });
};

module.exports.set_show = function (show, callback) {
  r.table("shows").get(show.id).replace(show).run(c, function (err) {
    if (err) callback(err);
    else module.exports.get_show(show.id, callback);
  });
};
