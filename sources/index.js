import * as THREE from "three";
import fragment from "../shader/fragment.glsl";
import vertex from "../shader/vertex.glsl";

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x141414, 1); 
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );
    this.camera.position.set(-1.5, 3, 4);
    
    this.time = 0;

    this.dracoLoader = new DRACOLoader()
    this.dracoLoader.setDecoderPath( '/draco/gltf/' );
    this.loader = new GLTFLoader()
    this.loader.setDRACOLoader( this.dracoLoader );
    
    this.loader.load(
        '/assets/model/dna.gltf',
        (gltf) => {
            console.log(gltf.scene.children[0].geometry)
            this.geometry = gltf.scene.children[0].geometry;
            this.geometry.center()

            this.addObjects();
            this.resize();
            this.setupResize();
            this.render();
        }
    )

    window.addEventListener("wheel", event => {
      //Model
      if (this.dna) {
        this.dna.rotation.y += event.deltaY * 0.002
        const scrollableEnd = document.documentElement.scrollHeight - window.innerHeight

        if (window.scrollY >= scrollableEnd || window.scrollY <= 0) {
        } else { 
          this.dna.position.y += event.deltaY * 0.002
        }
      }
    });
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    // let that = this;
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        uColor1: { value: new THREE.Color(0x0c0317) },
        uColor2: { value: new THREE.Color(0x170624) },
        uColor3: { value: new THREE.Color(0x07112e) },
        resolution: { value: new THREE.Vector4() }
      },
      // wireframe: true,
      transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.number = this.geometry.attributes.position.array.length;
    let randoms = new Float32Array(this.number/3);
    let colorRandoms = new Float32Array(this.number/3);

    for(let i = 0; i < this.number/3; i++) {
      randoms.set([Math.random()], i);
      colorRandoms.set([Math.random()], i);
    }
    this.geometry.setAttribute('randoms', new THREE.BufferAttribute(randoms, 1))
    this.geometry.setAttribute('colorRandoms', new THREE.BufferAttribute(colorRandoms, 1))

    this.dna = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.dna);

    //Stars
    this.starsGeometry = new THREE.BufferGeometry;
    this.starsCount = 500;

    this.posArray = new Float32Array(this.starsCount * 3);
    // xyz, xyz, xyz, xyz

    for(let i = 0; i < this.starsCount * 3; i++) {
      this.posArray[i] = ((Math.random() + 0.5) * 10) - 10
    }

    this.starsMaterial = new THREE.PointsMaterial({
      size: 0.006,
      color: 0xa9a9a9
  })

    this.starsGeometry.setAttribute('position', new THREE.BufferAttribute(this.posArray, 3))
    this.starsMesh = new THREE.Points(this.starsGeometry, this.starsMaterial);
    this.scene.add(this.starsMesh)
  }

  render() {
    this.time += 0.05;

    this.dna.rotation.y += 0.001;
    this.starsMesh.rotation.y = this.time/25;
    this.material.uniforms.time.value = this.time;
    
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  } 
}

new Sketch({
  dom: document.getElementById("container")
});