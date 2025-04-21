require('dotenv').config()
const PORT = process.env.PORT
const express = require('express')

const app = express()

app.use(express.json()); 
app.use(express.urlencoded(true))


const Food = require('./router/Food')
app.use('/api/food', Food)

const Water = require('./router/Water')
app.use('/api/water', Water)

const TempHumid = require('./router/Temperature_Humidity')
app.use('/api/tempHumid', TempHumid)

const Light = require('./router/Lights')
app.use('/api/light', Light)

const Chicken = require('./router/Chicken')
app.use('/api/chicken', Chicken)

const Notificaiton = require('./router/Notifications')
app.use('/api/notification_log', Notificaiton)


app.get('/api', (req, res)=>{
    res.json({
        message : "Welcome to C-coop IOT Base Monitoring System for your chicken.",
        version : "Dev-1",
        updates : "n/a"
    })
})

app.listen( PORT ,()=>{
    console.log("Server is Running at PORT: " + PORT)
})