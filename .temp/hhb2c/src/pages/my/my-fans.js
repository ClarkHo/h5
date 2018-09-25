import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";

var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        fans: {list: [],totalCount: 0,pageSize: 10,pageNo: 1},
    },
    ready: function() {
        this.getFansList();
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            if (this.fans.list.length < this.fans.totalCount) {
                this.pageNo += 1;
                this.getFansList();
            }
        });
    },
    methods: {
        //get 粉丝列表
        getFansList: function(){
            var url = "" + '/api/seller/fans/list';
            var param = {
                companyId: Vue.mallSettings.getCompanyId(),
                ut:Vue.auth.getUserToken(),
                type: 1, //1:粉丝；2:顾客
                pageSize: this.fans.pageSize,
                pageNo: this.fans.pageNo
            };
            Vue.api.get(url, param, (res) => {
                this.fans.totalCount = res.data.totalCount;
                //this.noFans = this.fans.totalCount == 0;
                if (res.data.data.length > 0) {
                    this.fans.list = this.fans.list.concat(res.data.data);
                }
            }, (res) => {
                Vue.api._showError(res.message);
            })
        }
    }
});
