<template>
  <div class="prod-like" v-if="data.length > 0" @touchstart="$event.stopPropagation()">
    <h5 class="tit"><i :class="icons"></i>{{title}}</h5>
    <div id="likeSlider" class="swipe">
        <div class="swipe-wrap">
            <figure v-for="reco in data" >
                <ul class="ui-grid-halve ui-border-t">
                    <li v-for="r in reco">
                        <div class="ui-grid-halve-img bgf" id='resizeImg'>
                            <img :src="r.url300x300" v-link-to="'/detail.html?itemId=' + r.mpId">
                            <p class="f14 c3 ui-nowrap">{{r.mpName}}</p>
                            <!--<p class="mgT10"><span class="f14 cf disIB pd3 bgff4444 radiusAll4">满减</span></p>-->
                            <p class="f12 theme" style="height: 22px;">
                                <!--<span class="marR5" v-for="tag in r.tagList">{{tag.tagName}}</span>-->
                                <template v-if="r.tagList">
                                    <span class="promotion-icon-text" v-for="tag in r.tagList | limitBy 4">{{tag.tagName}}</span> 
                                </template>
                            </p>
                            <p class="price ui-nowrap f14">
                                 <span v-if="r.availablePrice">{{r.availablePrice | currency '¥'}}</span>
                                <span v-if="!r.availablePrice">{{r.originalPrice | currency '¥'}}</span>
                                <del class="f10 c9 marL10" v-if="r.availablePrice">{{r.originalPrice | currency '¥'}}</del> 
                            </p>
                            <!--<p style="height: 18px;"><del class="f10 c9" v-if="r.availablePrice">{{r.originalPrice | currency '¥'}}</del></p>-->
                            <!-- <div class="add-to-cart" @click="addItemInCart(r)">
                                <i class="lyf-icons lyf-cartRed"></i>
                            </div> -->
                        </div>
                    </li>
                </ul>
            </figure>
        </div>
        <ul class="swipe-point">
            <li :class="{active: $index == 0}" v-for="reco in data"></li>
        </ul>
    </div>
</div>

</template>
  
<style lang="less">
@import (reference) "../common/variables.less";
  /*猜你喜欢*/
.prod-like{
  position: relative;
  margin-top: 36px;

  .tit{
    position: absolute;
    width: 130px;
    height: 40px;
    line-height: 40px;
    top: -20px;
    left: 50%;
    margin-left: -65px;
    background-color: @mainBackColor;
    text-align: center;
    z-index: 9;
    font-size: 15px;
     i{
       margin-right: 5px;
     }
  }
  .swipe {
    position: relative;
    visibility: hidden;
    overflow: hidden;
    height: inherit;

    .swipe-wrap {
        overflow: hidden;
        position: relative;

        > figure {
        float: left;
        width: 100%;
        position: relative;
        }
        .promotion-icon-text{
            color: #fff;
            display: inline-block;
            background: @themeColor;
            padding: 0 2px; 
        }
    }

    .swipe-point{
        width: 80px;
        margin: 0 auto 20px auto;
        text-align: center;
        height: 24px;
        background-color: white;
        //bottom: 0;
        //left: 50%;
        //transform: translateX(-50%);
        border-radius: 10px;

        li{
        display: inline-block;
        width: 7px;
        height: 7px;
        margin: 0 2px;
        border-radius: 4px;
        background-color: #d6d6d6;
        }
        .active{
        background-color: @themeColor;
        }
    }
}

  .ui-grid-halve{
    padding: 20px 5px 10px 15px;

    li{
      padding-right: 10px;
      height:auto;
    }

    .originalPrice{
      padding-top: 0px;
    }

    .mainprice{
      font-size: 16px;
    }

    .add-to-cart{
      position: absolute;
      right: 6px;
      bottom: 6px;
    }
  }
}
</style>
<script>
import Vue from "vue";
    export default {
        props: ["data","title","icons"],
        data: function () {
          return {
            
          }
        },
        watch:{
            'data':function(val,old){
                if(val.length > 0){
                    this.initSwiper();
                }
            }
        },
        ready:function(){
        },
        methods: {
            initSwiper:function () {
                Vue.nextTick( () => {
                    var points = $('#likeSlider .swipe-point li');
                    Swipe(document.getElementById('likeSlider'), {
                        auto: false,
                        continuous: true,
                        disableScroll: false,
                        callback: function (i, ele) {
                            points.removeClass('active').eq(i).addClass('active');
                        }
                    });
                    this.resizeImgHeight();
                })
            },
            // 重置晒图图片大小
            resizeImgHeight: function () {
                Vue.nextTick(function () {
                    var width = $('#resizeImg img').width();
                    $('#resizeImg img').height(width);
                })
            },
        }
    }
</script>