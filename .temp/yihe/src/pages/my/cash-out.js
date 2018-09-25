import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";


var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        chooseBank: false,
        cardNo: '',
        bankCardId: '',
        ut: Vue.auth.getUserToken(),
        usableWithdrawAmount: 0,  //可提现金额
        inputWithdrawAmount: null, // 用户输入的金额
        withdrawFee:0,
        actualWithdrawAmount: 0,
        cashOutDisabled:false,
        regulation:'',
        regulation_regulationDescs:[], //提现规则
        applyWords: '提交申请', // 申请按钮文字
        cardList: [],//银行卡列表
        pageNo: 1,
        pageSize: 10
    },
    watch: {
        'inputWithdrawAmount':function() {
            if(this.inputWithdrawAmount && !/^(([0-9]|([1-9][0-9]{0,9}))((\.[0-9]{1,2})?))$/.test(this.inputWithdrawAmount)) {
                $.tips({
                    content: '请输入正确金额',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            };
            var params = {
                ut: this.ut,
                withdrawAmount: this.inputWithdrawAmount
            };
            Vue.api.get("" + "/api/seller/withdraw/calcFee", params, (result) => {
                this.withdrawFee = result.data.withdrawFee;
                this.actualWithdrawAmount = result.data.actualWithdrawAmount;
            });
        }
    },
    ready: function() {
        this.getRegulation();
        this.UsableWithdrawAmount();
        this.getBankCardList();
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            this.pageNo += 1;
            this.getBankCardList();
        });
    },
    methods: {
        //可提现金额
        UsableWithdrawAmount: function() {
            var params = {
                ut: this.ut
            };
            Vue.api.get("" + "/api/seller/withdraw/usableAmount", params, (result) => {
                this.usableWithdrawAmount = result.data.usableWithdrawAmount;
            });
        },
        // 提现规则 :
        getRegulation: function() {
            Vue.api.get("" + "/api/seller/withdraw/regulation", null, (result) => {
                this.regulation = result.data;
                this.regulation_regulationDescs = result.data.regulationDescs;
            });
        },
        // 申请提现
        ApplyWithdraw: function() {
            if(!this.cardNo) {
                $.tips({
                    content: '请选择银行',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            };
            if(this.inputWithdrawAmount && !/^(([0-9]|([1-9][0-9]{0,9}))((\.[0-9]{1,2})?))$/.test(this.inputWithdrawAmount)) {
                $.tips({
                    content: '请输入正确金额',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            };
            if(this.inputWithdrawAmount > this.usableWithdrawAmount) {
                $.tips({
                    content: '输入金额不能大于可提现金额',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            };
            var params = {
                ut: this.ut,
                bankCardId: this.bankCardId,
                withdrawAmount: this.inputWithdrawAmount
            };
            Vue.api.get("" + "/api/seller/withdraw/apply", params, (result) => {
                $.tips({
                    content: '提现成功',
                    stayTime: 2000,
                    type: "warn"
                });
                this.applyWords='继续申请';
            }/*,(result)=>{
               this.cashOutDisabled = true;
               this.applyWords = '当日可提现次数不足';
            }*/);
        },
        //加载银行卡列表
        getBankCardList: function() {
            var params = {
                ut: this.ut,
                pageNo: this.pageNo,
                pageSize: this.pageSize
            };
            Vue.api.get("" + "/api/my/bank/list", params, (result) => {
                this.cardList = result.data.bankCardList;
            });
        },
        //选择银行卡
        selectCard: function (c) {
            this.cardNo = c.cardNo;
            this.bankCardId = c.bankCardId;
            this.chooseBank = false;
        },
        //返回事件
        backStep: function () {
            if(this.chooseBank) {
                this.chooseBank = false;
            }else {
                history.back();
            }
        }
    }
});

