import Vue from "vue";
import config from "../../env/config.js";
import UiScrollTop from "../components/ui-scroll-top.vue";
import UiFooter from "../components/ui-footer.vue";
import UiCountDown from "../components/ui-count-down.vue";
import UiHeader from "../components/ui-header.vue";
import UiDropDown from "../components/ui-drop-down.vue";
import UiMessage from "../components/ui-message.vue";
import UiShare from "../components/ui-share.vue";
import VueLazyload from 'vue-lazyload';

//隐藏app头部
Vue.app.postMessage('hiddenHead',{'isHidden':'1'});

Vue.use(VueLazyload,{
    loading:config.defaultImg
})
let urlParams = Vue.utils.paramsFormat(decodeURIComponent(window.location.href));
let hashParams = Vue.utils.hashFormat(window.location.href);
let hashStr = $.param(hashParams);

new Vue({
    el: 'body',
    components: {UiHeader,UiCountDown,UiFooter,UiScrollTop,UiShare,UiDropDown,UiMessage},
    data: {
        dtLoaded:false,
        ad_pic: [],//轮播图
        timeList:[],
        skDateTimes:{},//秒杀日期时间
        selectedDate:{}, //选中的秒杀日期
        selectedTime:{}, //选中的秒杀时间
        selectedCategory:{
            categoryId: 0,
            categoryName: "全部"
        }, //选中的秒杀类别
        categories:[],  //类目数组
        killProducts:{},
        pageNo: 1,//当前页
        pageSize: 10,//当页显示数量
        isEnd:false ,//是否最后一页
        showPages:false,//显示页面
        countDownFlag: false,
        rightNavFlag: false,
        isApp: Vue.browser.isApp(),
        weixin: Vue.browser.weixin(),
        userSelectedTime: urlParams.time ? true : false, //用户选择的时间
        sysTime: '',//系统时间
        restored: false, //是否通过restore恢复了页面的状态
        showShare:false,
        shareConfig: {}, //分享配置
        scrollflage:false,
        stopDropDown:false,
        firetime:'',
        is_tixing: false,
        not_tixing: false,
        status:2
    },
    ready: function() {
        "use strict";
        //如果分享地址里中文被多次转码
        if(location.href.indexOf('%25')>=0) location.replace(decodeURIComponent(location.href));
        //初始化PageRestorer (1分钟)
        Vue.pageRestorer.init(this, "seckill");

        //restore页面的内容
        if (Vue.pageRestorer.restore()) {
            this.restored = true;
        } else {
            this.getSkDateTimes();
        }

        //滚动加载更多数据
        Vue.scrollLoading({triggerHeight: 1000,callback:() => {
            this.scrollflage = true;
            if (!this.isEnd) {
                this.restored = false;
                this.pageNo += 1;
                this.getKillList(this.selectedTime.promotionId);
                this.showPages = true;
            }
        }});

        // this.tabsWidth = (window.screen.width)/5;
        //
        // this.switchToCenter();
    },
    computed:{
        dateLength:function(){
            "use strict";
            return (Object.getOwnPropertyNames(this.skDateTimes).length-1)*120+'px';
        },
        timeLength:function(){
            "use strict";
            return (Object.getOwnPropertyNames(this.selectedDate.times||{}).length-1)*71+'px';
        },
        catLength:function(){
            "use strict";
            return ((this.categories||[]).length)*100+'px';
        },
        //是否为今日秒杀
        isTodayKill: function () {
            return this.selectedDate && this.selectedDate.date == "今日秒杀";
        },
        //倒计时时间
        timeObj:function(){
            return {
                current:this.sysTime || this.selectedTime.sysTime,
                start:this.killProducts.startTime||this.selectedTime.startTime||this.selectedTime.starTime,
                end:this.killProducts.endTime||this.selectedTime.endTime
            };
        },
        showCountDown:function(){
            return this.sysTime&&this.countDownFlag;
        },
    },
    watch:{
        selectedDate:function(n,o){
            "use strict";
            if(Object.getOwnPropertyNames(n).length>1) {
                //如果是用户选择的时间
                if (this.userSelectedTime) {
                    return;
                }
                //初始设置,默认选择已经开始的时间
                if (Object.getOwnPropertyNames(o).length == 1) {
                    var doing, toDo,wait;
                    n.times.forEach((v)=> {
                        if (v.status == 2) doing = v;
                        if (!toDo&&v.status == 1) toDo = v;
                        if (!wait&&v.status==3) wait = v;
                    })
                    this.selectedTime = doing || toDo || wait || this.selectedTime;
                } else {
                    this.selectedTime = (n.times || [])[0]
                }
            }
        },
        selectedTime:function(n,o){
            "use strict";
            //换了n.promotionId, pageNo复位
            //this.pageNo= 1;
            //还原默认选中类别(全部)
            this.selectedCategory={
                categoryId: 0,
                categoryName: "全部"
            };
            ////切换时间后都会重新请求商品列表,所以isInit=true
            //this.getKillList(n.promotionId,true);
            //this.showCountDown = false;
            ////更新url
            //var url = location.pathname;
            //url += "?date=" + encodeURIComponent(this.selectedDate.date) + "&time=" + n.timeStr;
            //window.history.replaceState(null, "", url);
        },
        selectedCategory:function(n,o){
            //更新当前的系统时间
            this.updateSysTime();

            //如果是restore恢复了页面状态就不要重新初始化列表,否则需要重新初始化列表
            if (this.restored) {
                this.restored = false;
                return;
            }

            $('.ui-container').click();
            //selectedCategory初始化时不需求调用
            //if(n.categoryId==o.categoryId&&n.categoryId==0) return;
            //换了n.promotionId, pageNo复位
            this.pageNo= 1;
            //this.categories=[];
            //切换时间后都会重新请求商品列表
            this.scrollflage = false;
            this.getKillList(this.selectedTime.promotionId, true);
            this.countDownFlag = false;
            this.sysTime=0;
            //更新url
            var url = location.pathname;
            url += "?date=" + encodeURIComponent(this.selectedDate.date) + "&time=" + this.selectedTime.timeStr +"&cat="+n.categoryId;
            if (hashStr) {
                url += "#" + hashStr;
            }
            window.scrollTo(0,0);
            window.history.replaceState(null, "", url);
        }
    },
    methods: {
        // tab切换动画
        tabAnimation:function (index) {
            document.getElementById('seckill_tab_ul').style.transition="-webkit-transform 300ms";
            document.getElementById('seckill_tab_ul').style.webkitTransform = 'translateX('+ (-index*this.tabsWidth) +'px)';
        },
        switchToCenter:function () {

        },
        dropDown: function () {
            this.pageNo = 1;
            this.killProducts.merchantProducts = [];
            this.getKillList(this.selectedTime.promotionId);
            setTimeout(() => {
                this.stopDropDown = true;
            }, 2000);
        },
        //点击分享
        clickShare: function () {
            if (Vue.browser.isApp()) {
                Vue.app.postMessage("share", this.shareConfig);
            } else{
                this.shareConfig = {
                    url: "/lottery/rotary-table.html",
                    title: "抢购~！",
                    description: "抢购~！",
                    pic: "${staticPath}/images/shareBreakfast.png"
                };
                this.showShare = true;
            }
        },
        //将当前时间段移至可视区域
        showCurrTime: function () {
            Vue.nextTick(function () {
                //var $date = $('.seckill-date');
                var $time = $('.seckill-time');
                //var $dac = $date.find('li').filter('.active');
                var $tac = $time.find('li').filter('.active');
                //var doleft = $dac.offset().left;
                var toleft = $tac.offset().left;
                // var doright = doleft + $dac.width();
                var toright = toleft + $tac.width();
                //var dsleft = $date.scrollLeft();
                var tsleft = $time.scrollLeft();
                if(toleft > $time.width() || toright < 0) {
                    $time.scrollLeft($tac.position().left);
                }else if(toleft > 0 && toright > $time.width()) {
                    $time.scrollLeft(tsleft + $tac.width());
                }else if(toleft < 0 && toright < $tac.width()) {
                    $time.scrollLeft(tsleft - $tac.width());
                }

                // if(doleft > $date.width() || doright < 0) {
                //     $date.scrollLeft($dac.position().left);
                // }else if(doleft > 0 && doright > $date.width()) {
                //     $date.scrollLeft(dsleft + $dac.width());
                // }else if(doleft < 0 && doright < $dac.width()) {
                //     $date.scrollLeft(dsleft - $dac.width());
                // }
            })
        },
        //更新当前系统时间
        updateSysTime: function () {
            Vue.getSysTime((rtime) =>{
                this.sysTime = rtime.data.timestamp;
            });
        },
        //获取秒杀日时
        getSkDateTimes:function(){
            "use strict";
            var url='/api/promotion/secondkill/timeList',
                params={nocache: (new Date()).getTime()};
            Vue.api.get(url, params, (res) => {
                if((res.data.timeList||[]).length>0){
                    this.timeList=res.data.timeList;
                    var dt={};
                    res.data.timeList.forEach((obj)=>{
                        dt[obj.date]=obj;
                    })
                    this.skDateTimes = dt;

                    //地址栏有日期
                    if (urlParams.date) {
                        this.selectedDate = this.skDateTimes[decodeURIComponent(urlParams.date)]||{};
                        //如果地址栏的date是非法的,从存在的日期中找今日秒杀
                        if(Object.getOwnPropertyNames(this.selectedDate).length==1){
                            //优先选择今日秒杀
                            for (var i = 0; i < res.data.timeList.length; i++) {
                                var t =  res.data.timeList[i];
                                if (t.date == "今日秒杀") {
                                    this.selectedDate = t;
                                }
                            }
                            //如果没有今日秒杀,选择第一个
                            if(Object.getOwnPropertyNames(this.selectedDate).length==1) {
                                this.selectedDate = res.data.timeList[0];
                                return;
                            }
                        }
                        //地址栏date存在
                        for (var i = 0; i < this.selectedDate.times.length; i++) {
                            var t = this.selectedDate.times[i];
                            if (t.timeStr == urlParams.time) {
                                this.selectedTime = t;
                                break;
                            }
                        }
                        //没有选中给定的时间,取第一个时间
                        if(Object.getOwnPropertyNames(this.selectedTime).length==1){
                            this.selectedTime=this.selectedDate.times[0];
                        }
                    } else {
                        //优先选择今日秒杀
                        for (var i = 0; i < res.data.timeList.length; i++) {
                            var t =  res.data.timeList[i];
                            if (t.date == "今日秒杀") {
                                this.selectedDate = t;
                                this.showCurrTime();//控制日期可视
                                return;
                            }
                        }
                        // 默认选中第一个
                        this.selectedDate=res.data.timeList[0];
                    }
                    this.showCurrTime();//控制日期可视

                }
            })
        },
        //获取秒杀商品列表
        getKillList:function(promotionId,isInit){
            "use strict";
            var url='/api/promotion/secondkill/killList',
                params={
                    promotionId:promotionId,
                    pageSize:this.pageSize,
                    pageNo:this.pageNo,
                    // categoryId:this.selectedCategory.categoryId,
                    categoryId:0,
                    nocache: (new Date()).getTime(),
                    sortType: 1,
                    areaCode: Vue.area.getArea().aC,
                    ut:Vue.auth.getUserToken(),
                    sessionId: Vue.session.getSessionId()
                };
            this.dtLoaded=false;

            if(Vue.browser.isApp()){
                var version = Vue.browser.getUaParams().version;
                // var version = "5.0.7";
                version = version.replace(".","");
                version = version.replace(".","");
                if(Number(version) >= 506){
                    this.is_tixing = true;
                } else {
                    this.not_tixing = true;
                }
            } else {
                this.not_tixing = true;
            }

            Vue.api.get(url, params, (res) => {
                //如果取回有数据
                if((res.data.listObj||[]).length>0) {
                    this.firetime = res.data.listObj[0].startTime;
                    this.countDownFlag = true;
                    if(JSON.stringify(this.categories)!=JSON.stringify(res.data.listObj[0].categoryList||[]))
                        this.categories=res.data.listObj[0].categoryList||[];
                    //如果取回的item数小于pageSize, 表示到了最后一页
                    if ((res.data.listObj[0].merchantProducts || []).length < this.pageSize) {
                        this.isEnd = true;
                        //如果取回10件,表示没有结束
                    }else
                        this.isEnd=false;
                    //如果是第一次请求, 覆盖掉原有数据
                    if (isInit)
                        this.killProducts = res.data.listObj[0];
                    //否则添加到原有数据后面
                    else
                        this.killProducts.merchantProducts = this.killProducts.merchantProducts.concat(res.data.listObj[0].merchantProducts || []);
                    //已售百分比
                    for (var i = 0; i < this.killProducts.merchantProducts.length; i++) {
                        if(this.killProducts.merchantProducts[i].saleStock && this.killProducts.merchantProducts[i].saleStock != 0 && this.killProducts.merchantProducts[i].allStock && this.killProducts.merchantProducts[i].allStock != 0){
                            this.killProducts.merchantProducts[i].salePercent = Math.floor((this.killProducts.merchantProducts[i].saleStock)/(this.killProducts.merchantProducts[i].allStock)*100.00) + '%';
                        }else{
                            this.killProducts.merchantProducts[i].salePercent = '0%';
                        }
                    }

                    ////+++++实时库存与价格获取(等接口)+++++
                    //this.getPriceStockList((function(productList){
                    //    "use strict";
                    //    var itemIds=[];
                    //    for(let p of productList){
                    //        itemIds.push(p.mpId)
                    //    }
                    //    return itemIds.join();
                    //})(res.data.listObj[0].merchantProducts));
                    ////+++++实时库存与价格获取(等接口)+++++
                    //如果取回没有数据表示取到了最后一页
                }else{
                    //如果没有搜索到数据
                    if(this.pageNo==1)
                        this.categories=[];
                    this.isEnd = true;
                    //初始化如果取回空
                    if(isInit){
                        this.killProducts={}
                    }
                }
                this.dtLoaded=true;
            })
        },
        addItemInCart: function (item) {
            var params = {ut:Vue.auth.getUserToken(),mpId: item.mpId, num: 1, sessionId: Vue.session.getSessionId()};
            Vue.api.postForm("/api/cart/addItem", params, (result) => {
                Vue.utils.showTips('已加入购物车');
                this.showSizePop=false;
            });
        },
        ifNotLogin: function(item) {
            if (Vue.auth.loggedIn()) {
                this.addItemAlert(item);
            } else {
                 if (Vue.browser.isApp()) {
                    //跳转到app登录页面
                    window.location.href = "${appSchema}://login";
                } else {
                    window.location.href = "/login.html?from=" + encodeURIComponent(window.location.href);
                }
                
            }
        },
        addItemAlert: function (item) {
            var params={
                promotionId: item.promotionId,
                mpId: item.mpId,
                contentType: 18,
                ut:Vue.auth.getUserToken(),
                nocache: (new Date()).getTime(),
                sessionId: Vue.session.getSessionId()
            };
            Vue.api.postForm("/api/promotion/secondkill/saveNotice", params, (result) => {
                if(result.code == 0) {
                    item.noticeStatus = 1;
                    ++item.noticeCount;
                    var dia2=$(".ui-dialog").dialog("show");
                    // dia2.on("dialog:action",function(e){
                    //     console.log(e.index);
                    // });
                    // console.log(this.firetime/1000);
                    if(Vue.browser.isApp()){
                        Vue.app.postMessage('purchase',{"mpid":item.mpId,"firetime":this.firetime/1000});
                    }
                }
                
            });
        },
        //重定向
        gotoDetail:function(prod){
            "use strict";
            if(prod.status == 2 && !prod.canAreaSold){
                return;

            }else{

                if(Vue.browser.isApp()){
                    document.location = '${appSchema}://productdetail?body={"mpId":'+prod.mpId+'}'
                    //if(Vue.browser.android()){
                    //    document.location = '${appSchema}://productdetail?body={"mpId":'+mpId+'}'
                    //}
                }else{
                    document.location.href='/detail.html?itemId='+prod.mpId
                }

            }
        },
        reloadPage: function () {
            window.location.reload();
        },
        //价格说明
        priceCaption: function () {
            var dialog = $.dialog({
                title: "价格说明",
                content: "价格说明价格说明价格说明价格说明价格说明价格说明价格说明",
                button: ["我知道了"]
            });
        }
    }
});