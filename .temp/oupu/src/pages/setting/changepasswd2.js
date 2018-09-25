import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        password: '',               //原密码
        password1: '',              //新密码
        password2: '',              //确认密码
        spypassword: 'text',    //显示原密码
        spypassword1: 'text',   //显示新密码
        spypassword2: 'text',   //显示确认密码
    },
    ready: function() {
        //解决浏览器记住密码的功能
        setTimeout(() => {
            this.spypassword = 'password';
            this.spypassword1 = 'password';
            this.spypassword2 = 'password';
        }, 200);
    },
    methods: {
        modifyPassword: function () {
            if(!this.password) {
                $.tips({
                    content: '请输入旧密码',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!this.password1) {
                $.tips({
                    content: '请输入新密码',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!this.password2) {
                $.tips({
                    content: '请输入确认密码',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!/^[^\u2E80-\u9FFF]{6,18}$/.test(this.password) || !/^[^\u2E80-\u9FFF]{6,18}$/.test(this.password1) || !/^[^\u2E80-\u9FFF]{6,18}$/.test(this.password2)) {
                $.tips({
                    content: '密码6-18个字符',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!this.password1 || this.password1 != this.password2) {
                $.tips({
                    content: '前后两次输入新密码不一致',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            var url = config.ouserHost + '/ouser-web/user/resetUserPassword.do';
            var param = {
                companyId: Vue.mallSettings.getCompanyId(),
                ut: Vue.auth.getUserToken(),
                smsCode:this.user.captchas,
                password: this.password,
                password1: this.password1,
                password2: this.password2
            };
            Vue.api.post(url, param, (res) => {
                $.tips({
                    content: '密码修改成功',
                    stayTime: 2000,
                    type: "warn"
                });
                setTimeout(() => {
                    window.location.href = config.contextPath + "/setting/account-security.html";
                }, 2000);
            });
        }
    }
});
