const express = require('express')
const ably = require('../controller/Ably')
const channel = ably('esp32/status')

const router = express.Router()

let tempHumid = {
    temperature : 0,
    humidity : 0,
}
router.get('/', (req, res)=>{

    
    channel.subscribe((msg)=>{
        sensors_status = JSON.parse(Buffer.from(msg.data).toString())
        tempHumid.temperature = sensors_status.temperature
        tempHumid.humidity = sensors_status.humidity
    })

    res.json(tempHumid)
    

})

module.exports = router