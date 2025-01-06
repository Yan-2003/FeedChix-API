const express = require('express')
const router = express.Router()
const ably = require('../controller/Ably')

const channel = ably('esp32/status')

let currentCapacity = 0;

router.get('/capacity', (req, res)=>{

    channel.subscribe((msg)=>{
        sensors_status = JSON.parse(Buffer.from(msg.data).toString())
        currentCapacity = sensors_status.water_capacity
    })

    res.json({capacity: currentCapacity})
})

module.exports = router

