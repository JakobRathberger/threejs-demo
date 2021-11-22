import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import * as THREE from "three";
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader';
import {Group, LoadingManager} from 'three';
import {animate} from "@angular/animations";

@Component({
  selector: 'app-school',
  templateUrl: './school.component.html',
  styleUrls: ['./school.component.css']
})
export class SchoolComponent implements OnInit {

  @ViewChild('canvas')
  private canvasRef: ElementRef;

  //* Cube Properties

  @Input() public rotationSpeedX: number = 0.05;

  @Input() public rotationSpeedY: number = 0.01;

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

  private loadModel(){
    const objLoader = new OBJLoader();
    objLoader.setPath('/assets/');
    objLoader.load('model.obj', (object) => {
        console.log(object);
        this.obj = object;
        this.scene.add(object);

        this.scene.scale.set(0.0005, 0.0005, 0.0005);
      },
      function ( xhr ) {

        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

      },
      function ( error ) {

        console.log( 'An error happened' );

      });
  }



  //Animate the cube
  private animateCube() {
    requestAnimationFrame( animate );
    this.renderer.render(this.scene, this.camera);
  }


//Create the scene

  private createScene() {
    //* Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0000FF)
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
  }

  private getAspectRatio() {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  private startRenderingLoop() {
    //* Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    let component: SchoolComponent = this;
    (function render() {
      requestAnimationFrame(render);
      component.animateCube();
      component.renderer.render(component.scene, component.camera);
    }());
  }

  constructor() { }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.createScene();
    this.startRenderingLoop();
  }

}
