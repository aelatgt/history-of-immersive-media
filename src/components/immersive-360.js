/**
 * Description
 * ===========
 * 360 image that fills the user's vision when in a close proximity.
 *
 * Usage
 * =======
 * Given a 360 image asset with the following URL in Spoke:
 * https://gt-ael-aq-assets.aelatgt-internal.net/files/12345abc-6789def.jpg
 *
 * The name of the `immersive-360.glb` instance in the scene should be:
 * "some-descriptive-label__12345abc-6789def_jpg" OR "12345abc-6789def_jpg"
 */

const worldCamera = new THREE.Vector3()
const worldSelf = new THREE.Vector3()

AFRAME.registerComponent('immersive-360', {
  schema: {
    url: { type: 'string', default: null },
  },
  init: function () {
    const url = this.data.url ?? this.parseSpokeName()
    this.el.setAttribute('geometry', { primitive: 'sphere', radius: 300 })

    this.near = 1
    this.far = 1.3
    this.el.setAttribute('material', {
      src: url,
      shader: 'flat',
      side: 'back',
      transparent: true,
      depthTest: false,
    })
    // Render OVER the scene but UNDER the cursor
    this.el.object3DMap.mesh.renderOrder = APP.RENDER_ORDER.CURSOR - 1
  },
  tick: function () {
    // Linearly map camera distance to material opacity
    this.el.object3D.getWorldPosition(worldSelf)
    this.el.sceneEl.camera.getWorldPosition(worldCamera)
    const distance = worldSelf.distanceTo(worldCamera)
    const opacity = 1 - (distance - this.near) / (this.far - this.near)
    this.el.components.material.material.opacity = opacity
  },
  parseSpokeName: function () {
    // Accepted names: "label__image-hash_ext" OR "image-hash_ext"
    const spokeName = this.el.parentEl.parentEl.className
    const [, hash, extension] = spokeName.match(/(?:.*__)?(.*)_(.*)/)[1]
    const url = `https://gt-ael-aq-assets.aelatgt-internal.net/files/${hash}.${extension}`
    return url
  },
})
