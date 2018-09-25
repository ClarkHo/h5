<template>
    <div class="ui-dialog" :class="{show: show}" @click="hideDialog">
        <div class="ui-dialog-cnt" @click="stopPropagation">
            <div class="ui-dialog-bd">
                <div class="ui-form-item ui-form-item-r has-imgcode">
                    <input type="text" v-model="imgcode" placeholder="请输入验证码">
                    <a href="javascript:void(0)" class="ui-icon-close" @click="imgcode = ''" v-show="imgcode"></a>
                    <span class="imgcode" :style="{'background-image': imgurl }" @click="updImgCode"></span>
                </div>
            </div>
            <div class="ui-dialog-ft ui-btn-group">
                <button type="button" class="select" :disabled="smsBtnDisabled" @click="smsSend">发送验证码</button>
            </div>
        </div>
    </div>
</template>
<script>
import Vue from "vue";
import config from "../../env/config.js";

export default {
    props: ["show", "mobile", "smsBtn", "smsBtnDisabled"],
    data: function () {
        return {
            waitingTime: 60,
            imgcode: '', //输入的图片验证码
            imgurl: ''  //图片地址
        };
    },
    watch: {
        "show": function (boo, oldBoo) {
            if(boo) {//每次打开的时候，刷新图片验证码
                this.updImgCode();
            }
        }
    },
    methods: {
        //隐藏菜单
        hideDialog: function () {
            this.imgcode = '';
            this.show = false;
        },
        //阻止冒泡
        stopPropagation: function (e) {
            e.stopPropagation();
        },
        //发送验证码
        smsSend: function () {
            if(!this.imgcode) {
                $.tips({
                    content: '请输入图片验证码',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!/^[a-zA-Z0-9]{4}$/.test(this.imgcode)) {
                $.tips({
                    content: '请正确输入4位验证码',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }

            this.smsBtnDisabled = true;
            this.smsBtn = this.waitingTime + 's';
            var inter = setInterval(() => {
                this.waitingTime--;
                this.smsBtn = this.waitingTime + 's';
                if(this.waitingTime === 0) {
                    this.smsBtn = '重新获取';
                    this.smsBtnDisabled = false;
                    this.waitingTime = 60;
                    clearInterval(inter);
                }
            },1000);
            var url = '/ouser-web/mobileRegister/sendCaptchasCodeForm.do';
            var param = {
                mobile: this.mobile,
                companyId: Vue.mallSettings.getCompanyId(),
                checkImageCode: this.imgcode,
                imgeKey: Vue.cookie.getCookie('imageKey')
            };
            Vue.api.postForm(url, param, (res) => {
                //验证码发送成功
                this.show = false;//隐藏图片验证码窗口
            }, (res) => {
                this.updImgCode();//刷新验证码
                var msg = '网络异常，请稍后再试';//系统异常
                if(res.code) {                 //非系统异常
                    msg = res.message;
                }
                $.tips({
                    content: msg,
                    stayTime: 2000,
                    type: "warn"
                });
                this.updImgCode();//刷新图片验证码
                this.smsBtn = '重新获取';
                this.smsBtnDisabled = false;
                this.waitingTime = 60;
                clearInterval(inter);
            })
        },
        //刷新验证码
        updImgCode: function () {
            this.imgurl = 'url("/ouser-web/mobileLogin/checkImageForm.do?width=160&height=60&codeNmInSession=vicode&codeCount=4&' + new Date().getTime() + '")';
            this.imgcode = '';
            this.imgtime = new Date().getTime();
        }
    }
}
</script>
