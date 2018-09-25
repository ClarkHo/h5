import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiRotaryDialog from "../../components/ui-rotary-dialog.vue";
import UiShare from "../../components/ui-share.vue";
import config from "../../../env/config.js";

var urlParams = Vue.utils.paramsFormat(location.href);
//抽奖活动id
var themeId = urlParams.themeId || 0;
var ut = Vue.auth.getUserToken();

//隐藏app头部
Vue.app.postMessage('hiddenHead',{'isHidden':'1'});

new Vue({
    el: 'body',
    components: { UiHeader, UiRotaryDialog,UiShare },
    data: {
        isApp:Vue.browser.isApp(),
        loggedIn: Vue.auth.loggedIn(),
        //活动信息
        lotteryInfo: {},
        //奖品列表
        awardsList: [],
        //中奖名单
        receiveList: [],
        //是否在旋转中
        rotating: false,
        //当前抽中的奖品
        award: {},
        //中奖记录id
        receiveRecordId: null,
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
            //积分/伊豆不足
            "notEnoughPoint": "8",
            //需要先下单才可以抽奖
            "needOrder": "9",
            //活动不存在
            "nonExistent ": "10",
            //需要登录（自定义code）
            "needLogin": "101"
        },
        //谢谢参与奖品
        thankParticipationAward: null,
        //活动数据是否已经加载
        loaded: false,
        //中奖名单滚动的计时器
        rollTimer: null,
        themeId:themeId,
        showShare:false,
        shareConfig: {}, //分享配置
        refIds:[],
    },
    computed: {
        //总结抽奖次数
        totalDrawNum: function () {
            if (this.lotteryInfo) {
                return this.zeroIfNull(this.lotteryInfo.usableNum);
            }

            return 0;
        }
    },
    //初始化
    ready: function() {
        if(!this.loggedIn){
            this.showResult(this.DrawResultCodes.needLogin)
            return;
        }else{
            this.getLotteryInfo();
        }
    },
    methods: {
        zeroIfNull: function (num) {
            return num ? num : 0;
        },
        //点击分享
        clickShare: function () {
            // this.refIds = this.refIds.join(",");

            if (this.isApp) {
                this.shareConfig = {
                    url: '/lottery/rotary-table.html?themeId=' +this.themeId,
                    title: "越转越幸运",
                    description: "我在这里转出了一份“小确幸”，你也来试试吧！",
                    url160x160: "/images/shareDraw.png"
                };
                Vue.app.postMessage("share", this.shareConfig);

            } else{
                this.shareConfig = {
                    url: "/lottery/rotary-table.html?themeId=" +this.themeId, 
                    title: "越转越幸运",
                    description: "我在这里转出了一份“小确幸”，你也来试试吧！",
                    pic: "/images/shareDraw.png"
                };
                this.showShare = true;

                Vue.getSharePoint(this.themeId,3,2);
            }
        },


        //获取抽奖信息
        getLotteryInfo: function() {
            var params = { ut: ut, themeId: themeId };
            Vue.api.get("/api/promotion/lottery/info", params, (result) => {
                if (result.data) {
                    this.lotteryInfo = result.data;
                    this.awardsList = this.lotteryInfo.awardsList || [];
                    this.receiveList = this.lotteryInfo.receiveList || [];

                    for (var i = 0; i < this.awardsList.length; i++) {
                        if(this.awardsList[i].awardsName == "谢谢参与") {
                            this.thankParticipationAward = this.awardsList[i];
                            break;
                        }
                    }

                    if (this.receiveList.length > 3) {
                        this.rollReceives();
                    }

                    this.loaded = true;
                }
            }, (result)=>{
                this.showResult(this.DrawResultCodes.nonExistent);
            });
        },

        //点击go
        go: function () {
            if (!this.loaded) {
                return;
            }

            //用户未登录
            if (!this.loggedIn) {
                this.showResult(this.DrawResultCodes.needLogin)
                return;
            }

            if (this.lotteryInfo.status == 1) {
                //活动未开始
                this.showResult(this.DrawResultCodes.activityNotStarted);
                return;
            } else if (this.lotteryInfo.status == 3) {
                //活动已结束
                this.showResult(this.DrawResultCodes.activityHasEnd);
                return;
            }

            if (this.lotteryInfo.themeType==1 && this.lotteryInfo.freeDrawNum < 1 && this.lotteryInfo.pointAmount < this.lotteryInfo.consumeNum) {
                //积分/伊豆/伊豆不足
                this.showResult(this.DrawResultCodes.notEnoughPoint);
                return;
            }

            if (this.lotteryInfo.themeType==2 && this.lotteryInfo.effectiveOrderDrawNum==0) {
                //没有下单无法抽奖
                this.showResult(this.DrawResultCodes.needOrder);
                return;
            }

            if (this.lotteryInfo.usableNum < 1) {
                //抽奖次数已用完
                this.showResult(this.DrawResultCodes.todayNoTimes);
                return;
            }

            //转动抽奖
            this.rotate();
        },

        //旋转大转盘
        rotate: function() {
            if (this.rotating) {
                return;
            }

            this.rotating = true;
            this.drawResultCode = "";

            var self = this;

            //先转起来
            $('.table').rotate({
                angle: -30, //初始角度
                duration: 10000, //转圈时间,最多10秒
                animateTo: 360 * 10 + this.getAwardDegree(this.thankParticipationAward), //10圈,如果接口调用超时默认指向谢谢参与
                callback: function() {
                    //如果接口还没有返回,就显示未中奖
                    self.rotating = false;
                    self.showResult(self.DrawResultCodes.thankParticipation);
                    //更新抽奖信息
                    self.getLotteryInfo();
                }
            });

            var params = { ut: ut, themeId: themeId };
            Vue.api.postForm("/api/promotion/lottery/draw", params, (result) => {
                var lotteryResult = result.data || {};
                if(lotteryResult.drawResultCode != 1) {
                    return;
                }
                this.award = lotteryResult.awardsVO || {};
                this.receiveRecordId = lotteryResult.receiveRecordId;
                //要转动的角度
                var deg = this.getAwardDegree(this.award || this.thankParticipationAward);
                $('.table').stopRotate();
                var tempRotate = $('.table').getRotateAngle();
                //接口返回，转动到指定位置
                $('.table').rotate({
                    angle: tempRotate, //初始角度
                    duration: 3000, //转圈时间
                    animateTo: 1080 + deg, //3圈加上最后的结果
                    callback: function() {
                        self.rotating = false;
                        self.showResult(lotteryResult.drawResultCode);
                        //如果奖品是商品需要加购物车
                        if (self.award.awardsType == 1) {
                            self.addAwardToCart(self.receiveRecordId, self.award);
                        }
                        //更新抽奖信息
                        self.getLotteryInfo();
                    }
                });

            });
        },

        //获取奖品角度
        getAwardDegree: function (award) {
            if (!award) {
                return 0;
            }

            var index = 0;
            for (var i = 0; i < this.awardsList.length; i++) {
                if (this.awardsList[i].id == award.id) {
                    index = i;
                    break;
                }
            }

            //总奖品数
            var totalAward = 6;
            //每个奖品占60度
            var degPerItem = 360 / totalAward;
            //要转动的角度
            return (totalAward - index) * degPerItem;
        },

        //加入购物车
        addAwardToCart: function (receiveId, award) {
            var params = {ut:ut, mpId: award.awardsId, num: award.awardsNum || 1, sessionId: Vue.session.getSessionId(), itemType: 3, objectId: receiveId};
            Vue.api.postForm("/api/cart/addItem", params, (result) => {
                this.showSizePop=false;
                // this.updateProduct();
                this.getCartCount();
            });
        },

        //在试一次
        tryAgain: function () {
            this.hideResult();
            this.go();
        },

        //显示结果
        showResult: function (code) {
            this.drawResultCode = code;
        },

        //跳转购物车页面

        goShoppingCar: function(){
            if (Vue.browser.isApp()) {
                window.location.href = "${appSchema}://shoppingCar";
            } else {
                window.location.href = "/cart.html";
            }
        },

        //关闭结果
        hideResult: function () {
            this.drawResultCode = "";
            // this.getLotteryInfo();
        },

        //转到首页
        goHomepage: function () {
            location.href = "/index.html";
        },

        //转到登录页
        goLoginpage: function () {
            if (Vue.browser.isApp()) {
                //跳转到app登录页面
                window.location.href = "${appSchema}://login";
            } else {
                location.href = "/login.html?from=" + encodeURIComponent(Vue.utils.getRelatedUrl());
            }
        },

        //滚动中奖记录
        rollReceives: function() {
            if (this.rollTimer) {
                clearInterval(this.rollTimer);
            }

            this.rollTimer = setInterval(function() {
                $(".rotaryTable-List").find("ul").animate({
                    marginTop: "-23px"
                }, 1000, function() {
                    $(this).css({ marginTop: "0px" }).find("li:first-child").appendTo(this);
                })
            }, 2000);
        },
        back: function ( ) {

            if (Vue.browser.isApp()) {
                //跳转到app首页页面
                // window.location.href = "${appSchema}://main";
                Vue.app.back(true, true);

            } else {
                location.href = "/index.html";
            }
        }


    }
});
