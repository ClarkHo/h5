<template>
  <footer class="ui-footer ui-footer-stable ui-border-t" v-cloak v-if="show">
      <ul class="ui-tiled">
          <li :class="{'active': current==='index'}">
              <a href="/index.html">
                  <i class="icons icons-index blur"></i>
                  <i class="icons icons-index-red focus"></i>
                  <span class="name">首页</span>
              </a>
          </li>
          <li :class="{'active': current==='category'}">
                <a href="/category.html">
                    <i class="icons icons-category blur"></i>
                    <i class="icons icons-category-red focus"></i>
                    <span class="name">分类</span>
                </a>
            </li>
          <li :class="{'active': current===middle.name}" v-if="middle.showMiddle">
                <a :href="middle.url">
                    <i class="icons icons-{{middle.name}} blur"></i>
                    <i class="icons icons-{{middle.name}}-red focus"></i>
                    <span class="name">{{middle.title}}</span>
                </a>
            </li>
          <li :class="{'active': current==='cart'}">
              <a href="/cart.html">
                  <!-- <i class="icons4-footer icons4-cart blur"></i>
                  <i class="icons4-footer icons4-cart-red focus"></i> -->
                  <i class="icons icons-cart blur"><div class="ui-badge-cornernum bottom-cart" v-cloak v-if="count>0" :class="{'r50':count<10,'pdTips':9<count}">{{count>99?99+'+':count}}</div></i>
                  <i class="icons icons-cart-red focus"><div class="ui-badge-cornernum bottom-cart" v-cloak v-if="count>0" :class="{'r50':count<10,'pdTips':9<count}">{{count>99?99+'+':count}}</div></i>
                  <span class="name">购物车</span>
              </a>
          </li>
          <li :class="{'active': current==='mine'}">
              <a href="/my/home.html">
                  <i class="icons icons-home blur"></i>
                  <i class="icons icons-home-red focus"></i>
                  <span class="name">我</span>
              </a>
          </li>
      </ul>
  </footer>
</template>
<style lang="less">
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
</style>
<script>
import Vue from "vue";
import config from "../../env/config.js";
    var isApp = Vue.browser.isApp();
    export default {
        props: ["current","count"],
        data: function () {
          return {
            show: !isApp,
              config:config
          }
        },
        ready:function(){
           if(!isApp) {
                if(this.current!='cart') {
                  this.getCartCount();
                }
            }
        },
        computed:{
          middle:function(){return this.config.footer}
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
