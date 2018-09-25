import Vue from "vue";
import UiHeader from "../components/ui-header.vue";
import config from "../../env/config.js";

let urlParams = Vue.utils.paramsFormat(window.location.href);

var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        step: 0,
        showTalk:false,//步骤
        spypasswd: 'text',          //显示密码
        spyconfirmPassword:'text',  //显示确认密码
        fromUrl: decodeURIComponent(urlParams.from || urlParams.fromUrl || ''),   //跳转之前的url
        smsBtn: '获取验证码',       //验证码按钮value
        smsBtnDisabled: false,      //验证码按钮禁用
        sbmDisabled: false,         //防止重复提交
        user: {
            mobile: '',             //手机号
            captchas: '',           //验证码
            password: '',           //密码
            confirmPassword: '',    //确认密码
            inviteMobile: '',       //邀请人手机号
            inviteCode: '',          //分享码
            identityTypeCode: '4' //C端会员
        },
        reg_protocol: '' ,           //注册协议链接
        waitingTime: 60,

        startImgCode: false,            //启动图片验证码
        checkImageCode: '',             //图片验证码状态
        image: '',                      //验证码图片
        imgeKey: '',                    //验证码图片key
	    inviteFlag: false, //通过分享链接过来的用户标识
        adRegis_flag:false, //首页广告点击注册标识
        friend: '',        //亲友号传值
        invitingPage:urlParams.inviting,
        friendCode:false,
        isName:'',
        getShareName:""
    },
    //亲友号本地存储数据
    created:function(){
    	this.friend=localStorage.getItem("setname");
       if(this.friend!=""){
          	this.friend=true;
          }else{
          	this.friend=false;
          }
    },
    computed:{
        title:function(){
            if(this.invitingPage == 1){
                return this.step == 1 ? '设置密码' : '注册成为欧普会员';
            }else{
                return this.step == 1 ? '设置密码' : '注册';
            }
        }
    },
    ready: function() {
        // if(Vue.distribution.getInviterShareCode()) {
        //     //this.showInviteMobile = false;
        //     Vue.distribution.loadCurrentDistributionData((data)=>{
        //         if(data && data.mobile){
        //             this.user.inviteMobile = data.mobile;
        //             this.inviteFlag = true;
        //         }
        //     });
        // }
        //解决浏览器记住密码的功能
        setTimeout(() => {
            this.spypasswd = 'password';
            this.spyconfirmPassword = 'password';
        }, 200);
        //一次性的标识，防止用户去登录后回到首页也弹出自己的优惠券
        if(Vue.sessionStorage.getItem('adRegis')){
            this.adRegis_flag = true;
            Vue.sessionStorage.removeItem('adRegis');
        }
        this.getRegisText();//获取注册协议
        
      
   //判断注册用户名
	    this.isName=urlParams.setName
	    function getQueryString(name) {   
	      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");   
	      var r = window.location.search.substr(1).match(reg);   
	      if (r != null) return decodeURI(r[2]); return null;   
	    }      
        this.isName=getQueryString('setName')     
        if(this.isName=='undefined'){
      	    this.isName=false;
        }
        this.getShareCode()
	},
    
    methods: {
        getShareCode:function(){
            if(urlParams.shareCode){
                this.getShareName=decodeURI(urlParams.shareName);
            }
        },
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
                    content: '请输入短信验证码',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            //提交注册
            var url = config.ouserHost + '/ouser-web/api/user/checkMobileCaptcha.do'; 
            var param = {
                companyId: Vue.mallSettings.getCompanyId(),
                mobile: this.user.mobile,
                captchas: this.user.captchas,
                //password: this.user.password,
                confirmPassword: this.user.confirmPassword,
                //  inviteMobile: this.user.inviteMobile,
                inviteCode: Vue.cookie.getCookie('shareCode'),
                shareCode: Vue.cookie.getCookie('shareCode'),
                deviceId:"H5"
            };
            Vue.api.postForm(url, param, (res) => {
                //注册成功，code为0
                this.step = 1;  //切换到下一步
            }, (res) => {
                // 注册成功，code为0
                var msg = '网络异常，请稍后再试';//系统异常
                
                if(res.code) {                 //非系统异常
                    msg = res.message;

                    if(res.code == "0") {      //0注册成功
                        msg = "注册成功";
                        //标识是首页广告点击过来注册的用户
                        if(this.adRegis_flag){
                            Vue.sessionStorage.setItem('adRegisBack',1);
                        }
                        if(res.isPwd){ //这个判断没有意义
                            if (!this.fromUrl) {
                                location.href = config.contextPath + "/index.html";
                            }else {
                                var toUrl = this.fromUrl;
                                window.location.href = toUrl;
                            }
                        }else{
                            this.step = 1;//切换到下一步
                        }
                    }else {
                        this.sbmDisabled = false;
                    }
                }else {
                    this.sbmDisabled = false;
                }

                $.tips({
                    content: msg,
                    stayTime: 2000,
                    type: "warn"
                });

            });
        },
        getRegisText: function () {
            var url = config.apiHost + '/api/dolphin/list';
            var param = {
                platform: config.platform,
                pageCode: 'H5_HOME',
                adCode: 'reg_protocol',
                companyId: this.companyId,
                areaCode: Vue.area.getArea().aC,
            };
            Vue.api.get(url, param, (res) => {
                this.reg_protocol = res.data.reg_protocol[0].linkUrl || '';
            }, () => {
                //处理掉不显示报错
            });
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
            var url = config.ouserHost + '/ouser-web/api/user/checkAccountRepeat.do'; 
            var param = {
                companyId: Vue.mallSettings.getCompanyId(),
                mobile: this.user.mobile
            };
            Vue.api.postForm(url, param, (res) => {
                //验证手机号未注册
                this.smsSend();//显示
            }, (res) => {
                //验证手机号是否已注册
                if(res.code == 2)
                $.tips({
                    content: '该手机号已注册立即登录',
                    stayTime: 2000,
                    type: "warn"
                });
                setTimeout(function () {
                    location.href = config.contextPath + "/login.html";
                }, 3000);
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
                captchasType :1
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
        //刷新验证码
        updImgCode: function () {
            this.imgtime = new Date().getTime();
            this.checkImageCode = '';
        },
        //提交注册
        setPassword: function () {
            this.sbmDisabled = true;
            var url = config.ouserHost + '/ouser-web/api/user/register.do'; 
            var param = {
                mobile: this.user.mobile,
                password: this.user.password,
                inviteMobile: this.user.inviteMobile,
                captchas: this.user.captchas,
                identityTypeCode: this.user.identityTypeCode,
                shareCode: Vue.cookie.getCookie('shareCode'),
                platformId:config.platformId
            };
            Vue.api.postForm(url, param, (res) => {
                $.tips({
                    content: "密码设置成功",
                    stayTime: 2000,
                    type: "warn"
                });
                this.login();
                try{
                    window.eventSupport.emit('heimdallTrack',{
                        ev: "5"
                    });
                }catch(err){
                    console.log(err);
                }
            }, (res) => {
                var msg = '网络异常，请稍后再试';//系统异常
                if(res.code) {                 //非系统异常
                    msg = res.message;
                }else {
                    this.sbmDisabled = false;
                }
                $.tips({
                    content: msg,
                    stayTime: 2000,
                    type: "warn"
                });
            })
        },
        //登录
        login: function () {
            var url = config.ouserHost + '/ouser-web/api/user/login.do'; 
            var param = {
                username: this.user.mobile,
                password: this.user.password,
                companyId: Vue.mallSettings.getCompanyId(),
                initType: 0
            };
            Vue.api.postForm(url, param, (res) => {
                this.sbmDisabled = false;
                Vue.auth.setUserToken(res.ut);
                if (!this.fromUrl) {
                    location.href = config.contextPath + "/index.html";
                }else {
                    var toUrl = this.fromUrl;
                    window.location.href = toUrl;
                }
            }, (res) => {
                this.sbmDisabled = false;
                $.tips({
                    content: '自动登录失败，请手动去登录',
                    stayTime: 2000,
                    type: "warn"
                });
                setTimeout(function () {
                    location.href = config.contextPath + "/login.html";
                }, 2000);
            });
        },
        // 超限发送验证码
        overLimitSmsSend:function () {
            var url = '/ouser-web/mobileRegister/sendCaptchasCodeForm.do';
            var param = {
                mobile: this.user.mobile,
                captchasType :1,
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
        // 验证邀请人手机号是否注册
        judgeRegis:function (params) {
            if(!this.user.password || !/^[^\u2E80-\u9FFF]{6,18}$/.test(this.user.password)) {
                Vue.utils.showTips('密码6-16个字符');
                return;
            }
            if(!this.user.confirmPassword || this.user.password != this.user.confirmPassword) {
                Vue.utils.showTips('两次密码输入不一致')
                return;
            }
            //判断 通过分享链接过来的用户
            if(!this.inviteFlag){
                if(this.user.inviteMobile && !/^[0-9]{11}$/.test(this.user.inviteMobile)) {
                    Vue.utils.showTips('邀请人手机号格式错误');
                    return;
                }
                var url = config.ouserHost + '/ouser-web/mobileRegister/isRepeatPhoneForm.do';
                var param = {
                    companyId: Vue.mallSettings.getCompanyId(),
                    mobile: this.user.inviteMobile
                };
                Vue.api.postForm(url, param, (res) => {
                    Vue.utils.showTips('推荐人不存在');
                    return ;
                },(res) => {
                    this.setPassword()
                }) 
            } else{
                this.setPassword()
            }
        }
    }
});
