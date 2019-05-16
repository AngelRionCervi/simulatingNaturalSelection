class Scene extends Phaser.Scene {
	constructor() {
		super({key:'Scene'});
		this.dirToggle = 0;
		this.blobNumber = 72;
		this.xDir = [];
		this.yDir = [];
		this.fruits;

		this.newDirection = () => {
  			return Math.floor(-1 + Math.random()*3)
		}

		this.checkOverlap = (spriteA, spriteB) => {

		    let boundsA = spriteA.getBounds();
		    let boundsB = spriteB.getBounds();

    		return Phaser.Geom.Rectangle.Intersection(boundsA, boundsB);
		}

		this.getRandomDir = (length) => {
			this.xDir = [];
			this.yDir = [];
			for(let x=0; x<length; x++){
				this.xDir.push(this.newDirection())
				this.yDir.push(this.newDirection())
			}
		}
	}

	preload() {
		this.load.image('blob', 'assets/blob.png');
		this.load.image('fruit', 'assets/fruit.png');
	}

	create() {

		let circRadius = 100;
		let xPos = 100;
		let yPos = 20;
		let sprites = [];

		//  Create 25 sprites (they all start life at 0x0)
    	let fruits = this.physics.add.group({ key: 'fruit', frameQuantity: 25});
    	Phaser.Actions.Call(fruits.getChildren(), (fruit) => {
    		fruit.body.allowGravity = false;﻿﻿
		});﻿

    	this.fruits = fruits;
    	this.fruits.children.entries.map(v => v.name = 'fruit');

		this.getRandomDir(this.blobNumber);
		//this.physics.world.setBoundsCollision(true, true, true, true);

		let setSprites = (xPos, yPos) => {
			let sprite = this.physics.add.sprite(xPos, yPos, 'blob');
			sprite.name = 'blob'
			sprite.checkWorldBounds = true;
			sprite.body.allowGravity = false;﻿
			this.physics.add.overlap(sprite, fruits, collectFruit, null, this);
		}

		for(let x=0; x<this.blobNumber; x++){
			if(yPos === 20 && xPos < 700){
				setSprites(xPos, yPos)
				xPos+=30;
			}
			else if(xPos >= 700 && yPos <= 520){
				if(x === 21){
					yPos+=40;
					xPos+=80;
				}
				setSprites(xPos, yPos)
				yPos+=30;
			}
			else if(yPos <= 580 && xPos <= 780 && xPos > 100){
				if(x === 36){
					yPos+=40;
					xPos-=80;
				}
				setSprites(xPos, yPos)
				xPos-=30;
			}

			else if(yPos <= 580 && xPos <= 100){
				if(x === 57){
					yPos-=35;
					xPos-=80;
				}
				setSprites(xPos, yPos)
				yPos-=30;
			}

		}

		
		
		let {width, height} = this.sys.game.canvas

    	let rect = new Phaser.Geom.Rectangle(50, 50, width-100, height-100);

    	//  Randomly position the sprites within the rectangle
    	Phaser.Actions.RandomRectangle(this.fruits.getChildren(), rect);
    	console.log(this.add.displayList.list)
		
	}

	update(delta) {

		let blobs = this.add.displayList.list.filter(el => el.name === 'blob');
		let fruits = this.add.displayList.list.filter(el => el.name === 'fruit');
		//console.log(fruits)

		this.dirToggle++;
		
		if(this.dirToggle === 60){
			this.getRandomDir(this.blobNumber);
			this.dirToggle = 0;
		}

		let {width, height} = this.sys.game.canvas

		blobs.forEach((v, i, a)=>{
			v.x += this.xDir[i];
			v.y += this.yDir[i];
			if(v.x < 50){
				v.x += 1;	
			}
			if(v.y < 50){
				v.y += 1;	
			}
			if(v.x > width-50){
				v.x -= 1;	
			}
			if(v.y > height-50){
				v.y -= 1;	
			}
		
		})
	}
}
function collectFruit(blob, fruit){
	console.log('one fruit has been collected')
	fruit.disableBody(true, true)
}