import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";
let uaParams = Vue.browser.getUaParams();
new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        appVersion: uaParams.version || ""
    },
    //初始化
    ready: function() {
    },
    methods: {
    }
});
