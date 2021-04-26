/* global AFRAME */

/*
 * Description
 * ===========
 * Allows for specified audio files to be played inside designated height ranges "stratas" within the environment
 *
 * Usage
 * ======= 
 * Audio sounds are uploaded to an ngrok server, which is referenced by its unique server ID.
 * 
 * Example
 * ========
 * If ngrok Public URL is "https://ec85dd0b0721.ngrok.io/rooms", then assign variable ngrok_code to "ec85dd0b0721" 
 */

let ngrok_code = "1cf14edb86db";

//Query user elements
const cameraEl = document.querySelector("#avatar-rig"); //query the user
//const sceneEl = document.querySelector('a-scene');

const audio_link_1 = "https://" + ngrok_code + ".ngrok.io/assets/stratum_base.wav";
const audio_link_2 = "https://" + ngrok_code + ".ngrok.io/assets/stratum_1.mp3";
const audio_link_3 = "https://" + ngrok_code + ".ngrok.io/assets/stratum_2.mp3";
const audio_link_4 = "https://" + ngrok_code + ".ngrok.io/assets/stratum_3.m4a";
const audio_link_5 = "https://" + ngrok_code + ".ngrok.io/assets/stratum_4.mp3";
const audio_link_6 = "https://" + ngrok_code + ".ngrok.io/assets/stratum_future.mp3";

const from1 = -100;
const to1 = -1;

const from2 = -1;
const to2 = 2.25;

const from3 = 2.25;
const to3 = 5.25;

const from4 = 5.5;
const to4 = 10.25;

const from5 = 10.5;
const to5 = 15.5;

const from6 = 20;
const to6 = 100;

// Create your A-Frame entities
const cubeQuad1 = document.createElement('a-box');
const cubeQuad2 = document.createElement('a-box');
const cubeQuad3 = document.createElement('a-box');
const cubeQuad4 = document.createElement('a-box');
const cubeQuad5 = document.createElement('a-box');
const cubeQuad6 = document.createElement('a-box');

// Cubes in Quads
cubeQuad1.setAttribute('position', { x: 0, y: -2, z: 0 });
cubeQuad1.setAttribute('material', { color: 'yellow', shader: 'flat' });
cubeQuad1.setAttribute('visible', false);
cubeQuad1.setAttribute('sound', {src: audio_link_1, volume: 1, loop: true, autoplay: false});

cubeQuad2.setAttribute('position', { x: 0, y: 1, z: 0 });
cubeQuad2.setAttribute('material', { color: 'blue', shader: 'flat' });
cubeQuad2.setAttribute('visible', false);
cubeQuad2.setAttribute('sound', {src: audio_link_2, volume: 1, loop: true, autoplay: false});

cubeQuad3.setAttribute('position', { x: 0, y: 4, z: 0 });
cubeQuad3.setAttribute('material', { color: 'green', shader: 'flat' });
cubeQuad3.setAttribute('visible', false);
cubeQuad3.setAttribute('sound', {src: audio_link_3, volume: 1, loop: true, autoplay: false});

cubeQuad4.setAttribute('position', { x: 0, y: 7, z: 0 });
cubeQuad4.setAttribute('material', { color: 'red', shader: 'flat' });
cubeQuad4.setAttribute('visible', false);
cubeQuad4.setAttribute('sound', {src: audio_link_4, volume: 1, loop: true, autoplay: false});

cubeQuad5.setAttribute('position', { x: 0, y: 12, z: 0 });
cubeQuad5.setAttribute('material', { color: 'purple', shader: 'flat' });
cubeQuad5.setAttribute('visible', false);
cubeQuad5.setAttribute('sound', {src: audio_link_5, volume: 1, loop: true, autoplay: false});

cubeQuad6.setAttribute('position', { x: 0, y: 25, z: 0 });
cubeQuad6.setAttribute('material', { color: 'orange', shader: 'flat' });
cubeQuad6.setAttribute('visible', false);
cubeQuad6.setAttribute('sound', {src: audio_link_6, volume: 1, loop: true, autoplay: false});

//Code for testing on Mozilla Hubs
APP.scene.appendChild(cubeQuad1);
APP.scene.appendChild(cubeQuad2);
APP.scene.appendChild(cubeQuad3);
APP.scene.appendChild(cubeQuad4);
APP.scene.appendChild(cubeQuad5);
APP.scene.appendChild(cubeQuad6);

//==================================================================================================

//Music entities
let strataMusicEntities = document.querySelectorAll("[sound]");
console.log("strataMusicEntities.length: " + strataMusicEntities.length);

let userCurrStrata = 0;
let userPrevStrata = 0;

//Start scene
strataMusicEntities[0].components.sound.playSound();

//Continously update scene info
setInterval(function() {     
    //let localPos = cameraEl.object3D.position;
    let playerPos = cameraEl.object3D.getWorldPosition();  

    //Calculate user current strata
    userCurrStrata = calcStrata(playerPos.y);

    //Check if user left the strata
    if(userPrevStrata != userCurrStrata){           
        if(strataMusicEntities.length > 0){
            updateActiveMusic(userCurrStrata, userPrevStrata);
        }  
        userPrevStrata = userCurrStrata;
    }
}, 1000/80);

//Calculate the visited strata
function calcStrata(userHeight){
    let resultStrata = null;

    if(userHeight > from1 && userHeight <= to1){
        resultStrata = 0;
    }
    else if(userHeight > from2 && userHeight <= to2){
        resultStrata = 1;
    }
    else if(userHeight > from3 && userHeight <= to3){
        resultStrata = 2;
    }
    else if(userHeight > from4 && userHeight <= to4){
        resultStrata = 3;
    }
    else if(userHeight > from5 && userHeight <= to5){
        resultStrata = 4
    }
    else if(userHeight > from6 && userHeight <= to6){
        resultStrata = 5;
    }
    else{
    resultStrata = null;
    }  
    return resultStrata;
}

//Activate media in current strata and deactivate those in previous strata
function updateActiveMusic(strataCurr, strataPrev){
    console.log("Current Strata: " + strataCurr);
    console.log("Previous Strata: " + strataPrev);
    
    if(strataPrev != null){
    strataMusicEntities[strataPrev].components.sound.stopSound();
    }
    if(strataCurr != null){
    strataMusicEntities[strataCurr].components.sound.playSound();
    }
}