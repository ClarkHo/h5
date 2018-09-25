import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";

new Vue({
    el: 'body',
    components: {
        UiHeader
    },
    data: {
        faq_list: {},//帮助中心列表
        categoryCode:"help",
    },
    ready: function() {
        this.getFaqList();
    },
    methods: {
        getFaqList: function () {
            var url = "" + '/cms/view/h5/helpList';
            var param = {
                categoryCode:this.categoryCode,
            };
            Vue.api.get(url, param, (res) => {
                this.faq_list = res.data;
            });
        }
    }
});