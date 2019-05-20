class Scene extends Phaser.Scene {
	constructor() {

		super({key:'Scene'});

		this.mutation = new Mutation(this);
		this.dirToggle = 0;
		this.blobNumber = 72;
		this.fruitSpawnQuantity = 10;
		this.maxFruitQuantity = 60; //max = 49 + fruitQuantity
		this.initialPos = [];
		this.xDir = new Array(this.blobNumber);
		this.yDir = new Array(this.blobNumber);
		this.fruits;
		this.blobs;
		this.splitSpawn = false;
		this.areBlobsHome = false;
		this.dayDuration = 5000;
		this.nightDuration = 2000;
		this.blobsToHomeDur = 500;
		this.dayTime = 'day';
		this.senseCircles = [];

		this.shuffleArr = (array) => {

  			let currentIndex = array.length, temporaryValue, randomIndex;

  			// While there remain elements to shuffle...
  			while (0 !== currentIndex) {

    			// Pick a remaining element...
    			randomIndex = Math.floor(Math.random() * currentIndex);
    			currentIndex -= 1;

    			// And swap it with the current element.
    			temporaryValue = array[currentIndex];
    			array[currentIndex] = array[randomIndex];
    			array[randomIndex] = temporaryValue;
  			}

  			return array;
		}

		this.getActiveBlobs = () => {
			this.add.displayList.list = this.add.displayList.list.filter(el => el.active === true);
			return this.add.displayList.list.filter(el => el.name === 'blob');
		}

		this.getActiveFruits = () => {
			this.add.displayList.list = this.add.displayList.list.filter(el => el.active === true);
			return this.add.displayList.list.filter(el => el.name === 'fruit');
		}

		this.newDirection = () => {
  			return Math.floor(-1 + Math.random()*3);
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
			setTimeout(() => {
				this.dayTime = 'night';
				this.blobBackHome();
				this.checkEmptyStomach();
				this.mutation.sendBlobs(this.getActiveBlobs());
					this.mutation.mutate()
				setTimeout(() => {
					this.dayTime = 'day';
					
					console.log('number of blobs: ', this.add.displayList)
					
					this.spawnFruits();
					this.resetBlobs();
					this.dayNightCycle();
				}, this.nightDuration)
			},this.dayDuration)
		}

		this.blobBackHome = () => {
			this.getActiveBlobs().forEach((blob, i) => {
				this.xDir[i] = this.initialPos[i].x;
				this.yDir[i] = this.initialPos[i].y;
			})
		}

		this.spawnFruits = () => {
			//  Create x sprites
			if(this.getActiveFruits().length < this.maxFruitQuantity){
    			let fruits = this.physics.add.group({ key: 'fruit', frameQuantity: this.fruitSpawnQuantity});
    			Phaser.Actions.Call(fruits.getChildren(), (fruit) => {
    				fruit.body.allowGravity = false;
				});
				this.fruits = fruits;
    			this.fruits.children.entries.map(v => v.name = 'fruit');

    			let {width, height} = this.sys.game.canvas
    			let rect = new Phaser.Geom.Rectangle(50, 50, width-100, height-100);

    			//  Randomly position the sprites within the rectangle
    			Phaser.Actions.RandomRectangle(this.fruits.getChildren(), rect);
    		}
		}

		this.resetBlobs = () => {
			let fruits = this.getActiveFruits();
    		this.getActiveBlobs().forEach((blob) => {
    			blob.hasEaten = false;
    			this.physics.add.overlap(blob, fruits, this.collectFruit, null, this);
    			if(blob.genes.includes('sense')){
    				this.physics.add.overlap(fruits, this.getBlobSenseCircle(blob), this.sensedTheFruit, null, this);
    			}
    		})
		}

		this.checkEmptyStomach = () => {
			this.getActiveBlobs().forEach((blob, i, a) => {
				if(blob.hasEaten === false){
					blob.disableBody(true, true);
					if(blob.genes.includes('sense')){
						this.getBlobSenseCircle(blob).destroy();
					}
				}
			})
		}

		this.collectFruit = (blob, fruit) => {
			if(this.dayTime === 'day'){
				blob.hasEaten = true;
				fruit.destroy();
			}
		}

		this.sensedTheFruit = (fruit, circle) => {
			if(this.dayTime === 'day'){
				console.log('SENSED FRUIT')
				let blob = this.getBlobFromCircle(circle)
				//console.log('blob from circle : ',blob)
				blob.x = fruit.x;
				blob.y = fruit.y;
			}
		}

		this.randomizeSpawn = () => {
			this.xDir = this.shuffleArr(this.initialPos.map(n => n.x))
			this.yDir = this.shuffleArr(this.initialPos.map(n => n.y))
		}

		this.reproduce = () => {
			this.getActiveBlobs().forEach((blob, i, a) => {
				this.spawnBlob(blob.x, blob.y);
			})
		}

		this.spawnBlob = (xPos, yPos) => {
			this.initialPos.push({x: xPos, y: yPos});
			let blob = this.physics.add.sprite(xPos, yPos, 'blob');
			blob.name = 'blob';
			blob.checkWorldBounds = true;
			blob.body.allowGravity = false;
			blob.hasEaten = false;
			blob.hasSensedFruit = false;
			blob.genes = [];
			blob.id = '_' + Math.random().toString(36).substr(2, 9);
			this.blobs = this.add.displayList.list.filter(el => el.name === 'blob');
		}

		this.getBlobSenseCircle = (blob) => {
			return this.add.displayList.list.filter(el => el.id === blob.id).filter(el => el.name === 'circle')[0];
		}

		this.getBlobFromCircle = (circle) => {
			return this.add.displayList.list.filter(el => el.id === circle.id).filter(el => el.name === 'blob')[0];
		}
	}

	preload() {
		this.load.image('blob', 'assets/blob.png');
		this.load.image('fruit', 'assets/fruit.png');
	}

	create() {

		let xPos = 100;
		let yPos = 20;

		//initialize fruit object
		this.fruits = this.physics.add.group({ key: 'fruit', frameQuantity: 0});

		this.getRandomDir(this.blobNumber);

		for(let u=0; u<this.blobNumber; u++){
			if(yPos === 20 && xPos < 700){
				this.spawnBlob(xPos, yPos);
				xPos+=30;
			}
			else if(xPos >= 700 && yPos <= 520){
				if(u === 21){
					yPos+=40;
					xPos+=80;
				}
				this.spawnBlob(xPos, yPos);
				yPos+=30;
			}
			else if(yPos <= 580 && xPos <= 780 && xPos > 100){
				if(u === 36){
					yPos+=40;
					xPos-=80;
				}
				this.spawnBlob(xPos, yPos);
				xPos-=30;
			}
			else if(yPos <= 580 && xPos <= 100){
				if(u === 57){
					yPos-=35;
					xPos-=80;
				}
				this.spawnBlob(xPos, yPos);
				yPos-=30;
			}
		}

    	this.dayNightCycle();
    	this.spawnFruits();
    	this.resetBlobs();
	}

	update(delta) {

		this.dirToggle++;
		
		if(this.dirToggle >= 60 && this.dayTime === 'day'){
			this.areBlobsHome = false;
			this.getRandomDir(this.blobNumber);
			this.dirToggle = 0;
		}

		let {width, height} = this.sys.game.canvas;

		this.getActiveBlobs().forEach((blob, i, a) => {
			if(this.dayTime === 'day'){

				blob.x += this.xDir[i];
				blob.y += this.yDir[i];

				if(blob.x < 50){
					blob.x += 1;	
				}
				if(blob.y < 50){
					blob.y += 1;	
				}
				if(blob.x > width-50){
					blob.x -= 1;	
				}
				if(blob.y > height-50){
					blob.y -= 1;	
				}	

			}else{
				
				if(this.areBlobsHome === false){
					this.areBlobsHome = true;
					this.randomizeSpawn();
					this.reproduce();	
				}

				if(this.areBlobsHome === true){
					this.physics.moveTo(blob, this.xDir[i], this.yDir[i], null, this.blobsToHomeDur);
				}
				
			}

			if(blob.genes.includes('sense')){
				let blobCircle = this.getBlobSenseCircle(blob);
				blobCircle.x = blob.x;
				blobCircle.y = blob.y;
			}	
		})
	}
}






