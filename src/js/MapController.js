import * as PIXI from 'pixi.js'
import Parallaxor from "./Parallaxor"

/* For updating and controlling maps of obstacles and parallax backgrounds */
export default class MapController{

    constructor(gameController){

        //Back-references
        this.gameController = gameController;
        this.dataController = gameController.dataController;
        this.app = gameController.app;
        this.screen = this.app.renderer.screen;

        //Creates a parallaxor to control the parallax backgrounds
        this.parallaxor = new Parallaxor(gameController);

        //Gets map data - Currently statically retrieving the only map available on the game script data
        this.currentMap = this.dataController.gameContent.maps[0];
        this.obstacleData = this.currentMap.obstacle;
        this.behavioursData = this.obstacleData.behaviours;

        //Utility variables
        this.obstacleBehaviours = [];
        this.obstacleCounter = 0;
        this.scoringIndex = 0;
        this.collisionTestIndex = 0;
        
        //Setup map once resources loading completes
        this.dataController.loader.load(this.setupMaps.bind(this));

    }

    setupMaps(){

        //Retrieves base map scrolling speed
        this.scrollVelocity = this.currentMap.scrollVelocity;

        //Creates a container to hold all sets of obstacles
        this.obstaclesContainer = new PIXI.Container();
        this.gameController.sceneContainers["Game"].addChild(this.obstaclesContainer);

        //Generates a minimum pool of obstacles and position them in places
        this.createObstableSprites();
        this.resetMap();

        //Setup parallax backgrounds
        this.parallaxor.setupParallax(this.currentMap);

    }

    //Generates individual sets of obstacles
    createObstableSprites(){

        for(let i = 0; i < Math.ceil(this.app.renderer.screen.width / this.currentMap.distance) + 1; i++){

            //Creates individual container for each set of obstacles
            const obstacleContainer = new PIXI.Container();
            this.obstaclesContainer.addChild(obstacleContainer);

            //Generates and positions individual poles within their set's container
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

        //Resets map controller stats and trackers
        this.obstacleCounter = 0;
        this.obstacleBehaviours = [];
        this.scoringIndex = 0;
        this.collisionTestIndex = 0;
        let spawnPosition = this.screen.width;

        //Positions individual sets of obstacles according to the defined map data, ready to be animated and looped
        this.obstaclesContainer.children.forEach(obstacle => {

            this.placeObstacle(obstacle,spawnPosition);
            this.obstacleBehaviours.push(this.getBehavior(this.obstacleCounter + 1));
            spawnPosition += (this.currentMap.distance * this.gameController.scaleFactor);
            this.obstacleCounter++;

        })

    }

    //Retrieves targeted obstacle set's behavior
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

        return behaviorData;

    }

    //Places an obstacle set at the inputted X-position and random Y-position within the defined boundary
    placeObstacle(obstacle,posX){

        obstacle.x = posX;

        const gap = this.obstacleData.gap * this.gameController.scaleFactor;
        const min =  this.obstacleData.minGapHeight * this.gameController.scaleFactor;
        const max =  this.obstacleData.maxGapHeight * this.gameController.scaleFactor;

        obstacle.y = (-(obstacle.height/2) + (gap/2) + max) + ((this.screen.height - min - max - gap) * Math.random());

    }

    //Placeholder for the future multiple-maps feature
    changeMap(){
        //this.parallaxor.setupParallax(this.currentMap);
    }

    //Returns the focused obstacle set (closest and yet passed)
    get focusedObstacle(){
        return this.obstaclesContainer.children[this.collisionTestIndex];
    }

    //Animate individual sets of obstacles based on their behavior
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
                //WIP
                break;

            default:
                break;

        }

    }

    //Move the map along the X-axis
    scrollMap(delta){

        this.parallaxor.parallaxLoop(delta);

        const obstacleContainers = this.obstaclesContainer.children;
        let id = 0;

        obstacleContainers.forEach(obstacle => {

            this.animateObstacle(obstacle,this.obstacleBehaviours[id]);
            obstacle.position.x -= this.scrollVelocity * delta * this.gameController.scaleFactor;

            id++;

        });

    }

    //Loops the obstacles pool
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

        }

    }

    //Animation Loop
    mapLoop(delta){

        this.gameController.accumulatedDelta += delta;
        this.scrollMap(delta);
        this.recycleObstacle();

    }

}