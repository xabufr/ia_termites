Termite.prototype = new Agent();
Termite.prototype.constructor = Termite;

function Termite(world_width, world_height) {
    Agent.call(this);
    this.typeId = "termite";
    this.boundingRadius = 3;
    this.perceptionRadius = 50;

    this.hasWood = false;

    this.collideTypes = ["wood_heap", "wall"];
    this.contactTypes = ["wood_heap", "wall"];

    this.heapInfos = {
        data: [],
        getContainer: function (id) {
            for (var i in this.data) {
                var obj = data[i];
                if (obj.key === id) {
                    return obj.value;
                }
            }
            return null;
        },
        get: function (id) {
            var obj = this.getContainer(id);
            if (obj !== null) {
                return obj.value;
            }
            return null;
        },
        set: function (id, value) {
            var obj = this.getContainer(id);
            if (obj === null) {
                obj = {
                    key: id,
                    value: value
                };
                this.data.push(obj);
            } else {
                obj.value = value;
            }
        },
        keys: function () {
            var keys = new Array(this.data.length);
            for (var i in this.data) {
                keys[i] = this.data[i].key;
            }
            return keys;
        },
        forEach: function (callback, that) {
            for (var i in this.data) {
                var obj = this.data[i];
                callback.call(that, obj.key, obj.value);
            }
        }
    };
    this.walls = {};
    this.speed = 50 * 3;
    this.updateRandomDirection();

    this.nid = null;

    this.astar_grid = calculateAStarGrid([], this.worldWidth, this.worldHeight);
    this.worldWidth = world_width;
    this.worldHeight = world_height;

    this.drawAStar = false;

    this.gotoData = null;
}

Termite.prototype.updateRandomDirection = function () {
    this.direction = new Vect(Math.random() * 2 - 1, Math.random() * 2 - 1);
    this.direction.normalize(1);
};
Termite.prototype.setTarget = function (x, y) {
    this.direction = new Vect(x - this.x, y - this.y);
    this.direction.normalize(1);
};

Termite.prototype.update = function (dt) {
    if (this.gotoData != null) {
        if (this.gotoData.nextPoint === null) {
            this.findNextGotoPoint();
        }
        this.moveToNext(dt);
    }
};

Termite.prototype.findNextGotoPoint = function () {
    var index = ++this.gotoData.pathIndex;
    if (index >= this.gotoData.path.length - 1) {
        this.gotoData.nextPoint = this.gotoData.destination;
    } else {
        var node = this.gotoData.path[index];
        var point = this.gotoData.nextPoint = {
            x: node.node.x + node.node.width * 0.5,
            y: node.node.y + node.node.height * 0.5
        };
        var nextNode = this.gotoData.path[index + 1];
        var rel = {
            x: nextNode.x - node.x,
            y: nextNode.y - node.y
        };
        //point.x += rel.x * 0.5 * node.node.width;
        //point.y += rel.y * 0.5 * node.node.height;
    }
};
function square(a) {
    return a * a;
}
Termite.prototype.moveToNext = function (dt) {
    var distance = dt * this.speed * 0.001;
    var dest = this.gotoData.nextPoint;
    var distanceToFinalSquare = square(this.x - dest.x) + square(this.y - dest.y);
    var finished = false;
    if (distanceToFinalSquare < square(distance)) {
        distance = Math.sqrt(distanceToFinalSquare);
        if (this.gotoData.nextPoint === this.gotoData.destination) {
            finished = true;
        } else {
            this.gotoData.nextPoint = null;
        }
    }
    var direction = {
        x: this.gotoData.nextPoint.x - this.x,
        y: this.gotoData.nextPoint.y - this.y
    };

    this.moveBy(direction, distance);

    if (finished) {
        if (this.gotoData.callback !== null) {
            this.gotoData.callback.call(this);
        }
        this.gotoData = null;
    }
};

Termite.prototype.draw = function (context) {
    context.fillStyle = this.hasWood ? "#f00" : "#000";
    context.strokeStyle = "#000";
    context.beginPath();
    context.arc(this.x, this.y, this.boundingRadius, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
    if (this.drawAStar) {
        for (var i in this.astar_grid) {
            var row = this.astar_grid[i];
            for (var j in row) {
                var rect = row[j];
                context.beginPath();
                context.fillStyle = "rgba(255, 0, 0, 0.15)";
                context.rect(rect.x, rect.y, rect.width, rect.height);
                if (rect.full) {
                    context.fill();
                }
                context.stroke();
                context.fillStyle = "blue";
                context.fillText(i + " " + j, rect.x + 0.5 * rect.width, rect.y + 0.5 * rect.height);
            }
        }
        if (this.gotoData !== null) {
            var paths = this.gotoData.path;
            for (var i in paths) {
                var path = paths[i];
                var rect = path.node;
                context.beginPath();
                context.fillStyle = "rgba(0, 255, 0, 0.15)";
                context.rect(rect.x, rect.y, rect.width, rect.height);
                context.fill();
                context.beginPath();
            }
        }
    }
};

Termite.prototype.goto = function (x, y, callback) {
    var gridStart = worldToGrid(this.x, this.y, this.astar_grid);
    var gridGoal = worldToGrid(x, y, this.astar_grid);
    var astarPath = findPath(gridStart, gridGoal, this.astar_grid, this.boundingRadius);

    this.gotoData = {
        path: astarPath,
        nextPoint: null,
        pathIndex: 0,
        destination: {
            x: x,
            y: y
        },
        callback: callback
    };
};

Termite.prototype.processCollision = function (collidedAgent) {
    if (collidedAgent == null) {
    } else if (collidedAgent.typeId == "wood_heap") {
        if (this.hasWood) {
            collidedAgent.addWood();
            this.hasWood = false;
        } else {
            collidedAgent.takeWood();
            this.hasWood = true;
        }
        //this.changeDirection();
    } else if (collidedAgent.typeId == "wall") {
        this.processWallPerception(collidedAgent);
    }
};

function worldToGrid(x, y, grid) {
    for (var i = 0; i < grid.length; ++i) {
        for (var j = 0; j < grid[i].length; ++j) {
            if (isPointInRect(x, y, grid[i][j])) {
                return {
                    x: i,
                    y: j
                }
            }
        }
    }
    return {x: 0, y: 0};
}

function negociateNid(perceivedAgent) {
    function setTermiteNid(otherNid) {
        this.nid.id = otherNid.id;
        this.nid.termites = [this.id];
        this.nid.position.x = otherNid.position.x;
        this.nid.position.y = otherNid.position.y;
        for (var idx in otherNid.termites) {
            this.nid.termites.push(otherNid.termites[idx]);
        }
    }

    var otherNid = perceivedAgent.nid;
    if (otherNid !== null && this.nid === null) {
        this.nid = {};
        setTermiteNid.call(this, otherNid);
        return;
    }
    else if (otherNid === null || this.nid === null) {
        return;
    }


    if (otherNid.id != this.nid.id) {
        if (otherNid.termites.length >= this.nid.length) {
            setTermiteNid.call(this, otherNid);
        }
    } else {
        var otherTermites = perceivedAgent.nid.termites;
        for (var idx in  otherTermites) {
            var t_id = otherTermites[idx];
            if (this.nid.termites.indexOf(t_id) !== -1) {
                this.nid.termites.push(t_id);
            }
        }
    }
}
function getWallFromOther(other) {
    for (var wallId in other.walls) {
        if (!(wallId in this.walls)) {
            this.addWall(other.walls[wallId]);
        }
    }
}

function isPointInRect(x, y, rect) {
    if (x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height) {
        return true;
    }
}
Termite.prototype.processWallPerception = function (perceivedAgent) {
    if (!(perceivedAgent.id in this.walls)) {
        var wallInfos = {
            id: perceivedAgent.id,
            x: perceivedAgent.x - perceivedAgent.boundingWidth * 0.5,
            y: perceivedAgent.y - perceivedAgent.boundingHeight * 0.5,
            width: perceivedAgent.boundingWidth,
            height: perceivedAgent.boundingHeight
        };
        this.addWall(wallInfos);
    }
};
Termite.prototype.processPerception = function (perceivedAgent) {
    function exchangeHeapInfos() {
        perceivedAgent.heapInfos.forEach(function (key, heapInfo) {
            var curHeadInfo = this.heapInfos.get(i);
            if (curHeadInfo === null || curHeadInfo.date < heapInfo.date) {
                this.heapInfos.set(i, heapInfo);
            }
        }, this);
    }

    if (perceivedAgent.typeId == "wood_heap") {
        this.heapInfos[perceivedAgent.identifier] = {
            "x": perceivedAgent.x,
            "y": perceivedAgent.y,
            "count": perceivedAgent.woodCount,
            "date": new Date()
        };
        if (this.nid === null) {
            this.nid = {
                id: perceivedAgent.id,
                termites: [this.id],
                position: {
                    x: perceivedAgent.x,
                    y: perceivedAgent.y
                }
            };
        }
    } else if (perceivedAgent.typeId == "termite") {
        exchangeHeapInfos.call(this);
        negociateNid.call(this, perceivedAgent);
        getWallFromOther.call(this, perceivedAgent);
    } else if (perceivedAgent.typeId == "wall") {
        this.processWallPerception(perceivedAgent);
    }
};

Termite.prototype.addWall = function (wall) {
    this.walls[wall.id] = wall;
    this.astar_grid = calculateAStarGrid(this.walls, this.worldWidth, this.worldHeight);
    if (this.gotoData !== null) {
        this.goto(this.gotoData.destination.x, this.gotoData.destination.y, this.gotoData.callback);
    }
};

function calculateAStarGrid(walls, world_width, world_height) {
    function getArrayNoDuplicate(array) {
        var values = {};
        var noDuplicates = [];
        for (var index in array) {
            var value = array[index];
            if (!(value in values)) {
                noDuplicates.push(value);
                values[value] = 2;
            }
        }
        return noDuplicates;
    }

    function findAllCoordsSorted() {
        var x = [0, world_width];
        var y = [0, world_height];
        for (var index in walls) {
            var wall = walls[index];
            x.push(wall.x);
            x.push(wall.x + wall.width);
            y.push(wall.y);
            y.push(wall.y + wall.height);
        }

        var comparator = function (a, b) {
            return a - b;
        };
        x = getArrayNoDuplicate(x.sort(comparator));
        y = getArrayNoDuplicate(y.sort(comparator));

        return {x: x, y: y};
    }

    function makeGridFromSortedCoords(x, y) {
        var grid = [];
        for (var index_x = 0; index_x < x.length - 1; ++index_x) {
            var row = [];
            for (var index_y = 0; index_y < y.length - 1; ++index_y) {
                var currentX = x[index_x],
                    currentY = y[index_y],
                    nextX = x[index_x + 1],
                    nextY = y[index_y + 1];
                var rect = makeRect(currentX, currentY, nextX - currentX, nextY - currentY);
                rect.full = isRectFull(rect, walls);
                row.push(rect);
            }
            grid.push(row);
        }
        return grid;
    }

    function makeRect(x, y, width, height) {
        return {
            x: x,
            y: y,
            width: width,
            height: height
        };
    }

    function isRectFull(rect, walls) {
        var x = rect.x + rect.width * 0.5;
        var y = rect.y + rect.height * 0.5;
        for (var i in walls) {
            var wall = walls[i];
            if (x >= wall.x && x <= wall.x + wall.width && y >= wall.y && y <= wall.y + wall.height) {
                return true;
            }
        }
        return false;
    }

    var sortedCoords = findAllCoordsSorted();
    return makeGridFromSortedCoords(sortedCoords.x, sortedCoords.y);
}

function findPath(from, to, grid, minCaseSize) {
    function estimateCost(from, to) {
        return Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
    }

    function distanceBetween(from, to) {
        return estimateCost(from, to);
    }

    var closeSet = [];
    var openSet = [];
    var cameFrom = [];
    var fScore = [];
    var gScore = [];
    var nodesCache = [];
    var beginNode = makeNode(from.x, from.y);

    function makeGetUnique(container) {
        return function (node) {
            for (var i in container) {
                var curr = container[i];
                if (curr.key == node) {
                    return curr.value;
                }
            }
            return null;
        }
    }

    function makeSetUnique(container) {
        return function (key, value) {
            for (var i in container) {
                var curr = container[i];
                if (curr.key === key) {
                    curr.value = value;
                    return;
                }
            }
            container.push({key: key, value: value});
        }
    }

    var getFScore = makeGetUnique(fScore);
    var setFScore = makeSetUnique(fScore);
    var getGScore = makeGetUnique(gScore);
    var setGScore = makeSetUnique(gScore);
    var setCameFrom = makeSetUnique(cameFrom);
    var getCameFrom = makeGetUnique(cameFrom);

    openSet.push(beginNode);
    setGScore(beginNode, 0);
    setFScore(beginNode, 0 + estimateCost(from, to));


    function lowestFScoreNode() {
        var score = 99999999;
        var lowest = null;
        for (var index in openSet) {
            var currentNode = openSet[index];
            var currentScore = getFScore(currentNode);
            if (currentScore !== null && currentScore < score) {
                score = currentScore;
                lowest = currentNode;
            }
        }
        return lowest;
    }

    function makeNode(x, y) {
        for (var i in nodesCache) {
            var node = nodesCache[i];
            if (node.x == x && node.y == y) {
                return node;
            }
        }
        var newNode = {
            node: grid[x][y],
            x: x,
            y: y
        };
        nodesCache.push(newNode);
        return newNode;
    }

    function retrievePath(came_from, current_node) {
        var node = getCameFrom(current_node);
        if (node !== null) {
            var previous = retrievePath(came_from, node);
            return previous.concat([current_node])
        } else {
            return [current_node];
        }
    }

    function findNeighbor(node) {
        var indices = [];

        function inGrid(x, y) {
            return x >= 0 && y >= 0 && x < grid.length && y < grid[x].length;
        }

        function canAdd(x, y) {
            if (inGrid(x, y)) {
                var isEmpty = !grid[x][y].full;
                if (isEmpty) {
                    //UP - DOWN
                    if (node.x == x) {
                        if (grid[x][y].width < minCaseSize) {
                            isEmpty = false;
                        }
                        //LEFT - RIGHT
                    } else {
                        if (grid[x][y].height < minCaseSize) {
                            isEmpty = false;
                        }
                    }
                }
                return isEmpty;
            }
            return false;
        }

        function processNeighbor(x, y) {
            if (canAdd(x, y)) {
                indices.push(makeNode(x, y));
                return true;
            }
            return false;
        }

        var top = processNeighbor(node.x, node.y - 1);
        var left = processNeighbor(node.x - 1, node.y);
        var right = processNeighbor(node.x + 1, node.y);
        var bottom = processNeighbor(node.x, node.y + 1);

        if (top && left) {
            processNeighbor(node.x - 1, node.y - 1);
        }
        if (left && bottom) {
            processNeighbor(node.x - 1, node.y + 1);
        }
        if (top && right) {
            processNeighbor(node.x + 1, node.y - 1);
        }
        if (bottom && right) {
            processNeighbor(node.x + 1, node.y + 1);
        }

        return indices;
    }

    function nodeEquals(n1, n2) {
        return n1.x == n2.x && n1.y == n2.y;
    }


    while (openSet.length > 0) {
        var current = lowestFScoreNode();
        if (nodeEquals(current, to)) {
            return retrievePath(cameFrom, makeNode(current.x, current.y));
        }
        openSet.splice(openSet.indexOf(current), 1);
        closeSet.push(current);

        var neighbors = findNeighbor(current);
        for (var index in neighbors) {
            var neighbor = neighbors[index];
            if (closeSet.indexOf(neighbor) != -1) {
                continue;
            }

            var tentativeGScore = getGScore(current) + distanceBetween(current, neighbor);
            if (openSet.indexOf(neighbor) === -1 || tentativeGScore < getGScore(neighbor)) {
                setCameFrom(neighbor, current);
                setGScore(neighbor, tentativeGScore);
                setFScore(neighbor, tentativeGScore + distanceBetween(neighbor, to));
                if (openSet.indexOf(neighbor) === -1) {
                    openSet.push(neighbor);
                }
            }
        }
    }
    return false;
}
