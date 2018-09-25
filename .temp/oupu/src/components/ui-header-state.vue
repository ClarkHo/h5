<template>
  <header class="ui-header ui-header-stable ui-border-b">
      <h1 v-cloak>{{title}}</h1>
      <slot></slot>
  </header>
</template>
<script>
export default {
  props: ["title"]
}
</script>
