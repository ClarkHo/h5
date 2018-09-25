import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiActionsheetPop from "../../components/ui-actionsheet-pop.vue";
import config from "../../../env/config.js";


const companyId = Vue.mallSettings.getCompanyId();
const ut = Vue.auth.getUserToken();

new Vue({
    el: 'body',
    components: { UiHeader,UiActionsheetPop },
    data: {
 
    },
    //初始化
    ready: function() {

    },
    methods: {
        back:function () {
            if(Vue.browser.isApp()){
                Vue.app.back()
            } else{
                history.back();
            }
        },

    }
});
