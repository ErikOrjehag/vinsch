
var geom = require("./geom.js");

var Datastore = require('nedb');
var showsdb = new Datastore({ filename: __dirname + '/shows.db', autoload: true });
var confdb = new Datastore({ filename: __dirname + '/conf.db', autoload: true });

exports.create_show = function (name, callback) {
  showsdb.insert({
    name: name,
    default: false,
    created: new Date(),
    keyframes: []
  }, function (err) {
    if (err) callback(err);
    else exports.get_shows(callback);
  });
};

exports.delete_show = function (id, callback) {
  showsdb.remove({ _id: id }, {}, function (err) {
    if (err) callback(err);
    else exports.get_shows(callback);
  });
};

exports.make_default_show = function (id, callback) {
  showsdb.update({}, { $set: { default: false } }, { multi: true }, function (err) {
    if (err) callback(err);
    else showsdb.update({ _id: id }, { $set: { default: true } }, {}, function (err) {
      if (err) callback(err);
      else exports.get_shows(callback);
    });
  });
};

exports.get_shows = function (callback) {
  showsdb.find({}).sort({ created: 1 }).exec(function (err, shows) {
    callback(err, shows.map(function (show) { return {
      _id: show._id,
      name: show.name,
      default: show.default,
      created: show.created
    }}));
  })
};

exports.copy_show = function (id, name, callback) {
  showsdb.findOne({ _id: id }, function (err, show) {
    if (err) callback(err);
    else {
      delete show["_id"];
      show.default = false;
      show.created = new Date();
      show.name = name;
      showsdb.insert(show, function (err) {
        if (err) callback(err);
        else exports.get_shows(callback);
      });
    }
  });
};

exports.rename_show = function (id, name, callback) {
  showsdb.update({ _id: id}, { name: name }, {}, function (err) {
    if (err) callback(err);
    else exports.get_shows(callback);
  });
};

exports.get_show = function (id, callback) {
  showsdb.findOne({ _id: id }, callback);
};

exports.set_show = function (show, callback) {
  showsdb.update({ _id: show._id }, show, {}, function (err) {
    if (err) callback(err);
    else exports.get_show(show._id, callback);
  });
};

exports.store_setpoint = function () {
  var conf = { type: "setpoint", setpoint: geom.get_setpoint() };
  confdb.update({ type: "setpoint" }, conf, { upsert: true }, function (err) {
    if (err) console.log(err)
  });
}

exports.get_setpoint = function (callback) {
  confdb.findOne({ type: "setpoint" }, function (err, conf) {
    if (err) callback(err);
    else if (conf) callback(null, conf.setpoint);
    else callback();
  });
};
