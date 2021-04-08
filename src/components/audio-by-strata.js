/* global AFRAME */

/*
 * Description
 * ===========
 * 
 * 
 *
 * Usage
 * =======
 * 
 *  
 * 
 * 
 * 
 * Example: 
 * 
 */

AFRAME.registerComponent("audio-by-strata", {
    schema: {
      audio1: { type: "selector" }, 
      audio2: { type: "selector"},
      audio3: { type: "selector" },
      audio4: { type: "selector" },

    },
    init: function() {
        const cameraEl = document.querySelector("[networked-avatar]"); //query the user
        // let strataMusicEntities = [this.data.audio1, this.data.audio2, this.data.audio3, this.data.audio4];
        let strataMusicEntities = document.querySelectorAll("[sound]");

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
        
            if(userHeight > 0 && userHeight <= 2.5){
            resultStrata = 0;
            }
            else if(userHeight > 2.5 && userHeight <= 5.0){
            resultStrata = 1;
            }
            else if(userHeight > 5.0 && userHeight <= 7.5){
            resultStrata = 2;
            }
            else if(userHeight > 7.5 && userHeight <= 10.0){
            resultStrata = 3;
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

    }
  });