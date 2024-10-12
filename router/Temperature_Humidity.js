const express = require('express')
const ably = require('../controller/Ably')
const tempHumid_channel = ably('esp32/tempHumid')

const router = express.Router()

let tempHumid = 0

tempHumid_channel.subscribe((msg)=>{
    tempHumid = JSON.parse(Buffer.from(msg.data).toString())
    console.log(tempHumid)
})


router.get('/', (req, res)=>{

    res.json(tempHumid)

})

module.exports = router