const worldCamera = new THREE.Vector3()
const worldSelf = new THREE.Vector3()

AFRAME.registerComponent('proximity-events', {
  schema: {
    radius: { type: 'number', default: 1 },
  },
  init() {
    this.inZone = false
    this.camera = this.el.sceneEl.camera
  },
  tick() {
    this.camera.getWorldPosition(worldCamera)
    this.el.object3D.getWorldPosition(worldSelf)
    const wasInzone = this.inZone
    this.inZone = worldCamera.distanceTo(worldSelf) < this.data.radius
    if (this.inZone && !wasInzone) this.el.emit('proximityenter')
    if (!this.inZone && wasInzone) this.el.emit('proximityleave')
  },
})
