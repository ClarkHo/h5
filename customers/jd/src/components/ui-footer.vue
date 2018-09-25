<template>
  <footer class="ui-footer ui-footer-stable ui-border-t" v-cloak v-if="show">
      <ul class="ui-tiled">
          <li :class="{'active': current==='index'}">
              <a href="/index.html">
                  <i class="icon icon-home blur"></i>
                  <i class="icon icon-home-on focus"></i>
                  <span class="name">首页</span>
              </a>
          </li>
          <li :class="{'active': current==='category'}">
                <a href="/category.html">
                    <i class="icon icon-classify blur"></i>
                    <i class="icon icon-classify-on focus"></i>
                    <span class="name">分类</span>
                </a>
            </li>
          <li :class="{'active': current==='serve'}">
                <a href="/serviceCenter/service-center.html">
                    <i class="icon icon-find blur"></i>
                    <i class="icon icon-find-on focus"></i>
                    <span class="name">服务</span>
                </a>
            </li>
          <li :class="{'active': current==='cart'}">
              <a href="/cart.html">
                  <!-- <i class="icons4-footer icons4-cart blur"></i>
                  <i class="icons4-footer icons4-cart-red focus"></i> -->
                  <i class="icon icon-cart blur"><div class="ui-badge-cornernum bottom-cart" v-cloak v-if="count>0">{{count>99?99+'+':count}}</div></i>
                  <i class="icon icon-cart-on focus"><div class="ui-badge-cornernum bottom-cart" v-cloak v-if="count>0">{{count>99?99+'+':count}}</div></i>
                  <span class="name">购物车</span>
              </a>
          </li>
          <li :class="{'active': current==='mine'}">
              <a href="/my/home.html">
                  <i class="icon icon-my blur"></i>
                  <i class="icon icon-my-on focus"></i>
                  <span class="name">我的</span>
              </a>
          </li>
      </ul>
  </footer>
</template>
<style lang="less">
@import (reference) "../common/variables.less";
    .jiaobiao{
        padding: 0 4px !important;
        min-width: 11px !important;
    }
    .ui-badge-cornernum{
        min-width: 7px;
    }
    .pdTips{
        padding: 0 6px;
        height: 16px;
        min-width: 11px;
        line-height: 16px;
    }
    .r50{
        border-radius: 50%;
        -webkit-border-radius: 50%;
    }
    /* 底部 */
.ui-footer{
    height:50px;
  .ui-tiled{
    height: 100%;

    li{
      height: 100%;
      font-size: 0;

      a{
        display: block;
        width: 100%;
        height: 100%;
        color: @fontColor;
      }
      .icon{
        display: block;
      }
      .name{
        font-size: 12px;
        line-height: 1;
      }
      .focus{
        display: none;
      }
      &.active{
        .blur{
          display: none;
        }
        .focus{
          display: block;
        }
        a{
          color: @themeColor;
        }
      }
    }
  }
}
</style>
<script>
import Vue from "vue";
    var isApp = Vue.browser.isApp();
    export default {
        props: ["current","count"],
        data: function () {
          return {
            show: !isApp
          }
        },
        ready:function(){
           if(!isApp) {
                if(this.current!='cart') {
                  this.getCartCount();
                }
            }
        },
        methods: {
            //获取购物车数目
            getCartCount:function(){
                "use strict";
                //不用统一处理，防止99跳登录
                Vue.http.post('/api/cart/count', {
                  ut: Vue.auth.getUserToken(),
                  sessionId: Vue.session.getSessionId()
                }, {
                  emulateJSON: true
                }).then((result) => {
                  this.count=result.data.data;
                });
            }

        }
    }
</script>

<style>

</style>
