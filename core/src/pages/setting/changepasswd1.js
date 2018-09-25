import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";

var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        smsBtn: '获取验证码',       //验证码按钮value
        smsBtnDisabled: false,      //验证码按钮禁用
        sbmDisabled: false,         //防止重复提交
        user: {
            mobile: '',             //手机号
            captchas: '',           //验证码
            inviteCode: ''  ,        //分享码
            password: '',               //原密码
            password1: '',              //新密码
            password2: ''              //确认密码
        },
        waitingTime: 60,
        step: 0,
        spypasswd: 'text',      //显示密码
        spyconfirmPassword:'text',//显示确认密码
        showTalk:false,
        startImgCode: false,            //启动图片验证码
        checkImageCode: '',             //图片验证码状态
        image: '',                      //验证码图片
        imgeKey: '',                    //验证码图片key
        readOnly:false,//如果拿到了缓存的用户手机号，则手机号不可修改，只读
    },
    ready: function() {
        //解决浏览器记住密码的功能
        setTimeout(() => {
            this.spypasswd = 'password';
            this.spyconfirmPassword = 'password';
        }, 200);
        if(Vue.localStorage.getItem('username')){
            this.user.mobile = Vue.localStorage.getItem('username');
            this.readOnly = true;
        }
    },
    methods: {
        // 超限发送验证码
        overLimitSmsSend:function () {
            var url = '/ouser-web/mobileRegister/sendCaptchasCodeForm.do';
            var param = {
                mobile: this.user.mobile,
                captchasType :5,
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
            //校验手机号是否已注册
            var url = config.ouserHost + '/ouser-web/mobileRegister/isRepeatPhoneForm.do';
            var param = {
                companyId: Vue.mallSettings.getCompanyId(),
                mobile: this.user.mobile
            };
            Vue.api.postForm(url, param, (res) => {
                //验证手机号未注册
                $.tips({
                    content: '该手机号还未注册',
                    stayTime: 2000,
                    type: "warn"
                });
            }, (res) => {
                //验证手机号是否已注册
                if(res.code == -1)
                    this.smsSend();//显示
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
        //提交注册
        nextStep: function () {
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

            var url = config.ouserHost + '/ouser-web/mobileRegister/checkCaptchasForm.do';
             var param = {
                 mobile: this.user.mobile,
                 captchas: this.user.captchas
             };
             Vue.api.postForm(url, param, (res) => {
                if(res.code == 0){
                    this.step=1;
                }
             })
        },
        modifyPassword: function () {
            // if(!this.password) {
            //     $.tips({
            //         content: '请输入旧密码',
            //         stayTime: 2000,
            //         type: "warn"
            //     });
            //     return;
            // }
            if(!this.user.password1) {
                $.tips({
                    content: '请输入新密码',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!this.user.password2) {
                $.tips({
                    content: '请输入确认密码',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if( !/^[^\u2E80-\u9FFF]{6,18}$/.test(this.user.password1) || !/^[^\u2E80-\u9FFF]{6,18}$/.test(this.user.password2)) {
                $.tips({
                    content: '密码6-18个字符',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!this.user.password1 || this.user.password1 != this.user.password2) {
                $.tips({
                    content: '前后两次输入新密码不一致',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            this.sbmDisabled = true;
            var url = config.ouserHost + '/ouser-web/mobileRegister/modifyPasswordForm.do';
            var param = {
                password1: this.user.password1,
                password2: this.user.password2,
                ut:Vue.auth.getUserToken()
            };
            Vue.api.postForm(url, param, (res) => {
                $.tips({
                    content: '密码修改成功',
                    stayTime: 2000,
                    type: "warn"
                });
                setTimeout(() => {
                    window.location.href = config.contextPath + "/my/home.html";
                }, 2000);
            },(res) => {
                this.sbmDisabled = false;
                $.tips({
                    content: res.message,
                    stayTime: 2000,
                    type: "warn"
                });
                // setTimeout(() => {
                //     location.href = '/setting/changepasswd1.html';
                // }, 3000);

            });
        }
    }
});
