function PIXI_Context(canvas) {
    var width = canvas.scrollWidth;
    var height = canvas.scrollHeight;
    var stage = new PIXI.Stage;
    var renderer = new PIXI.autoDetectRenderer(width, height, canvas);

    var world = null;
    var debug = false;
    var debug_termite = null;

    var play = true;
    var last_time = window.performance.now();
    var createWoodHeapCompter = 20000 * Math.random() + 10000;

    this.getWorld = function() {
        return world;
    };

    this.reset = function(parameters) {
        stage = new PIXI.Stage;
        stage.setBackgroundColor(0xaaaaaa);
        var that = this;
        stage.mouseup = function(data) {
            var newHeap = new WoodHeap(that);
            var mousePos = that.getStage().getMousePosition();
            newHeap.x = mousePos.x;
            newHeap.y = mousePos.y;
            newHeap.init();
            that.getWorld().addAgent(newHeap);
        };

        world = new World(width, height);

        for (var i = 0; i < parameters.heaps; i++) {
            var woodHeap = new WoodHeap(this);
            world.addAgent(woodHeap);
            woodHeap.moveTo(width * Math.random(),
                    height * Math.random());
        }

        for (var i = 0; i < parameters.walls; i++) {
            var wall = new Wall(this);
            world.addAgent(wall);
            wall.moveTo(width * Math.random(),
                    height * Math.random(), this);
        }

        var solver = new WorldSolver(world);
        solver.solve();

        world.correctWalls();

        for (var i = 0; i < parameters.termites; i++) {
            var termite = new Termite(width, height, this);
            if(i === 0) {
                debug_termite = termite;
            }
            world.addAgent(termite);
            termite.moveTo(width * Math.random(),
                    height * Math.random());
        }

        world.init();
    };

    this.togglePlay = function () {
        play = !play;
    };

    function getDt() {
        var current = window.performance.now();
        var dt = current - last_time;
        last_time = current;
        return dt;
    }

    var stats = null;
    var self = this;

    function update() {
        if(createWoodHeapCompter <= 0)
        {
            var woodHeap =new WoodHeap(self);
            world.addAgent(woodHeap);
            woodHeap.moveTo(width * Math.random(),
                    height * Math.random());
            woodHeap.init();
            createWoodHeapCompter = 20000 * Math.random() + 10000;
        }
        if(stats != null) {
            stats.begin();
        }
        requestAnimFrame(update);
        if(world === null) {
            return;
        }
        var dt = getDt();
        createWoodHeapCompter -= dt;
        if(play) {
            world.update(dt);
        }
        debug_termite.drawAStar = debug;
        world.draw(renderer);
        renderer.render(stage);
        if(stats != null) {
            stats.end();
        }
    }

    this.getStage = function() {
        return stage;
    };

    this.toggleDebug = function() {
        debug = !debug;
    };

    this.setStats = function(newstats) {
        stats = newstats;
    };

    var termiteSpeed = 150;
    this.getVelocity = function() {
        return termiteSpeed;
    };

    this.setVelocity = function(speed) {
        termiteSpeed = speed;
    };

    requestAnimFrame(update);
}
