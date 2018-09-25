import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";

new Vue({
    el: 'body',
    components: {
        UiHeader
    },
    data: {
        ut: Vue.auth.getUserToken(),
        content:'', // 用户输入的内容
        companyId: Vue.mallSettings.getCompanyId()
    },
    ready: function(){

    },
    methods: {
        // 提交投诉内容
        feedSubmit: function() {
            var params = {
                ut: this.ut,
                content: this.content,
                companyId:this.companyId
            };
            Vue.api.postForm("" + "/api/social/live/complain/create", params, (result) => {
                $.tips({
                    content: '提交成功',
                    stayTime: 2000,
                    type: "success"
                });
                setTimeout(() => {
                    location.href = '/help/help.html';//跳转帮助中心
                }, 1000);


            });
        }
        
    }
});