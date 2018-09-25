import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiDropDown from "../../components/ui-drop-down.vue";
import config from "../../../env/config.js";

let urlParams = Vue.utils.paramsFormat(location.href);
let state = Vue.utils.paramsFormat(location.href).t;

new Vue({
    el: 'body',
    components: { UiHeader ,UiDropDown},
    data: {
    	status: urlParams.t ? urlParams.t : 0,
    	pageNo: 1,
    	pageSize: 10,
    	total: 0,
    	cutList: [],
        isApp: Vue.browser.isApp(),
        weixin: Vue.browser.weixin(),
        cutState:state,
        stopDropDown:false,
    },
    ready: function() {
        this.getMyCutList();
        Vue.scrollLoading(() => {
            if(this.cutList.length < this.total) {
                this.pageNo += 1;
                this.getMyCutList();
            }
        });
    },
    methods: {
        dropDown: function () {
            this.currentPage = 1;
            this.isEnd = false;
            this.cutList = [];
            this.getMyCutList();
            setTimeout(() => {
                this.stopDropDown = true;
            }, 2000);
        },
        //查询我的砍价单
        getMyCutList: function () {
            var url = config.apiHost + '/api/promotion/cut/myinst';
            var params = {
                ut: Vue.auth.getUserToken(),
                platformId: config.platformId,
                itemsPerPage: this.pageSize,
                currentPage: this.pageNo
            };
            if(this.status == 1) {
                params.status = 0;
            }
            if(this.status == 2) {
                params.status = 1;
            }
            if(this.status == 3) {
                params.status = 3;
            }
            Vue.api.get(url, params, (res) => {
                if(res.data) {
                    this.total = res.data.total;
                    this.cutList = this.cutList.concat(res.data.listObj);
                }
            });
        },
        switchStatus: function (status) {
            var params = Vue.utils.paramsFormat(location.href);
            params.t = status;
            var url = location.pathname + '?' + $.param(params);
            window.history.replaceState(null, "", url);

            this.status = status;
            this.pageNo = 1;
            this.cutList = [];
            this.getMyCutList();
        }
    }
});