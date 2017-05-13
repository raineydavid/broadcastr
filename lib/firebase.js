var fbCron         = require('firebase-cron'),
    firebase       = require('firebase'),
    admin          = require('firebase-admin'),
    serviceAccount = require("../echo-email-7c3f6c3d45e1.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://echo-email.firebaseio.com/"
});

var config = {
    apiKey: "AIzaSyDn8zb14rRlQBcx74zdgXqSqoEbl-hYQJ4",
    authDomain: "echo-email.firebaseapp.com",
    databaseURL: "https://echo-email.firebaseio.com",
    storageBucket: "echo-email.appspot.com",
    messagingSenderId: "861801325411"
  };
firebase.initializeApp(config);

exports.admin = admin
exports.db = admin.database()
exports.root = admin.database().ref()
exports.firebase = firebase
