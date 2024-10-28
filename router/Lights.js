const express = require('express')
const router = express.Router()
const ably = require('../controller/Ably')
const light_channel = ably('esp32')
const light_status_channel = ably('esp32/lightStatus')
const cron = require('node-cron')
const database = require('../Database/Firebase')

let light_status = ""
const schedule = database.ref('light_schedule')

router.get('/status', (req, res)=>{

    light_status_channel.subscribe((msg)=>{
        light_status = Buffer.from(msg.data).toString()

        console.log("light Status: ", light_status)
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
        console.log('Message published successfully:', message);
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
        console.log('Message published successfully:', message);
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

    cron.schedule( getTime(LightSchedule.turn_on) , ()=>{

        console.log("Attempting to send messange [Ably MQTT]: Turn on Light")

        const payload = {
            functionName : "light",
            status : "ON"
        }

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
})


const getTime = (time) =>{
    const date = new Date(time)

    const minues = date.getMinutes()
    const hours = date.getHours()

    return `${minues} ${hours} * * *`
}

module.exports = router;