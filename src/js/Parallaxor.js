import * as PIXI from 'pixi.js'

export default class Parallaxor{

    constructor(gameController){

        this.gameController = gameController;
        this.dataController = gameController.dataController;  
        this.app = gameController.app;

        this.tiles = [];
        this.spawns = [];

    }

    setupParallax({map,scenery,scrollVelocity}){

        this.scrollVelocity = scrollVelocity;

        this.backgroundsContainer = new PIXI.Container();
        this.foregroundsContainer = new PIXI.Container();
        this.gameController.sceneContainers["Game"].addChild(this.backgroundsContainer);
        this.gameController.sceneContainers["Game"].addChild(this.foregroundsContainer);
        this.backgroundsContainer.parent.setChildIndex(this.backgroundsContainer, 0);
        this.foregroundsContainer.parent.setChildIndex(this.backgroundsContainer, this.foregroundsContainer.parent.numChildren - 1);

        const mapTextures = this.dataController.loader.resources[`map_${map}`].textures;

        scenery.forEach(element => {

            const texture = mapTextures[element.texture];
            
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

            const elementSprite = new PIXI.TilingSprite(texture,texture.width,texture.height);

            if(element.position === "fill"){
                elementSprite.scale.set(this.app.renderer.screen.height/elementSprite.height);
            }else{
                /*FIX PLEASE!!!!*/
                elementSprite.scale.set(this.gameController.scaleFactor);
                this.setPosition(elementSprite,element.position,element.offset);     
            }

            /* elementSprite.cacheAsBitmap = true; */
            /* elementSprite.clampMargin = -0.5;  */

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

    setPosition(sprite,position,offset){

        if(position === "top"){
            sprite.position.y = offset * this.gameController.scaleFactor;
            return;
        }

        sprite.anchor.y = 1;
        sprite.position.y = (this.app.renderer.screen.height - (offset * this.gameController.scaleFactor));

    }

    parallaxLoop(delta){

        this.tiles.forEach(tile => {
            tile.sprite.tilePosition.x -= this.scrollVelocity * (this.gameController.scaleFactor/tile.distance) * delta;
        });

        this.spawns.forEach(spawn => {

            const spawnSprites = spawn.container.children;

            spawnSprites.forEach(sprite => {
                sprite.position.x -= this.scrollVelocity * ( this.gameController.scaleFactor/spawn.distance) * delta;
            });

            if((spawnSprites[0].position.x + spawnSprites[0].width) < 0){

                const respawnSprite = spawnSprites.shift();

                respawnSprite.position.x = spawnSprites[spawnSprites.length-1].position.x + (spawn.spawnGap * this.gameController.scaleFactor);

                spawnSprites.push(respawnSprite);

            }

        });


    }

}
