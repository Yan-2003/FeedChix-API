const express = require('express')
const router = express.Router()
const ably = require('../controller/Ably')
const cron = require('node-cron')
const channel = ably('esp32/status')
const sendPushNotification = require('../controller/Notification')

const sched_channel = ably('esp32')

const database = require('../Database/Firebase')

const feeding_schedule = database.ref('feeding_schedule');

let currentWeight = 0;

let feeding_schedule_list

const chicken_info = database.ref('chicken_info')

let chicken

chicken_info.on('value', snapshot=>{
    chicken = snapshot.val()
    console.log("chicken info: ", chicken)
})


feeding_schedule.on('value', snapshot =>{
    feeding_schedule_list = snapshot.val()

    console.log('detecting new data...')
    scheudleFood()

})

const getTime = (time) =>{
    const date = new Date(time)

    const minues = date.getMinutes()
    const hours = date.getHours()

    return `${minues} ${hours} * * *`
}



let activeSchedules = new Map()


const get_schedules = () =>{

    if(feeding_schedule_list != null){
        const sched_list = Object.keys(feeding_schedule_list).map(key =>({
            id : key,
            ...feeding_schedule_list[key]
        }))
        return sched_list
    }
    console.log(activeSchedules)
    return null
}




const setupSchedules = ()=>{

    const schedule = get_schedules()

    console.log(schedule)

    if(schedule != null){
        activeSchedules.forEach((job, id)=>{
            if(schedule.some((s)=> s.id === id)){
                console.log(`Stopping job: ${id}`)
                job.stop()  
                activeSchedules.delete(id)
            }
        })
    }

}




const scheudleFood = async ()=> {
    console.log("Load Feeding Schedule....")

    
    let message = {
        functionName : "feeding",
        age_week : await chicken_info.week_age,
        chick_num : await chicken_info.chicken_num,
    }


    console.log("message: ", message)
    
    if(feeding_schedule_list != null){

        const scheduleList = get_schedules()

        scheduleList.forEach(scheudle => {
    
            console.log('Schedule Feeding :' , scheudle.timestamp)

            const job = cron.schedule( getTime(scheudle.timestamp), ()=>{
    
                sendPushNotification("Feeding Chickens");
    
                console.log("Attempting to send messange [Ably MQTT]")
            
                try {
                    sched_channel.publish('feeding', message, (err) => {
                        if (err) {
                          console.error('Failed to publish message:', err);
                          return res.status(500).send('Error publishing message');
                        }
                    
                        console.log('Message published successfully:', message);
                        res.status(200).send('Feeding function triggered successfully');
                      });
                    
                } catch (error) {
                    console.log(error)
                }
            })

            activeSchedules.set(scheudle.id, job)
    
        });
    }else{
        console.log('No Schedule...')
    }


}

router.get('/weight', (req, res)=>{

    channel.subscribe((msg)=>{
        sensors_status = JSON.parse(Buffer.from(msg.data).toString())
        currentWeight = sensors_status.food_weight
    })

    res.json({weight: currentWeight});

})

router.post('/add_schedule', (req, res)=>{

    setupSchedules()

    console.log(req.body)

    feeding_schedule.push({
        timestamp : req.body.feeding_sched.toString()
    })

    res.json("successfully added feeding schedule");

})

router.get('/get_schedules', (req, res) => {
    
    const sched_list = Object.keys(feeding_schedule_list).map(key =>({
        id : key,
        ...feeding_schedule_list[key]
    }))

    return res.json(sched_list)

})


router.delete('/delete_schedule/schedules/:id', async (req ,res)=>{

    console.log('Deleteding an Item')

    setupSchedules()

    const schedule_id = req.params.id

    try {
        await database.ref(`feeding_schedule/${schedule_id}`).remove()
        console.log('successfully deleted an item')

    } catch (error) {
        console.log(error)
    }

    console.log("Item Deleted:" ,schedule_id)

    return res.json("Item Deleted")    
})



module.exports = router;

