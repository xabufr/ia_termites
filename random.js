function getRandomWeightedValue(values) {
    function makeRange(value, begin, size) {
        return {
            value: value,
            begin: begin,
            end: begin + size,
            contains: function(p_value) {
                return p_value >= this.begin && p_value <= this.end;
            }
        };
    }

    var count = 0;
    var totalValue = 0;
    for(var index in values) {
        ++count;
        totalValue += values[index];
    }

    var ranges = [];
    var lastEnd = 0;
    for(var index in values) {
        var range = makeRange(index, lastEnd, values[index] / totalValue);
        ranges.push(range);
        lastEnd = range.end;
    }
    var value = Math.random();

    for(var i=0;i<ranges.length;++i) {
        if(ranges[i].contains(value)) {
            return ranges[i].value;
        }
    }
    return null;
}

