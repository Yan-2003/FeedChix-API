const axios = require('axios');

// Function to send a push notification
const sendPushNotification = async (expoPushToken) => {
  try {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: 'Hello!',
      body: 'This is a test notification',
      data: { customData: 'any additional data' },
    };

    const response = await axios.post('https://exp.host/--/api/v2/push/send', message);
    console.log('Notification sent:', response.data);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};


sendPushNotification("");