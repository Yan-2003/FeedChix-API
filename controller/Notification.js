const axios = require('axios');
const database = require('../Database/Firebase')


const notificaiton = database.ref('notification_log')

// Function to send a push notification
const sendPushNotification = async (message_body) => {
  try {
    const message =  {
      appId: 26755,
      appToken: "UtZgk2d9XwWKObtyW9dA3d",
      title: "C coop",
      body: message_body,
      dateSent: new Date(),
      pushData: { yourProperty: "yourPropertyValue" }
  }

    const response = await axios.post('https://app.nativenotify.com/api/notification', message);
    console.log('Notification sent:', response.data);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};


module.exports = sendPushNotification;