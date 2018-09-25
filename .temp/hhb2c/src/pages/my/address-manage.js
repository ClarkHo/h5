import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiAddress from "../../components/ui-address.vue";
import config from "../../../env/config.js";

new Vue({
    el: 'body',
    components: {
        UiHeader,
        UiAddress
    },
    data: {
        address: [],
        noAddress: false, //无地址列表
        addressId: '', //地址id
        showAddress: false,  //显示收货地址
        companyId: Vue.mallSettings.getCompanyId(),
        overseas:false//海购标识
    },
    ready: function(){
        this.getAllAddress();
        this.checkOverseas();
    },
    methods: {
        checkOverseas: function () {
            var params = { data: { companyId: this.companyId, mainModule:"OVERSEAS_MODULE",subModule:""} };
            Vue.api.post("/osc-api/getModuleController.do", params, (result) => {
                this.overseas = result.resultData == 1;
            });
        },
        //得到所有的收货地址
        getAllAddress: function() {  
            var params = {
                ut: Vue.auth.getUserToken(),
                nocache: new Date().getTime()
            };
            Vue.api.postForm(config.ouserHost + '/ouser-web/address/getAllAddressForm.do', params,(res) => {
                
                if (res.data.length > 0) {
                    this.address = res.data;
                    this.noAddress = false;
                } else {
                    //无地址列表
                    this.address = [];
                    this.noAddress = true;
                }
            })
        },
        //设为默认地址
        setDefaultIs: function(item) { 
            var params = {
                id: item.id,
                defaultIs: 1,
                ut: Vue.auth.getUserToken()
            };
            Vue.api.postForm(config.ouserHost + '/ouser-web/address/updateAddressForm.do', params,(res) => {
                item.defaultIs = 1;
                var el = $.tips({
                    content: '设为默认地址成功',
                    stayTime: 2000,
                    type: "success"
                })
                this.getAllAddress();
            });
        },
        //调起删除操作
        deleteAddress: function(item) {
            var dialog = $.dialog({
                title: "",
                content: "确定删除地址吗？",
                button: ["取消", "确认"]
            });
            dialog.on("dialog:action", (e) => {
                //点击确定按钮
                if (e.index == 1) {
                    var params = {
                        id: item.id,
                        defaultIs: item.defaultIs,
                        ut: Vue.auth.getUserToken()
                    };
                    Vue.api.postForm(config.ouserHost + '/ouser-web/address/deleteAddressForm.do', params,(res) => {
                        var el = $.tips({
                            content: '删除成功',
                            stayTime: 2000,
                            type: "success"
                        })
                        this.getAllAddress();
                    });
                }
            });
        },
        //新增或编辑成功回调
        callBack: function (id) {
            this.getAllAddress();
        },
        //新增或编辑
        addOrUpdAddress: function (id) {
            this.addressId = id || '';
            this.showAddress = true;
        }
    }
});