import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";

const urlParams = Vue.utils.paramsFormat(window.location.href);

new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        companyId: Vue.mallSettings.getCompanyId(),
        title: urlParams.t == 1 ? '伊点卡':'优惠券',
        mobile:'',
        captchas:'',
        shareCode: urlParams.marketingShareCode,
        sendBtnDisabled: false,//发送验证码按钮可点击
        sendCountDown: 60,//验证码发送倒计时
        sendCaptchasWords:'发送验证码',
        step: 0,
        isECard: urlParams.t == 1 ? true : false,
        ECard: {},//伊点卡信息
        coupon: {},//优惠券信息
        startImgCode: false,            //启动图片验证码
        checkImageCode: '',             //图片验证码状态
        image: '',                      //验证码图片
        imgeKey: '',                    //验证码图片key
        screenHeight:667
    },
    ready: function() {
       // this.firstSend();
       this.screenHeight = window.screen.availHeight;
    },
    methods: {
        cancel:function () {
            this.startImgCode = false;
            this.sendBtnDisabled = false;
        },
        //第一次init
        firstSend:function(){

            var url = '/ouser-web/api/user/init.do';
            var param = {
                mobile: this.mobile,
                initType:2,
                width: 160,
                height: 60,
            };
            Vue.api.postForm(url, param, (res) => {
                if(res.data.needImgCaptcha){
                    this.startImgCode = true;// 显示图片验证码
                    this.checkImageCode = '';
                    this.image = res.data.image;
                    this.imageKey = res.data.imageKey;
                }else{
                    this.smsSend();
                }

            })
        },
        //发送验证码
        smsSend: function () {
            this.sendBtnDisabled = true;
            this.sendCaptchasWords = this.sendCountDown + 's';
            var inter = setInterval(() => {
                this.sendCountDown--;
                this.sendCaptchasWords = this.sendCountDown + 's';
                if(this.sendCountDown === 0) {
                    this.sendCaptchasWords = '重新获取';
                    this.sendBtnDisabled = false;
                    this.sendCountDown = 60;
                    clearInterval(inter);
                }
            },1000);
            var url = '/ouser-web/mobileRegister/sendCaptchasCodeForm.do';
            var param = {
                mobile: this.mobile,
                companyId: Vue.mallSettings.getCompanyId(),
                captchasType:5
            };
            Vue.api.postForm(url, param, (res) => {
                //验证码发送成功
                this.startImgCode = false;//隐藏图片验证码窗口
                Vue.utils.showTips('验证码发送成功');
            }, (res) => {

                if(res.code == 913){
                    // 24小时内一个手机号最多发送30条短信，多则不发
                    Vue.utils.showTips('您今天发送的短信验证码已超限了哦');

                }else if(res.code == 914){
                    // 每小时内一个手机号发送超过10条，则需要图片验证码
                    Vue.utils.showTips('为了您的账户安全，请输入图片验证码再试');

                    // 显示图片验证码
                    //this.startImgCode = true;
                    // 刷新图片验证码
                    this.firstSend();

                }else if(res.code == 920){
                    // 每分钟手机最多一条验证码
                    Vue.utils.showTips('验证码已发送，请1分钟后再试');

                }else{
                    Vue.utils.showTips(res.message);

                };
                this.smsBtn = '重新获取';
                this.sendBtnDisabled = false;
                this.sendCountDown = 60;
                clearInterval(inter);
            })
        },
        // 超限发送验证码
        overLimitSmsSend:function () {
            if(!this.checkImageCode){
                Vue.utils.showTips('请输入图形验证码');
                return;
            }

            var url = '/ouser-web/mobileRegister/sendCaptchasCodeForm.do';
            var param = {
                mobile: this.mobile,
                captchasType :7,
                checkImageCode: this.checkImageCode,
                imgeKey: this.imageKey || '',
            };
            Vue.api.postForm(url, param, (res) => {
                //验证码发送成功
                this.startImgCode = false;//隐藏图片验证码窗口
                this.sendBtnDisabled = true;//禁用按钮
                this.sendCaptchasWords = this.sendCountDown + 's';//开始即时
                var timer = setInterval(() => {
                    this.sendCountDown--;
                    this.sendCaptchasWords = this.sendCountDown + 's';
                    
                    if(this.sendCountDown == 0) {
                        clearInterval(timer);
                        this.sendCaptchasWords = '重新获取';
                        this.sendBtnDisabled = false;
                        this.sendCountDown = 60;
                    }
                }, 1000);
                Vue.utils.showTips(res.message);
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
                    this.firstSend();

                }else if(res.code == 920){
                    // 每分钟手机最多一条验证码
                    Vue.utils.showTips('验证码已发送，请1分钟后再试');

                }else if (res.code == -2) {
                    this.firstSend();
                    Vue.utils.showTips(res.message);
                }else{
                    Vue.utils.showTips(res.message);
                };
            });
        },

        // 发送验证码
        sendCaptchasCodeForm:function () {
            if(!/^1(3|4|5|7|8)\d{9}$/.test(this.mobile)){
                $.tips({
                    content: '请输入正确的手机号',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            };
            this.firstSend();
           /* this.sendBtnDisabled = true;//禁用按钮
            this.sendCaptchasWords = this.sendCountDown + 's';//开始即时
            var timer = setInterval(() => {
                this.sendCountDown--;
                this.sendCaptchasWords = this.sendCountDown + 's';
                
                if(this.sendCountDown == 0) {
                    clearInterval(timer);
                    this.sendCaptchasWords = '重新获取';
                    this.sendBtnDisabled = false;
                    this.sendCountDown = 60;
                }
            }, 1000);

            let url = '/ouser-web/mobileRegister/sendCaptchasCodeForm.do';
            let param = {
                mobile: this.mobile,
                captchasType :7,
                checkImageCode: this.checkImageCode,
                imgeKey: this.imageKey || '',
            };
            Vue.api.postForm(url, param, (res) => {
                //验证码发送成功
                if(res.code==0){
                this.startImgCode = false;//隐藏图片验证码窗口
                this.sendBtnDisabled = true;
                this.smsBtn = this.sendCountDown + 's';
                var inter = setInterval(() => {
                    this.sendCountDown--;
                    this.smsBtn = this.sendCountDown + 's';
                    if(this.sendCountDown === 0) {
                        this.smsBtn = '重新获取';
                        this.sendBtnDisabled = false;
                        this.sendCountDown = 60;
                        clearInterval(inter);
                    }
                },1000);
                this.firstSend();
                Vue.utils.showTips(res.message);
                }
            }, (res)=> {
                if(res.code == 913){
                    // 24小时内一个手机号最多发送30条短信，多则不发
                    Vue.utils.showTips('您今天发送的短信验证码已超限了哦');

                }else if(res.code == 914){
                    // 每小时内一个手机号发送超过10条，则需要图片验证码
                    Vue.utils.showTips('为了您的账户安全，请输入图片验证码再试');

                    // 显示图片验证码
                   // this.startImgCode = true;
                    // 刷新图片验证码
                    this.firstSend();

                }else if(res.code == 920){
                    // 每分钟手机最多一条验证码
                    Vue.utils.showTips('验证码已发送，请1分钟后再试');

                }else{
                    Vue.utils.showTips(res.message);
                };
                clearInterval(timer);
                this.sendCaptchasWords = '重新获取';
                this.sendBtnDisabled = false;
                this.sendCountDown = 60;
            })*/
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
        // 校验验证码
        checkCaptchasForm:function () {
            if(!/^1(3|4|5|7|8)\d{9}$/.test(this.mobile)){
                $.tips({
                    content: '请输入正确的手机号',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            };

            if(!this.captchas){
                $.tips({
                    content: '请输入短信验证码',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            };

            let url = config.ouserHost + '/ouser-web/mobileRegister/checkCaptchasForm.do';
            let params = {
                mobile: this.mobile,
                captchas: this.captchas,
                companyId: this.companyId,
                captchasType : 7,
                nocache: new Date().getTime()
            };
            Vue.api.postForm(url, params, (res) => {
                this.receiveCoupon();
            });
        },
        // 领取优惠码
        receiveCoupon:function () {
            var url = config.apiHost + '/api/promotion/referralCode/receive';
            let param={
                type:1,//领取类型 1：分享领取 2：直接绑定	
                referralCodeIdStr:this.shareCode,
                cellNo:this.mobile,
                verifyCode:this.captchas
            }
            
            Vue.api.postForm(url, param, (res) => {
                if(this.isECard) {
                    this.ECard = res.data;

                }else {
                    this.coupon = res.data;
                }
                this.step = 1;
            },(res) => {
                // $.tips({
                //     content:res.message,
                //     stayTime:2000,
                //     type:"success"
                // });
                var dia=$.dialog({
                    title:'',
                    content:'<div class="text-center">'+ res.message +'</div>',
                    button:["去首页","取消"]
                });
                dia.on("dialog:action",function(e){
                    if(e.index == 0){
                        location.href = '/index.html';
                    }
                });
            });
        },
        //立即使用
        ImmediateUse: function () {
            if(Vue.browser.isApp()) {
                location.href = '${appSchema}://home';
            }else {
                location.replace('/index.html');
            }
        }
    }
});
