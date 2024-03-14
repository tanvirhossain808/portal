import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

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
const portalLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })

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

for (let i = 0; i < fireFliesCount; i++) {
    firefliesPositionArray[i * 3] = Math.random() * 4
    firefliesPositionArray[i * 3 + 1] = Math.random() * 4
    firefliesPositionArray[i * 3 + 2] = Math.random() * 4
}

fireFliesGeometry.setAttribute("position", new THREE.BufferAttribute(firefliesPositionArray, 3))

//Material

const firesFliesMaterial = new THREE.PointsMaterial({ size: 0.1, sizeAttenuation: true })

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

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()