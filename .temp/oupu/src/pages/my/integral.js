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
        //当前积分
        currentIntegral:'',
        //可用积分
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
        rulesUrl:'',//积分规则
        userInfo:null,//
        integralAd:'',//积分广告位
    },
    //初始化
    ready: function() {
        this.getRulesUrl();
        this.getUserPoint();
        this.loadPointList();
        this.userInfoDetail();
        this.getaIntegral();
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            if (this.pointList.length < this.totalCount) {
                this.pageNo += 1;
                this.loadPointList();
            }
        });
    },
    methods: {
        back:function () {
            if(Vue.browser.isApp()){
                Vue.app.back()
            } else{
                history.back();
            }
        },
        //获取积分广告位
        getaIntegral: function(){
            var url = config.apiHost + '/api/dolphin/list';
            var param = {
                platform: 2,
                pageCode: "H5_HOME",
                adCode: 'points_instruction',
                companyId: Vue.mallSettings.getCompanyId()
            };
            Vue.api.get(url,param,(res) => {
                if(res.code == 0){
                    this.integralAd = res.data.points_instruction;                 
                }
            })
        },
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
            let params = {companyId: companyId, ut: ut};
            Vue.api.postForm("/api/my/point/account", params, (result) => {
                let data = result.data;
                if (data) {
                    this.amountBalance = data.amountBalance;
                    this.amountFreezed = data.amountFreezed;
                    this.amountExpiring= data.amountExpiring;
                    this.currentIntegral=this.amountBalance + this.amountFreezed;
                }
            });
        },

        loadPointList: function () {
            let params = {companyId: companyId, ut: ut, pointStatus: this.pointStatus, pageNo: this.pageNo, pageSize: this.pageSize};
            Vue.api.postForm("/api/my/point/list", params, (result) => {
                let data = result.data;
                this.totalCount = data.totalCount;
                if (data && data.data && data.data.length > 0) {
                    this.pointList = this.pointList.concat(data.data);
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
        },
        //用户线 获取用户信息（类型）
        userInfoDetail:function(){
            var url = config.apiHost + '/ouser-center/api/user/info/detail.do';
            var param = {
                identityTypeCode:4//4:普通会员 41:内购 42:企业 43:渠道会员
            }
            Vue.api.postForm(url,param,res => {
                if(res.data && res.data.userInfo && res.data.userInfo.identityTypeCode){
                    this.userInfo = res.data.userInfo;
                }else{
                    Vue.utils.showTips(res.message || '请稍后再试');
                }
            })
        },
    }
});
