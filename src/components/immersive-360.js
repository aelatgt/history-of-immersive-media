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
  init: async function () {
    const url = this.data.url ?? this.parseSpokeName()
    const extension = url.match(/^.*\.(.*)$/)[1]

    // media-image will set up the sphere geometry for us
    this.el.setAttribute('media-image', {
      projection: '360-equirectangular',
      alphaMode: 'opaque',
      src: url,
      version: 1,
      batch: false,
      contentType: `image/${extension}`,
      alphaCutoff: 0,
    })
    // but we need to wait for this to happen
    this.mesh = await this.getMesh()
    this.mesh.geometry.scale(100, 100, 100)
    this.mesh.material.setValues({
      transparent: true,
      depthTest: false,
    })
    this.near = 1
    this.far = 1.3

    // Render OVER the scene but UNDER the cursor
    this.mesh.renderOrder = APP.RENDER_ORDER.CURSOR - 1
  },
  tick: function () {
    if (this.mesh) {
      // Linearly map camera distance to material opacity
      this.mesh.getWorldPosition(worldSelf)
      this.el.sceneEl.camera.getWorldPosition(worldCamera)
      const distance = worldSelf.distanceTo(worldCamera)
      const opacity = 1 - (distance - this.near) / (this.far - this.near)
      this.mesh.material.opacity = opacity
    }
  },
  parseSpokeName: function () {
    // Accepted names: "label__image-hash_ext" OR "image-hash_ext"
    const spokeName = this.el.parentEl.parentEl.className
    const [, hash, extension] = spokeName.match(/(?:.*__)?(.*)_(.*)/)
    const url = `https://gt-ael-aq-assets.aelatgt-internal.net/files/${hash}.${extension}`
    return url
  },
  getMesh: async function () {
    return new Promise((resolve) => {
      const mesh = this.el.object3DMap.mesh
      if (mesh) resolve(mesh)
      this.el.addEventListener(
        'image-loaded',
        () => {
          resolve(this.el.object3DMap.mesh)
        },
        { once: true }
      )
    })
  },
})
