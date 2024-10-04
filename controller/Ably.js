require('dotenv').config()
const Ably = require('ably') 
const ably = new Ably.Realtime(process.env.ABLY_KEY)

function channel(channel_name){
    
    return ably.channels.get(channel_name)
}

module.exports = channel