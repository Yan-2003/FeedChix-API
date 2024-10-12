require('dotenv').config()
const PORT = process.env.PORT
const express = require('express')
const app = express()



const food = require('./router/Food')
app.use('/api/food', food)

const water = require('./router/Water')
app.use('/api/water', water)

const tempHumid = require('./router/Temperature_Humidity')
app.use('/api/tempHumid', tempHumid)



app.listen( PORT ,()=>{
    console.log("Server is Running at PORT: " + PORT)
})