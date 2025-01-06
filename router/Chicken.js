const express = require('express')
const router = express.Router()
const ably = require('../controller/Ably')
const database = require('../Database/Firebase')
const axios = require('axios')
const light_auto_channel = ably('esp32')

const chicken_info = database.ref('chicken_info')

let chickenInfo


setInterval( async ()=>{


    chicken_info.on('value', snapshot => {
        chickenInfo= snapshot.val()
        
        const payload = {
            functionName : "auto_recommend_env",
            week_age : chickenInfo.week_age,
        }
        
        light_auto_channel.publish('light_auto', payload, (err)=>{
            if(err){
                console.error('Failed to publish message:', err)
                return res.status(500).send('Error publishing message');
            }
            console.log('Message published successfully:', message);
        })
    
        console.log("adjusting light intensety.")
    })
    
}, 30000)



router.post('/set_chicken', (req, res)=>{

    chicken_info.set({
        week_age : req.body.week_age,
        time_stamp : new Date().toISOString() 
    }).then(()=>{
        console.log("Set Chicken Info")
    }).catch((error)=>{
        console.log(error)
    })

    return res.json({message : "set checkin info"})
})


router.get('/', (req, res)=>{

    return res.json(chickenInfo)
})







module.exports = router;