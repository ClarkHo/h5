import Vue from "vue";
import UiHeader from "../components/ui-header.vue";
import UiDialogCaptchas from "../components/ui-dialog-captchas.vue";
import config from "../../env/config.js";

var vm = new Vue({
    el: 'body',
    components: { UiHeader,UiDialogCaptchas },
    data: {
        spypasswd: 'text',      //显示密码
        spyconfirmPassword:'text',//显示确认密码
        step: 0,                    //步骤
        formUrl: '',                //来自url
        smsBtn: '获取验证码',       //验证码按钮value
        smsBtnDisabled: false,      //验证码按钮禁用
        sbmDisabled: false,         //防止重复提交
        vicodeDialog: false,        //显示图片验证码
        user: {
            mobile: '',             //手机号
            captchas: '',           //验证码
            password1: '',          //密码
            password2: ''           //确认密码
        },
        waitingTime: 60,

        startImgCode: false,            //启动图片验证码
        checkImageCode: '',             //图片验证码状态
        image: '',                      //验证码图片
        imgeKey: '',                    //验证码图片key
    },
    ready: function() {
        this.getFormUrl();
        //解决浏览器记住密码的功能
        setTimeout(() => {
            this.spypasswd = 'password';
            this.spyconfirmPassword = 'password';
        }, 200);
    },
    methods: {
        //返回事件
        backStep: function () {
            if(this.step == 0) {
                history.back();
            }else {
                this.step = 0;
            }
        },
        //下一步
        nextStep: function() {
            if(!this.user.mobile || !/^[0-9]{11}$/.test(this.user.mobile)) {
                $.tips({
                    content: '请输入正确的手机号',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!this.user.captchas || !/^[0-9]{4,6}$/.test(this.user.captchas)) {                
                $.tips({
                    content: '请输入6位数字验证码',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            //校验验证码
            var url = config.ouserHost + '/ouser-web/api/user/checkMobileCaptcha.do';
            var param = {
                mobile: this.user.mobile,
                captchas: this.user.captchas,
                companyId: Vue.mallSettings.getCompanyId(),
                captchasType:5
            };
            Vue.api.postForm(url, param, (res) => {
                this.step = 1;//切换到下一步
            },(res) => {
                var msg = '网络异常，请稍后再试';//系统异常
                if(res.code) {                 //非系统异常
                    msg = res.message;
                }
                $.tips({
                    content: msg,
                    stayTime: 2000,
                    type: "warn"
                });
            })
        },
        //提交注册
        submitForm: function () {
            if(!this.user.password1 || !/^[^\u2E80-\u9FFF]{6,18}$/.test(this.user.password1)) {
                $.tips({
                    content: '请输入6-18位英文、符号、数字',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!this.user.password2 || this.user.password1 != this.user.password2) {
                $.tips({
                    content: '两次密码输入不一致',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            this.sbmDisabled = true;
            var url = config.ouserHost + '/ouser-web/mobileRegister/modifyPasswordForm.do';
            var param = {
                companyId: Vue.mallSettings.getCompanyId(),
                mobile: this.user.mobile,
                password1: this.user.password1,
                //password1: hex_md5(this.user.password1),
                password2: this.user.password2,
                //password2: hex_md5(this.user.password2),
                captchas: this.user.captchas
            };
            Vue.api.postForm(url, param, (res) => {
                $.tips({
                    content: '密码修改成功',
                    stayTime: 2000,
                    type: "warn"
                });
                setTimeout(() => {
                    if(this.formUrl) {
                        location.href = '/login.html?from=' + this.formUrl;
                    }else {
                        location.href = '/login.html';
                    }
                }, 2000);
            }, (res) => {
                this.sbmDisabled = false;

                var msg = '网络异常，请稍后再试';//系统异常
                if(res.code) {                 //非系统异常
                    msg = res.message;
                }
                $.tips({
                    content: msg,
                    stayTime: 2000,
                    type: "warn"
                });
            })
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
            var url = config.ouserHost + '/ouser-web/mobileRegister/isRepeatPhoneForm.do';
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
                        this.smsSend();
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
        //发送验证码
        smsSend: function () {
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
                mobile: this.user.mobile,
                companyId: Vue.mallSettings.getCompanyId(),
                captchasType:5
            };
            Vue.api.postForm(url, param, (res) => {
                //验证码发送成功
                this.startImgCode = false;//隐藏图片验证码窗口
            }, (res) => {

                if(res.code == 913){
                    // 24小时内一个手机号最多发送30条短信，多则不发
                    Vue.utils.showTips('您今天发送的短信验证码已超限了哦');

                }else if(res.code == 914){
                    // 每小时内一个手机号发送超过10条，则需要图片验证码
                    Vue.utils.showTips('为了您的账户安全，请输入图片验证码再试');

                    // 显示图片验证码
                    this.startImgCode = true;
                    // 刷新图片验证码
                    this.updImgCode();

                }else if(res.code == 920){
                    // 每分钟手机最多一条验证码
                    Vue.utils.showTips('验证码已发送，请1分钟后再试');

                }else{
                    Vue.utils.showTips(res.message);

                };
                this.smsBtn = '重新获取';
                this.smsBtnDisabled = false;
                this.waitingTime = 60;
                clearInterval(inter);
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
