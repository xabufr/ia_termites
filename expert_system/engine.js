function InferenceEngine() {

}

InferenceEngine.prototype.inferForward = function(factBase, ruleBase) {
	var inferredFacts = [];
	var finished = false;
	while(!finished) {
		finished = true;
		for(var i=0;i< ruleBase.rules.length; ++i) {
			var rule = ruleBase.rules[i];
			if(!rule.goal.isValid() && rule.isValid()) {
				rule.goal.value = true;
				inferredFacts.push(rule.goal.label);

				finished = false;
			}
		}
	}

	return inferredFacts;
};

InferenceEngine.prototype.inferBackward = function(factBase, ruleBase) {
	var primaryGoals = ruleBase.primaryGoals();
	for(var i=0;i < primaryGoals.length;++i) {
		var goalLabel = primaryGoals[i];
		var initialPremises = ruleBase.initialPremises(goalLabel);
		for(var premiseIndex=0;premiseIndex < initialPremises.length; ++premiseIndex) {
			var premiseLabel = initialPremises[premiseIndex];
			if(!factBase.isFactValid(premiseLabel)) {
				return premiseLabel;
			}
		}
	}
	return null;
};
