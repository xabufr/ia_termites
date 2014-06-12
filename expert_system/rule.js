function Rule(goal, premises) {
	this.goal = goal;
	this.premises = premises;
}

Rule.prototype.isValid = function() {
	for(var i=0;i<this.premises.length;++i) {
		var premise = this.premises[i];
		if(!premise.isValid()) {
			return false;
		}
	}
	return true;
};

function RuleBase() {
	this.rules = [];
}

RuleBase.prototype.addRule = function(rule) {
	this.rules.push(rule);
};

RuleBase.prototype.primaryGoals = function() {
	var primaryGoals = [];
	for(var i=0; i<this.rules.length; ++i) {
		var rule = this.rules[i];
		if(!this.isPremise(rule.goal.label)) {
			primaryGoals.push(rule.goal.label);
		}
	}
	return primaryGoals;
};

RuleBase.prototype.initialPremises = function(goalLabel, result) {
	if(result == undefined) result = [];

	for(var i=0;i<result.length;++i) {
		if(result[i] == goalLabel) {
			return;
		}
	}

	var rules = this.rulesWithGoal(goalLabel);
	if(rules.length == 0) {
		result.push(goalLabel);
	} else {
		for(var i=0;i<rules.length;++i) {
			var rule = rules[i];
			for(var premise_index=0; premise_index<rule.premises.length;++premise_index) {
				var premise = rule.premises[premise_index];
				this.initialPremises(premise.label, result);
			}
		}
	}

	return result;
};

RuleBase.prototype.isPremise = function(label) {
	for(var i=0; i < this.rules.length; ++i) {
		var rule = this.rules[i];
		for(var j=0;j < rule.premises.length;++j) {
			var premise = rule.premises[j];
			if(premise.label == label) {
				return true;
			}
		}
	}
	return false;
};

RuleBase.prototype.rulesWithGoal = function(label) {
	var result = [];
	for(var i=0; i < this.rules.length; ++i) {
		var rule = this.rules[i];
		if(rule.goal.label == label) {
			result.push(rule);
		}
	}
	return result;
};

