const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'dateapp-dbcf4.appspot.com' // 🔁 apna project id
});

const bucket = admin.storage().bucket();
module.exports = bucket;
