const express = require('express')
const router = express.Router()
const ably = require('../controller/Ably')
const cron = require('node-cron')
const food_channel = ably('esp32/foodWeight')
const firebase = require('../Database/Firebase')

let currentWeight = 0;
//const db = firebase.database();


food_channel.subscribe((msg)=>{
    currentWeight = parseFloat(Buffer.from(msg.data).toString(), 10);
    console.log(msg)
    console.log("Current Weight: ", currentWeight)
})

router.get('/weight', (req, res)=>{

    res.json({weight: currentWeight});

})

router.post('/sched_feeding', (req, res)=>{

    const ref = db.ref('feeding_schedule');

    ref.once('value', (snapshot) => {
    const data = snapshot.val();
    console.log(data);
    });

    const newData = { 
        age_week : age_week,
        chicken_num : chicken_num, 
        time: time, 
        time_stamp: new Date().toISOString() 
    };
    ref.set(newData);


})



module.exports = router;

