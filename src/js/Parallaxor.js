import * as PIXI from 'pixi.js'

/* For setting up and animating the parallax backgrounds and foregrounds */
export default class Parallaxor{

    constructor(gameController){

        //Back-references
        this.gameController = gameController;
        this.dataController = gameController.dataController;  
        this.app = gameController.app;

        //Utility variables
        this.tiles = [];
        this.spawns = [];

    }

    //Generate parallax backgrounds according to the supplied map
    setupParallax({map,scenery,scrollVelocity}){

        this.scrollVelocity = scrollVelocity;

        //Setups separate backgrounds and foregrounds containers
        this.backgroundsContainer = new PIXI.Container();
        this.foregroundsContainer = new PIXI.Container();
        this.gameController.sceneContainers["Game"].addChild(this.backgroundsContainer);
        this.gameController.sceneContainers["Game"].addChild(this.foregroundsContainer);

        //Set the containers' layer order accordingly
        this.backgroundsContainer.parent.setChildIndex(this.backgroundsContainer, 0);
        this.foregroundsContainer.parent.setChildIndex(this.backgroundsContainer, this.foregroundsContainer.parent.numChildren - 1);

        const mapTextures = this.dataController.loader.resources[`map_${map}`].textures;

        //Loops through each individual background element to generate and lay it out accordingly
        scenery.forEach(element => {

            const texture = mapTextures[element.texture];
            
            //For single decoration objects -> uses sprites pooling 
            if(element.type === "spawn"){

                const spawnContainer = new PIXI.Container();
                this.backgroundsContainer.addChild(spawnContainer);

                let spawnPosition = Math.round(Math.random() * this.app.renderer.screen.width);

                for(let i = 0; i < Math.ceil(this.app.renderer.screen.width / element.spawnGap) + 1; i++){

                    const spawnSprite = new PIXI.Sprite(texture);
                    this.gameController.adjustSprite(spawnSprite);
                    this.setPosition(spawnSprite,element.position,element.offset);
                    spawnSprite.position.x = spawnPosition;
                    spawnContainer.addChild(spawnSprite);

                    spawnPosition += element.spawnGap;

                }

                this.spawns.push({
                    container: spawnContainer,
                    texture: texture,
                    distance: element.distance,
                    position: element.position,
                    offset: element.offset,
                    spawnGap: element.spawnGap
                });

                return;

            }

            //Else, uses tiling sprites

            const elementSprite = new PIXI.TilingSprite(texture,texture.width,texture.height);

            if(element.position === "fill"){
                elementSprite.scale.set(this.app.renderer.screen.height/elementSprite.height);
            }else{
                //-0.01 is a very hacky fix to remove the overflowed dark line across a tiling sprite *NTF: urgent need for fixing
                elementSprite.scale.set(this.gameController.scaleFactor - 0.01);
                this.setPosition(elementSprite,element.position,element.offset);
            }

            if(element.layer === "background"){

                this.tiles.push({
                    sprite: elementSprite,
                    distance: element.distance
                });

                this.backgroundsContainer.addChild(elementSprite);

            }else if(element.layer === "foreground"){

                this.tiles.push({
                    sprite: elementSprite,
                    distance: element.distance
                });
    
                this.foregroundsContainer.addChild(elementSprite);

            }
            
        });

    }

    //Set Y-position of the inputted element
    setPosition(sprite,position,offset){

        if(position === "top"){
            sprite.position.y = offset * this.gameController.scaleFactor;
            return;
        }

        sprite.anchor.y = 1;
        sprite.position.y = (this.app.renderer.screen.height - (offset * this.gameController.scaleFactor));

    }

    //Animation Loop
    parallaxLoop(delta){

        const multiplier = this.gameController.mapController.velocityMultiplier;

        //Scrolls individual tiling sprite background element infinitely
        this.tiles.forEach(tile => {
            tile.sprite.tilePosition.x -= this.scrollVelocity * (this.gameController.scaleFactor/tile.distance) * delta * multiplier;
        });

        //Moves and pools individual decoration sprite along the X-axis
        this.spawns.forEach(spawn => {

            const spawnSprites = spawn.container.children;

            //Moves
            spawnSprites.forEach(sprite => {
                sprite.position.x -= (this.scrollVelocity * this.gameController.scaleFactor) * ( this.gameController.scaleFactor/spawn.distance) * delta * multiplier;
            });

            //Pools if completely out of the stage
            if((spawnSprites[0].position.x + spawnSprites[0].width) < 0){

                const respawnSprite = spawnSprites.shift();
                respawnSprite.position.x = spawnSprites[spawnSprites.length-1].position.x + (spawn.spawnGap * this.gameController.scaleFactor);
                spawnSprites.push(respawnSprite);

            }

        });

    }

}
