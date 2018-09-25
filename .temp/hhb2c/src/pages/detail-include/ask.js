import Vue from "vue";
import config from "../../../env/config.js";
import UiHeader from "../../components/ui-header.vue";


let urlParams = Vue.utils.paramsFormat(window.location.href);

new Vue({
    el: 'body',
    components: { UiHeader},
    data: {
        askList:[],
        pageNo:1,
        pageSize:10,
        totalNum:0,
        content:decodeURIComponent(urlParams.content),
        mpId:urlParams.mpId||'',
    },
    ready: function() {
        this.getAskList();
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            if (this.total > this.consultList.length) {
                this.pageNo += 1;
                this.getAskList();
            }
        });
    },
    methods: {
        //获取当前商品的问题列表
        getAskList:function () {
            var url = '/back-product-web/consultAppAction/getOwnerConsultAndQaList.do';
            var params = {
                merchantProductId:this.mpId,
                currentPage:this.pageNo,
                itemsPerPage:this.pageSize,
                headerType:1,//0 =咨询，1 =问答,默认是咨询
                fullReturn:false
            }
            Vue.api.post(url, params, (res) => {
                if(res.data && res.data.listObj){
                    this.totalNum = res.data.total;
                    this.askList = this.askList.concat(res.data.listObj || []);
                }
            })
        }
    }
});