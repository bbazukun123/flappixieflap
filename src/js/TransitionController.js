import * as PIXI from 'pixi.js'

/* For transitioning between scenes - Please note that the approach here is very manual, hacky and inefficient ** NTF: Please focus on reusability! ** */
export default class TransitionController{

    constructor(gameController){

        //Back-references
        this.gameController = gameController;
        this.app = gameController.app;
        this.loadingScene = gameController.sceneContainers["Loading"];
        this.mainMenuScene = gameController.sceneContainers["MainMenu"];
        this.gameScene = gameController.sceneContainers["Game"];
        this.endScene = gameController.sceneContainers["End"];

        //Utility variables
        this.skinSprite = null;
        this.gameScore = null;
        this.characterSprite = null;
        this.transitionDuration = 30;
        this.popDuration = 300;
        this.backdropOn = false;
        this.deltaCounter = 0;
        this.transition = null;

        this.setupForTransition();

    }

    setupForTransition(){

        this.endScene.alpha = 0;

        this.backdrop = new PIXI.Graphics();
        this.backdrop.beginFill(0x000000);
        this.backdrop.drawRect(0, 0, this.app.renderer.screen.width, this.app.renderer.screen.height);
        this.backdrop.endFill();
        this.app.stage.addChild(this.backdrop);
        this.app.stage.sortableChildren = true;
        this.backdrop.zIndex = 1;
        this.app.stage.sortChildren();
        this.backdrop.alpha = 0;

    }

    /* ------------------------------ INDIVIDUAL TRANSITION SEQUENCES ------------------------------ */

    loadingToMainMenuScene(){

        this.transition = delta => {

            if(this.backdrop.alpha < 1 && !this.backdropOn)
                this.backdrop.alpha += (delta/this.transitionDuration) * 1;
            else{

                this.backdropOn = true;
                this.loadingScene.visible = false;
                this.mainMenuScene.visible = true;
                
                if(this.backdrop.alpha > 0)
                    this.backdrop.alpha -= (delta/this.transitionDuration) * 1;
                else{
                    this.transition = null;
                    this.backdropOn = false;
                }

            }

        }

    }

    mainMenuToGameScene(){

        this.transition = delta => {

            if(this.skinSprite.scale > 0){
                this.skinSprite.scale -= (delta/this.popDuration) * this.skinSprite.originalScale;
            }else{

                if(this.backdrop.alpha < 1 && !this.backdropOn)
                    this.backdrop.alpha += (delta/this.transitionDuration) * 1;
                else{

                    this.backdropOn = true;
                    this.mainMenuScene.visible = false;
                    this.gameScene.visible = true;

                    if(this.backdrop.alpha > 0)
                        this.backdrop.alpha -= (delta/this.transitionDuration) * 1;
                    else{

                        this.transition = null;
                        this.backdropOn = false;
                        this.gameController.state = this.gameController.gameScene;

                    }

                }
            }

        }

    }

    gameToEndScene(){

        this.transition = delta => {

            this.endScene.visible = true;

            if(this.endScene.alpha < 1){
                this.endScene.alpha += (delta/this.transitionDuration) * 1;
                this.gameScore.alpha -= (delta/this.transitionDuration) * 1;
            }else
                    this.transition = null;

        }

    }

    endToMainMenuScreen(){

        this.transition = delta => {

            if(this.backdrop.alpha < 1 && !this.backdropOn)
                this.backdrop.alpha += (delta/this.transitionDuration) * 1;
            else{
                
                this.backdropOn = true;
                this.endScene.alpha = 0;
                this.endScene.visible = false;
                this.gameScore.alpha = 1;
                this.gameScene.visible = false;
                this.gameController.resetGame();
                this.mainMenuScene.visible = true;
                this.gameController.state = this.gameController.mainMenuScene;

                if(this.backdrop.alpha > 0)
                    this.backdrop.alpha -= (delta/this.transitionDuration) * 1;
                else{
                    this.transition = null;
                    this.backdropOn = false;  
                }

            }

        }

    }

    endToGameScene(){
        
        this.transition = delta => {

            if(this.backdrop.alpha < 1 && !this.backdropOn)
                this.backdrop.alpha += (delta/this.transitionDuration) * 1;
            else{
                
                this.backdropOn = true;
                this.endScene.alpha = 0;
                this.endScene.visible = false;
                this.gameScore.alpha = 1;
                this.gameController.resetGame();   

                if(this.backdrop.alpha > 0)
                    this.backdrop.alpha -= (delta/this.transitionDuration) * 1;
                else{

                    this.transition = null;
                    this.backdropOn = false;
                    this.gameController.state = this.gameController.gameScene;
                    
                }

            }

        }

    }

    //No Longer used but could come in handy
    /* fade(container,duration){

        this.activeTransition.push((() => {

            if(container.alpha === 1){

                return (delta => {
                    console.log("Fading Out: " + container);
                    if(container.alpha > 0)
                        container.alpha -= (delta / duration) * 1;
                    else{
                        container.visible = false;
                        return true;
                    }

                });

            }

            return (delta => {
                console.log("Fading In: " + container);
                if(container.visible = false)
                    container.visible = true;

                if(container.alpha < 1)    
                    container.alpha += (delta / duration) * 1;
                else
                    return true;

            });

        })());    
    
    } */

    animate(delta){

        //Paired with the fade()
        /* 
        if(this.activeTransition.length !== 0)
            this.activeTransition.forEach((animation,index) => {

                if(animation(delta))
                    this.activeTransition.splice(index,1);
            });
        */

        if(this.transition)
            this.transition(delta);

    }

}