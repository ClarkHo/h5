import Vue from "vue";
import UiHeader from "../components/ui-header.vue";
import config from "../../env/config.js";

let urlParams = Vue.utils.paramsFormat(window.location.href);

var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        spypasswd: 'text',              //显示密码
        loginBtn: '登录',               //登录按钮显示内容
        loginDisabled: false,           //登录按钮禁用
        checkDisabled: true,            //检查输入内容
        checkExistsDisabled: true,      //是否重复
        imgtime: new Date().getTime(),  //当前时间毫秒
        username: '',                   //手机号
        password: '',                   //密码
        startImgCode: false,            //启动图片验证码
        checkImageCode: '',             //验证码
        // formUrl: '',                    //跳转之前的url
        iconInvisible: {},              //联合登陆可用控制
        isWeixin: Vue.browser.weixin(),
        supportDistribution: false,//是否支持分销功能
        loginTab:1,
        formUrl: decodeURIComponent(urlParams.from || urlParams.fromUrl || ''),
        smsBtn: '获取验证码',
        smsBtnDisabled: false,      //验证码按钮禁用
        sbmDisabled: false,         //防止重复提交
        vicodeDialog: false,        //显示图片验证码
        showpassword:false,          //判定用户是否需要输入密码
        sId : "",
        user: {
            mobile: '',             //手机号
            captchas: '',            //验证码
            password: '',           //密码
            confirmPassword: '',    //确认密码
            bindMobile:'',         //初次登录绑定手机号
            bindCaptchas:'',       //绑定手机的验证码
            startImgCode: false,   //启动图片验证码
            checkImageCode: ''     //验证码

        },
        waitingTime: 60,
        step:0,
        spypasswds: 'text',          //显示密码
        spyconfirmPassword:'text',  //显示确认密码
        showFoucsWeixin:false,      //显示关注微信弹窗
        uniteLoginFlag:false,//联合登录显示判断
        friend: '',
        friendCode:false,
        shareCode:"",
        setname:"",
        inviteUserLimit:""
        
    },
    
    computed: {
        //图片验证码地址
        imgurl: function () {
            return 'url("'+ config.ouserHost +'/ouser-web/mobileLogin/checkImageForm.do?width=160&height=60&codeNmInSession=vicode&codeCount=4&' + this.imgtime + '")';
        }
    },
    ready: function() {
        //进入该页面会判断ut数量，如果有超过2个ut，则肯定有一个无效ut，需要清除所有ut
        Vue.cookie.delUt();
        this.getInit();
        //去除检查登录机制
        // this.checkLogin();
        // this.getFormUrl();
        $('#focusInput').focus();
        //读取本地存储的 上次登录成功的账号
        if(localStorage.username) {
            this.username = localStorage.username;
            console.log(this.username);          
        }
        
        //查询联合登录方式
        this.getIconInvisible();

        //this.checkWrongNum();
        //解决浏览器记住密码的功能
        setTimeout(() => {
            this.spypasswd = 'password';
        }, 200);
        if(this.username){
            this.checkExists();
        }

        //对fromUrl做安全处理
        Vue.utils.safeDomainCheck(this.formUrl,(res) => {
            if(!res){
                this.formUrl = '/index.html';
            }
        })
    },
    watch: {
        //当密码为不可见状态，得到焦点清空密码
        'spypasswd': function (val, old) {
            if(val == 'password') {
                $('#passwdInput')[0].addEventListener('focus', this.clearPassword);
            }else {
                $('#passwdInput')[0].removeEventListener('focus', this.clearPassword);
            }
        }
    },
    methods: {
        //检查是否支持分销功能
        checkSupportDistribution: function () {
            var params = { data: { companyId: this.companyId, mainModule:"AGENT_MODULE",subModule:""} };
            Vue.api.post("/osc-api/getModuleController.do", params, (result) => {
                this.supportDistribution = result.resultData == 1;
            });
        },
        // 联合登陆
        // 1、获取联合登录跳转链接
        getRelatedParams: function(type) {
            var url = config.ouserHost + '/ouser-web/api/union/getLoginParamsURL.do';
            var redirectUrl = "http://"+window.location.host + "/unionlogin.html";
            var params = {
                unionType : type,
                redirectURL: redirectUrl,
                platformType:3
            };
            if(urlParams.from){
                // redirectUrl += '?from=' + encodeURIComponent(urlParams.from);
                if(Vue.cookie.getCookie("unite_login")){
                    Vue.cookie.delCookie("unite_login");
                }
                Vue.cookie.setCookie('unite_login',decodeURIComponent(urlParams.from));
            }
            Vue.api.postForm(url, params, (res) => {
                location.href = res.data;
            });
        },
        // 图标展示控制接口
        getIconInvisible: function() {
            var params = {};
            Vue.api.post(config.ouserHost + "/ouser-web/api/union/getUnionTypeStatus.do", params, (result) => {
                this.iconInvisible = result.data;
                this.uniteLoginFlag = !$.isEmptyObject(result.data);
            });
        },

        //清除密码
        clearPassword: function () {
            this.password = '';
        },
        //输错5次启用图片验证码
        checkWrongNum: function () {
            var nowTime = localStorage.nowTime;
            var errNum = localStorage.errNum;
            if(typeof nowTime == 'undefined') {
                localStorage.nowTime = new Date().getTime();
            }
            if(typeof errNum == 'undefined') {
                localStorage.errNum = 0;
            }
            errNum = errNum*1 + 1;
            localStorage.errNum = errNum;
            //第一次输错计时
            var countdown = new Date().getTime() - nowTime;

            if(countdown <= 1000*60*30 && errNum >= 5) {
                this.startImgCode = true;
            }
        },
        //刷新验证码
        updImgCode: function () {
            this.imgtime = new Date().getTime();
            this.checkImageCode = '';
        },
        //检查登录状态
        checkLogin: function () {
            var ut = Vue.auth.getUserToken();
            if(ut) {
                var url = config.ouserHost + "/ouser-web/mobileLogin/getUserInfo.do";
                var params = {
                    ut: ut
                };
                Vue.api.get(url, params, (res) => {
                    location.replace("/index.html");//如果已登录跳转到首页
                });
            }
        },
        //判断登录按钮是否禁用
        checkBtnDisabled: function () {
            if(!this.username) {
                this.checkDisabled = true;
                return;
            }
            if(!/^[0-9]{11}$/.test(this.username)) {
                this.checkDisabled = true;
                return;
            }
            if(!this.password) {
                this.checkDisabled = true;
                return;
            }
            this.checkDisabled = false;
        },
        //检查手机号是否存在
        checkExists: function () {
            if(/^[0-9]{11}$/.test(this.username)) {
                var url = config.ouserHost + '/ouser-web/mobileRegister/isRepeatPhoneForm.do';
                var param = {
                    companyId: Vue.mallSettings.getCompanyId(),
                    mobile: this.username
                };
                Vue.api.postForm(url, param, (res) => {
                    //手机号不存在
                    this.checkExistsDisabled = true;
                    Vue.utils.showTips('该手机号还未注册');
                }, (res) => {
                    var msg = '网络异常，请稍后再试';//系统异常

                    if (res.code) {                 //非系统异常
                        msg = res.message;
                        if (res.code == -1) {//手机号已注册
                            this.checkExistsDisabled = false;
                            return;
                        }
                    }
                    Vue.utils.showTips(msg);
                });
            }else{
                this.checkExistsDisabled = false;
            }
        },
        //登录
        login: function () {
            var msg = '';
            if(!this.username) {
                Vue.utils.showTips('请输入手机号');
                return;
            }
            if (!this.password) {
                Vue.utils.showTips('请输入密码');
                return;
            }
            if (!/^[^\u2E80-\u9FFF]{6,18}$/.test(this.password)) {
                Vue.utils.showTips('密码6-18位,字母,数字,字符');
                return;
            }
            if (this.startImgCode) {
                if (!this.checkImageCode) {
                    Vue.utils.showTips('请输入图片验证码');
                    return;
                }
                if (this.checkImageCode.length != 4) {
                    Vue.utils.showTips('请输入4位验证码');
                    return;
                }
            }
            this.loginDisabled = true;
            this.loginBtn = '登录中...';
            var url = config.ouserHost + '/ouser-web/api/user/login.do';       //ouser-web/mobileLogin/loginForm.do
            var param = {
                mobile: this.username,
                password: this.password,
                companyId: Vue.mallSettings.getCompanyId(),
                identityTypeCode: 4,
                initType: 0
            };
            if (this.startImgCode) {//需要输入验证码
                param.checkImageCode = this.checkImageCode;
            }

            Vue.api.postForm(url, param, (res) => {
                Vue.auth.setUserToken(res.ut);
                try {
                    localStorage.username = this.username;
                } catch (e) {

                }
                var fromParam = "from=";
                var qInd = location.search.indexOf(fromParam);
                
                var returnUrl = '';
                if (qInd < 0) {
                        returnUrl = config.contextPath + "/index.html";
                } else {
                    returnUrl = config.contextPath + decodeURIComponent(this.formUrl);
                }
                this.loginDisabled = false;
                this.loginBtn = '登录';
                //获取分销商信息后跳转
                if (this.supportDistribution) {
                    this.getCurrDistributor(res.ut, returnUrl);
                }
                location.replace(returnUrl);                      
            }, (res) => {
                this.getInit();
                
                this.loginDisabled = false;
                this.loginBtn = '登录';

                //如果密码输错一次，清空保存的账号
                localStorage.username = "";

                var msg = '网络异常，请稍后再试';//系统异常

                if (res.code) {//非系统异常
                    msg = res.message;
                    if(res.code == 4){
                        msg = "账户或密码错误";
                    }
                }
                Vue.utils.showTips(msg);
            });
        },  
        qlogin: function () {
            if(!this.user.mobile) {
                Vue.utils.showTips('请输入手机号');
                return;
            }
            if(!/^[0-9]{11}$/.test(this.user.mobile)) {
                Vue.utils.showTips('请输入11位有效手机号');
                return;
            }
            if(!this.user.captchas) {
                Vue.utils.showTips('请输入短信验证码');
                return;
            }
            // var param = {
            //     companyId: Vue.mallSettings.getCompanyId(),
            //     mobile: this.user.mobile
            // }
            // var url = config.ouserHost + '/ouser-web/api/user/checkAccountRepeat.do';
            // Vue.api.postForm(url,param,(res)=>{
            //     if(res.code == 0){
            //         Vue.utils.showTips("这个账号还没有注册")
            //     }
            // },(res)=>{
            // 产品化，快速登录，不校验是否注册
            this.loginDisabled = true;
            this.loginBtn = '登录中...';
            var url = config.ouserHost + '/ouser-web/api/user/login.do';
            var param = {
                mobile: this.user.mobile,
                captchas: this.user.captchas,
                companyId: Vue.mallSettings.getCompanyId(),
                identityTypeCode: 4,
                initType: 0
            };
            if(this.user.startImgCode) {//需要图形验证码
                param.checkImageCode = this.user.checkImageCode;
            }
            Vue.api.postForm(url, param, (res) => {
                Vue.auth.setUserToken(res.ut);
                try {
                    localStorage.username = this.user.mobile;
                } catch (e) {
                }
                if(res.code == 0){
                    var fromParam = "from=";
                    var qInd = location.search.indexOf(fromParam);
                    if (qInd < 0) {
                        location.replace(config.contextPath + "/index.html");
                        this.loginDisabled = false;
                        this.loginBtn = '登录';
                    } else {
                        var toUrl = decodeURIComponent(this.formUrl);
                        location.replace(toUrl);
                        this.loginDisabled = false;
                        this.loginBtn = '登录';
                    }
                } else{
                    this.step == 1;
                }
            }, (res) => {
                this.getInitQ();
                this.loginDisabled = false;
                this.loginBtn = '登录';
                var msg = '网络异常，请稍后再试';//系统异常
                if (res.code) {                 //非系统异常
                    if (res.code == -1) {
                        msg = "短信验证码错误";
                    } else if (res.code == -2) {
                        msg = "图形验证码错误";
                    } else {
                        msg = res.message;
                    }
                }
                Vue.utils.showTips(msg);
            });
            // })
        },
        setPassword: function () {
            if(!this.user.confirmPassword || this.user.password != this.user.confirmPassword) {
                Vue.utils.showTips('两次密码输入不一致');
                return;
            }
            this.sbmDisabled = true;

            var url = config.ouserHost + '/ouser-web/user/setUserPassword.do';
            var param = {
                password1: this.user.password,
                password2: this.user.confirmPassword,
            };

            Vue.api.postForm(url, param, (res) => {
                Vue.utils.showTips('密码设置成功');

                if(this.formUrl){
                    this.syncFoot(res.ut);
                    location.replace(this.fromUrl);
                } else{
                    this.syncFoot(res.ut);
                    location.replace(config.contextPath + "/index.html");
                }
            }, (res) => {
                var msg = '网络异常，请稍后再试';//系统异常
                if(res.code) {                 //非系统异常
                    msg = res.message;

                    // if(res.code == 20) {      //20注册成功
                    //     msg = "注册成功";
                    //     setTimeout(() => {
                    //         this.login();//自动登录
                    //     }, 2000);
                    // }else {
                    //     this.sbmDisabled = false;
                    // }
                }else {
                    this.sbmDisabled = false;
                }
                Vue.utils.showTips(msg);
            })
        },
        smsSend: function (param) {
            var mobile = param =='bind'?this.user.bindCaptchas:this.user.mobile;
            if(mobile == "") {
                mobile = this.user.bindMobile;
            }
            if(!mobile || !/^[0-9]{11}$/.test(mobile)) {
                Vue.utils.showTips('请输入正确的手机号');
                return;
            }
            //绑定手机号，直接执行
            // if(param =='bind'){
            //     this.sendMsg(mobile);
            // }else {
            //     //验证手机号是否已经注册
            //     var param = {
            //         companyId: Vue.mallSettings.getCompanyId(),
            //         mobile: this.user.mobile
            //     }
            //     var url = config.ouserHost + '/ouser-web/api/user/checkAccountRepeat.do';
            //     Vue.api.postForm(url, param, (res) => {
            //         if (res.code == 0) {
            //             Vue.utils.showTips("这个账号还没有注册")
            //             return;
            //         }
            //     }, (res) => {
            //         this.sendMsg(mobile);
            //     });
            // }
            //产品化，发送验证码不需要验证是否已经注册
            this.sendMsg(mobile);
        },

        //执行发送短信的接口
        sendMsg:function (mobile) {
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
                mobile: mobile,
                captchasType :3,
            };
            Vue.api.postForm(url, param, (res) => {
                //验证码发送成功
                this.startImgCode = false;//隐藏图片验证码窗口
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
        },
        //获取并设置分销商ID
        getCurrDistributor: function (ut, returnUrl) {
            var url = config.apiHost + '/api/seller/distributor/currDistributor';
            var param = {
                ut: ut
            };
            Vue.api.get(url, param, (res) => {
                Vue.auth.setDistributorId(2, res.data.id);
                Vue.localStorage.setItem('currDistributor',res.data);

            }, () => {

            });
        },
        //判断验证码接口
        getInit:function(){
            if(this.username.length < 11) return;
            var _this = this;
            var url = config.apiHost + '/ouser-web/api/user/init.do';
            var param = {
                initType: 0,
                mobile: _this.username
            };
            Vue.api.postForm(url, param, (res) => {
                this.needImgCaptcha  = res.data.needImgCaptcha;
                if( this.needImgCaptcha){
                    _this.startImgCode = true;
                    _this.updImgCode();
                }
            });
        },
        //判断验证码接口
        getInitQ:function(){
            if(this.user.mobile.length < 11) return;
            var _this = this;
            var url = config.apiHost + '/ouser-web/api/user/init.do';
            var param = {
                initType: 0,
                mobile: _this.user.mobile
            };
            Vue.api.postForm(url, param, (res) => {
                this.needImgCaptcha  = res.data.needImgCaptcha;
                if( this.needImgCaptcha){
                    _this.user.startImgCode = true;
                    _this.updImgCode();
                }
            });
        },
        /*
        *欧普项目，内部员工初次登录绑定手机号
        */
        bindPhone:function (params) {
            var _this = this;
            var url = config.apiHost + '/ouser-web/api/union/bindUnionMobile.do';
            if(this.showpassword == true){
                var param = {
                    mobile: this.user.bindMobile,             //手机号
                    captchas: this.user.bindCaptchas,            //验证码
                    sId: this.sId,
                    password: this.user.password
                }
            }else {
                var param = {
                    mobile: this.user.bindMobile,             //手机号
                    captchas: this.user.bindCaptchas,            //验证码
                    sId: this.sId
                }
            }
            Vue.api.postForm(url, param, (res) => {
                this.gologin();
                location.replace(config.contextPath + "/index.html");
            }, (res)=>{
                    if(res.code==7){
                        this.showpassword = true;
                    }else{
                        Vue.utils.showTips(res.message);
                    }
            });
        },

        gologin:function () {
            var  param = {
                employeeCode: this.username,
                employeePassword: this.password,
                unionType: 5,
            };
            var url = config.ouserHost + '/ouser-web/api/union/login.do';
            Vue.api.postForm(url, param, (res) => {
                if(res.code == 0){
                    Vue.auth.setUserToken(res.ut);
                }else{
                    Vue.utils.showTips('自动登录失败请再次登录');
                    location.replace(config.contextPath + "/login.html");
                }
            },(res) => {
                Vue.utils.showTips('自动登录失败请再次登录');
                location.replace(config.contextPath + "/login.html");
            });
            
        }
    }
});