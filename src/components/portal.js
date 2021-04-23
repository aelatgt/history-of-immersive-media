/**
 * Description
 * ===========
 * Bidirectional see-through portal. Two portals are paired by color.
 *
 * Usage
 * =======
 * Add two instances of `portal.glb` to the Spoke scene.
 * The name of each instance should look like "some-descriptive-label__color"
 * Any valid THREE.Color argument is a valid color value.
 * See here for example color names https://www.w3schools.com/cssref/css_colors.asp
 *
 * For example, to make a pair of connected blue portals,
 * you could name them "portal-to__blue" and "portal-from__blue"
 */

import './proximity-events.js'
import vertexShader from '../shaders/portal.vert.js'
import fragmentShader from '../shaders/portal.frag.js'
import snoise from '../shaders/snoise.js'

const worldPos = new THREE.Vector3()
const worldCameraPos = new THREE.Vector3()
const worldDir = new THREE.Vector3()
const worldQuat = new THREE.Quaternion()
const mat4 = new THREE.Matrix4()

AFRAME.registerSystem('portal', {
  dependencies: ['fader-plus'],
  init: function () {
    this.teleporting = false
    this.characterController = this.el.systems['hubs-systems'].characterController
    this.fader = this.el.systems['fader-plus']
  },
  teleportTo: async function (object) {
    this.teleporting = true
    await this.fader.fadeOut()
    // Scale screws up the waypoint logic, so just send position and orientation
    object.getWorldQuaternion(worldQuat)
    object.getWorldDirection(worldDir)
    object.getWorldPosition(worldPos)
    worldPos.add(worldDir.multiplyScalar(1.5)) // Teleport in front of the portal to avoid infinite loop
    mat4.makeRotationFromQuaternion(worldQuat)
    mat4.setPosition(worldPos)
    // Using the characterController ensures we don't stray from the navmesh
    this.characterController.travelByWaypoint(mat4, true, false)
    await this.fader.fadeIn()
    this.teleporting = false
  },
})

AFRAME.registerComponent('portal', {
  schema: {
    color: { type: 'color', default: null },
  },
  init: async function () {
    this.system = APP.scene.systems.portal // A-Frame is supposed to do this by default but doesn't?
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        cubeMap: { value: null },
        time: { value: 0 },
        radius: { value: 0 },
        ringColor: { value: this.getColor() },
      },
      vertexShader,
      fragmentShader: `
        ${snoise}
        ${fragmentShader}
      `,
    })

    // Assume that the object has a plane geometry
    const mesh = this.el.getOrCreateObject3D('mesh')
    mesh.material = this.material

    this.el.setAttribute('animation__portal', {
      property: 'components.portal.material.uniforms.radius.value',
      dur: 700,
      easing: 'easeInOutCubic',
    })
    this.el.addEventListener('animationbegin', () => (this.el.object3D.visible = true))
    this.el.addEventListener('animationcomplete__portal', () => (this.el.object3D.visible = !this.isClosed()))
    this.other = await this.getOther()

    this.cubeCamera = new THREE.CubeCamera(1, 100000, 1024)
    this.cubeCamera.rotateY(Math.PI) // Face forwards
    this.el.object3D.add(this.cubeCamera)
    this.other.components.portal.material.uniforms.cubeMap.value = this.cubeCamera.renderTarget.texture

    this.el.sceneEl.addEventListener('model-loaded', () => {
      this.cubeCamera.update(this.el.sceneEl.renderer, this.el.sceneEl.object3D)
    })
    this.el.setAttribute('proximity-events', { radius: 7 })
    this.el.addEventListener('proximityenter', () => this.open())
    this.el.addEventListener('proximityleave', () => this.close())
  },
  tick: function (time) {
    this.material.uniforms.time.value = time / 1000
    if (this.other && !this.system.teleporting) {
      this.el.object3D.getWorldPosition(worldPos)
      this.el.sceneEl.camera.getWorldPosition(worldCameraPos)
      const dist = worldCameraPos.distanceTo(worldPos)
      if (dist < 1) {
        this.system.teleportTo(this.other.object3D)
      }
    }
  },
  getOther: function () {
    return new Promise((resolve) => {
      const portals = Array.from(document.querySelectorAll(`[portal]`))
      const other = portals.find((el) => el.components.portal.getColor().equals(this.getColor()) && el !== this.el)
      if (other !== undefined) {
        // Case 1: The other portal already exists
        resolve(other)
        other.emit('pair', { other: this.el }) // Let the other know that we're ready
      } else {
        // Case 2: We couldn't find the other portal, wait for it to signal that it's ready
        this.el.addEventListener('pair', (event) => resolve(event.detail.other), { once: true })
      }
    })
  },
  getColor: function () {
    if (this.color) return this.color
    this.color = new THREE.Color(this.data.color ?? this.parseSpokeName())
    return this.color
  },
  parseSpokeName: function () {
    const spokeName = this.el.parentEl.parentEl.className
    const color = spokeName.match(/(?:.*__)?(.*)/)[1] // e.g. "label__color"
    return color
  },
  setRadius(val) {
    this.el.setAttribute('animation__portal', {
      from: this.material.uniforms.radius.value,
      to: val,
    })
  },
  open() {
    this.setRadius(1)
  },
  close() {
    this.setRadius(0)
  },
  isClosed() {
    return this.material.uniforms.radius.value === 0
  },
})
