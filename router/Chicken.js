const express = require('express')
const router = express.Router()
const ably = require('../controller/Ably')
const database = require('../Database/Firebase')
const light_auto_channel = ably('esp32')
const cron  = require('node-cron')

const chicken_info = database.ref('chicken_info')

let chickenInfo


function getScheduleDay(date) {
  const inputDate = new Date(date)
  return `0 ${inputDate.getMinutes()} ${inputDate.getHours()} * * ${inputDate.getDay()}`
}

cron.schedule("*/2 * * * *" , ()=>{
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
})



chicken_info.on('value', snapshot =>{
    chickenInfo = snapshot.val()

    let getWeek = getScheduleDay(chickenInfo.time_stamp)
    
    
    cron.schedule( getWeek, async () => {

        let new_week_age = parseInt(chickenInfo.week_age) + 1

        await chicken_info.update({
            week_age : new_week_age.toString()
        })

        console.log("chicken week age increase")
    
    })

})


router.post('/set_chicken', (req, res)=>{

    chicken_info.set({
        week_age : req.body.week_age,
        chicken_num : req.body.chicken_num,
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