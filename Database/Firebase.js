require('dotenv').config()
const admin = require('firebase-admin');
const serviceAccount = JSON.parse(Buffer.from(process.env.SERVICE_ACCOUNT_JSON, 'base64').toString('utf-8'));


console.log(serviceAccount)


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.databaseURL
});

const firebase = admin.database()

module.exports = firebase;

