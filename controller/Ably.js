require('dotenv').config()
const Ably = require('ably') 
const ably = new Ably.Realtime(process.env.ABLY_KEY)

function channel(channel_name){
    
    //const food_channel = ably.channels.get('esp32/foodWeight')

    return ably.channels.get(channel_name)
}

module.exports = channel