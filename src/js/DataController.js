import * as PIXI from 'pixi.js'

/* For global data/content management */
export default class DataController{

    constructor(){

        //This acts as a game script that hold gameplay configurations and asset data - ** Can potentially be stored on a JSON file instead **
        this.gameContent = {
            ui: {
                background: "mainBG_composite.jpg",
                title: "",
                button: "playButton.png",
                button2: "backButton.png",
                button3: "replayButton.png",
                arrow: "rightArrow.png",
                loader: "loader.png",
                sound: "soundOn.png",
                muted: "muted.png"
            },
            // Currently, all the skins are initially unlocked, but a skin unlock system would be a nice compliment to the map progression in the future
            skins: [
                {
                    skin: "default",
                    texture: "default.json"
                },
                {
                    skin: "rocker",
                    texture: "rocker.json"
                },
                {
                    skin: "pinkie",
                    texture: "pinkie.json"
                }
            ],
            // Can potentially hold multiple maps and different sets of obstacles to give some senses of progression (transitioning seamlessly to maintain infinite side scrolling experience)
            maps: [
                {
                    map: "original_forest",

                    //Side-scrolling speed (both parallaxing backgrounds and gameplay)
                    scrollVelocity: 3, 

                    //Distance between obstacle sets
                    distance: 400, 

                    //Amount of obstacle sets in the map before transitioning (* Currently being ignored & running infinitely on this single map).
                    passAmount: 100,
                    
                    source: "WorldAssets.json",
                    scenery: [
                        {
                            layer: "background",
                            texture: "05_far_BG.jpg",

                            //"tile" for tiling sprites & "spawn" for pooling decorations
                            type: "tile",

                            //Y-Offset reference point: "bottom", "top" (from the ed of the canvas)
                            position: "bottom", 

                            //Offset distance from the reference point
                            offset: 90,

                            //Parallax Distance (Virtual Z-Distance for individual scroll speed calculations)
                            distance: 9
                        },
                        {
                            layer: "background",
                            texture: "03_rear_canopy.png",
                            type: "tile",
                            position: "top",
                            offset: -20,
                            distance: 6
                        }, 
                        {
                            layer: "background",
                            texture: "03_rear_silhouette.png",
                            type: "tile",
                            position: "bottom",
                            offset: 60,
                            distance: 6
                        },
                        {
                            layer: "background",
                            texture: "01_hanging_flower1.png",
                            type: "spawn",
                            spawnGap: 400,
                            position: "top",
                            offset: 0,
                            distance: 5
                        },
                        {
                            layer: "background",
                            texture: "02_tree_1.png",
                            type: "spawn",
                            spawnGap: 400,
                            position: "bottom",
                            offset: 35,
                            distance: 4
                        },
                        {
                            layer: "background",
                            texture: "02_tree_2.png",
                            type: "spawn",
                            spawnGap: 600,
                            position: "bottom",
                            offset: 70,
                            distance: 4
                        },
                        {
                            layer: "background",
                            texture: "01_hanging_flower2.png",
                            type: "spawn",
                            spawnGap: 500,
                            position: "top",
                            offset: 0,
                            distance: 4
                        },
                        {
                            layer: "background",
                            texture: "02_front_canopy.png",
                            type: "tile",
                            position: "top",
                            offset: 10,
                            distance: 4
                        },
                        {
                            layer: "background",
                            texture: "01_hanging_flower3.png",
                            type: "spawn",
                            spawnGap: 600,
                            position: "top",
                            offset: 0,
                            distance: 3
                        },
                        {
                            layer: "background",
                            texture: "01_front_silhouette.png",
                            type: "tile",
                            position: "bottom",
                            offset: 0,
                            distance: 3
                        },
                        {
                            layer: "foreground",
                            texture: "00_roof_leaves.png",
                            type: "tile",
                            position: "top",
                            offset: -30,
                            distance: 0.6
                        }
                    ],
                    // Currently only has 2 types of obstacles exist but can easily be expanded in animateObstacle function in the MapController
                    obstacle: {

                        //Y-distance between the poles in obstacle sets
                        gap: 215,

                        //Minimum distance from the top edge of the gap (bottom of top pole sprite)
                        maxGapHeight: 100,

                        //Minimum distance from the bottom edge of the gap (top of bottom pole sprite)
                        minGapHeight: 100,

                        texture: "column.png",
                        behaviours: [
                            {
                                start: 0,
                                action: "static" //Stationary poles
                            },
                            {
                                start: 25, //Sequence starting point (Therefore try get up to 25 points :p)
                                action: "bob", //Up-Down poles
                                speed: 8 //Bobbing speed
                            }
                        ]
                    }
                }
            ]
        }

        //Retrieves saved game data from browser's local storage, or create new one if doesn't exist
        this.savedData = window.localStorage.getItem("savedData") ? JSON.parse(window.localStorage.getItem("savedData")) : this.initSaveData();

        this.loader = PIXI.Loader.shared;
        this.loadResources();

    }

    //Load all the textures listed in the game script
    loadResources(){

        const directory = "./assets/images/";

        //Load Character-related textures
        this.gameContent.skins.forEach(({skin,texture}) => {
            this.loader.add(`skin_${skin}`,`${directory}/skins/${texture}`);
        });

        //Load Map textures
        this.gameContent.maps.forEach(({map,source,obstacle}) => {

            this.loader
                .add(`map_${map}`,`${directory}/${source}`)
                .add(`obstacle_${map}`,`${directory}/${obstacle.texture}`);

        });

        //Load UI-related textures
        this.loader
            .add("ui_background", `${directory}/${this.gameContent.ui.background}`)
            .add("ui_button", `${directory}/${this.gameContent.ui.button}`)
            .add("ui_button2", `${directory}/${this.gameContent.ui.button2}`)
            .add("ui_button3", `${directory}/${this.gameContent.ui.button3}`)
            .add("ui_arrow", `${directory}/${this.gameContent.ui.arrow}`)
            .add("ui_loader", `${directory}/${this.gameContent.ui.loader}`)
            .add("ui_sound", `${directory}/${this.gameContent.ui.sound}`)
            .add("ui_muted", `${directory}/${this.gameContent.ui.muted}`);

        //Load Sounds *****

    }

    initSaveData(){

        const defaultData = {
            highscore: 0,
            skinsUnlocked: ["default","rocker","pinkie"],
            selectedSkin: "default"
        }

        return defaultData;
        
    }

    writeSaveData(){
        window.localStorage.setItem("savedData", JSON.stringify(this.savedData));
    }

    /* ------------------------------ UTILITIES ------------------------------ */

    get highscore(){
        return this.savedData.highscore;
    }

    set highscore(newHighScore){
        this.savedData.highscore = newHighScore;
        this.writeSaveData();
    }

    getSkin(skinName){
        return Object.values(this.loader.resources[`skin_${skinName}`].textures);
    }

    get selectedSkin(){
        return Object.values(this.loader.resources[`skin_${this.savedData.selectedSkin}`].textures);
    }

    set selectedSkin(skin){
        this.savedData.selectedSkin = skin;
        this.writeSaveData();
    }

    isSkinUnlocked(skinName){
        return skinsUnlocked.includes(skinName) ? true : false;
    }

    unlockSkin(skinName){

        if(!skinsUnlocked.includes(skinName)){
            skinsUnlocked.push(skinName);
            this.writeSaveData();
        }     

    }

}
