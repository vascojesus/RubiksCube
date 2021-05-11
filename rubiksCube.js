const deg90 = Math.PI/2.0;
var RotateStep = 0.1*deg90; // Rotate in 10 steps

var rubiksCube;
 
class RubiksCube {
    // constructor
    constructor(args) {

        var timerVar = setInterval(countTimer, 1000);
        var totalSeconds = 0;
        function countTimer() {
           ++totalSeconds;
        var hour = Math.floor(totalSeconds /3600);
        var minute = Math.floor((totalSeconds - hour*3600)/60);
        var seconds = totalSeconds - (hour*3600 + minute*60);
            if(hour < 10)
                hour = "0"+hour;
            if(minute < 10)
                minute = "0"+minute;
            if(seconds < 10)
                seconds = "0"+seconds;
        document.getElementById("timer").innerHTML = hour + ":" + minute + ":" + seconds;
        }
             
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xFFFFFF)
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer ({ antialias: true });
 
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Some helpers     
        this.activeCubes = new THREE.Group();                       // Create a group on which to rotate
        this.activeAxis = new THREE.Vector3(1,0,0).normalize();     // Axis on which to rotate
        this.direction = 1;                                         // Rotation direction
        this.steps = 0;                                             // If steps > 0, we are rotating
 
        document.body.appendChild(this.renderer.domElement);
        for (let x = -1; x < 2; x++) {
            for (let y = -1; y < 2; y++) {
                for (let z = -1; z < 2; z++) {
                    if ((x === 0) && (y === 0) && (z === 0)) {
                        continue;
                    }
                    let cube = this.createCube(x,y,z);
                    this.scene.add(cube)
                }
            }
        }
       
        this.camera.position.set(5,3,6)
        this.scene.add(this.camera)
        this.orbitControls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.enableKeys = false;
    }

    createCube(x,y,z) {
        // geometria do cubo
        var geometry = new THREE.BoxGeometry(0.95, 0.95, 0.95);
    
        let colors = ['#0000DD', '#DD0000', '#00CC00', '#FFFFFF', '#ff5a00', '#ffe700'] // as 6 cores dum rubiks cube
        // atribui uma cor para cada face do cubo ** 2 triangulos == 1 face **
        let indiceCor = 0 
        // 
        for (var i = 0; i < geometry.faces.length; i += 2) { 
            var color = colors[indiceCor]; // cor de cada face
            if ((x === 1)&&(indiceCor === 0)) {
                geometry.faces[i].color.set(color); //triangulo 1
                geometry.faces[i+1].color.set(color); //triangulo 2
            } else if ((x === -1)&&(indiceCor === 1)) {
                geometry.faces[i].color.set(color); //triangulo 1
                geometry.faces[i+1].color.set(color); //triangulo 2
            } else if ((y === 1)&&(indiceCor === 2)) {
                geometry.faces[i].color.set(color); //triangulo 1
                geometry.faces[i+1].color.set(color); //triangulo 2
            } else if ((y === -1)&&(indiceCor === 3)) {
                geometry.faces[i].color.set(color); //triangulo 1
                geometry.faces[i+1].color.set(color); //triangulo 2
            } else if ((z === 1)&&(indiceCor === 4)) {
                geometry.faces[i].color.set(color); //triangulo 1
                geometry.faces[i+1].color.set(color); //triangulo 2
            } else if ((z === -1)&&(indiceCor === 5)) {
                geometry.faces[i].color.set(color); //triangulo 1
                geometry.faces[i+1].color.set(color); //triangulo 2
            } else {
                geometry.faces[i].color.set(0x0); //triangulo 1
                geometry.faces[i+1].color.set(0x0); //triangulo 2
            }
            indiceCor++;    
        }

        // material do cubo
        var material = new THREE.MeshBasicMaterial({
            vertexColors: true // vertexColors vai aplicar as cores que atribuimos a cada geometry.faces[i]
        }); 
        let cube = new THREE.Mesh(geometry, material);
        cube.position.x = x;
        cube.position.y = y;
        cube.position.z = z;
        return cube;
    }

    move(v, axis, dir) {
        if (this.steps > 0)
            return;
        if (axis === 'x') {
            this.activeAxis = new THREE.Vector3(1,0,0).normalize();
        } else if (axis === 'y') {
            this.activeAxis = new THREE.Vector3(0,1,0).normalize();            
        } else {
            this.activeAxis = new THREE.Vector3(0,0,1).normalize();            
        }

        // We can't loop an array and remove children at the same  time, so we do something "strange" here
        this.activeCubes = new THREE.Group();
        var i = 0;
        while (i < this.scene.children.length) {
            let cube = this.scene.children[i];
            if ( cube instanceof THREE.Mesh ) {
                if (Math.abs(cube.position[axis] - v)<0.5) {        // Sometimes it stays at 0.9999, so we need some kind of "close enough"
                    rubiksCube.activeCubes.add(cube);
                } else
                    i++;
            } else
                i++;
        }
        this.steps = 10;                            // We rotate in 10 steps
        this.direction = dir;                       // The direction
    }

    /*shuffle(){
        function randomAxis() {
          return ['x', 'y', 'z'][randomInt(-1,1)];
        }
  
        function randomDirection() {
          var x = randomInt(0,1);
          if(x == 0) x = -1;
          return x;
        }
  
        function randomCube() {
          var i = randomInt(0, allCubes.length - 1);
          //TODO: don't return a centre cube
          return allCubes[i];
        }
  
        var nMoves = randomInt(10, 40);
        for(var i = 0; i < nMoves; i ++) {
          //TODO: don't reselect the same axis?
          var cube = randomCube();
          pushMove(cube, cube.position.clone(), randomAxis(), randomDirection());
        }
  
        startNextMove();
      }*/
      

    // Update and draw the scene
    frame() {
        'use strict';
        this.orbitControls.update();
        if (this.steps > 0) {
            this.activeCubes.rotateOnAxis(this.activeAxis,this.direction * RotateStep);
            this.scene.add( this.activeCubes );
            this.steps--;
            if (this.steps === 0) {
                // Now we need to empty the active group
                while (this.activeCubes.children.length > 0) {
                    let cube = this.activeCubes.children.pop();
                    if ( cube instanceof THREE.Mesh ) {
                        rubiksCube.scene.attach(cube);
                    } 
                }
            }
        }

        // And draw !
        this.renderer.render(this.scene, this.camera);
    }
};
 
function animate() {
    requestAnimationFrame(animate);
    rubiksCube.frame();
}
 
var startAnimation = function() { 
    rubiksCube = new RubiksCube();
    animate();
}

startAnimation();

