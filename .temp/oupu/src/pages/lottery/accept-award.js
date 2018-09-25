import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";

var urlParams = Vue.utils.paramsFormat(location.href);
//奖品id
var awardId = urlParams.id;

new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        loggedIn: Vue.auth.loggedIn(),
        //活动信息
        lotteryInfo: {},
        //奖品列表
        awardList: [],
        //中奖名单
        receiveList: [],
        //是否在旋转中
        rotating: false,
        //当前抽中的奖品
        award: {},
        //当前抽奖状态
        drawResultCode: "",
        //所有抽奖状态
        DrawResultCodes: {
            //中奖
            "winning": "1",
            //未中奖
            "notWinning": "2",
            //谢谢参与
            "thankParticipation": "3",
            //活动未开始
            "activityNotStarted": "4",
            //活动已经结束
            "activityHasEnd": "5",
            //今日机会已用完（限每日抽奖次数限制的抽奖）
            "todayNoTimes": "6",
            // 抽奖机会已用完 
            "noLotteryTimes": "7",
            //积分不足
            "notEnoughPoint": "8",
            //需要先下单才可以抽奖
            "needOrder": "9"
        }
    },
    //初始化
    ready: function() {
        this.getLotteryInfo();
    },
    methods: {
        //获取抽奖信息
        initAward: function() {
            var params = { ut: ut, themeId: themeId };
            Vue.api.get("/api/promotion/lottery/info", params, (result) => {
                if (result.data) {
                    this.lotteryInfo = result.data;
                    this.awardList = this.lotteryInfo.awardList || [];
                    this.receiveList = this.lotteryInfo.receiveList || [];

                    if (this.receiveList.length > 0) {
                        this.rollReceives();
                    }
                }
            });
        }

    }
});
