const express = require('express')
const router = express.Router()
const ably = require('../controller/Ably')
const cron = require('node-cron') 
const channel = ably('esp32/status')
const sendPushNotification = require('../controller/Notification')

let currentCapacity = 0;

router.get('/capacity', (req, res)=>{

    channel.subscribe((msg)=>{
        sensors_status = JSON.parse(Buffer.from(msg.data).toString())
        currentCapacity = sensors_status.water_capacity
    })

    res.json({capacity: currentCapacity})
})

module.exports = router

cron.schedule("*/20 * * * *", ()=>{
    if(currentCapacity < 10){
        sendPushNotification("Chicken is Low in Water 💧")
    }   
})


