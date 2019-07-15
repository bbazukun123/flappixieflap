import * as PIXI from 'pixi.js'

/* For controlling in-game character (excluding the skin sprite in the menu) including the physics loop */
export default class CharacterController{

    constructor(gameController){

        //Back-references
        this.gameController = gameController;
        this.dataController = gameController.dataController;  
        this.app = gameController.app;     
        
        //Utility variables
        this.jumpVelocity = 10;
        this.velocity = 0;
        this.gravity = 0.5;

        //Setup character once resources loading completes
        this.dataController.loader.load(this.setupCharacter.bind(this));
        
    }

    setupCharacter(){

        //Setup character containers and animation sprite
        this.characterContainer = new PIXI.Container();
        this.gameController.sceneContainers["Game"].addChild(this.characterContainer);
        this.characterSprite = new PIXI.AnimatedSprite(this.dataController.selectedSkin);

        this.characterSprite.anchor.set(0.5);
        this.characterSprite.pivot.set(0.5);
        this.characterSprite.scale.set(0.6);
        this.gameController.adjustSprite(this.characterSprite);
        this.characterContainer.addChild(this.characterSprite);
        this.characterSprite.animationSpeed = 0.5;
        this.characterSprite.play();
    
        this.activateControls();

    }

    //
    activateControls(){

        this.app.stage.interactive = true;
        /* this.app.stage.onFuntion = this.jump.bind(this); */
        this.app.stage.on("pointerdown", () => {
            this.jump();
        });
        this.spaceKey = keyboard(" ");
        this.spaceKey.press = () => {
            this.jump();
        }

        //Borrowed from KittyKatAttack [https://github.com/kittykatattack/learningPixi#keyboard]
        function keyboard(value) {
            let key = {};
            key.value = value;
            key.isDown = false;
            key.isUp = true;
            key.press = undefined;
            key.release = undefined;
            //The `downHandler`
            key.downHandler = event => {
                if (event.key === key.value) {
                    if (key.isUp && key.press)
                        key.press();
                    key.isDown = true;
                    key.isUp = false;
                    event.preventDefault();
                }
            };

            //The `upHandler`
            key.upHandler = event => {
                if (event.key === key.value) {
                    if (key.isDown && key.release)
                        key.release();
                    key.isDown = false;
                    key.isUp = true;
                    event.preventDefault();
                }
            };

            //Attach event listeners
            const downListener = key.downHandler.bind(key);
            const upListener = key.upHandler.bind(key);
            
            window.addEventListener(
                "keydown", downListener, false
            );
            window.addEventListener(
                "keyup", upListener, false
            );
            
            // Detach event listeners
            key.unsubscribe = () => {
                window.removeEventListener("keydown", downListener);
                window.removeEventListener("keyup", upListener);
            };
            
            return key;
        }

    }

    deactivateControls(){
        /* this.app.stage.off("pointerdown", this.app.stage.onFuntion); */
        this.app.stage.interactive = false;
        this.spaceKey.unsubscribe();
    }

    deactivateControls(){
        /* this.app.stage.off("pointerdown", this.app.stage.onFuntion); */
        this.app.stage.interactive = false;
        this.spaceKey.unsubscribe();
    }

    changeSkin(selectedSkin){
        this.characterSprite.texture = selectedSkin;
    }

    resetCharacter(){
        this.velocity = 0;
        this.gameController.scoringActive = true;
        this.characterSprite.rotation = 0;
        this.characterSprite.textures = this.dataController.selectedSkin;
        this.characterSprite.play(); 
        this.characterSprite.x = this.app.renderer.screen.width * 0.30;
        this.characterSprite.y = this.app.renderer.screen.height / 2;

        this.activateControls();
    }

    jump(){

        if(this.characterSprite.y > -(this.app.renderer.screen.height / 3))
            this.velocity = -(this.jumpVelocity * this.gameController.scaleFactor);

    }
    
    get posX(){
        return this.characterSprite.x;
    }

    get posY(){
        return this.characterSprite.y;
    }

    set posY(newY){
        this.characterSprite.y = newY;
    }

    characterPhysics(delta){

        if(this.velocity < 50)
            this.velocity += (this.gravity * delta) * this.gameController.scaleFactor;

        if(this.characterSprite.y < this.app.renderer.screen.height + this.characterSprite.height)
            this.posY += (this.velocity * delta) * this.gameController.scaleFactor;

        if(this.characterSprite.rotation < 0)
            this.characterSprite.rotation = 0;

        this.characterSprite.rotation += (this.velocity/300) * delta;

        if(this.characterSprite.rotation > Math.PI / 20)
            this.characterSprite.rotation = Math.PI / 20;



        /* if(this.characterSprite.rotation < Math.PI / 8)
            this.characterSprite.rotation += Math.PI / 100; */
        /* this.characterSprite.rotation = (Math.PI / 60) * (Math.sin((this.gameController.accumulatedDelta / 20) + 1)); */
        
    }

    dead(){
        this.gameController.scoringActive = false;
        this.deactivateControls();
        this.velocity = 10;
    }

    isDead(){

        if(this.characterSprite.y > this.app.renderer.screen.height + this.characterSprite.height){
            /* console.log("Dead"); */
            return true;
        }

    }

}
