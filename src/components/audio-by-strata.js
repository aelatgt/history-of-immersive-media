/* global AFRAME */

/*
 * Description
 * ===========
 * Allows for specified sounds to be played inside designated height ranges "stratas" within the environment
 *
 * Usage
 * =======
 * Attach this component to an empty a-entity after the related audio sources have been declared
 * as separate sound entities. 
 * 
 * Reference the various audio sources using their id selectors in the component's audio1, audio2, audio3, and audio4 properties
 * 
 * Example
 * ========
 * <a-entity id="sound-1" position="0 0 0" sound="src: #sound-asset-1; volume: .5; loop: true"></a-entity>
 * <a-entity id="sound-2" position="0 5 0" sound="src: #sound-asset-2; volume: .5; loop: true"></a-entity>
 * <a-entity id="sound-3" position="0 10 0" sound="src: #sound-asset-3; volume: .5; loop: true"></a-entity>
 * <a-entity id="sound-4" position="0 15 0" sound="src: #sound-asset-4; volume: .5; loop: true"></a-entity>
 * 
 * audio-by-strata="audio1: #sound-1; from1: 0; to1: 2.5; audio2: #sound-2; from2: 2.5; to2: 5.0; audio3: #sound-3; from3: 5.0; to3: 7.5; audio4: #sound-4; from4: 7.5; to4: 10.0"></a-entity>
 */

AFRAME.registerComponent("audio-by-strata", {
    schema: {
      audio1: { type: "selector" }, 
      from1: { type: "number"},
      to1: {type: "number"},
      audio2: { type: "selector"},
      from2: { type: "number"},
      to2: {type: "number"},
      audio3: { type: "selector" },
      from3: { type: "number"},
      to3: {type: "number"},
      audio4: { type: "selector" },
      from4: { type: "number"},
      to4: {type: "number"},
    },
    init: function() {
        const cameraEl = document.querySelector("[networked-avatar]"); //query the user
        let strataMusicEntities = [this.data.audio1, this.data.audio2, this.data.audio3, this.data.audio4];
        // let strataMusicEntities = document.querySelectorAll("[sound]");
        console.log("strataMusicEntities.length: " + strataMusicEntities.length);

        const from1 = this.data.from1;
        const from2 = this.data.from2;
        const from3 = this.data.from3;
        const from4 = this.data.from4;

        const to1 = this.data.to1;
        const to2 = this.data.to2;
        const to3 = this.data.to3;
        const to4 = this.data.to4;

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