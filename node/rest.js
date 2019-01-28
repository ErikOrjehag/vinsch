
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

  app.get("/download/:id", function (req, res) {
    console.log("download", req.params.id);
    db.get_show(req.params.id, function (err, show) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        res.set({"Content-Disposition":"attachment; filename=\""+show.name+".json\""});
        var data = JSON.stringify(show);
        res.send(data);
      }
    })
  });
};
