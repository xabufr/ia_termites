function uniqid() {
    return "" + parseInt(Math.random() * 100) + "-" + parseInt(Math.random() * 10000) + "-" + parseInt(Math.random() * 100);
}
function Agent () {
	this.typeId = "agent";
	this.x = 0;
	this.y = 0;
	this.boundingRadius = 0;
	this.boundingWidth = 0;
	this.boundingHeight = 0;

	this.perceptionRadius = 0;
	this.collideTypes = [];
	this.contactTypes = [];
	
	this.dropped = null;	
	this.dead = false;

    this.id = uniqid();
}
Agent.prototype.init = function() {

};

Agent.prototype.update = function(dt) {

};

Agent.prototype.draw = function(context) {

};

Agent.prototype.processCollision = function(collidedAgent) {
	
};

Agent.prototype.processPerception = function(perceivedAgent) {
	
};

Agent.prototype.collides = function(agent) {
	return this.collideTypes.indexOf(agent.typeId) != -1;
};

Agent.prototype.contacts = function(agent) {
	return this.contactTypes.indexOf(agent.typeId) != -1;
};

Agent.prototype.drop = function(agent) {
	this.dropped = agent;
};

Agent.prototype.delete = function() {

};

Agent.prototype.moveTo = function(x, y) {
	this.previousX = this.x;
	this.previousY = this.y;

	this.x = x;
	this.y = y;
};

Agent.prototype.moveBy = function(direction, length) {
	if((direction.x != 0 || direction.y != 0) && length > 0) {
		var moveVect = new Vect(direction.x, direction.y);
		moveVect.normalize(length);
		var x = this.x + moveVect.x;
		var y = this.y + moveVect.y;
		this.moveTo(x, y);
	}
};
