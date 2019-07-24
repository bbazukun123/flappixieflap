import * as PIXI from 'pixi.js'
import CharacterController from "./CharacterController"
import MapController from "./MapController"
import UIController from "./UIController"
import DataController from "./DataController"
import TransitionController from "./TransitionController"
import SoundController from "./SoundController"

/* For global game control that acts as a key reference */
export default class GameController{

    constructor(gameCanvas){

        //Automatic application sizing that goes up to 480px wide and holds the 4:3 ratio to maintain the consistency and the gameplay fairness
        this.width = window.innerWidth < 480 ? window.innerWidth : 480;
        this.height = this.width * (4/3);

        //Calculates the scaling factor for assets resizing on screen smaller than 480px wide
        this.scaleFactor = this.width / 480;

        //Create express PIXI application
        this.app = new PIXI.Application({

            view: gameCanvas,
            width: this.width,
            height: this.height,
            resolution: window.devicePixelRatio,
            autoDensity: true

        });

        //Creates other sub-controllers
        this.dataController = new DataController();
        this.uiController = new UIController(this);
        this.characterController = new CharacterController(this);
        this.mapController = new MapController(this);
        this.soundController = new SoundController();

        //Utility variables and references
        this.sceneContainers = {};
        this.activeSceneContainer = null;
        this.state = null;
        this.scoringActive = true;
        this.score = 0;
        this.accumulatedDelta = 0;
        this.soundMuted

        this.init();

    }

    init(){

        //Setup window resize listener to adjust the page content accordingly
        window.addEventListener("resize", () => {

            const newWidth = window.innerWidth < 480 ? window.innerWidth : 480;
            const newHeight = newWidth * (4/3);

            this.app.stage.scale.set(
                newWidth/this.width,
                newHeight/this.height
            );

            this.app.renderer.resize(newWidth,newHeight);

        });

        //Creates main containers for all scenes 
        const loadingSceneContainer = new PIXI.Container();
        const mainMenuSceneContainer = new PIXI.Container();
        const gameSceneContainer = new PIXI.Container();
        const endSceneContainer = new PIXI.Container();

        this.sceneContainers["Loading"] = loadingSceneContainer;
        this.sceneContainers["MainMenu"] = mainMenuSceneContainer;
        this.sceneContainers["Game"] = gameSceneContainer;
        this.sceneContainers["End"] = endSceneContainer;

        this.sceneContainers["Game"].sortableChildren = true;

        Object.values(this.sceneContainers).forEach(container => {
            container.visible = false; // Initially hides all the scenes
            this.app.stage.addChild(container);
        })

        //Later creates controller for scene transitions (make uses of the defined scene containers)
        this.transitionController = new TransitionController(this);

        //Puts the application into the initial loading state
        this.changeState("Loading");

        //Kickstarts the application loop
        this.app.ticker.add(delta => this.gameLoop(delta));

    }

    changeState(newState){
        
        this.activeSceneContainer = this.sceneContainers[newState];

        //Some state re-assignments are moved into the transition functions to accomodate the transitioning animations 
        switch(newState){

            case "Loading":
                this.activeSceneContainer.visible = true;
                this.state = this.loadingScene;
                break;

            case "MainMenu":
                //Here the application can transition from both loading scene and the end menu
                if(this.sceneContainers["Loading"].visible === true){
                    this.transitionController.loadingToMainMenuScene();
                    this.state = this.mainMenuScene;
                    return;
                }
                this.transitionController.endToMainMenuScreen();
                break;
                
            case "Game":
                //Here the application can transition from both main menu and the end menu
                if(this.sceneContainers["MainMenu"].visible === true){
                    this.transitionController.mainMenuToGameScene();
                    return;
                }
                this.transitionController.endToGameScene();
                break;

            case "End":
                this.state = null;
                this.activeSceneContainer.visible = true;
                this.transitionController.gameToEndScene();
                break;

            default:
                break;

        }

    }

    scoring(){
        if(this.scoringActive){
            
            const currentObstacle = this.mapController.obstaclesContainer.children[this.mapController.scoringIndex];

            if((currentObstacle.x + (currentObstacle.width / 2)) - this.characterController.characterSprite.x <= 0){

                this.mapController.scoringIndex++;
                this.score++;
                if(!this.soundMuted)
                    this.soundController.scoringSound();
                this.uiController.gameScore.text = this.score;

            }
        }

    }

    //Detects whether player has been colliding with the obstacle poles or not (Rectangle hitbox) ** NTS: Please find ways to do alpha-sprite collision detection **
    isCollided(){

        //Focus on the closest/yet-passed obstacle set
        const currentObstacle = this.mapController.focusedObstacle;
        const character = this.characterController.characterSprite;

        //** NTS: Still need to balance the hitbox boundary **
        const minXOffset = 0 * this.scaleFactor;
        const minYOffset = 25 * this.scaleFactor;
        const maxXOffset = 45 * this.scaleFactor;
        const maxYOffset = 20 * this.scaleFactor;

        const minCharacterY = (character.y - character.height / 2) + minYOffset;
        const maxCharacterY = (character.y + character.height / 2) - maxYOffset;
        const minCharacterX = (character.x - character.width / 2) + minXOffset;
        const maxCharacterX = (character.x + character.width / 2) - maxXOffset;

        const minGapY = currentObstacle.y + (currentObstacle.height / 2) - (this.mapController.obstacleData.gap * this.scaleFactor / 2);
        const maxGapY = currentObstacle.y + (currentObstacle.height / 2) + (this.mapController.obstacleData.gap * this.scaleFactor / 2);
        const minObstacleX = currentObstacle.x;
        const maxObstacleX = currentObstacle.x + currentObstacle.width;

        let inXBound = false;
        let inYBound = true;

        if((maxCharacterX > minObstacleX && maxCharacterX < maxObstacleX) || (minCharacterX > minObstacleX && minCharacterX < maxObstacleX)){

            inXBound = true;

            if((minCharacterY > minGapY && minCharacterY < maxGapY) && (maxCharacterY > minGapY && maxCharacterY < maxGapY))
                inYBound = false; //Check whether the players is in the Y range of the gap between the poles (safe-zone) rather than on the obstacles like for X range

        }

        //Shift the focus to the next set of obstacle poles once passed
        if(character.x > maxObstacleX)
            this.mapController.collisionTestIndex++;

        return inXBound && inYBound;

    }

    //Resets the character and map assets, as well as some of the utility variables
    resetGame(){

        this.score = 0;
        this.uiController.gameScore.text = 0;
        this.characterController.resetCharacter();
        this.mapController.resetMap();
        this.scoringActive = true;

    }

    /* ------------------------------ LOOPS ------------------------------ */

    //Main looper
    gameLoop(delta){

        this.accumulatedDelta += delta;
        if(this.state)
            this.state(delta);
        this.transitionController.animate(delta);

    }

    loadingScene(delta){

        this.uiController.menuLoop(delta);

        this.dataController.loader
            .on("progress",(loader) => {
                console.log(loader.progress + "%");
            })
            .load(() => {
                this.changeState("MainMenu");
            })

    }

    mainMenuScene(delta){
        this.uiController.menuLoop(delta);
    }

    gameScene(delta){
        
        this.characterController.characterPhysics(delta);
        this.mapController.mapLoop(delta);

        //Checks for current status of the gameplay and loops accordingly
        if(!this.characterController.isDead() && !this.isCollided()){ 

            this.scoring();

            //Hacky Solutions! ** NTF: Fix this ASAP!
            if(this.uiController.go.alpha > 0){
                this.uiController.go.alpha -= (delta/40);
            }

            if(this.uiController.gameScore.alpha < 1){
                this.uiController.gameScore.alpha += (delta/40);
            }
                
        }else if(!this.sceneContainers["End"].visible){

            if(this.scoringActive)
                this.characterController.dead();

            if(this.score > this.dataController.highscore)
                this.dataController.highscore = this.score;

            if(this.characterController.isDead()){
                this.transitionController.resetCounter();
                this.uiController.resetEndMenu();
                this.changeState("End");
            }
            
        }
    }

    /* ------------------------------ UTILITIES ------------------------------ */

    //Proportionally alters inputted sprite's dimension 
    adjustSprite(sprite){
        sprite.width = sprite.width * this.scaleFactor;
        sprite.height = sprite.height * this.scaleFactor;
    }

}
