require('dotenv').config()
const admin = require('firebase-admin');
const serviceAccount = require('./feedchix-944969b2e8ee.json');


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.databaseURL
});

const db = admin.database();
const ref = db.ref('feeding_schedule');

ref.once('value', (snapshot) => {
  const data = snapshot.val();
  console.log(data);
});


const sched_feeding = (time, age_week) =>{
    
    const newData = { 
        age_week : age_week,
        time: time, 
        time_stamp: new Date().toISOString() 
    };
    ref.set(newData);
}

module.exports = sched_feeding;



