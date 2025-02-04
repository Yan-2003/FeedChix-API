const express = require('express')
const router = express.Router()
const database = require('../Database/Firebase')


const notification_logs = database.ref('notification_log')

let notifications

notification_logs.on('value', snapshot => {
    notifications = snapshot.val()
})



router.get('/', (req ,res)=>{

    
    const notificationArray = Object.keys(notifications).map(key =>({
      id : key,
      ...notifications[key]
    }))

    notificationArray.sort((a, b) => b.timestamp - a.timestamp);


    return res.json(notificationArray)

})


module.exports = router