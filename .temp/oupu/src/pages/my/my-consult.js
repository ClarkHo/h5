import Vue from "vue";
import config from "../../../env/config.js";
import UiHeader from "../../components/ui-header.vue";


let urlParams = Vue.utils.paramsFormat(window.location.href);

new Vue({
    el: 'body',
    components: {
        UiHeader
    },
    data: {
        pageNo:1,
        pageSize:10,
        consultList:[],
        totalNum:0
    },
    ready: function () {
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            if (this.totalNum > this.consultList.length) {
                this.pageNo += 1;
                this.getMyConsultList();
            }
        });
        this.getMyConsultList();
    },
    methods: {
        //获取当前商品的问题列表
        getMyConsultList: function () {
            var url = '/back-product-web/consultAppAction/getOwnerConsultAndQaList.do';
            var params = {
                currentPage: this.pageNo,
                itemsPerPage   : this.pageSize,
                headerType: 0, //0 =咨询，1 =问答,默认是咨询
                qaType:0
            }
            Vue.api.post(url, params, (res) => {
                if (res.data && res.data.listObj) {
                    this.totalNum = res.data.total;
                    this.consultList = this.consultList.concat(res.data.listObj || []);
                }
            })
        }
    }
});