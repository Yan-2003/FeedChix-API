const feeding_amount_per_chick = [30, 51, 88, 108, 126]

let currentWeight = 1000

const chicken_age = 2

let gram_feed = chicken_age > feeding_amount_per_chick.length ? feeding_amount_per_chick[feeding_amount_per_chick.length - 1] : feeding_amount_per_chick[chicken_age] 

let new_weight = currentWeight - (gram_feed * 10  )

if(new_weight < 0){
    new_weight = 0
}

console.log(new_weight)