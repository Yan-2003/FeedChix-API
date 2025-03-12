const express = require('express')
const router = express.Router()
const ably = require('../controller/Ably')
const database = require('../Database/Firebase')
const light_auto_channel = ably('esp32')
const cron  = require('node-cron')
const channel = ably('esp32/status')
const sendPushNotification = require('../controller/Notification')

const chicken_info = database.ref('chicken_info')

const light_options = database.ref('light_options')

let chickenInfo

let autoRecTemp

light_options.on('value', snapshot =>{
    autoRecTemp = snapshot.val()
})


function getScheduleDay(date) {
  const inputDate = new Date(date)
  return `0 ${inputDate.getMinutes()} ${inputDate.getHours()} * * ${inputDate.getDay()}`
}

chicken_info.on('value', snapshot =>{
    chickenInfo = snapshot.val()

    let getWeek = getScheduleDay(chickenInfo.time_stamp)
    
    
    cron.schedule( getWeek, async () => {

        let new_week_age = parseInt(chickenInfo.week_age) + 1

        await chicken_info.update({
            week_age : new_week_age.toString()
        })

        sendPushNotification("Chicken is in week : ", chickenInfo.week_age);

        console.log("chicken week age increase")
    
    })

})

let recommended_temp = [32, 30, 26, 22, 20];

let sensors_status

let light_power

let temperature

let light_status

channel.subscribe((msg)=>{
    sensors_status = JSON.parse(Buffer.from(msg.data).toString())
    light_power = parseInt(sensors_status.light_power)    
    temperature = parseFloat(sensors_status.temperature)
    light_status = sensors_status.light_status
})

const adjust_light = () =>{
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
}


cron.schedule("*/2 * * * *" , ()=>{
    chicken_info.on('value', snapshot => {
        chickenInfo= snapshot.val()

        const payload = {
            functionName : "light",
            status : "ON"
        }

        if(autoRecTemp.autoLightTemp != true){
            if(light_status == "ON" &&light_power == 20 && temperature > recommended_temp[chickenInfo.week_age]){
                if(light_options.silentNotification == false) sendPushNotification("Chicken Temperature is High ♨️ recommend to turn off light.");

            }else if(light_status == "OFF" && temperature < recommended_temp[chickenInfo.week_age]){
                if(light_options.silentNotification == false) sendPushNotification("Chicken Temperature is Low ❄️ recommend to turn on light.");

            }else{
                adjust_light()
            }
        }else{
            if(light_status == "ON" &&light_power == 40 && temperature > recommended_temp[chickenInfo.week_age]){
                payload.status = 'OFF'
                if(light_status != 'OFF'){
                    light_auto_channel.publish('light', payload, (err)=>{
                        if(err){
                            console.log("Failed to publish message: ", err)
                        }
                        console.log("Message published successfully")
                    })
                    if(light_options.silentNotification == false) sendPushNotification("Chicken Temperature is High ♨️ auto turn off light.");
                    
                }
            }else if(light_status == "OFF" && temperature < recommended_temp[chickenInfo.week_age]){
                if(light_status != 'ON'){
                    light_auto_channel.publish('light', payload, (err)=>{
                        if(err){
                            console.log("Failed to publish message: ", err)
                        }
                        console.log("Message published successfully")
                    })
                    if(light_options.silentNotification == false) sendPushNotification("Chicken Temperature is Low ❄️ auto turn on light.");
                }

            }else{
                adjust_light()
            }
        }

        console.log("adjusting light intensety.")
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

router.get('/status', (req, res)=>{
    return res.json(sensors_status)
})


module.exports = router;