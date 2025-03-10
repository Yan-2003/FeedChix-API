const express = require('express')
const router = express.Router()
const ably = require('../controller/Ably')
const light_channel = ably('esp32')
const channel = ably('esp32/status')
const cron = require('node-cron')
const database = require('../Database/Firebase')
const sendPushNotification = require('../controller/Notification')
let light_status = ""
const schedule = database.ref('light_schedule')
const light_options  = database.ref('light_options')

router.get('/status', (req, res)=>{

    channel.subscribe((msg)=>{
        sensors_status = JSON.parse(Buffer.from(msg.data).toString())
        light_status = sensors_status.light_status
    })
    
    return res.json({"light_status" : light_status})

})

router.get('/schedule' , (req , res)=>{

    schedule.once("value").then( snapshot =>{
        const data = snapshot.val()
        console.log("schedule" , data)

        res.json(data)
    })

})


router.get('/on', (req , res)=>{

    const payload = {
        functionName : "light",
        status : "ON"
    }

    light_channel.publish('light', payload , (err)=>{
        if(err){
            console.error('Failed to publish message:', err)
            return res.status(500).send('Error publishing message');
        }
        console.log('Message published successfully:');
    })
    
    return res.status(200).json({message : "light successfully turn on"});

})

router.get('/off', (req , res)=>{

    const payload = {
        functionName : "light",
        status : "OFF"
    }

    light_channel.publish('light', payload , (err)=>{
        if(err){
            console.error('Failed to publish message:', err)
            return res.status(500).send('Error publishing message');
        }
        console.log('Message published successfully:');
    })
    return res.status(200).json({message : "light successfully turn off"});
})


router.post('/schedule', (req, res)=>{

    schedule.set({
        turn_on : req.body.on,
        turn_off : req.body.off
    }).then(()=>{
        console.log("Schedule added")
    }).catch((error)=>{
        console.error(error)
    })

    return res.json({message : "scheudle a operation"})
})

let LightSchedule;

schedule.on('value', snapshot => {
    LightSchedule = snapshot.val()

    if(LightSchedule.turn_on && LightSchedule.turn_off != null){

        cron.schedule( getTime(LightSchedule.turn_on) , ()=>{
    
            console.log("Attempting to send messange [Ably MQTT]: Turn on Light")
    
            const payload = {
                functionName : "light",
                status : "ON"
            }
    
            sendPushNotification("Turning Lights On ")
    
            try {
                light_channel.publish('light', payload, (err) => {
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
    
    
        cron.schedule( getTime(LightSchedule.turn_off) , ()=>{
    
            console.log("Attempting to send messange [Ably MQTT] : Turn off Light")
    
            const payload = {
                functionName : "light",
                status : "OFF"
            }
    
            sendPushNotification("Turning Lights Off ")
    
    
            try {
                light_channel.publish('light', payload, (err) => {
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
    
        console.log('Data updated in real-time:', LightSchedule);


    }

}) 


const getTime = (time) =>{
    const date = new Date(time)

    const minues = date.getMinutes()
    const hours = date.getHours()

    return `${minues} ${hours} * * *`
}


/* Light Options */


router.post('/autoLightTemp', (req, res)=>{

    light_options.set({
        autoLightTemp : req.body.autoLightTemp,
    }).then(()=>{
        console.log("set the light to auto recommend using temp.")
    }).catch((error)=>{
        console.log("error: ", error)
    })

})


let var_light_options;

light_options.on('value', snapshot =>{
    var_light_options = snapshot.val()
})

router.get('/get/lightOptions', (req, res) =>{

    return res.json(var_light_options)

})
 














module.exports = router;