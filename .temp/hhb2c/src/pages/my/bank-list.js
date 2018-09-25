import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";


var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        bankList: [],  //银行卡列表
        pageNo: 1,
        pageSize: 10
    },
    ready: function() {
        this.getBankList();
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            this.pageNo += 1;
            this.getBankList();
        });
    },
    methods: {
        //加载银行卡列表
        getBankList: function() {
            var params = {
                ut: this.ut,
                pageNo: this.pageNo,
                pageSize: this.pageSize
            };
            Vue.api.get("" + "/api/my/bank/list", params, (result) => {
                this.bankList = this.bankList.concat(result.data.bankCardList);
            });
        },
        deleteBankDialog: function(CardId, event) {
            event.stopPropagation();
            var dialog = $.dialog({
                title: "",
                content: "确定删除这张银行卡吗？",
                button: ["取消", "确认"]
            });
            dialog.on("dialog:action", (e) => {
                //点击确定按钮
                if (e.index == 1) {
                    this.deleteBank(CardId)
                }
            });
        },
        deleteBank:function(CardId){
            var params = {
                ut: this.ut,
                bankCardId: CardId
            };
            Vue.api.postForm('' + '/api/my/bank/delete', params, (res) => {
                // var el = $.tips({
                //     content: '删除成功',
                //     stayTime: 2000,
                //     type: "success"
                // });
                $.tips({
                    content: '删除成功',
                    stayTime: 2000,
                    type: "warn"
                });
                this.bankList=[];
                this.getBankList();
            });
        }
    }
});

// Vue.filter('bankAsterisk', function (value) {
//     var reg = /^(\d{3})(\d{4})(\d{4})(\d{4})(\d{4})$/;
//     value = value.replace(reg, "*** **** **** **** $2");
//     return value.replace(reg)
// })

