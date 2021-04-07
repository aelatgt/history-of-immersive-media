/* global AFRAME */

/*
 * Description
 * ===========
 * Allows play/plause of media elements via an external entity.
 * Similar to how a remote control triggers play/pause on a TV.
 *
 * Usage
 * =======
 * Attach this component to an external entity that will serve
 * as the "remote". 
 * 
 * Reference the media element using a selector in the component's "media" property
 * 
 * Example: 
 * <a-entity remote-media-player="media: #my-media-object"></a-entity>
 */

AFRAME.registerComponent("remote-media-player", {
    schema: {
      media: {
        type: "selector"
      }
    },
    init: function() {
      let media = this.data.media;
      this.el.addEventListener("click", function() {
        media.paused ? media.play() : media.pause();
      });
    }
  });