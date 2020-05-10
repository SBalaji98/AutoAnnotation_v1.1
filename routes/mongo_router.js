const express = require('express')
const router = express.Router();
const { Classes } = require('../mongo_models/class')


router.get('/get_class', (req, res) => {
  console.log(req.query.project)
  Classes.findOne({ project: `${req.query.project}` })
    .then((classes) => {
      res.send({ classes });
    }, (e) => {
      res.status(400).send(e);
    })
});


router.post('/add_class', (req, res) => {
  var cls = new Classes(req.body);

  cls.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});


router.post('/update_class', (req, res) => {
  Classes.findOneAndUpdate({ project: `${req.query.project}` }, req.body, { returnOriginal: true })
    .then((classes) => {
      res.send({ classes });
    }, (e) => {
      res.status(400).send(e);
    })
});

module.exports = router;