import * as PIXI from 'pixi.js'

/* For outputting UI and perform menu related actions */
export default class UIController{

    constructor(gameController){

        //Back-references
        this.gameController = gameController;
        this.dataController = gameController.dataController;  
        this.app = gameController.app;

        this.fontStyles = [];

        //Setup UI once resources loading completes
        this.dataController.loader.load(this.setupUI.bind(this));

    }

    setupUI(){

        //Generate different font styles (mainly just size differences) - ** NTS: Please find more effective way in dealing with dynamic texts **
        this.createFontStyles();

        /* Potential Loading UI if loading time becomes significant */
        this.createMainMenu();
        this.createInGameUI();
        this.createEndMenu();

    }

    createFontStyles(){

        const baseStyle = (fontSize, strokeThickness) => {

            return (new PIXI.TextStyle({
                fontFamily: 'Fredoka One',
                fontSize: fontSize,
                fontWeight: 'bold',
                lineHeight: 30,
                letterSpacing: 8,
                align: "center",
                fill: "#ffffff", // gradient
                stroke: '#4a1850',
                strokeThickness: strokeThickness,
                dropShadow: true,
                dropShadowColor: '#ffffff',
                dropShadowBlur: 4,
                dropShadowDistance: 0,
                wordWrap: true,
                wordWrapWidth: 250
            }));

        }
        
        this.fontStyles.push(baseStyle(50,10));
        this.fontStyles.push(baseStyle(90,10));
        this.fontStyles.push(baseStyle(30,8));
        this.fontStyles.push(baseStyle(70,8));

    }

    createMainMenu(){

        //Main menu's background
        const background = new PIXI.Sprite(this.dataController.loader.resources["ui_background"].texture);
        background.width = (this.app.renderer.screen.height/background.height) * background.width;
        background.height = this.app.renderer.screen.height;
        this.gameController.sceneContainers["MainMenu"].addChild(background);

        //Main menu's "Best" label
        const title = new PIXI.Text('Best', this.fontStyles[0]);
        title.anchor.x = 0.5;
        this.gameController.adjustSprite(title);
        title.x = this.app.renderer.screen.width / 2;
        title.y = this.app.renderer.screen.height * 0.05;
        
        //Score Holder - * Uses "this" for the ability to access it from outside *  
        this.score = new PIXI.Text(this.dataController.highscore, this.fontStyles[1]);
        this.score.anchor.x = 0.5;
        this.gameController.adjustSprite(this.score);
        this.score.y = title.y + title.height;
        this.score.x = this.app.renderer.screen.width / 2;

        this.gameController.sceneContainers["MainMenu"].addChild(title);
        this.gameController.sceneContainers["MainMenu"].addChild(this.score);

        //Skin display
        this.skinSprite = new PIXI.AnimatedSprite(this.dataController.selectedSkin);
        this.gameController.transitionController.skinSprite = this.skinSprite;
        this.skinSprite.anchor.set(0.5);
        this.skinSprite.pivot.set(0.5);
        this.skinSprite.originalScale = 0.9;
        this.skinSprite.scale.set(this.skinSprite.originalScale);
        this.gameController.adjustSprite(this.skinSprite);
        this.skinSprite.position.set(this.app.renderer.screen.width / 1.9,this.app.renderer.screen.height / 2)
        this.gameController.sceneContainers["MainMenu"].addChild(this.skinSprite);
        this.skinSprite.animationSpeed = 0.5;
        this.skinSprite.play();

        //Skin switching buttons
        const rightArrow = new PIXI.Sprite(this.dataController.loader.resources["ui_arrow"].texture);
        rightArrow.anchor.set(0.5);
        rightArrow.scale.set(0.6);
        this.gameController.adjustSprite(rightArrow);
        rightArrow.position.set(this.app.renderer.screen.width * 4 / 5,this.app.renderer.screen.height / 2);
        rightArrow.interactive = true;
        rightArrow.buttonMode = true;
        rightArrow.on("pointerdown",() => {
            this.changeSkin("next");
        })
        this.gameController.sceneContainers["MainMenu"].addChild(rightArrow);

        const leftArrow = new PIXI.Sprite(this.dataController.loader.resources["ui_arrow"].texture);
        leftArrow.anchor.set(0.5);
        leftArrow.scale.set(-0.6);
        this.gameController.adjustSprite(leftArrow);
        leftArrow.position.set(this.app.renderer.screen.width * 1 / 5,this.app.renderer.screen.height / 2);
        leftArrow.interactive = true;
        leftArrow.buttonMode = true;
        leftArrow.on("pointerdown",() => {
            this.changeSkin("previous");
        })
        this.gameController.sceneContainers["MainMenu"].addChild(leftArrow);

        //Our hero button~
        const startButton = new PIXI.Sprite(this.dataController.loader.resources["ui_button"].texture);
        startButton.anchor.x = 0.5;
        startButton.scale.set(0.8);
        this.gameController.adjustSprite(startButton);
        startButton.position.set(this.app.renderer.screen.width / 2,this.app.renderer.screen.height / 1.4);
        startButton.interactive = true;
        startButton.buttonMode = true;
        startButton.on("pointerdown",() => {
            this.gameController.resetGame();
            this.gameController.changeState("Game");
        })
        this.gameController.sceneContainers["MainMenu"].addChild(startButton);

    }

    createInGameUI(){

        //Overlayed Score Counter
        this.gameScore = new PIXI.Text(this.dataController.highscore, this.fontStyles[3]);
        this.gameScore.anchor.x = 0.5;
        this.gameController.adjustSprite(this.gameScore);
        this.gameScore.x = this.app.renderer.screen.width / 2;
        this.gameScore.y = 30;
        this.gameController.sceneContainers["Game"].addChild(this.gameScore);
        this.gameController.transitionController.gameScore = this.gameScore;
        this.gameScore.parent.sortableChildren = true;
        this.gameScore.zIndex = 1;
        this.gameScore.parent.sortChildren();

    }

    createEndMenu(){

        //Translucent background
        this.endBackground = new PIXI.Graphics();
        this.endBackground.beginFill(0x000000);
        this.endBackground.drawRect(0, 0, this.app.renderer.screen.width, this.app.renderer.screen.height);
        this.endBackground.endFill();
        this.endBackground.alpha = 0.5;
        this.gameController.sceneContainers["End"].addChild(this.endBackground);
        this.endBackground.parent.sortableChildren = true;
        this.endBackground.zIndex = -1;
        this.endBackground.parent.sortChildren();

        //Texts set
        const title2 = new PIXI.Text('Score', this.fontStyles[0]);
        this.score2 = new PIXI.Text(this.gameController.score, this.fontStyles[1]);
        this.best = new PIXI.Text("Best: " + this.dataController.highscore, this.fontStyles[2]);
        title2.anchor.x = 0.5;
        this.score2.anchor.x = 0.5;
        this.best.anchor.x = 0.5;
        this.gameController.adjustSprite(title2);
        this.gameController.adjustSprite(this.score2);
        this.gameController.adjustSprite(this.best);

        title2.x = this.app.renderer.screen.width / 2;
        title2.y = this.app.renderer.screen.height * 0.05;
        this.score2.x = this.app.renderer.screen.width / 2;
        this.score2.y = title2.y + title2.height;
        this.best.x = this.app.renderer.screen.width / 2;
        this.best.y = this.score2.y + this.score2.height;

        this.gameController.sceneContainers["End"].addChild(title2);
        this.gameController.sceneContainers["End"].addChild(this.score2);
        this.gameController.sceneContainers["End"].addChild(this.best);

        //Play-again button
        const retryButton = new PIXI.Sprite(this.dataController.loader.resources["ui_button3"].texture);
        retryButton.anchor.x = 0.5;
        retryButton.scale.set(0.8);
        this.gameController.adjustSprite(retryButton);
        retryButton.position.set(this.app.renderer.screen.width / 2,this.app.renderer.screen.height / 2);
        retryButton.interactive = true;
        retryButton.buttonMode = true;
        retryButton.on("pointerdown",() => {
            /* this.gameController.resetGame(); */
            this.gameController.changeState("Game");
        })
        this.gameController.sceneContainers["End"].addChild(retryButton);

        //Back to main menu button
        const backButton = new PIXI.Sprite(this.dataController.loader.resources["ui_button2"].texture);
        backButton.anchor.x = 0.5;
        backButton.scale.set(0.8);
        this.gameController.adjustSprite(backButton);
        backButton.position.set(this.app.renderer.screen.width / 2,this.app.renderer.screen.height / 1.4);
        backButton.interactive = true;
        backButton.buttonMode = true;
        backButton.on("pointerdown",() => {
            this.resetMainMenu();
            this.gameController.changeState("MainMenu");
        })
        this.gameController.sceneContainers["End"].addChild(backButton);

    }

    //Switch the textures of the skin according to the selected button (left/right)
    changeSkin(direction){

        const savedData = this.dataController.savedData;
        let currentIndex = savedData.skinsUnlocked.indexOf(savedData.selectedSkin);

        if(direction === "next"){

            currentIndex++;

            if(currentIndex >= savedData.skinsUnlocked.length)
                currentIndex = 0;

        }else if(direction === "previous"){

            currentIndex--;

            if(currentIndex < 0)
                currentIndex = savedData.skinsUnlocked.length - 1;

        }

        this.dataController.selectedSkin = savedData.skinsUnlocked[currentIndex];
        this.skinSprite.textures = this.dataController.getSkin(savedData.skinsUnlocked[currentIndex]);
        this.skinSprite.play();

    }

    resetMainMenu(){
        this.score.text = this.dataController.highscore;
    }

    resetEndMenu(){
        this.score2.text = this.gameController.score;
        this.best.text = "Best: " + this.dataController.highscore;
    }   

    menuLoop(delta){
        this.skinSprite.y = (this.app.renderer.screen.height / 2) + (Math.sin((this.gameController.accumulatedDelta / 20)) * 6);
        this.skinSprite.rotation = (Math.PI / 60) * (Math.sin((this.gameController.accumulatedDelta / 20) + 1));
    }

}
