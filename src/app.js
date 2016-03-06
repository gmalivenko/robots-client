var $ = require('jquery');
var io = require('socket.io-client');
var BABYLON = require('babylonjs');

$(document).ready(function() {
  var canvas = document.getElementById('renderCanvas');
  var engine = new BABYLON.Engine(canvas, true);

  var createScene = function() {
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 100, -150), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.speed = 10.0;
    camera.attachControl(canvas, false);
    var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
    var ground = BABYLON.MeshBuilder.CreateGround('ground1', {width:1000.0, height: 1000.0}, scene);
    ground.position = new BABYLON.Vector3(0, 0, 0);
    return scene;
  };

  var sphere = null;
  var config = null;
  var scene = createScene();

  engine.runRenderLoop(function() {
    scene.render();
  });

  window.addEventListener('resize', function() {
    engine.resize();
  });

  var socket = io.connect('http://127.0.0.1:7777');
  socket.on('disconnect', function() {
    window.location.reload();
  });

  function state(state) {
    var material = new BABYLON.StandardMaterial('Mat', scene);
    material.diffuseTexture = new BABYLON.Texture('./img/crate.png', scene);
    for (var i = 0; i < state.length; i++) {
      for (var j = 0; j < state[i].length; j++) {
        if (state[i][j] != 0) continue;
        var box = new BABYLON.Mesh.CreateBox('crate' + i + j, config.map.cubeSize, scene);
        box.position = new BABYLON.Vector3(j * config.map.cubeSize, 0, i * config.map.cubeSize);
        box.material = material;
      }
    }
  }

  socket.emit('config.get', {}, function(serverConfig) {
    config = serverConfig;
    socket.emit('map.getMaze', {}, state);
    socket.emit('map.getPoints', {}, function(points) {
      var material = new BABYLON.StandardMaterial('Mat', scene);
      material.diffuseTexture = new BABYLON.Texture('./img/robo.jpg', scene);
      material.diffuseTexture.hasAlpha = true;
      for (var i = 0; i < points.length; i++) {
        var target = new BABYLON.Mesh.CreateBox('point' + i, config.map.cubeSize, scene);
        target.material = material;
        target.position.x = points[i][0] * config.map.cubeSize;
        target.position.y = 0;
        target.position.z = points[i][1] * config.map.cubeSize;
      }

    });
  });

  function getState() {
    socket.emit('robot.getState', {}, function(state) {
      state = JSON.parse(state);

      if (!sphere) {
        var material = new BABYLON.StandardMaterial('Mat', scene);
        material.diffuseTexture = new BABYLON.Texture('./img/robo.jpg', scene);
        material.diffuseTexture.hasAlpha = true;
        sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, state.r * 2.0, scene);
        sphere.material = material;
      }

      sphere.position.x = state.x;
      sphere.position.y = state.z; //y-z inverted
      sphere.position.z = state.y;

      console.log(state);
    });
  }

  setInterval(getState, 50);

  $('.force').click(function(e) {
    var force = {fx:0, fy:0, fz:0};
    force[$(this).data('direction')] = $(this).data('amount') * $('#forceMultiplier').val();
    socket.emit('robot.applyForce', force);
  });

});
