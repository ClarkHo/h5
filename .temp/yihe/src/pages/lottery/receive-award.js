import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";

var urlParams = Vue.utils.paramsFormat(location.href);
//中奖记录id
var recordId = urlParams.id;
//收货地址id 
var receiverId = urlParams.receiverId;
var themeId =  urlParams.themeId;

new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        //领奖信息详情
        receiveDetail: {},
        //数据是否已加载
        isLoaded: false
    },
    computed: {
        //领奖人信息
        receiver: function () {
           return this.receiveDetail.receiver || {};
        },
        //收货人地址信息
        receiverAddress: function () {
            if (this.receiver && this.receiver.receiverId) {
                return this.receiver.provinceName + this.receiver.cityName + this.receiver.areaName + this.receiver.detailAddress;
            } else {
                return "";
            }
        }
    },
    //初始化
    ready: function() {
        this.getReceiveDetail();  
    },
    methods: {
        //获取抽奖信息
        getReceiveDetail: function() {
            var params = { ut: this.ut, recordId: recordId };
            if (receiverId) {
                params.receiverId = receiverId;
            } 

            Vue.api.get("/api/promotion/lottery/init", params, (result) => {
                if (result.data) {
                  this.receiveDetail = result.data;
                  this.isLoaded = true;
                }
            });
        },

        //确认领取
        confirm: function () {
            var rid = receiverId || this.receiver.receiverId
            if (!rid) {
                Vue.utils.showTips("请选择收货地址");
                return;
            }

            var params = {ut: this.ut, recordId: recordId, receiver: {receiverId: rid}};
            Vue.api.post("/api/promotion/lottery/save", params, (result) => {
                location.replace('/lottery/receive-success.html?themeId=' + themeId);
            });
        },

        //选择地址
        selectAddress: function () {
            var url = "/my/address-chose.html?scene=lottery&id=" + recordId;
            if (this.receiveDetail && this.receiveDetail.receiver) {
                url += "&receiverId=" + this.receiveDetail.receiver.receiverId;
            }

            location.replace(url);
        }

    }
});
