import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import * as THREE from "three";
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader';
import {DirectionalLight, Group, HemisphereLight, LoadingManager, Object3D} from 'three';
import {animate} from "@angular/animations";
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader";

@Component({
  selector: 'app-school',
  templateUrl: './school.component.html',
  styleUrls: ['./school.component.css']
})
export class SchoolComponent implements OnInit {

  @ViewChild('canvas')
  private canvasRef: ElementRef;

  @Input() public size: number = 200;

  //* Stage Properties

  @Input() public cameraZ: number = 1500;

  @Input() public fieldOfView: number = 1;

  @Input('nearClipping') public nearClippingPlane: number = 1;

  @Input('farClipping') public farClippingPlane: number = 1000;

  private camera!: THREE.PerspectiveCamera;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private renderer!: THREE.WebGLRenderer;

  private scene!: THREE.Scene;

  private obj: Group;

  private mouseDown: boolean = false;
  private mouseX: number = 0;
  private mouseY: number = 0;

  private objects: Object3D[] = []

  private loadModel(){

    const mtlLoader = new MTLLoader();
    mtlLoader.setPath('/assets/');
    mtlLoader.load('Model.mtl', (materials) => {
      materials.preload();


      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath('/assets/');
      objLoader.load('model.obj', (object) => {
          this.obj = object;

          this.scene.add(object);
          for(const o of object.children) {
            console.log(o.name);
            this.objects.push(o);
            this.hideCeiling();
          }
        },
        function (xhr) {

          console.log((xhr.loaded / xhr.total * 100) + '% loaded');

        },
        function (error) {

          console.log('An error happened');

        });
      this.scene.scale.set(0.0005, 0.0005, 0.0005);
    });
  }

  private hideCeiling(){
    console.log("Hide Ceiling");
    // @ts-ignore
    this.objects.find(o => o.name === "ceiling").visible = false;
  }
  private setUpHemiLight() {
    const hemiLight = new HemisphereLight(0xffffff, 0xffffff, 0.4);
    hemiLight.position.set(0, 500, 0);
    this.scene.add(hemiLight);
  }

  private setupDirLight() {
    const dirLight = new DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(-1, 0.75, 1);
    dirLight.position.multiplyScalar(50);
    dirLight.name = 'dirLight';

    this.scene.add(dirLight);

    dirLight.castShadow = true;
    dirLight.shadow.mapSize.height = dirLight.shadow.mapSize.height = 1024 * 2;
    const d = 300;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;

    dirLight.shadow.camera.far = 3500;
    dirLight.shadow.bias = -0.0001;
  }
//Create the scene

  private createScene() {
    //* Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1b2023)
    this.loadModel();
    //*Camera
    let aspectRatio = this.getAspectRatio();
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPlane,
      this.farClippingPlane
    )
    this.camera.position.z = this.cameraZ;
    this.camera.position.setLength(300);
    this.setUpHemiLight();
    this.setupDirLight();
  }

  private getAspectRatio() {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  private onMouseMove = (evt: MouseEvent) => {
    if (!this.mouseDown) {
      return;
    }

    evt.preventDefault();

    var deltaX = evt.clientX - this.mouseX,
      deltaY = evt.clientY - this.mouseY;
    this.mouseX = evt.clientX;
    this.mouseY = evt.clientY;
    this.mouse.x = (evt.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(evt.clientY / window.innerHeight) * 2 + 1;
    this.rotateScene(deltaX, deltaY);
  }

  private onMouseDown = (evt: MouseEvent) => {
    evt.preventDefault();

    this.mouseDown = true;
    this.mouseX = evt.clientX;
    this.mouseY = evt.clientY;

    this.raycaster.setFromCamera( this.mouse, this.camera );

    // calculate objects intersecting the picking ray
    const intersects = this.raycaster.intersectObjects( this.objects, true );

    for ( let i = 0; i < intersects.length; i ++ ) {
      console.log("clicked: " + intersects[i].object.name);
    }
  }

  private onMouseUp = (evt: MouseEvent) => {
    evt.preventDefault();

    this.mouseDown = false;
  }

  private rotateScene(deltaX: number, deltaY: number) {
    this.obj.rotation.y += deltaX /100;
    this.obj.rotation.x += deltaY /100;
  }


  private startRenderingLoop() {
    //* Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('mouseup', this.onMouseUp);

    console.log("FOV:" + this.camera.fov)

    let component: SchoolComponent = this;
    (function render() {
      requestAnimationFrame(render);
      component.renderer.render(component.scene, component.camera);
    }());
  }

  constructor() {  }


  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.createScene();
    this.startRenderingLoop();
  }
}
