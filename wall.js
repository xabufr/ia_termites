Wall.prototype = new Agent();
Wall.prototype.constructor = Wall;

function Wall(pixi_context) {
	Agent.call(this);

    this.graphics = new PIXI.Graphics();
    pixi_context.getStage().addChild(this.graphics);

	this.typeId = "wall";
	if(Math.random() < 0.5) {
		this.boundingWidth = 100 + Math.random() * 400;
		this.boundingHeight = 20;
	} else {
		this.boundingHeight = 100 + Math.random() * 400;
		this.boundingWidth = 20;		
	}
}

Wall.prototype.init = function() {
    this.graphics.beginFill(0xFF7777, 1);
    this.graphics.lineStyle(1, 0xff0000, 1);
    this.graphics.drawRect(this.x - this.boundingWidth * 0.5, this.y - this.boundingHeight * 0.5, this.boundingWidth, this.boundingHeight);
    this.graphics.endFill();
};
Wall.prototype.draw = function(context) {
};