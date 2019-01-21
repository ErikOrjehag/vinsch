
var geom = require('./geom');
var db = require('./db');

exports.interface = function (app) {

  app.get("/layout", function (req, res) {
    db.get_layout(function (err, layout) {
      if (err) res.sendStatus(500);
      else res.json(layout);
    });
  });

  app.post("/layout", function (req, res) {
    db.set_layout(req.body, function (err) {
      if (err) res.sendStatus(500);
      else {
        geom.set_layout(req.body);
        res.sendStatus(200);
      }
    });
  });

};
