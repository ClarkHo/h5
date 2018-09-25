import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";

var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        customer: {list: [],totalCount: 0,pageSize: 10,pageNo: 1}
    },
    ready: function() {
        this.getCustomerList();
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            if (this.customer.list.length < this.customer.totalCount) {
                this.pageNo += 1;
                this.getCustomerList();
            }
        });
    },
    methods: {
        //get 顾客列表
        getCustomerList: function(){
            var url = "" + '/api/seller/fans/list';
            var param = {
                companyId: Vue.mallSettings.getCompanyId(),
                ut:Vue.auth.getUserToken(),
                type: 2, //1:粉丝；2:顾客
                pageSize: this.customer.pageSize,
                pageNo: this.customer.pageNo
            };
            Vue.api.get(url, param, (res) => {
                this.customer.totalCount = res.data.totalCount;
                //this.noCustomer = this.customer.totalCount == 0;
                if (res.data.data.length > 0) {
                    this.customer.list = this.customer.list.concat(res.data.data);
                }
            }, (res) => {
                Vue.api._showError(res.message);
            })
        }
    }
});
