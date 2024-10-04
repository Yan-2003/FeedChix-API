const express = require('express')
const router = express.Router()
const ably = require('../controller/Ably')

const water_channel = ably('esp32/waterCapacity')

let currentCapacity = 0;

water_channel.subscribe((msg)=>{
    currentCapacity = parseFloat(Buffer.from(msg.data).toString(), 10);
    console.log(msg)
    console.log("Current Capacity: ", currentCapacity)
})

router.get('/', (req, res)=>{
    res.json({capacity: currentCapacity})
})

module.exports = router

