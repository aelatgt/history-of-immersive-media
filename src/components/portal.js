/**
 * Description
 * ===========
 * Bidirectional see-through portal. Two portals can be paired using a shared group name.
 *
 * Usage
 * =======
 * Add two instances of `portal.glb` to the Spoke scene.
 * The name of each instance should look like "some-descriptive-label__group-name"
 *
 * For example, to make a pair of portals to/from the panorama area,
 * you could name them "portal-to__panorama" and "portal-from__panorama"
 */

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
    worldPos.add(worldDir) // Teleport in front of the portal to avoid infinite loop
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
    group: { type: 'string', default: null },
  },
  init: async function () {
    this.system = APP.scene.systems.portal // A-Frame is supposed to do this by default but doesn't?
    this.group = this.data.group ?? this.parseSpokeName()
    this.other = await this.getOther()

    // TODO: Replace this visualization with camera and shader setup
    this.el.setAttribute('geometry', { primitive: 'dodecahedron' })
    this.el.setAttribute('material', { wireframe: true })
    const axesHelper = new THREE.AxesHelper()
    this.el.object3D.add(axesHelper)
  },
  tick: async function () {
    if (this.other && !this.system.teleporting) {
      this.el.object3D.getWorldPosition(worldPos)
      this.el.sceneEl.camera.getWorldPosition(worldCameraPos)
      const dist = worldCameraPos.distanceTo(worldPos)
      if (dist < 0.5) {
        this.system.teleportTo(this.other.object3D)
      }
    }
  },
  getOther: function () {
    return new Promise((resolve) => {
      const portals = Array.from(document.querySelectorAll(`[portal]`))
      const other = portals.find((el) => el.getAttribute('portal').group === this.data.group && el !== this.el)
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
  parseSpokeName: function () {
    // Accepted names: "label__group" OR "group"
    const spokeName = this.el.parentEl.parentEl.className
    const group = spokeName.match(/(?:.*__)?(.*)/)[1]
    return group
  },
})
