/* */

const express = require('express');
const app = express();

const path = require('path');
const request = require('request');

const c = require(path.join(__dirname, '_config.js'));
const lib = require(path.join(__dirname, '/_lib/lib.js'));

app.use(function (req, res, next) {
  next();
});

// localhost:3000/v1/proxy?quest=codetabs.com => {quest: 'codetabs.com'}
app.get('/*', function (req, res) {
  // console.log('==>', req.query.quest)
  if (req.query.quest) {
    corsProxy(req, res);
  } else {
    const msg = `Quest is empty`;
    lib.sendError(res, msg, 400);
  }
});

app.get('/*', function (req, res) {
  c.error.Error = "Bad request : " + req.path;
  res.status(400).json(c.error);
});

function corsProxy(req, res) {
  let url = req.query.quest;

  if (url.slice(0, 8) === 'https://') {
    url = url.slice(8, url.length);
  } else if (url.slice(0, 7) === 'http://') {
    url = url.slice(7, url.length);
  } else {
    url = 'http://' + url;
  }
  if (!lib.isValidURL(url)) {
    url = 'http://' + url;
  }

  try {
    const x = request(url);
    x.on('error', function (err) {
      let msg = "Invalid URI -> " + req.query.quest;
      lib.sendError(res, msg, 400);
      //console.error('ERROR 1=> ', err);
      res.end();
      return;
    });
    req.pipe(x, {
      end: true
    });
    x.pipe(res);
  } catch (err) {
    console.error('ERROR => ', err);
    let msg = "Invalid URI -> " + url;
    lib.sendError(res, msg, 400);
  }
  /*
  request
    .get(url)
    .on('error', function (err) {
      console.log(err);
    })
    .pipe(res);
  */
}

module.exports = app;