const database = require('./Database/Firebase')

const food_weight = database.ref('food_storage')

food_weight.once('value').then(e => console.log((e.val()).food_weight))