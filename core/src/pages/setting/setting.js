import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiFileUpload from "../../components/ui-file-upload.vue";
import UiActionsheet from "../../components/ui-actionsheet.vue";
import config from "../../../env/config.js";

var pushStatus = Vue.localStorage.getItem("pushStatus");
var urlParams = Vue.utils.paramsFormat(decodeURIComponent(location.href));

var vm = new Vue({
    el: 'body',
    components: {UiHeader, UiFileUpload, UiActionsheet},
    data: {
        showTalk: false,
        hasPassword: true,
        headPicUrl: '${staticPath}/images/no-header.png?v=${version}',
        cache: '0MB',
        isApp: Vue.browser.isApp(),
        status:pushStatus || 0,//消息推送默认状态
        loggedIn: Vue.auth.loggedIn(),
    },
    ready: function () {
        if (this.isApp) {
            Vue.app.postMessage("getCache", (data) => {
                this.cache=data;
            });
        }
        // this.checkPassword();
       // this.getUserInfo();
    },
    computed:{
        pageConfig:function () {
            return config.setting || {};
        }
    },
    methods: {

        //退出登录
        logout: function () {
            var url = config.apiHost + '/ouser-web/mobileLogin/exit.do';
            var param = {
                ut: Vue.auth.getUserToken()
            };
            //调取退出登录接口
            Vue.api.post(url, param, () => {
            
                if (this.isApp) {
                    Vue.app.logout();
                }else{
                    window.location.href = "/my/home.html";
                }
            });
            Vue.auth.deleteUserToken();//清除UT
        },
        //查询是否已有密码
        checkPassword: function () {
            var url = config.apiHost + '/ouser-web/unionLogin/checkPassword.do';
            var param = {
                ut: Vue.auth.getUserToken()
            };
            Vue.api.post(url, param, (res)=> {
                if (res.data == 0) {//没有密码
                    this.hasPassword = false;
                }
            });
        },
        //图片上传成功
        uploadSuccess: function (data) {
            this.headPicUrl = data.filePath;
            this.updUserInfo();
            //修改头像后，清除分销商信息缓存,使首页头像刷新
            Vue.distribution.clearCurrentDistributionData();
            if (this.isApp) {
                //通知app刷新个人中心页面
                Vue.app.postMessage("pageRefresh");
            }
        },
        //获取用户信息
        getUserInfo: function () {
            var url = config.apiHost + '/api/my/user/info';
            var param = {
                ut: Vue.auth.getUserToken(),
                companyId: Vue.mallSettings.getCompanyId()
            };
            Vue.api.postForm(url, param, (res) => {
                this.headPicUrl = res.data.url100x100;
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
       //清除图片缓存
        clearCache: function () {
            Vue.app.postMessage("clearCache", ()=>{
                this.cache = '0MB';
            });
        },
        //消息推送
        messagePushed:function(){
            this.status = !this.status;
            Vue.localStorage.setItem("pushStatus", this.status);
            Vue.app.postMessage("pushCtrl",{status: this.status});
        },

        back: function () {
            if (this.isApp) {
                Vue.app.back();
            } else {
                history.back();
            }
        }
    }
});
