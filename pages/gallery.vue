<script setup lang="ts">
/**
 * Gallery page — redirects to the space section on the homepage.
 * The gallery now lives inline in SpaceSection with a lightbox overlay,
 * so this page simply forwards visitors who arrive via old links or bookmarks.
 */
definePageMeta({
  redirect: '/#space',
})
</script>
