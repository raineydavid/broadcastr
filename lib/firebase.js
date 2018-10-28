var fbCron         = require('firebase-cron'),
    firebase       = require('firebase'),
    admin          = require('firebase-admin'),
    serviceAccount = require("../broadcastr-email-7c3f6c3d45e1.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://broadcastr-email.firebaseio.com/"
});

var config = {
    apiKey: "AIzaSyDn8zb14rRlQBcx74zdgXqSqoEbl-hYQJ4",
    authDomain: "broadcastr-email.firebaseapp.com",
    databaseURL: "https://broadcastr-email.firebaseio.com",
    storageBucket: "broadcastr-email.appspot.com",
    messagingSenderId: "861801325411"
  };
firebase.initializeApp(config);

exports.admin = admin
exports.db = admin.database()
exports.root = admin.database().ref()
exports.firebase = firebase
