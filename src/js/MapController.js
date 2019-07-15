import * as PIXI from 'pixi.js'
import Parallaxor from "./Parallaxor"

export default class MapController{

    constructor(gameController){

        this.gameController = gameController;
        this.dataController = gameController.dataController;

        this.app = gameController.app;
        this.screen = this.app.renderer.screen;

        this.parallaxor = new Parallaxor(gameController);
        console.log(this.dataController.gameContent.maps[0]);
        this.currentMap = this.dataController.gameContent.maps[0];
        this.obstacleData = this.currentMap.obstacle;
        this.behavioursData = this.obstacleData.behaviours;
        this.obstacleBehaviours = [];
        this.obstacleCounter = 0;

        this.scoringIndex = 0;
        this.collisionTestIndex = 0;
        
        this.dataController.loader.load(this.setupMaps.bind(this));
        /* this.accumulatedDelta = 0; */
    }

    setupMaps(){

        this.scrollVelocity = this.currentMap.scrollVelocity;

        this.obstaclesContainer = new PIXI.Container();
        this.gameController.sceneContainers["Game"].addChild(this.obstaclesContainer);

        this.createObstableSprites();
        this.resetMap();

        this.parallaxor.setupParallax(this.currentMap);

    }

    createObstableSprites(){

        for(let i = 0; i < Math.ceil(this.app.renderer.screen.width / this.currentMap.distance) + 1; i++){

            const obstacleContainer = new PIXI.Container();
            this.obstaclesContainer.addChild(obstacleContainer);

            const topObstacleSprite = new PIXI.Sprite(this.dataController.loader.resources[`obstacle_${this.currentMap.map}`].texture);
            this.gameController.adjustSprite(topObstacleSprite);
            const bottomObstacleSprite = new PIXI.Sprite(this.dataController.loader.resources[`obstacle_${this.currentMap.map}`].texture);
            this.gameController.adjustSprite(bottomObstacleSprite);

            bottomObstacleSprite.y = topObstacleSprite.height + (this.currentMap.obstacle.gap * this.gameController.scaleFactor);

            obstacleContainer.addChild(topObstacleSprite);
            obstacleContainer.addChild(bottomObstacleSprite);

        }

    }

    resetMap(){

        this.obstacleCounter = 0;
        this.obstacleBehaviours = [];
        /* this.accumulatedDelta = 0; */

        this.scoringIndex = 0;
        this.collisionTestIndex = 0;

        let spawnPosition = this.screen.width;

        this.obstaclesContainer.children.forEach(obstacle => {

            this.placeObstacle(obstacle,spawnPosition);

            this.obstacleBehaviours.push(this.getBehavior(this.obstacleCounter + 1));

            spawnPosition += (this.currentMap.distance * this.gameController.scaleFactor);
            this.obstacleCounter++;

        })


    }

    getBehavior(counter){

        let currentBehaviour;

        this.behavioursData.forEach(behaviour => {
            
            if(counter >= behaviour.start)
                currentBehaviour = behaviour;

        });

        let behaviorData = Object.values(currentBehaviour);
        behaviorData.shift();

        if(currentBehaviour.action === "bob")
            behaviorData.push(Math.random());

        /* //For Scoring
        behaviorData.push(true); */

        return behaviorData;
    }

    placeObstacle(obstacle,posX){

        obstacle.x = posX;
        /* obstacle.y = (-(obstacle.height/2) + this.obstacleData.maxGapHeight) + ((this.screen.height - (this.obstacleData.minGapHeight + this.obstacleData.maxGapHeight)) * Math.random()); */

        const gap = this.obstacleData.gap * this.gameController.scaleFactor;
        const min =  this.obstacleData.minGapHeight * this.gameController.scaleFactor;
        const max =  this.obstacleData.maxGapHeight * this.gameController.scaleFactor;

        obstacle.y = (-(obstacle.height/2) + (gap/2) + max) + ((this.screen.height - min - max - gap) * Math.random());
    }

    changeMap(){
        //this.parallaxor.setupParallax(this.currentMap);
    }

    mapLoop(delta){

        this.gameController.accumulatedDelta += delta;
        this.scrollMap(delta);
        this.recycleObstacle();

    }

    animateObstacle(obstacle,behaviour,delta){

        switch(behaviour[0]){
            case "static":
                return;
            case "bob":
                const gap = this.obstacleData.gap * this.gameController.scaleFactor;
                const min =  this.obstacleData.minGapHeight * this.gameController.scaleFactor;
                const max =  this.obstacleData.maxGapHeight * this.gameController.scaleFactor;
                obstacle.y = (-(obstacle.height/2) + (gap/2) + max) + ((this.screen.height - min - max - gap) * ((Math.sin((this.gameController.accumulatedDelta / 1000 * behaviour[1]) + Math.PI * behaviour[2])+1)/2));
                break;
            case "crush":
                break;
            default:
                break;
        }

    }

    scrollMap(delta){

        this.parallaxor.parallaxLoop(delta);

        const obstacleContainers = this.obstaclesContainer.children;
        let id = 0;

        obstacleContainers.forEach(obstacle => {

            this.animateObstacle(obstacle,this.obstacleBehaviours[id]);
            obstacle.position.x -= this.scrollVelocity * delta * this.gameController.scaleFactor;

            /* this.collisionDetector(obstacle); */

            id++;

        });

    }

    recycleObstacle(){

        const obstacleContainers = this.obstaclesContainer.children;

        if((obstacleContainers[0].x + obstacleContainers[0].width) < 0){

            this.scoringIndex--;
            this.collisionTestIndex--;

            this.obstacleBehaviours.shift();
            const respawnObstacle = obstacleContainers.shift();
            const lastPosition = obstacleContainers[obstacleContainers.length-1].position.x;

            this.placeObstacle(respawnObstacle,lastPosition + (this.currentMap.distance * this.gameController.scaleFactor));

            obstacleContainers.push(respawnObstacle);

            this.obstacleBehaviours.push(this.getBehavior(this.obstacleCounter + 1));


            this.obstacleCounter++;

            /* console.log(this.obstacleBehaviours); */

        }

    }

    get focusedObstacle(){
        return this.obstaclesContainer.children[this.collisionTestIndex];
    }

}
