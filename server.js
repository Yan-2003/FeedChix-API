require('dotenv').config()
const PORT = process.env.PORT
const express = require('express')
const app = express()



const food_weight = require('./router/FoodWeight')
app.use('/api/foodWeight', food_weight)

const water_capacity = require('./router/WaterCapacity')
app.use('/api/waterCapacity', water_capacity)



app.listen( PORT ,()=>{
    console.log("Server is Running at PORT: " + PORT)
})