const express = require('express')
const router = express.Router()
const ably = require('../controller/Ably')
const cron = require('node-cron')
const food_channel = ably('esp32/foodWeight')

const sched_channel = ably('esp32')

const firebase = require('../Database/Firebase')

let currentWeight = 0;
//const db = firebase.database();




let message = {
    functionName : "feeding",
    age_week : 1,
    chick_num : 10
}

/* cron.schedule('* * * * *', ()=>{

    console.log("Attempting to send messange [Ably MQTT]")

    try {
        sched_channel.publish('feeding', message, (err) => {
            if (err) {
              console.error('Failed to publish message:', err);
              return res.status(500).send('Error publishing message');
            }
        
            console.log('Message published successfully:', message);
            res.status(200).send('Feeding function triggered successfully');
          });
        
    } catch (error) {
        console.log(error)
    }
})
 */

router.get('/weight', (req, res)=>{

    food_channel.subscribe((msg)=>{
        currentWeight = parseFloat(Buffer.from(msg.data).toString(), 10);
        console.log(msg)
        console.log("Current Weight: ", currentWeight)
    })

    res.json({weight: currentWeight});

})

router.get('/sched_feeding', (req, res)=>{

/*     const ref = db.ref('feeding_schedule');

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
    ref.set(newData); */

    

    res.json("sched fedding");

})



module.exports = router;

