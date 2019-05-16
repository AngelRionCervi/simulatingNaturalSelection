class Scene extends Phaser.Scene {
	constructor() {
		super({key:'Scene'});
		this.dirToggle = 0;
		this.blobNumber = 72;
		this.fruitQuantity = 10;
		this.initialPos = [];
		this.xDir = new Array(this.blobNumber);
		this.yDir = new Array(this.blobNumber);
		this.fruits;
		this.blobs;
		this.dayDuration = 5000;
		this.nightDuration = 2000;
		this.dayTime = 'day';

		this.newDirection = () => {
  			return Math.floor(-1 + Math.random()*3)
		}

		this.getRandomDir = (length) => {
			this.xDir = [];
			this.yDir = [];
			for(let x=0; x<length; x++){
				this.xDir[x] = this.newDirection();
				this.yDir[x] = this.newDirection();
			}
		}

		this.dayNightCycle = () => {
			setTimeout(()=>{
				console.log('night time');
				this.dayTime = 'night';
				this.blobBackHome();
				setTimeout(()=>{
					this.dayTime = 'day';
					this.spawnFruits();
					this.dayNightCycle();
				}, this.nightDuration)
			},this.dayDuration)
		}

		this.blobBackHome = () => {
			//console.log(this.initialPos, this.blobs);
			this.blobs.forEach((blob, i)=>{
				this.xDir[i] = this.initialPos[i].x;
				this.yDir[i] = this.initialPos[i].y;
			})
		}

		this.spawnFruits = () => {
			//  Create x sprites
    		let fruits = this.physics.add.group({ key: 'fruit', frameQuantity: this.fruitQuantity});
    		Phaser.Actions.Call(fruits.getChildren(), (fruit) => {
    			fruit.body.allowGravity = false;
			});
			this.fruits = fruits;
    		this.fruits.children.entries.map(v => v.name = 'fruit');

    		let {width, height} = this.sys.game.canvas
    		let rect = new Phaser.Geom.Rectangle(50, 50, width-100, height-100);

    		//  Randomly position the sprites within the rectangle
    		Phaser.Actions.RandomRectangle(this.fruits.getChildren(), rect);

    		//need to allow blobs to eat fruits at every spawn...
    		this.blobs.forEach((blob)=>{
				blob.hasEaten = false;
			})
    		this.blobs.forEach((blob)=>{
    			this.physics.add.overlap(blob, this.fruits, collectFruit, null, this);
    		})
    		
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

		this.getRandomDir(this.blobNumber);
		//this.physics.world.setBoundsCollision(true, true, true, true);

		let setSprites = (xPos, yPos) => {
			this.initialPos.push({x: xPos, y: yPos});
			let blobs = this.physics.add.sprite(xPos, yPos, 'blob');
			blobs.name = 'blob';
			blobs.checkWorldBounds = true;
			blobs.body.allowGravity = false;
			blobs.hasEaten = false;
			this.blobs = this.add.displayList.list.filter(el => el.name === 'blob');
		}

		for(let u=0; u<this.blobNumber; u++){
			if(yPos === 20 && xPos < 700){
				setSprites(xPos, yPos);
				xPos+=30;
			}
			else if(xPos >= 700 && yPos <= 520){
				if(u === 21){
					yPos+=40;
					xPos+=80;
				}
				setSprites(xPos, yPos);
				yPos+=30;
			}
			else if(yPos <= 580 && xPos <= 780 && xPos > 100){
				if(u === 36){
					yPos+=40;
					xPos-=80;
				}
				setSprites(xPos, yPos);
				xPos-=30;
			}

			else if(yPos <= 580 && xPos <= 100){
				if(u === 57){
					yPos-=35;
					xPos-=80;
				}
				setSprites(xPos, yPos);
				yPos-=30;
			}
		}

    	this.dayNightCycle()
    	this.spawnFruits();
		
	}

	update(delta) {

		let blobs = this.add.displayList.list.filter(el => el.name === 'blob');
		let fruits = this.add.displayList.list.filter(el => el.name === 'fruit');

		this.dirToggle++;
		
		if(this.dirToggle >= 60 && this.dayTime === 'day'){
			this.getRandomDir(this.blobNumber);
			this.dirToggle = 0;
		}

		let {width, height} = this.sys.game.canvas

		
			blobs.forEach((v, i, a)=>{
				if(this.dayTime === 'day'){
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
				}else{
					if(v.x !== this.xDir[i] && v.y !== this.yDir[i]){
						this.physics.moveTo(v, this.xDir[i], this.yDir[i], null, 400);
					}else{
						checkEmptyStomach(a);
					}
				}
			})
		

	}
}

function collectFruit(blob, fruit){
	blob.hasEaten = true;
	fruit.disableBody(true, true);
}

function checkEmptyStomach(blobs){
	console.log(blobs.filter(el => el.active==true))
	blobs.forEach((v, i, a)=>{
		if(v.hasEaten === false){
			v.disableBody(true, true);
		}
	})
}



