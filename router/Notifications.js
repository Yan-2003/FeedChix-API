const express = require('express')
const router = express.Router()
const database = require('../Database/Firebase')


const notification_logs = database.ref('notification_log')

let notifications

notification_logs.on('value', snapshot => {
    notifications = snapshot.val()
})



router.get('/', (req ,res)=>{
    
    return res.json(notifications)
    
})



module.exports = router