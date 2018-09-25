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
        currentTab: 0, //当前活跃状态的tab,
        pageNo:1,
        pageSize:10,
        askList:[],
        totalNum:0
    },
    ready: function () {
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            if (this.totalNum > this.askList.length) {
                this.pageNo += 1;
                this.getMyAskList();
            }
        });
        this.getMyAskList();
    },
    methods: {
        //获取当前商品的问题列表
        getMyAskList: function (flag) {
            var url = this.currentTab == 0 ? '/back-product-web/consultAppAction/getOwnerConsultAndQaList.do' : '/back-product-web/consultAppAction/getToAnswerlist.do';
            var params = {
                currentPage: this.pageNo,
                itemsPerPage   : this.pageSize,
                headerType: 1, //0 =咨询，1 =问答,默认是咨询
            }
            if(this.currentTab == 0){
                params.qaType = this.currentTab;
                // params.fullReturn = false;
            } else{
                params.userIsAnsweredFlag = this.currentTab - 1;
            }
            Vue.api.post(url, params, (res) => {
                if (res.data) {
                    this.totalNum = res.data.total;
                    if(flag){
                        this.askList = res.data.listObj || [];
                    } else {
                        this.askList = this.askList.concat(res.data.listObj || []);
                    }
                    
                }
            })
        },
        swithTab:function (num) {
            if(this.currentTab == num){
                return;
            }
            this.currentTab = num;
            this.pageNo = 1;
            this.getMyAskList(true);
        }
    }
});