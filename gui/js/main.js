
String.prototype.format = function () {
  var str = this;
  for (var i = 0; i < arguments.length; i ++) {
    str = str.replace('{' + i + '}', arguments[i]);
  }
  return str;
};

var $container, stats;
var camera, scene, renderer;
var splineHelperObjects = [];
var splinePointsLength = 0;
var positions = [];
var options;
var sphere;

var boxGeometry = new THREE.BoxGeometry(20, 20, 20);
var transformControl;

var ARC_SEGMENTS = 200;

var curve;

var params = {
  showCurve: true,
  showHandles: true,
  addPoint: addPoint,
  removePoint: removePoint,
  exportSpline: exportSpline
};

initScene();
initTimeline();
render();

function initScene() {

  $container = $('#container');

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  camera = new THREE.PerspectiveCamera(70, $container.width() / $container.height(), 1, 10000);
  camera.position.set(0, 250, 1000);
  scene.add(camera);

  scene.add(new THREE.AmbientLight(0xf0f0f0));
  var light = new THREE.SpotLight(0xffffff, 1.5);
  light.position.set(0, 1500, 200);
  light.castShadow = true;
  light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(70, 1, 200, 2000));
  light.shadow.bias = -0.000222;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  scene.add(light);
  spotlight = light;

  var planeGeometry = new THREE.PlaneGeometry(2000, 2000);
  planeGeometry.rotateX(- Math.PI / 2);
  var planeMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });

  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.y = -200;
  plane.receiveShadow = true;
  scene.add(plane);

  var helper = new THREE.GridHelper(2000, 100);
  helper.position.y = - 199;
  helper.material.opacity = 0.25;
  helper.material.transparent = true;
  scene.add(helper);

  sphere = new THREE.Mesh(
    new THREE.SphereGeometry(10, 32, 32),
    new THREE.MeshLambertMaterial({ color: 0xaa0000 })
  );
  scene.add(sphere);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize($container.width(), $container.height());
  renderer.shadowMap.enabled = true;
  $container.append(renderer.domElement);

  stats = new Stats();
  $container.append(stats.dom);

  var gui = new dat.GUI();

  /*gui.add(params, 'uniform');
  gui.add(params, 'tension', 0, 1).step(0.01).onChange(function(value) {
    splines.uniform.tension = value;
    updateSplineOutline();
  });*/
  gui.add(params, 'showCurve');
  gui.add(params, 'showHandles');
  gui.add(params, 'addPoint');
  gui.add(params, 'removePoint');
  gui.open();

  // Controls
  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.damping = 0.2;
  controls.addEventListener('change', render);

  controls.addEventListener('start', function() {
    cancelHideTransorm();
  });

  controls.addEventListener('end', function() {
    delayHideTransform();
  });

  transformControl = new THREE.TransformControls(camera, renderer.domElement);
  transformControl.addEventListener('change', render);
  scene.add(transformControl);

  transformControl.addEventListener('change', function(e) {
    cancelHideTransorm();
  });

  transformControl.addEventListener('mouseDown', function(e) {
    cancelHideTransorm();
  });

  transformControl.addEventListener('mouseUp', function(e) {
    delayHideTransform();
  });

  transformControl.addEventListener('objectChange', function(e) {
    updateSplineOutline();
  });

  var dragcontrols = new THREE.DragControls(splineHelperObjects, camera, renderer.domElement);
  dragcontrols.enabled = false;
  dragcontrols.addEventListener('hoveron', function (event) {
    transformControl.attach(event.object);
    cancelHideTransorm();
  });

  dragcontrols.addEventListener('hoveroff', function (event) {
    delayHideTransform();
  });

  var hiding;

  function delayHideTransform() {
    cancelHideTransorm();
    hideTransform();
  }

  function hideTransform() {
    hiding = setTimeout(function() {
      transformControl.detach(transformControl.object);
    }, 500)
  }

  function cancelHideTransorm() {
    if (hiding) clearTimeout(hiding);
  }


  /*******
   * Curves
   *********/
  var curveGeometry = new THREE.Geometry();

  for (var i = 0; i < ARC_SEGMENTS; i ++) {
    curveGeometry.vertices.push(new THREE.Vector3());
  }

  curve = new THREE.CatmullRomCurve3(positions);
  curve.curveType = 'centripetal';
  curve.mesh = new THREE.Line(curveGeometry, new THREE.LineBasicMaterial({
    color: 0x0000ff,
    opacity: 0.35,
    linewidth: 2
  }));
  curve.mesh.castShadow = true;
  scene.add(curve.mesh);

  load([new THREE.Vector3(289.76843686945404, 452.51481137238443, 56.10018915737797),
      new THREE.Vector3(-53.56300074753207, 171.49711742836848, -14.495472686253045),
      new THREE.Vector3(-91.40118730204415, 176.4306956436485, -6.958271935582161),
      new THREE.Vector3(-383.785318791128, 491.1365363371675, 47.869296953772746)]);
}

function addSplineObject(position) {
  var material = new THREE.MeshLambertMaterial({ color: 0x0066ff });
  var object = new THREE.Mesh(boxGeometry, material);

  if (position) {
    object.position.copy(position);
  } else {
    object.position.x = Math.random() * 1000 - 500;
    object.position.y = Math.random() * 600;
    object.position.z = Math.random() * 800 - 400;
  }

  object.castShadow = true;
  object.receiveShadow = true;
  scene.add(object);
  splineHelperObjects.push(object);
  return object;
}

function addPoint() {
  splinePointsLength++;
  positions.push(addSplineObject().position);
  updateSplineOutline();
}

function removePoint() {
  if (splinePointsLength <= 4) {
    return;
  }

  splinePointsLength --;
  positions.pop();
  scene.remove(splineHelperObjects.pop());
  updateSplineOutline();
}

function updateSplineOutline() {

  if (positions.length < 2) {
    return;
  }

  var curveMesh = curve.mesh;

  for (var i = 0; i < ARC_SEGMENTS; i++) {
    var p = curveMesh.geometry.vertices[i];
    var t = i /  (ARC_SEGMENTS - 1);
    curve.getPoint(t, p);
  }

  curveMesh.geometry.verticesNeedUpdate = true;

  curve.updateArcLengths();
}

function exportSpline() {
  var strplace = [];

  for (var i = 0; i < splinePointsLength; i ++) {
    var p = splineHelperObjects[i].position;
    strplace.push('new THREE.Vector3({0}, {1}, {2})'.format(p.x, p.y, p.z))
  }

  console.log(strplace.join(',\n'));
  var code = '[' + (strplace.join(',\n\t')) + ']';
  prompt('copy and paste code', code);
}

function load(new_positions) {
  while (new_positions.length > positions.length) {
    addPoint();
  }

  while (new_positions.length < positions.length) {
    removePoint();
  }

  for (var i = 0; i < positions.length; i ++) {
    positions[i].copy(new_positions[i]);
  }

  updateSplineOutline();
}

function initTimeline() {
  var canvas = document.getElementById("timeline");
  var ctx = canvas.getContext("2d");
  console.log(ctx);
}

function moveSphere() {
  var t = ((Date.now()) % 10000) / 10000.0
  var point = curve.getPointAt(t);
  sphere.position.copy(point);
}

function render() {
  requestAnimationFrame(render);

  curve.mesh.visible = params.showCurve;

  for (var i = 0; i < splineHelperObjects.length; i++) {
    splineHelperObjects[i].visible = params.showHandles;
  }

  moveSphere();

  renderer.render(scene, camera);
  stats.update();
  transformControl.update();
}
