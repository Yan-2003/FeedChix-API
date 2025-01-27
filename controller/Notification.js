const axios = require('axios');
const database = require('../Database/Firebase')
const notificaiton = database.ref('notification_log')
const admin = require('firebase-admin');


// Function to send a push notification
const sendPushNotification = async (message_body) => {
  try {
    const message =  {
      appId: 26755,
      appToken: "UtZgk2d9XwWKObtyW9dA3d",
      title: "C coop",
      body: message_body,
      dateSent: Date.now(),
      pushData: { yourProperty: "yourPropertyValue" }
  }

    const response = await axios.post('https://app.nativenotify.com/api/notification', message);

    notificaiton.push({
      message: message_body,
      timestamp: admin.database.ServerValue.TIMESTAMP, 
    })

    console.log('Notification sent:', response.data);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};


module.exports = sendPushNotification;