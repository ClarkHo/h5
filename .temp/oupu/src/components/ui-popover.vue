<template>
    <div class="xui-popover" :class="{'active':show}">
        <div class="xui-popover-inner">
            <i class="arrow"></i>
            <slot></slot>
        </div>
    </div>
</template>
<script>
import Vue from "vue";

export default {
    props: [
      //是否显示，取值true，false
      "show"
    ],
    methods: {
        hide: function () {
             this.show = false;
        }
    }
}
</script>
<style lang="less">
    .xui-popover{
      display: none;
      position: relative;
      background: transparent;
      z-index: 120;

      .xui-popover-inner{
        position: absolute;
        top: 40px;
        right: 0;
        min-width: 80px;
        opacity: 0.9;
        line-height: 40px;
        border-radius: 4px;
        background-color: #3d3d3d;
        transition: right 0.4s;
        -webkit-transition: right 0.4s;

        .arrow{
          position: absolute;
          top: -5px;
          right: 10px;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-bottom: 5px solid #3d3d3d;
          font-size: 0;
          line-height: 0;
        }

        a{
          display: block;
          text-align: center;
          color: #fff;

          &.active {
            color: #ff6900;
          }

          .icon{
            margin-right: 5px;
          }

        }
        
      }

      &.active{
        display: block;
      }
    }
</style>