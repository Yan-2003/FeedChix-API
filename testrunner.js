let recommend = 30;
let temp = 40;
let brightness = 30;
if(recommend < temp && brightness > 30){
    brightness -= 10
}

if(recommend > temp && brightness < 90){
    brightness += 10
}


console.log(brightness)