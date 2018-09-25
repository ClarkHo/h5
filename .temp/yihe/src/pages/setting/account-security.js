import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiFileUpload from "../../components/ui-file-upload.vue";
import config from "../../../env/config.js";

let uaParams = Vue.browser.getUaParams();
var code = Vue.utils.paramsFormat(window.location.href).code;
var state = Vue.utils.paramsFormat(window.location.href).state;
var vm = new Vue({
    el: 'body',
    components: { UiHeader,UiFileUpload },
    data: {
        hasPassword: true,
        headPicUrl: '',
        appVersion: uaParams.version || "",
        userInfo:'',
        type: Vue.localStorage.getItem('bindThirdPlatform_type'),
        weChat:Vue.browser.weixin(),
        app:Vue.browser.isApp(),
        bindWechatStatus:0,
    },
    ready: function() {
        this.checkPassword();
        this.getUserInfo();
        // this.autoBind();
        if(code&&this.type){
            this.bound(this.type);
        }
    },
    methods: {
        // 1、绑定第三方QQ WeChat
        bindThirdPlatform: function(type) {
            //QQ
            if(type==1){
                Vue.localStorage.removeItem('bindThirdPlatform_type');
                Vue.localStorage.setItem('bindThirdPlatform_type', type);
                //未绑定QQ
                if(this.userInfo.bindQQStatus==0){
                    //App中
                    if(Vue.browser.isApp()){
                        Vue.app.postMessage("bindThirdPlatformQQ", null, (res)=>{

                        });
                    } else {
                        this.getRelatedParams(type);
                    }

                } else{ //解绑
                    this.confirmUnBound(type)
                }
            } else{
                Vue.localStorage.removeItem('bindThirdPlatform_type');
                Vue.localStorage.setItem('bindThirdPlatform_type', type);
                //未绑定微信
                if(this.userInfo.bindWechatStatus==0){
                    if(Vue.browser.isApp()){
                        Vue.app.postMessage("bindThirdPlatformWX", null, (res)=>{

                        });
                    } else{
                        this.getRelatedParams(type);
                    }
                } else{ //解绑
                    this.confirmUnBound(type)
                }
            }


        },
        //获取联合登录地址并跳转
        getRelatedParams:function (type) {
            var url = config.ouserHost + '/ouser-web/unionLogin/getRelatedParams.do';
            var redirectUrl = "/setting/account-security.html";
            var params = {
                gateway: type,
                redirectUrl: redirectUrl,
                platformId:config.platformId
            };
            Vue.api.post(url, params, (res) => {
                location.href = res.data;
            });
        },
        //绑定第三方账户
        bound:function (type) {
            var url = config.ouserHost + '/ouser-web/unionLogin/bindThirdPlatform.do';
            var params = {
                ut: Vue.auth.getUserToken(),
                code: code,
                gateWay:type,
                state:state
            };
            Vue.api.postForm(url, params, (res) => {
                if(res.code==0){
                    $.tips({
                        content: "绑定成功",
                        stayTime: 2000,
                        type: "success"
                    });
                    this.getUserInfo();
                }
            },(res) => {
                Vue.utils.showTips(res.msg)
            });
        },
        confirmUnBound:function (type) {
            var dia=$.dialog({
                title:'',
                content:'<div class="text-center">确认要解绑吗?</div>',
                button:["取消","确认"]
            });

            dia.on("dialog:action",(e) =>{
                if(e.index==1){
                    this.unBound(type)
                }
            });
        },
        //解绑第三方账户
        unBound:function (type) {
            var url= config.ouserHost + '/ouser-web/unionLogin/unbindThirdPlatform.do';
            var params = {
                ut: Vue.auth.getUserToken(),
                gateway:type
            }
            Vue.api.postForm(url, params, (res) => {
                if(res.code==0){
                    $.tips({
                        content: "解绑成功",
                        stayTime: 2000,
                        type: "success"
                    });
                    this.getUserInfo();
                }
            })
        },
        autoBind:function () {
            if(code&&this.type){
                this.bound(this.type);
            }
        },
        //退出登录
        logout: function () {
            var url = config.apiHost + '/ouser-web/mobileLogin/exit.do';
            var param = {
                ut: Vue.auth.getUserToken()
            };
            Vue.api.post(url, param, (result)=>{
                Vue.auth.setUserToken('asdfasdf');//目前出现部分ios手机在升级到10.1.1版本后 cookie清除不掉的情况，采用重写值，再删除
                Vue.auth.deleteUserToken();//清除UT
                // Vue.cookie.delCookie('ut');

                if (Vue.browser.isApp()) {
                    //通知app退出登录
                    location.href = "${appSchema}://logout";
                } else {
                    location.href = config.contextPath + '/index.html';
                }

            });
        },
        //查询是否已有密码
        checkPassword: function () {
            var url = config.apiHost + '/ouser-web/unionLogin/checkPassword.do';
            var param = {
                ut: Vue.auth.getUserToken()
            };
            Vue.api.post(url, param, (res)=> {
                if(res.data == 0) {//没有密码
                    this.hasPassword = false;
                    // 没有密码时跳转添加密码
                }
            },(res) => {
                if(res.code==-1){
                    //处理掉错误信息，
                }
            });
        },
        //图片上传成功
        uploadSuccess: function (data) {
            this.headPicUrl = data.filePath;
            this.updUserInfo();
        },
        //获取用户信息
        getUserInfo: function () {
            var url = config.apiHost + '/api/my/user/info';
            var param = {
                ut: Vue.auth.getUserToken(),
                companyId: Vue.mallSettings.getCompanyId()
            };
            Vue.api.postForm(url, param, (res) => {
                this.userInfo = res.data;
                this.bindWechatStatus=res.data.bindWechatStatus;
                this.headPicUrl = res.data.headPicUrl;
            });
        },
        //更新用户信息
        updUserInfo: function () {
            var url = config.apiHost + '/api/my/user/updateInfo';
            var param = {
                ut: Vue.auth.getUserToken(),
                headPicUrl: this.headPicUrl
            };
            Vue.api.postForm(url, param, (res) => {
                this.isEditStatus = 0;
                $.tips({
                    content: '头像修改成功',
                    stayTime: 2000,
                    type: "warn"
                })
            });
        },
        //点击后退
        back: function() {
            if (this.isApp) {
                Vue.app.back();
            } else {
                history.back();
            }

        },
    }
});
