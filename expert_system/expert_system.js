function ExpertSystem() {
	this.factBase = new FactBase();
	this.ruleBase = new RuleBase();
	this.engine = new InferenceEngine();
}

ExpertSystem.prototype.addFact = function(label) {
	this.factBase.addFact(label);
};

ExpertSystem.prototype.setFactValid = function(label, value) {
	this.factBase.setFactValid(label, value);
};

ExpertSystem.prototype.addRule = function(conclusionLabel, premiseLabels) {
	var conclusion = this.factBase.addFact(conclusionLabel);
	
	var premises = [];
	for(var i = 0; i < premiseLabels.length; ++i) {
		var premise = this.factBase.addFact(premiseLabels[i]);
		premises.push(premise);
	}

	this.ruleBase.addRule(new Rule(conclusion, premises));
};

ExpertSystem.prototype.resetFactValues = function() {
	this.factBase.resetValues();
};

ExpertSystem.prototype.inferForward = function() {
	return this.engine.inferForward(this.factBase, this.ruleBase);
};

ExpertSystem.prototype.inferBackward = function() {
	return this.engine.inferBackward(this.factBase, this.ruleBase);
};
