require('dotenv').config()
const admin = require('firebase-admin');
const serviceAccount = require('./feedchix-944969b2e8ee.json');

const firebase = () =>{
    return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.databaseURL
    });
}

module.exports = firebase;

