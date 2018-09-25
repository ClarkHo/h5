<template>
    <div class="ui-actionsheet" :class="{'show': showMore}" @click="hideActionsheet">
        <div class="ui-actionsheet-cnt ui-share" @click="stopPropagation">
            <ul class="ui-tiled" id="shares" v-if="!share">
                <li v-for="x in shareType" >
                    <div>
                    <i v-if="x.name=='新浪微博'" class="icons icons-share-SinaWeibo -mob-share-weibo" :class="styleObj"></i>
                    <i v-if="x.name=='QQ空间'" class="icons icons-share-QZone -mob-share-qzone"></i>
                    <i v-if="x.name=='QQ'" class="icons icons-share-QQ -mob-share-qq"></i>
                    <i v-if="x.name=='朋友圈'" class="icons icons-share-WechatMoments -mob-share-weixin"></i>
                    <i v-if="x.name=='微信'" class="icons icons-share-Wechat -mob-share-weixin"></i>
                    <i v-if="x.name=='二维码'" class="icons2 icons2-share-QCode " @click="creatQCode()"></i>
                    </div><span class="f10 c3">{{x.name}}</span>
                 </li>
            </ul>
            <ul class="ui-tiled" id="shares" v-if="share">
                <li v-for="x in shareType" >
                    <div>
                    <i v-if="x.name=='新浪微博'" @click="share(null,1)" class="icons icons-share-SinaWeibo -mob-share-weibo" :class="styleObj"></i>
                    <i v-if="x.name=='QQ空间'" @click="share(null,1)" class="icons icons-share-QZone -mob-share-qzone"></i>
                    <i v-if="x.name=='QQ'" @click="share(null,1)" class="icons icons-share-QQ -mob-share-qq"></i>
                    <i v-if="x.name=='朋友圈'" @click="share(null,1)" class="icons icons-share-WechatMoments -mob-share-weixin"></i>
                    <i v-if="x.name=='微信'" @click="share(null,1)" class="icons icons-share-Wechat -mob-share-weixin"></i>
                    <i v-if="x.name=='二维码'" class="icons2 icons2-share-QCode" @click="creatQCode()"></i>
                    </div><span class="f10 c3">{{x.name}}</span>
                 </li>
            </ul>
            <div class="divider ui-border-b"></div>
            <button class="f18 c6 ui-border-t" @click="hideActionsheet">取消分享</button>
        </div>
        <slot></slot>
    </div>
    <div class="share-mask hide" :class="{show: showArrow}" @click="hideActionsheet">
        <img class="arrow" src="${staticPath}/libs/res/icon/weixin_tips.png" alt="">
        <div class="inner">
            <p>点击右上角<br>将它分享到朋友圈<br>或指定的朋友</p>
        </div>
    </div>
    <div class="shareQCode hide" :class="{'show':showQCode}">
        <div class="-mob-share-weixin-qrcode-content" style="left: 47.5px; top: 133.4px; opacity: 1; transition-property: all; transition-duration: 0s;">
        <button class="-mob-share-weixin-qrcode-close" @click="showQCode = false" title="关闭">X</button>
        <p class="-mob-share-weixin-qrcode-header">使用手機【扫一扫】扫描下面的二维码</p>
        <img class="-mob-share-weixin-qrcode" id="QCode">
        </div>
        <div class="-mob-share-weixin-qrcode-bg" style="opacity: 0.7; transition-property: all; transition-duration: 0s;"></div>
    </div>
</template>
<style lang="less">
    .apply{
        border-bottom: 1px solid #ccc;
    }
    .not{
       font-size: 16px;
        margin: 6px 0;
    }
    #apply-now{
        width: 123px;
        height: 34px;
        background-color: #fd7b4f;
        text-align: center;
        margin-left: 130px;
        line-height: 34px;
        font-size: 12px;
        color: #fff;
        margin-bottom: 18px;
    }
    .explain{
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        color: #fff;
        z-index: 999;
        display:none;
        .pdL20{
            padding-left:20px;
        }
    }
    .showE{
        display:block!important;
    }
.share-mask{
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  color: #fff;
  z-index: 106;
  background: rgba(51,51,51,0.8);

  .inner{
    padding-top: 100px;
    margin-left: 30%;
    font-size: 18px;
  }
  .arrow{
    position: absolute;
    top: 20px;
    right: 25px;
    width: 70px;
  }

}
.shareQCode{
}
</style>
<script>
import Vue from "vue";
import QCode from "qrious";
export default {
    data: function () {
        return {
            showMore: false,
            showArrow: false,
            showE: false,
            showQCode:false
        }
    },
    props: ["show", "config", "callback", "shareType","share"],
    watch: {
        "show": function (boo, oldBoo) {
            if(boo) {
                if(Vue.browser.weixin()) {
                    this.showArrow = true;
                }else {
                    this.showMore = true;
                    this.initConfig();
                }
            }else {
                this.showArrow = false;
                this.showMore = false;
            }
        }
    },
    ready:function(){
        //前台没有传入配置信息是初始化部分四条信息
          if(!this.shareType){
            this.shareType = [{ name: '新浪微博' }, {  name: '朋友圈'}, {  name: '微信'},{name: '二维码' }]
          }
    },
    methods: {
        //二維碼分享
        creatQCode:function(){
            if(this.config && this.config.url){
                new QCode({
                    element: document.getElementById('QCode'),
                    size: 150,
                    value: this.config.url
                });
                this.showQCode = true;
            }
        },
        //隐藏菜单
        hideActionsheet: function () {
            this.show = false;
        },
        //阻止冒泡
        stopPropagation: function (e) {
            e.stopPropagation();
        },
        //初始化配置
        initConfig: function () {
            mobShare.config({
                debug: false, // 开启调试，将在浏览器的控制台输出调试信息
                appkey: '${appKey}', // appkey
                params: {
                    url: this.config.url, // 分享链接
                    title: this.config.title, // 分享标题
                    description: this.config.description, // 分享内容
                    pic: this.config.pic, // 分享图片，使用逗号,隔开
                    reason: this.config.reason //只应用与QZone与朋友网
                },
                /**
                 * 分享时触发的回调函数
                 * 分享是否成功，目前第三方平台并没有相关接口，因此无法知道分享结果
                 * 所以此函数只会提供分享时的相关信息
                 * 
                 * @param {String} plat 平台名称
                 * @param {Object} params 实际分享的参数 { url: 链接, title: 标题, description: 内容, pic: 图片连接 }
                 */
                callback: (plat, params) => {
                    if(typeof this.callback == 'function') {
                        this.callback(plat, params);
                    }
                }
            });
        }
    }
}
</script>
