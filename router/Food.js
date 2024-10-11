const express = require('express')
const router = express.Router()
const ably = require('../controller/Ably')
const cron = require('node-cron')
const food_channel = ably('esp32/foodWeight')
const sched_feeding = require('../Database/Firebase')

let currentWeight = 0;

food_channel.subscribe((msg)=>{
    currentWeight = parseFloat(Buffer.from(msg.data).toString(), 10);
    console.log(msg)
    console.log("Current Weight: ", currentWeight)
})

router.get('/weight', (req, res)=>{
    res.json({weight: currentWeight})
})

router.get('/sched_feeding', (req, res)=>{

    if(sched_feeding('7:00')){

        res.json({message : 'successfull'})
    }else{
        res.json({ message : 'failed'})
    }


})



module.exports = router

