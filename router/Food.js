const express = require('express')
const router = express.Router()
const ably = require('../controller/Ably')
const cron = require('node-cron')
const channel = ably('esp32/status')
const sendPushNotification = require('../controller/Notification')

const sched_channel = ably('esp32')

const database = require('../Database/Firebase')

const feeding_schedule = database.ref('feeding_schedule');
const food_store = database.ref('food_storage')

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

    const feeding_amount_per_chick = [30, 51, 88, 108, 126]

    console.log("Load Feeding Schedule....")

    const data = await chicken_info.once('value')
    const chicken_data = data.val()
    
    let message = {
        functionName : "feeding",
        age_week : chicken_data.week_age,
        chick_num : chicken_data.chicken_num,
    }


    console.log("message: ", message, "\n")
    
    if(feeding_schedule_list != null){

        const scheduleList = get_schedules()

        scheduleList.forEach(scheudle => {
    
            console.log('Schedule Feeding :' , scheudle.timestamp)

            const job = cron.schedule( getTime(scheudle.timestamp), async ()=>{
    
                sendPushNotification("Feeding Chickens");

                // deduct amount of food in storage 

                const food = food_store.once('value')
                const data = (await food).val()

                if(data.food_weight != 0){

                    let gram_feed = chicken.week_age > feeding_amount_per_chick.length ? feeding_amount_per_chick[feeding_amount_per_chick.length - 1] : feeding_amount_per_chick[chicken.week_age] 

                    let new_weight = data.food_weight - (gram_feed * chicken.chick_num  )

                    if(new_weight < 0){
                        new_weight = 0
                    }

                    const new_food_weight = {
                        food_weight : new_weight
                    }

                    food_store.set(new_food_weight)
                    console.log("updating food weight...")
                } 

    
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

router.get('/weight', async (req, res)=>{

    const food_weight_data = food_store.once('value')
    const weight = (await food_weight_data).val()

    let data = weight.food_weight

   res.json({weight : data})
})


router.get('/raw_weight', (req, res)=>{

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

cron.schedule("0 * * * *", ()=>{
    if(currentWeight < 1){
        sendPushNotification("Chicken is Low on Food 🍽️")
    }
})


router.post('/food_storage/setup', (req, res)=>{

    console.log(res.body)


    food_store.set({
        food_weight : req.body.raw_weight ?? 0, 
    })

    res.json({message: "setup food weight.."})
})


module.exports = router;

