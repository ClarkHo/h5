import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiActionsheetPop from "../../components/ui-actionsheet-pop.vue";
import config from "../../../env/config.js";

const companyId = Vue.mallSettings.getCompanyId();
const ut = Vue.auth.getUserToken();

new Vue({
    el: 'body',
    components: { UiHeader,UiActionsheetPop },
    data: {
        //可用佣金
        amountBalance: 0,
        //冻结积分
        amountFreezed: 0,
        //即将过期的积分
        amountExpiring: 0,
        //分页
        pageNo: 1,  
        pageSize: 10,
        totalCount: 0,
        //积分状态（0-全部，1-收入积分，2-支出积分）
        pointStatus: 0,
        //积分列表
        pointList: [],
        rulesUrl:''//积分规则
    },
    //初始化
    ready: function() {
        this.getRulesUrl();
        this.getUserPoint();
        this.loadPointList();
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            if (this.pointList.length < this.totalCount) {
                this.pageNo += 1;
                this.loadPointList();
            }
        });
    },
    filters: {
        formatDate(time) {
            var date = new Date(time);
            return date.toLocaleString();
        },
        symbolClear( obj ){
            return obj.toString().substr(1);
        }
    },
    methods: {
        switchTab: function (status) {
            if (status != this.pointStatus) {
                this.pointStatus = status;
                this.loadPointList();
                this.pageNo = 1;
                this.totalCount = 0;
                this.pointList = [];
            }
        },

        getUserPoint: function () {
            let params = { ut: ut };
            Vue.api.postForm("/back-finance-web/api/commission/queryCommissionAccount.do", params, (result) => {
                let data = result.data;
                if (data) {
                    this.amountBalance = data.availableAccountAmount;
                    this.amountFreezed = data.frozenAmount;
                    //this.amountExpiring= data.amountExpiring;
                }
            });
        },

        loadPointList: function () {
            let params = {
                companyId: companyId,
                ut: ut, 
                //pointStatus: this.pointStatus, 
                currentPage: this.pageNo, 
                itemsPerPage: this.pageSize,
            };
            Vue.api.postForm("/back-finance-web/api/commission/queryCommissionIncomeDetail.do", params, (result) => {
                let data = result.data.commissionDetail;
                this.totalCount = data.total;
                if (data && data.listObj && data.listObj.length > 0) {
                    this.pointList = this.pointList.concat(data.listObj);
                }
            });
        },

        //获得积分类型符号（+，-）
        getPointSign: function (point) {
            return point.actionType == 1 ? "+": "-";
        },

        //获取积分规则url
        getRulesUrl: function () {
            var url = config.apiHost + '/api/dolphin/list';
            var param = {
                platform: 2,
                pageCode: config.pageCode,
                adCode: 'credit_rule',
                companyId: companyId
            };
            Vue.api.get(url, param, (res) => {
                if(res.data.credit_rule && res.data.credit_rule[0]) {
                    this.rulesUrl = res.data.credit_rule[0].linkUrl;
                }
            });
        }
    }
});
