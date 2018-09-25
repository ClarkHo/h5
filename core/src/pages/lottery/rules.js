import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";


var urlParams = Vue.utils.paramsFormat(location.href);
var themeId = urlParams.themeId || 0;
new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        rule:''
    },
    //初始化
    ready: function() {
        this.getRule();
    },
    methods: {
        getRule:function () {
            var params = {themeId: themeId };
            Vue.api.get("/api/promotion/lottery/desc", params, (result) => {
                if (result.data) {
                    this.rule=result.data;
                }
            }, (result)=>{

            });
        }
    }
});
