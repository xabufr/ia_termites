WoodHeap.prototype = Agent.prototype;
WoodHeap.prototype.constructor = WoodHeap;

function WoodHeap(pixi_context) {
	Agent.call(this);
    this.graphics = new PIXI.Graphics();
    this.textCount = new PIXI.Text("0", {
        font: "bold 8px Arial"
    });
    this.textCount.anchor.x = 0.5;
    this.textCount.anchor.y = 0.5;
    pixi_context.getStage().addChild(this.graphics);
    pixi_context.getStage().addChild(this.textCount);

	this.typeId = "wood_heap";

	this.woodCount = Math.random() * 90 + 10;
	this.contactTypes = ["wood_heap", "wall"];

	this.identifier = Math.random() * 1000;

	this.updateRadius();
}

WoodHeap.prototype.init = function() {
    this.textCount.position.x = this.x;
    this.textCount.position.y = this.y;
    this.updateWoodCount();
};

WoodHeap.prototype.updateRadius = function() {
	this.boundingRadius = Math.sqrt(this.woodCount);
};

WoodHeap.prototype.update = function(dt) {
	this.updateRadius();
};

WoodHeap.prototype.addWood = function() {
	this.woodCount++;
    this.updateWoodCount();
};

WoodHeap.prototype.updateWoodCount = function() {
    this.textCount.setText(Math.round(this.woodCount) + "");
};

WoodHeap.prototype.takeWood = function() {
	this.woodCount--;
    this.updateWoodCount();
	if(this.woodCount <= 0) {
		this.dead = true;
	}
};

WoodHeap.prototype.draw = function(context) {
    this.graphics.clear();
    this.graphics.beginFill(0xffffff, 1);
    this.graphics.lineStyle(1, 0x111111, 1);
    this.graphics.drawCircle(0, 0, this.boundingRadius);
    this.graphics.endFill();
    this.graphics.position.x = this.x;
    this.graphics.position.y = this.y;
};

WoodHeap.prototype.delete = function() {
    pixi_context.getStage().removeChild(this.graphics);
};

WoodHeap.prototype.processCollision = function(collidedAgent) {
	if(collidedAgent && collidedAgent.typeId == "wood_heap") {
		if(this.woodCount > collidedAgent.woodCount) {
			collidedAgent.takeWood();
			this.addWood();
		}
	} else if(collidedAgent && collidedAgent.typeId == "wall") {
		this.takeWood();
	}
};