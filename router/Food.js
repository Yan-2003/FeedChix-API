const express = require('express')
const router = express.Router()
const ably = require('../controller/Ably')
const cron = require('node-cron')
const channel = ably('esp32/status')

const sched_channel = ably('esp32')

const database = require('../Database/Firebase')

let currentWeight = 0;

/* const chicken_info_db = database.ref('chicken_info')

let chicken_info

chicken_info_db.on('value', snapshot =>{
    chicken_info = snapshot.val()
    
    console.log("chicken info : " ,chicken_info)
})


let message = {
    functionName : "feeding",
    age_week : chicken_info.week_age,
    chick_num : chicken_info.chicken_num
}

 */

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

    channel.subscribe((msg)=>{
        sensors_status = JSON.parse(Buffer.from(msg.data).toString())
        currentWeight = sensors_status.food_weight
    })

    res.json({weight: currentWeight});

})

router.post('/add_schedule', (req, res)=>{

    const feeding_schedule = database.ref('feeding_schedule');

    feeding_schedule.push({
        timestamp : req.body.feeding_sched
    })

    res.json("successfully added feeding schedule");

})



module.exports = router;

