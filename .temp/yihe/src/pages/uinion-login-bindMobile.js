import Vue from "vue";
import UiHeader from "../components/ui-header.vue";
import UiDialogCaptchas from "../components/ui-dialog-captchas.vue";
import config from "../../env/config.js";

var state = Vue.utils.paramsFormat(window.location.href).state;
var code = Vue.utils.paramsFormat(window.location.href).code;

var vm = new Vue({
    el: 'body',
    components: { UiHeader,UiDialogCaptchas},
    data: {
        user: {
            mobile: '',
            captchas: ''
        }, //用户信息
        smsBtn: '获取验证码',      //验证码按钮value
        vicodeDialog: false,       //显示图片验证码
        ut: ''
    },
    ready: function() {

    },
    methods: {

        //显示图片验证码
        showImgViCode: function () {
            if(!this.user.mobile || !/^[0-9]{11}$/.test(this.user.mobile)) {
                $.tips({
                    content: '请输入正确的手机号',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            //校验手机号是否已注册
            // var url = '' + '/ouser-web/mobileRegister/isRepeatPhoneForm.do';
            // var param = {
            //     companyId: Vue.mallSettings.getCompanyId(),
            //     mobile: this.user.mobile
            // };
            // Vue.api.postForm(url, param, (res) => {
            //     //手机号未绑定
            //     this.vicodeDialog = true;
            // })
            this.vicodeDialog = true;
        },
        //绑定手机号
        ckBindMobile: function () {
            if(!this.user.mobile || !/^[0-9]{11}$/.test(this.user.mobile)) {
                $.tips({
                    content: '请输入正确的手机号',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!this.user.captchas || this.user.captchas.length != 6) {
                $.tips({
                    content: '请输入6位短信验证码',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }

            // 校验验证码是否正确
            // var captchasUrl = '' + '/ouser-web/mobileRegister/checkCaptchasForm.do';
            // var captchasParam = {
            //     mobile: this.user.mobile,
            //     captchas: this.user.captchas,
            //     companyId: Vue.mallSettings.getCompanyId()
            // };
            // Vue.api.postForm(captchasUrl, captchasParam, (res) => {
            //     this.bindMobile();
            // });

            this.unionLogin();
        },
        bindMobile:function () {
            // 绑定手机号
            var url = "" + '/api/my/user/bindMobile.do';
            var param = {
                ut: this.ut,
                mobile: this.user.mobile,
                captchas: this.user.captchas
            };
            Vue.api.postForm(url, param, (res) => {
                this.bindState = res.data.result;
                if(this.bindState){
                    $.tips({
                        content: '绑定成功',
                        stayTime: 2000,
                        type: "warn"
                    });
                    Vue.auth.setUserToken(this.ut);
                    location.href= 'index.html';
                }else{
                    $.tips({
                        content: '绑定失败',
                        stayTime: 2000,
                        type: "warn"
                    });
                }

            });
        },
        unionLogin: function() {
            var params = {
                code: code,
                state: state
            };
            Vue.api.postForm('' + "/ouser-web/unionLogin/login.do", params, (result) => {
                this.ut = result.ut;
                this.bindMobile();
            });
        }
    }

});
