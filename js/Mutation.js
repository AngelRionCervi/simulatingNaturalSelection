class Mutation extends Phaser.Scene {
	constructor(Scene) {

		super({key:'Mutation'});
		this.Scene = Scene;
		this.mutationChanceNbr = 1; //0-1
		this.blobs;
		this.possibleGenes = ['sense'];

		this.mutationChance = () =>{
			return Math.floor(Math.random() * (this.mutationChanceNbr+1));
		}

		this.getActiveSenseCircles = () => {
			this.Scene.add.displayList.list = this.Scene.add.displayList.list.filter(el => el.active === true);
			return this.Scene.add.displayList.list.filter(el => el.name === 'circle');
		}
	}

	sendBlobs(blobs) {
		this.blobs = blobs
	}

	mutate() {
		this.blobs.forEach((blob, i, a) => {
			//if(this.mutationChance() === 1){
				this.inspectGenes(blob);
			//}
		})
	}

	inspectGenes(blob) {
		if(blob.genes.length === 0){
			this.insertNewGene(blob);
		}
	}

	insertNewGene(blob) {
		let newGene = this.possibleGenes[Math.floor(Math.random()*this.possibleGenes.length)];
		if(newGene === 'sense'){
			this.createSenseGene(blob, newGene);
		}
	}

	createSenseGene(blob, newGene) {
		let graphics = this.Scene.add.graphics({ lineStyle: { width: 1, color: 0x00ff00 }});
    	let circle = new Phaser.Geom.Circle(0, 0, 50);
    	graphics.strokeCircleShape(circle);
    	graphics.id = blob.id;
    	graphics.name = 'circle';
    	this.Scene.physics.world.enable(graphics);
    	graphics.body.setAllowGravity(false);
    	blob.genes.push(newGene);
	}
}