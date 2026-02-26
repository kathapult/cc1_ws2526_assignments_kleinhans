import { camera } from "./scene.js";


const intervalId = setInterval(() => {

 console.log(camera.position);

}, 5000); 


//clearInterval(intervalId);
