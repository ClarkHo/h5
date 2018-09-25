import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";

let urlParams = Vue.utils.paramsFormat(window.location.href);


new Vue({
    el: 'body',
    components: {
        UiHeader
    },
    data:{
        exchangeRankList:[],
        totalNum:10,
        mpIds:[],
        exType:1,
        loading:false
    },
    ready:function () {
        this.getExchangeRankList();
    },
     methods:{
         getDate:function(date){
            if (date) {
                var d = new Date(date);
                var arr = [d.getFullYear(), this.fmtNum(d.getMonth() + 1), this.fmtNum(d.getDate())];
                return arr.join("-");
            }
            return "";
         },
         fmtNum:function(num){
             return num >= 10 ? num : ("0" + num);
         },
         formatDate:function (date, fmt) {
            if (/(y+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
            }
            let o = {
                'M+': date.getMonth() + 1,
                'd+': date.getDate(),
                'h+': date.getHours(),
                'm+': date.getMinutes(),
                's+': date.getSeconds()
            };
            for (let k in o) {
                if (new RegExp(`(${k})`).test(fmt)) {
                    let str = o[k] + '';
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str));
                }
            }
            return fmt;
        },
        getExchangeRankList:function (scroll) {
            if(this.loading) return;
            let url = '/obi-web/api/product/pointProductRank.do';
            var endDate = this.getDate(new Date());
            var start = new Date().getTime();
            var startDate ;
            if(this.exType==1){
             startDate = this.getDate(new Date(start-2592000000));
            }else if (this.exType == 2){
                startDate = this.getDate(new Date(start-31536000000));
            }
            let params = {
                startTime:startDate,
                endTime:endDate,
                companyId:Vue.mallSettings.getCompanyId(),
                totalNum:this.totalNum
            };
            this.loading = true;
            Vue.api.get(url, params, (res) => {
                this.loading = false;
                if(res.data) {
                    var ssslist = res.data.datalist || [];
                    for(var i=0;i<res.data.datalist.length;i++){
                        res.data.datalist[i].mpId = res.data.datalist[i].pid;
                        this.mpIds.push(res.data.datalist[i].mpId);
                    }
                    Vue.getPointProPriceAndStock(this.mpIds.join(),res.data.datalist,null,(obj) => {
                        this.exchangeRankList = obj;
                    });
                }
            },() => {
                this.loading = false;
            });
        },
        swtichTab:function (type) {
            if(this.loading || this.exType == type) return;
            this.exType = type;
            this.getExchangeRankList();
        }
    } 
});