import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";

let today = new Date();
let oneDay = new Date().setDate(1)

new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        initMonth: today.getMonth(),
        initYear: today.getFullYear(),
        initDay: today.getDate(),
        currentMonth: today.getMonth(),
        currentYear: today.getFullYear(),
        currentDay: today.getDate(),
        monthDay: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],//1-12月每月对应的天数
        days: [], //要遍历成日历的数组
        daysLength: 0, //一个月的天数
        signShow: false,
        num: {},//签到统计,
        pointNum:0,
        nowDay:0,
        liWidth:0,
        showSign:false,
        signYiBean:0,
        time:new Date().getTime(),
        popupShow:false
    },
    ready: function() {
        this.nowDay = today.getDate();
        if(Vue.auth.getUserToken()){
            this.initData(today, new Date(oneDay).getDay());
            this.getPoint();
        }
        this.liWidth = document.body.clientWidth / 7
    },
    methods: {
        back:function () {
            if (Vue.browser.isApp()) {
                Vue.app.back();
            } else {
                history.back();
            }
        },
        surprise:function (day) {
            var tips = '';
            switch(day.state){
                case 0:
                    tips = '暂无补签功能，敬请期待';
                    break;
                case 1:
                    this.popupShow = false;
                    tips = day.isToday ? '今日已签到' : '该日已签到';
                    break;
                case 3:
                    tips = '时间还没到，别急啊~';
                    break;
                default:
                    //this.sign();
                    this.popupShow = true;
                    break;
            }
            if(tips){
                Vue.utils.showTips(tips);
            }
            
        },
        //生成日期对应的月份的days
        initData: function(date, num) {
            //console.log(date.getFullYear(),date.getMonth()+1)
            var days = [];
            //前面空日期补全
            for(var j=0; j<num; j++) {
                days.push({});//对其日期对应的星期
            }
            //一个月天数
            this.daysLength = this.monthDay[date.getMonth()];
            if(date.getMonth() == 1) {//判断闰年
                this.daysLength = (date.getFullYear() % 4 == 0) && (date.getFullYear() % 100 != 0 || date.getFullYear() % 400 == 0) ? 29 : 28;
            }
            for (var i = 1; i <= this.daysLength; i++) {
                //console.log(date.getFullYear()+'-'+(date.getMonth()+1) + '-' + i)
                days.push({
                    state: 0, //0漏签,1已签,2当天未签,3可签到
                    day: i,
                    date:new Date((date.getFullYear()+'-'+(date.getMonth()+1) + '-' + i).toString()).getTime(),
                    isToday:false
                });
            }
            //后面空日期补全
            var len = days.length;
            var rightCompletion = Math.abs((len % 7) - 7);
            for(var l=0;l<rightCompletion;l++){
                days.push({});
            }
            this.days = days;

            //初始化日历状态
            for(var j in this.days) {
                if(date.getFullYear() > this.initYear) {
                    this.days[j].state = 3;
                }else if(date.getFullYear() < this.initYear) {
                    this.days[j].state = 0;
                }else if(date.getMonth() > this.initMonth) {
                    this.days[j].state = 3;
                }else if(date.getMonth() < this.initMonth) {
                    this.days[j].state = 0;
                }else if(this.days[j].day > this.currentDay) {
                    this.days[j].state = 3;
                }else if(this.days[j].day < this.currentDay) {
                    this.days[j].state = 0;
                }else {
                    this.days[j].state = 2;
                    this.days[j].isToday = true;
                }
            }
            if(this.currentMonth <= this.initMonth && this.currentYear <= this.initYear) {
                this.getSignDays();
            }
            
        },
        //查询签到记录
        getSignDays: function(){
            var params={
                ut:Vue.auth.getUserToken(),
                startDateStr:this.formatDate(this.currentYear,this.currentMonth+1,1), //当前月1日
                endDateStr:this.formatDate(this.currentYear,this.currentMonth+1,this.daysLength)//当前月最后一天
            };
            Vue.api.postForm("/api/social/read/sign/signList",params,(result)=>{
                this.num = result.data;
                if(result.data&&result.data.signDayList){
                    for(var i=0; i < result.data.signDayList.length; i++){
                        var d = new Date(result.data.signDayList[i]);
                        for(var j=0; j<this.days.length; j++) {
                            if(this.days[j].day && d.getDate() == this.days[j].day) {
                                this.days[j].state = 1;
                            }
                        }
                    }
                }
            })
        },
        //上一月
        pickPre: function() {
            if(this.currentMonth==0 && this.currentYear > 1971){
                this.currentMonth=11;
                this.currentYear-=1;
            }else{
                this.currentMonth-=1;
            }
            var predate=new Date();
            predate.setDate(1)
            predate.setMonth(this.currentMonth);
            predate.setFullYear(this.currentYear);
            this.initData(predate,predate.getDay());
        },
        //下一月
        pickNext: function() {
            if(this.currentMonth==11){
                this.currentMonth=0;
                this.currentYear+=1;
            }else{
                this.currentMonth+=1;
            }
            var nextdate=new Date();
            nextdate.setDate(1)
            nextdate.setMonth(this.currentMonth);
            nextdate.setFullYear(this.currentYear);
            
            this.initData(nextdate,nextdate.getDay());
        },

        // 返回 类似 2016-01-02 格式的字符串
        formatDate: function(year,month,day){
            var y  = year;
            var m = month;
            if(m<10) m = "0" + m;
            var d = day;
            if(d<10) d = "0" + d;
            return y+"-"+m+"-"+d
        },
        //签到
        sign:function(){
            var params = {
                ut:Vue.auth.getUserToken()
            };
            //以form提交而不是json格式
            Vue.api.postForm("/api/social/write/sign/doSign", params, (result) => {
                if(result.data){
                    this.signYiBean = result.data.amount;
                    this.getSignDays();
                    this.getPoint();
                }
            },(result) => {
                if(result.code == 'point_maxPoints_NotMatch'){
                    
                }
            });
        },
        //查询账户伊豆
        getPoint: function () {
            var url = '/api/my/accountSummary';
            var params ={
                ut:Vue.auth.getUserToken()
            }
            Vue.api.get(url, params, (res) => {
                if(res.data){
                    this.pointNum = res.data.pointBalance;
                }
            })
        }
    }

})

