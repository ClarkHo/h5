import Vue from "vue";
import UiHeader from "../components/ui-header.vue";
import UiDialogCaptchas from "../components/ui-dialog-captchas.vue";
import config from "../../env/config.js";

var vm = new Vue({
    el: 'body',
    components: { UiHeader,UiDialogCaptchas },
    data: {
        formUrl: '',                //来自url
        smsBtn: '获取验证码',       //验证码按钮value
        smsBtnDisabled: false,      //验证码按钮禁用
        sbmDisabled: false,         //防止重复提交
        vicodeDialog: false,        //显示图片验证码
        user: {
            mobile: '',             //手机号
            captchas: ''            //验证码
        }
    },
    ready: function() {
        this.checkLogin();
        this.getFormUrl();
    },
    methods: {
        //检查登录状态
        checkLogin: function () {
            var ut = Vue.auth.getUserToken();
            if(ut) {
                var url = '' + "/ouser-web/mobileLogin/getUserInfo.do";
                var params = {
                    ut: ut
                };
                Vue.api.get(url, params, (res) => {
                    location.href = "/index.html";//如果已登录跳转到首页
                });
            }
        },
        //登录
        login: function () {
            if(!this.user.mobile) {
                $.tips({
                    content: '请输入手机号',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!/^[0-9]{11}$/.test(this.user.mobile)) {
                $.tips({
                    content: '请输入11位有效手机号',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!this.user.captchas) {
                $.tips({
                    content: '请输入短信验证码',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(this.user.captchas.length < 6) {
                $.tips({
                    content: '短信验证码至少6位',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            this.loginDisabled = true;
            this.loginBtn = '登录中...';
            var url = '' + '/ouser-web/mobileLogin/loginForm.do';
            var param = {
                mobile: this.user.mobile,
                captchas: this.user.captchas,
                companyId: Vue.mallSettings.getCompanyId()//,
                //userPlatformId: config.userPlatformId
            };
            Vue.api.postForm(url, param, (res) => {
                Vue.auth.setUserToken(res.ut);
                var fromParam = "from=";
                var qInd = location.search.indexOf(fromParam);

                if (qInd < 0) {
                    location.href = '' + "/index.html";
                    this.loginDisabled = false;
                    this.loginBtn = '登录';
                } else {
                    var toUrl = decodeURIComponent(this.formUrl);
                    window.location.href = toUrl;
                    this.loginDisabled = false;
                    this.loginBtn = '登录';
                }
            }, (res) => {
                this.loginDisabled = false;
                this.loginBtn = '登录';

                var msg = '网络异常，请稍后再试';//系统异常

                if(res.code) {                 //非系统异常
                    msg = res.message;
                }
                $.tips({
                    content: msg,
                    stayTime: 2000,
                    type: "warn"
                });
            });
        },
        
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
            var url = '' + '/ouser-web/mobileRegister/isRepeatPhoneForm.do';
            var param = {
                companyId: Vue.mallSettings.getCompanyId(),
                mobile: this.user.mobile
            };
            Vue.api.postForm(url, param, (res) => {
                $.tips({
                    content: '该手机号还未注册!',
                    stayTime: 2000,
                    type: "warn"
                });
            }, (res) => {
                var msg = '网络异常，请稍后再试';//系统异常

                if(res.code) {                 //非系统异常
                    msg = res.message;

                    if(res.code == -1) {//手机号已注册
                        this.vicodeDialog = true;
                        return;
                    }
                }

                $.tips({
                    content: msg,
                    stayTime: 2000,
                    type: "warn"
                });
            })
        },
        //获取跳转以前的页面
        getFormUrl: function () {
            var fromParam = "from=";
            var qInd = location.search.indexOf(fromParam);

            if (qInd >= 0) {
                //获取重定向地址
                var url = location.search.substring(qInd + fromParam.length);
                this.formUrl = url;
            }
        }
    }
});
