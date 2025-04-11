const database = require('./Database/Firebase')

const food_weight = database.ref('food_storage')


food_weight.set({
    food_weight : 500
})