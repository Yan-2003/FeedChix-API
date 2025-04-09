const express = require('express')
const router = express.Router()
const ably = require('../controller/Ably')
const database = require('../Database/Firebase')
const light_auto_channel = ably('esp32')
const cron  = require('node-cron')
const channel = ably('esp32/status')
const sendPushNotification = require('../controller/Notification')
const { GoogleSpreadsheet } = require('google-spreadsheet');
const chicken_info = database.ref('chicken_info')
const light_options = database.ref('light_options')
const SHEET_ID = '1aIzKvOVf2uecfaBqwx0VdWfRDb97CeCMRRZ5PWD0_iA';
const {JWT} = require('google-auth-library')
const serviceAccount = JSON.parse(Buffer.from(process.env.SERVICE_ACCOUNT_JSON, 'base64').toString('utf-8'));
let chickenInfo

let lightOptions

light_options.on('value', snapshot =>{
    lightOptions = snapshot.val()
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
    try {
        const rawData = Buffer.from(msg.data).toString();
        console.log("Received raw data:", rawData); // Debugging output

        sensors_status = JSON.parse(rawData); // Attempt to parse JSON

        // Extract values
        light_power = parseInt(sensors_status.light_power);
        temperature = parseFloat(sensors_status.temperature);
        light_status = sensors_status.light_status;

    } catch (error) {
        console.error("JSON parsing error:", error.message);
    }
})

// loggin to google sheet function


const sheet_log = async () =>{

    const chicken_data = chicken_info.once('value')
    const chicken = (await chicken_data).val()

    try {

        const accessSheet = new JWT({
            email : serviceAccount.client_email,
            key : serviceAccount.private_key,
            scopes : ['https://www.googleapis.com/auth/spreadsheets'],
        })

        const doc = new GoogleSpreadsheet(SHEET_ID, accessSheet)

        await doc.loadInfo(); // Load spreadsheet info
    
        const sheet = doc.sheetsByIndex[0];

        const sheet_row = {
            Timestamp: new Date().toISOString(),
            week_age : chicken.week_age,
            chicken_num : chicken.chicken_num,
            temperature : sensors_status.temperature,
            humidity : sensors_status.humidity,
            water_percent : sensors_status.water_capacity,
            food_storage : sensors_status.food_weight,
            light_intencity : light_power,
            light_status : light_status,
            light_auto_recommend : lightOptions.autoLightTemp,
            light_notification_silent : lightOptions.silentNotification,
        }
        
        console.log("Added Row: ", sheet_row)
    
        await sheet.addRow(sheet_row);
        console.log("Successfully Log to Google Sheet")
        
    } catch (error) {
        console.log("Faild to Log to Google Sheet: ",error)
    }
}




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

cron.schedule("*/20 * * * *", ()=>{
    if(sensors_status.humidity > 80){
        sendPushNotification("Chicken Humidity is High 💧")
    }
    if(sensors_status.humidity < 60){
        sendPushNotification("Chicken Humidity is Low 💧")
    }

    if(lightOptions.autoLightTemp == false){

        if(light_status == "ON" && temperature > recommended_temp[chickenInfo.week_age]){
            sendPushNotification("Chicken Temperature is High ♨️");
            
        }else if(light_status == "OFF" && temperature < recommended_temp[chickenInfo.week_age]){
            sendPushNotification("Chicken Temperature is Low ❄️");
            
        }else{
            adjust_light()
        }
    }
})


cron.schedule("*/2 * * * *" , ()=>{
    chicken_info.on('value', snapshot => {
        chickenInfo= snapshot.val()
        
        const payload = {
            functionName : "light",
            status : "ON"
        }

        if(lightOptions.autoLightTemp == false){

            adjust_light()
        }
        
        if(lightOptions.autoLightTemp == true){

            console.log("int the true light auto: ", lightOptions.autoLightTemp)


            if(light_status == "ON" && light_power == 30 && temperature > recommended_temp[chickenInfo.week_age]){
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

cron.schedule("0 * * * *", ()=>{
    sheet_log()
    console.log("Added to Google Sheet Log....")
})

module.exports = router;