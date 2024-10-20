const express = require('express')
const router = express.Router()
const ably = require('../controller/Ably')
const light_channel = ably('esp32')
const light_status_channel = ably('esp32/lightStatus')


let light_status = ""


router.get('/status', (req, res)=>{

    light_status_channel.subscribe((msg)=>{
        light_status = Buffer.from(msg.data).toString()
        console.log("light Status: ", light_status)
    })
    
    return res.json({"light_status" : light_status})

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
        res.status(200).send('Feeding function triggered successfully');
    })


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
        res.status(200).send('Feeding function triggered successfully');
    })
    
})


module.exports = router;