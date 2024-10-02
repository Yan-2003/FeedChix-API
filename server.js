require('dotenv').config()

const express = require('express')
const Ably = require('ably')
const axios = require('axios')

const app = express()

const ably = new Ably.Realtime(process.env.ABLY_KEY)
const channel = ably.channels.get('esp32')
const food_channel = ably.channels.get('esp32/foodWeight')


let currentWeight = 0;

// Subscribe to the weight channel to get real-time updates

food_channel.subscribe((msg)=>{
    currentWeight = parseFloat(Buffer.from(msg.data).toString(), 10);
    console.log(msg)
    console.log("Current Weight: ", currentWeight)
})

app.get('/foodWeight', (req, res)=>{
    res.json({weight: currentWeight})
})


const PORT = process.env.PORT


app.listen( PORT ,()=>{
    console.log("Server is Running at PORT: " + PORT)
})