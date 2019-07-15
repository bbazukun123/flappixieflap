export function adjustSprite(sprite){
    console.log("Test SF: " +this.scaleFactor);
    sprite.width = sprite.width * this.scaleFactor;
    sprite.height = sprite.height * this.scaleFactor;
}