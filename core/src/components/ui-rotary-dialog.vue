<template>
<div class="ui-dialog ui-rotary-dialog" :class="{show: show}">
    <div class="ui-dialog-cnt">
        <slot></slot>
        
    </div>
    <div class="close">
    <img src="${staticPath}/images/lottery-close.png?v=${version}" @click="close" alt="">
    </div>
</div>
</template>

<script>
export default {
    props: ["show"],
    methods: {
      //关闭弹窗
      close: function () {
          this.show = false;
          this.$emit("close");
      }
    }
}
</script>

