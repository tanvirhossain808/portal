import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import fireFliesVertexShader from "./shaders/fireflies/vertex.glsl"
import fireFliesFragmentShader from "./shaders/fireflies/fragmentShader.glsl"
import portalVertex from "./shaders/Portal/vertex.glsl"
import portalFragment from "./shaders/Portal/fragment.glsl"
/**
 * Base
 */
// Debug

//Debug object

const debugObject = {}

const gui = new dat.GUI({
    width: 400
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)


const bakedTexture = textureLoader.load("/baked.jpg")
bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding


/**
 * Object
 */
// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial()
// )

// scene.add(cube)

/* 
materials
*/


//baked materials
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })

//portal light material
const portalLightMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 }
    },
    vertexShader: portalVertex,
    fragmentShader: portalFragment

})

//pole light material

const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 })
/* 

gltf loader
*/

gltfLoader.load(
    "/portal.glb",
    (gltf) => {
        // gltf.scene.traverse((child) => {
        //     child.material = bakedMaterial
        // })
        const bakedMesh = gltf.scene.children.find(child => child.name === "baked")
        // bakedMesh.material = bakedMaterial


        const portalLightMesh = gltf.scene.children.find(child => child.name === "portalLight")
        const poleLightAMesh = gltf.scene.children.find((child) => child.name === "poleLightA")
        const poleLightBMesh = gltf.scene.children.find((child) => child.name === "poleLightB")
        bakedMesh.material = bakedMaterial
        poleLightAMesh.material = poleLightMaterial
        poleLightBMesh.material = poleLightMaterial
        portalLightMesh.material = portalLightMaterial

        scene.add(gltf.scene)
        // console.log(gltf.scene)
    }
)

//Fireflies

//Geometry

const fireFliesGeometry = new THREE.BufferGeometry()

const fireFliesCount = 30
const firefliesPositionArray = new Float32Array(fireFliesCount * 3)

const scaleArray = new Float32Array(fireFliesCount)

for (let i = 0; i < fireFliesCount; i++) {
    firefliesPositionArray[i * 3] = (Math.random() - 0.5) * 4
    firefliesPositionArray[i * 3 + 1] = Math.random() * 2
    firefliesPositionArray[i * 3 + 2] = (Math.random() - 0.5) * 4

    scaleArray[i] = Math.random()
}

fireFliesGeometry.setAttribute("position", new THREE.BufferAttribute(firefliesPositionArray, 3))
fireFliesGeometry.setAttribute("aScale", new THREE.BufferAttribute(scaleArray, 1))
//Material

const firesFliesMaterial = new THREE.ShaderMaterial({
    uniforms:
    {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 100 }
    },
    vertexShader: fireFliesVertexShader,
    fragmentShader: fireFliesFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,




})

gui.add(firesFliesMaterial.uniforms.uSize, "value").min(0).max(500).step(1).name("fireFlexSize")
//points

const fireFlies = new THREE.Points(fireFliesGeometry, firesFliesMaterial)
scene.add(fireFlies)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    //update fire flies
    firesFliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding
debugObject.clearColor = "#201919"
renderer.setClearColor(debugObject.clearColor)
gui.addColor(debugObject, "clearColor").onChange(() => renderer.setClearColor(debugObject.clearColor))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // update fire material


    controls.update()
    firesFliesMaterial.uniforms.uTime.value = elapsedTime
    portalLightMaterial.uniforms.uTime.value = elapsedTime
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()