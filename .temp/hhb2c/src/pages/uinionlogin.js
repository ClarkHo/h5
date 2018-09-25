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
        ut: '',
        showBindMobile: false,
        smsBtnDisabled: false,
        waitingTime: 60,
        startImgCode: false,            //启动图片验证码
        checkImageCode: '',             //图片验证码状态
        image: '',                      //验证码图片
        imgeKey: '',                    //验证码图片key
        sid: ''
    },
    ready: function() {
        this.unionLogin();
    },
    methods: {
        // 超限发送验证码
        overLimitSmsSend:function () {
            var url = '/ouser-web/mobileRegister/sendCaptchasCodeForm.do';
            var param = {
                mobile: this.user.mobile,
                captchasType :7,
                checkImageCode: this.checkImageCode,
                imgeKey: this.imageKey || '',
            };
            Vue.api.postForm(url, param, (res) => {
                //验证码发送成功
                this.startImgCode = false;//隐藏图片验证码窗口
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
                Vue.utils.showTips(res.message);
            }, (res) => {
                Vue.utils.showTips(res.message);
            })
        },
        cancel:function () {
            this.startImgCode = false;
        },
        // 获取图片验证码
        getImg: function () {
            var url = config.apiHost + '/ouser-web/mobileRegister/checkImageForm.do';
            var param = {
                width: 160,
                height: 60
            };
            Vue.api.postForm(url, param, (res) => {
                this.image = res.image;
                this.imageKey = res.imageKey;
            })
        },
        //刷新验证码
        updImgCode: function () {
            this.checkImageCode = '';
            this.getImg();
        },
        //发送验证码
        checkViCode: function () {
            if(!this.user.mobile || !/^[0-9]{11}$/.test(this.user.mobile)) {
                $.tips({
                    content: '请输入正确的手机号',
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
            var url = '/ouser-web/mobileRegister/sendCaptchasForm.do';
            var param = {
                mobile: this.user.mobile,
            };
            Vue.api.postForm(url, param, (res) => {
                //验证码发送成功
                // this.show = false;//隐藏图片验证码窗口
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
            if(!this.user.captchas || !/^[0-9]{4,6}$/.test(this.user.captchas)) {
                $.tips({
                    content: '请输入短信验证码',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            this.bindMobile();
        },
        //获取绑定手机号
        getBindMobile: function () {
            var param = {
                identityTypeCode : 4,
                mobile : this.user.mobile,
                captchas :this.user.captchas,
            }
            var url = config.apiHost + '/ouser-web/api/union/bindUnionMobile.do';
            Vue.api.get(url, param, (res) => {
                if(res.code == 0) {
                    $.tips({
                        content: '绑定成功',
                        stayTime: 2000,
                        type: "warn"
                    });
                }else {
                    this.showBindMobile = true;1
                }
            });
        },
        //绑定手机号
        bindMobile:function () {
            // 绑定手机号
            var url = config.apiHost + '/ouser-web/api/union/bindUnionMobile.do';
            var param = {
                mobile: this.user.mobile,
                captchas: this.user.captchas,
                sId:this.sId,
            };
            Vue.api.postForm(url, param, (res) => {
                if(res.code == 0){
                    Vue.utils.showTips("绑定成功");
                    if(Vue.cookie.getCookie("unite_login")){
                        let returnUrl = Vue.cookie.getCookie("unite_login");
                        Vue.cookie.delCookie("unite_login");
                        location.href = returnUrl;
                    } else {
                        location.href= 'index.html';
                    }
                }else{
                    Vue.utils.showTips(res.message);
                }
            },(res)=>{
                Vue.utils.showTips(res.message);
            });
        },
        unionLogin: function() {
            var param = Vue.utils.paramsFormat(window.location.href);
            if(param.needBind == "true"){
                Vue.auth.setUserToken(param.ut);
                this.showBindMobile = true;
                this.sId = param.sId;
            }else{
                Vue.auth.setUserToken(param.ut);
                if(Vue.cookie.getCookie("unite_login")){
                    let returnUrl = Vue.cookie.getCookie("unite_login");
                    Vue.cookie.delCookie("unite_login");
                    location.href = returnUrl;
                } else {
                    location.href= 'index.html';
                }
            }

        }
    }

});
