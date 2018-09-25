import Vue from "vue";
import config from "../../../env/config.js";
import UiHeader from "../../components/ui-header.vue";


let urlParams = Vue.utils.paramsFormat(window.location.href);

new Vue({
    el: 'body',
    components: {UiHeader },
    data: {
        consultList:[],
        pageNo:1,
        pageSize:10,
        totalNum:0,
        mpId:urlParams.mpId
    },
    ready: function() {
        this.getConsultList();
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            if (this.total > this.consultList.length) {
                this.pageNo += 1;
                this.getConsultList();
            }
        });
    },
    methods: {
        // 获取当前商品的咨询列表
        getConsultList:function () {
            var url = '/back-product-web/consultAppAction/getOwnerConsultAndQaList.do';
            var params = {
                merchantProductId:urlParams.mpId,
                currentPage:this.pageNo,
                itemsPerPage   :this.pageSize,
                headerType:0,//0 =咨询，1 =问答,默认是咨询
                fullReturn:false
            }
            Vue.api.post(url, params, (res) => {
                if(res.data && res.data.listObj){
                    this.totalNum = res.data.total;
                    this.consultList = this.consultList.concat(res.data.listObj || []);
                }
            })
        }
    }
});