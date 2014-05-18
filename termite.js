Termite.prototype = new Agent();
Termite.prototype.constructor = Termite;

function Termite(world_width, world_height) {
    Agent.call(this);
    this.typeId = "termite";
    this.boundingRadius = 3;
    this.perceptionRadius = 100;

    this.hasWood = false;

    this.collideTypes = ["wood_heap", "wall"];
    this.contactTypes = ["wood_heap"];

    this.heapInfos = [];
    this.walls = {};
    this.directionDelay = 0;
    this.speed = 500;
    this.updateRandomDirection();

    this.nid = null;

    this.drawAStar = false;

    this.astar_grid = [new Rectangle(0, 0, world_width, world_height, false)];
}

function Rectangle(x, y, width, height, full) {
    this.position = new Vect(x, y);
    this.dimension = new Vect(width, height);
    this.full = full;

    this.split = function (otherRect) {
        return [this];
    }

    function contains(other) {
        return this.position.x <= other.position.x && this.position.x + this.dimension.x >= other.position.x &&
            this.position.y <= other.position.y && this.position.y + this.dimension.y >= other.position.y;
    }

    this.draw = function (context) {
        if (this.full) {
            context.fillStyle = "rgba(255, 0, 0, 0.5)";
        } else {
            context.fillStyle = "rgba(128, 128, 128, 0.25)";
        }
        context.beginPath();
        context.rect(this.position.x, this.position.y, this.dimension.x, this.dimension.y);
        context.fill();
    }
}

Termite.prototype.updateRandomDirection = function (dt) {
    this.direction = new Vect(Math.random() * 2 - 1, Math.random() * 2 - 1);
    this.direction.normalize(1);
};
Termite.prototype.setTarget = function (x, y) {
    this.direction = new Vect(x - this.x, y - this.y);
    this.direction.normalize(1);
};

Termite.prototype.update = function (dt) {
    this.directionDelay -= dt;
    if (this.directionDelay <= 0) {
        var targetHeap = null;
        var searchTargetHeap = (Math.random() < 0.9)
        if (searchTargetHeap) {
            for (identifier in this.heapInfos) {
                var heapInfo = this.heapInfos[identifier];
                if (heapInfo.count > 2) {
                    if (this.hasWood) {
                        if (targetHeap == null || heapInfo.count > targetHeap.count) {
                            targetHeap = heapInfo;
                        }
                    } else if (!this.hasWood) {
                        if (targetHeap == null || heapInfo.count < targetHeap.count) {
                            targetHeap = heapInfo;
                        }
                    }
                }
            }
        }
        if (targetHeap) {
            this.setTarget(targetHeap.x, targetHeap.y);
        } else {
            this.updateRandomDirection();
        }
        this.speed = 100 + Math.random() * 200;
        this.directionDelay = 100 + Math.random() * 900;
    }

    var x = this.x + this.direction.x * this.speed * dt / 1000;
    var y = this.y + this.direction.y * this.speed * dt / 1000;
    this.moveTo(x, y);
};

Termite.prototype.draw = function (context) {
    context.fillStyle = this.hasWood ? "#f00" : "#000";
    context.strokeStyle = "#000";
    if(this.drawAStar)
    context.fillStyle = "rgba(0, 255, 0, 1)";
    context.beginPath();
    context.arc(this.x, this.y, this.boundingRadius, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
    if (this.drawAStar) {
        for (var i in this.astar_grid) {
            var rect = this.astar_grid[i];
            rect.draw(context);
        }
    }
};

Termite.prototype.processCollision = function (collidedAgent) {
    if (collidedAgent == null || collidedAgent.typeId == "wall") {
        this.directionDelay = 0;

    } else if (collidedAgent.typeId == "wood_heap") {
        if (this.hasWood) {
            collidedAgent.addWood();
            this.hasWood = false;
        } else {
            collidedAgent.takeWood();
            this.hasWood = true;
        }
        //this.changeDirection();
    }
};

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
Termite.prototype.processPerception = function (perceivedAgent) {
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
        for (var identifier in perceivedAgent.heapInfos) {
            var heapInfo = perceivedAgent.heapInfos[identifier];
            if (this.heapInfos[identifier] == null) {
                this.heapInfos[identifier] = heapInfo;
            } else if (this.heapInfos[identifier].date < heapInfo.date)
                this.heapInfos[identifier] = heapInfo;
        }
        negociateNid.call(this, perceivedAgent);
        getWallFromOther.call(this, perceivedAgent);
    } else if (perceivedAgent.typeId == "wall") {
        if (!(perceivedAgent.id in this.walls)) {
            var wallInfos = {
                id: perceivedAgent.id,
                x: perceivedAgent.x,
                y: perceivedAgent.y,
                width: perceivedAgent.boundingWidth,
                height: perceivedAgent.boundingHeight
            };
            this.addWall(wallInfos);
        }
    }
};

Termite.prototype.addWall = function(wall) {
    this.walls[wall.id] = wall;
    var newRect = new Rectangle(wall.x, wall.y, wall.width, wall.height, true);
    var newAStar = [];
    for(var i in this.astar_grid) {
        var newRectangles = this.astar_grid[i].split(newRect);
        for(var j in newRectangles) {
            newAStar.push(newRectangles[j]);
        }
    }
    this.astar_grid = newAStar;
}
