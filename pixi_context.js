function PIXI_Context(width, height, canvas) {
    var stage = new PIXI.Stage;
    var renderer = new PIXI.WebGLRenderer(width, height, canvas);

    var world = null;
    var debug = false;
    var debug_termite = null;

    var textures = {};

    var play = true;
    var last_time = window.performance.now();
    var frame_count;
    var frame_count_start;
    var fps = 0;

    function resetFrameCount() {
        frame_count = 0;
        frame_count_start = window.performance.now();
    }
    resetFrameCount();

    this.getWorld = function() {
        return world;
    };

    this.reset = function(parameters) {
        stage = new PIXI.Stage;
        stage.setBackgroundColor(0xaaaaaa);
        var that = this;
        stage.click = function(data) {
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

    function update() {
        if(stats != null) {
            stats.begin();
        }
        requestAnimFrame(update);
        var time = window.performance.now() - frame_count_start;
        if(time >= 500) {
            fps = (frame_count / time) * 1000;
            resetFrameCount();
        }
        ++frame_count;
        if(world === null) {
            return;
        }
        var dt = getDt();
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

    this.getTexture = function (image) {
        if(image in textures) {
            return textures[image];
        }
        return (textures[image] = PIXI.Texture.fromImage(image));
    };

    this.getStage = function() {
        return stage;
    };

    this.getFPS = function() {
        return fps;
    };

    this.toggleDebug = function() {
        debug = !debug;
    };

    this.setStats = function(newstats) {
        stats = newstats;
    }

    requestAnimFrame(update);
}
