import Vue from "vue";
import UiHeader from "../components/ui-header.vue";
import UiShare from "../components/ui-share.vue";
import config from "../../env/config.js";

var vm = new Vue({
    el: 'body',
    components: { UiHeader,UiShare },
    data: {
        rightNavFlag: false,
        distributor: {},
        showShare: false,
        shareConfig: {},
        supportDistribution: false,//是否支持分销功能
    },
    ready: function() {
        this.checkSupportDistribution();
        // this.getCurrDistributor();
        this.getShareInfo();
    },
    methods: {
        //检查是否支持分销功能
        checkSupportDistribution: function () {
            var params = { data: { companyId: this.companyId, mainModule:"AGENT_MODULE",subModule:""} };
            Vue.api.post("/osc-api/getModuleController.do", params, (result) => {
                this.supportDistribution = result.resultData == 1;
                if(this.supportDistribution){
                    this.getCurrDistributor();
                }
            });
        },
        //获取分销商信息
        getCurrDistributor: function () {
            if(Vue.localStorage.contains('currDistributor')) {
                this.distributor = Vue.localStorage.getItem('currDistributor');
            }else {
                var url = "" + '/api/seller/distributor/currDistributor';
                var param = {
                    ut: this.ut,
                    shareCode: Vue.cookie.getCookie('shareCode')
                };
                Vue.api.get(url, param, (res) => {
                    this.distributor = res.data;
                    Vue.localStorage.setItem('currDistributor',res.data);
                });
            }
        },
        //获取分享信息
        getShareInfo: function () {
            var url = "" + '/api/share/shareInfo';
            var param = {
                type: 1,
                ut: this.ut
            };
            Vue.api.get(url, param, (res) => {
                var qrcode = new QRCode(document.getElementById("qrcode"), {
                    width: 135,//设置宽高
                    height: 135
                });
                qrcode.makeCode(res.data.linkUrl);
            });
        },
        //点击分享
        clickShare: function () {
            //获取分享信息 
            var url = "" + '/api/share/shareInfo';
            var param = {
                type: 1,
                ut: this.ut
            };
            Vue.api.get(url, param, (res) => {
                this.shareConfig = {
                    url: res.data.linkUrl,
                    title: res.data.title,
                    description: res.data.content,
                    pic: res.data.sharePicUrl
                };
                this.showShare = true;
                this.rightNavFlag = false;
            });
        }
    }
});
