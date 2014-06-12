function Fact(label) {
	this.label = label;
	this.value = false;
}

Fact.prototype.isValid = function() {
	return (this.value == true);
};

function FactBase() {
	this.facts = [];
}

FactBase.prototype.addFact = function(label) {
	if(!this.hasFact(label)) {
		this.facts.push(new Fact(label));
	}
	return this.getFact(label);
};

FactBase.prototype.getFact = function(label) {
	for(var i=0; i < this.facts.length; ++i) {
		var fact = this.facts[i];
		if(fact.label == label) {
			return fact;
		}
	}
	return null;
};

FactBase.prototype.setFactValid = function(label, value) {
	var fact = this.getFact(label);
	if(fact) {
		fact.value = value;
	}
};

FactBase.prototype.isFactValid = function(label) {
	var fact = this.getFact(label);
	if(fact) {
		return fact.isValid();
	}
	return false;
};

FactBase.prototype.hasFact = function(label) {
	var fact = this.getFact(label);
	return (fact != null);
};

FactBase.prototype.resetValues = function() {
	for(var i=0; i < this.facts.length; ++i) {
		var fact = this.facts[i];
		fact.value = false;
	}
};

