require('dotenv').config()
const PORT = process.env.PORT
const express = require('express')
const app = express()



const food_weight = require('./router/FoodWeight')
app.use('/api/foodWeight', food_weight)





app.listen( PORT ,()=>{
    console.log("Server is Running at PORT: " + PORT)
})