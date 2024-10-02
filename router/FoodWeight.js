const express = require('express')
const router = express.Router()
const ably = require('../controller/Ably')

const food_channel = ably('esp32/foodWeight')

let currentWeight = 0;

food_channel.subscribe((msg)=>{
    currentWeight = parseFloat(Buffer.from(msg.data).toString(), 10);
    console.log(msg)
    console.log("Current Weight: ", currentWeight)
})

router.get('/', (req, res)=>{
    res.json({weight: currentWeight})
})

module.exports = router

