import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        password1: '',              //新密码
        password2: '',              //确认密码
        spypassword1: 'text',   //显示新密码
        spypassword2: 'text',   //显示确认密码
    },
    ready: function() {
        //解决浏览器记住密码的功能
        setTimeout(() => {
            this.spypassword1 = 'password';
            this.spypassword2 = 'password';
        }, 200);
    },
    methods: {
        modifyPassword: function () {
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
            var url = config.ouserHost + '/ouser-web/user/setUserPassword.do';
            var param = {
                password1: this.password1,
                password2: this.password2,
            };
            Vue.api.postForm(url, param, (res) => {
                //删除ut
                Vue.auth.deleteUserToken();

                $.tips({
                    content: '密码添加成功',
                    stayTime: 2000,
                    type: "warn"
                });
                setTimeout(() => {
                    location.href = '/login.html';
                }, 2000);
            });
        }
    }
});
