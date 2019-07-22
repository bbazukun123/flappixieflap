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
        this.characterSprite = null;
        this.gameScore = null;
        this.counterTexts = [];
        this.transitionDuration = 30;
        this.popDuration = 15;
        this.countDownDuration = 25;
        this.backdropOn = false;
        this.deltaCounter = 0;
        this.countDownCounter = 0;
        this.transition = null;
        this.soundMuted = false;

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

    setupUIReferences(){

        this.gameScore = this.gameController.uiController.gameScore;

        this.counterTexts.push(this.gameController.uiController.three);
        this.counterTexts.push(this.gameController.uiController.two);
        this.counterTexts.push(this.gameController.uiController.one);
        this.counterTexts.push(this.gameController.uiController.go);

        this.resetCounter();

    }

    resetCounter(){

        this.gameScore.alpha = 0;

        this.counterTexts.forEach(text => {
            text.alpha = 0;
            text.scale.set(1);
        })

        this.countDownCounter = 0;

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

                //Hackily stops the loader animation *NTS: Please search for a better alternative
                if(this.gameController.uiController.isLoading)
                    this.gameController.uiController.isLoading = false;
                
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

            //WIP Scaling Exit Animation
            /* if(this.skinSprite.scale.x > 0){

                const scale = (delta/this.popDuration) * this.skinSprite.originalScale;

                this.skinSprite.scale.x -= scale;
                this.skinSprite.scale.y -= scale;

            }else{ */

                if(this.backdrop.alpha < 1 && !this.backdropOn)
                    this.backdrop.alpha += (delta/this.transitionDuration) * 1;
                else{

                    this.backdropOn = true;
                    this.mainMenuScene.visible = false;
                    this.gameScene.visible = true;

                    if(this.backdrop.alpha > 0)
                        this.backdrop.alpha -= (delta/this.transitionDuration) * 1;
                    else{

                        if(this.countDownCounter < 4)
                            this.countDown(delta);
                        else{

                            this.transition = null;
                            this.backdropOn = false;
                            this.gameController.state = this.gameController.gameScene;
                            this.gameController.characterController.jumpSoundEnabled = true;

                        }
                        
                    }

                }

            /* } */

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
                this.gameController.resetGame();   

                if(this.backdrop.alpha > 0)
                    this.backdrop.alpha -= (delta/this.transitionDuration) * 1;
                else{

                    if(this.countDownCounter < 4)
                        this.countDown(delta);
                    else{

                        this.transition = null;
                        this.backdropOn = false;
                        this.gameController.state = this.gameController.gameScene;
                        this.gameController.characterController.jumpSoundEnabled = true;

                    }
                    
                }

            }

        }

    }

    //Animates countdown timer sequence at the start of each gameplay
    countDown(delta){

        const currentText = this.counterTexts[this.countDownCounter];
        const previousText = this.counterTexts[this.countDownCounter - 1];

        if(previousText && previousText.alpha > 0)
            previousText.alpha -= (delta * (5/6)/this.countDownDuration) * 1;
        else{

            if(currentText.alpha < 1){

                currentText.alpha += (delta/this.countDownDuration) * 1;

                if(currentText.scale.x > 0.5){
                    currentText.scale.x -= (delta/this.countDownDuration) * 1;
                    currentText.scale.y -= (delta/this.countDownDuration) * 1;
                }

            }
            else{

                this.countDownCounter++;

                if(!this.gameController.soundMuted){

                    if(this.countDownCounter == 4){
                        this.gameController.soundController.goSound();
                        return;
                    }

                    this.gameController.soundController.counterSound();
                    
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

    //Animation Loop
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