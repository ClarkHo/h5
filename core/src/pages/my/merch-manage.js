import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";



//获取url 参数 根据类目id或者关键词查找结果
let urlParams = Vue.utils.paramsFormat(decodeURIComponent(window.location.href));
var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        merchList: [],  //商品列表
        companyId: Vue.mallSettings.getCompanyId(),
        pageNo: 1,
        pageSize: 10,
       // detailTab: "collect1",
        totalCount: 0,
        totalCountR:0,//已推荐商品
        showNoMore:false, //显示没有更多数据了
        showNoMoreR:false,//已推荐商品显示没有更多数据了
        showSearchPop:false,//搜索弹层
        showSequencePop: false,//排序弹层
        showAllPop: false,//全部商品弹层
        showFilterPop: false,//过滤弹层
        //currentIndex: 0,//以哪种方式排序(选中标红)
        complexText: '排序',//默认综合排序
        sortType: 0,//排序方式(默认综合排序)
        sortByList: [],
        sortMode:false,
        //可推荐商品
        rePageNo: 1, //已推荐商品页码
        rePageSize: 10, //已推荐商品页码大小
        recommendList: [], //可推荐商品商品列表
        keyword:'',
        paramCategoryId:'',
        platformId:3,
        //前台类目
        categoryList:[], //一级类目
        showCategory:false,
        childrenCategories:[],
        currentCategoryId:'',
        categoryChildrenList:{}, //子类目集
        currentCategory:[], //当前展示类目

        //筛选相关
        showFilter:false,
        prices:{
            from:'',
            to:''
        },
        brandList:[],//品牌列表
        brandListBak:'',//品牌列表备份
        showAllBrands:false, //显示所有品牌
        properties:[], //各属性列表
        propertiesBak:'',//各属性列表备份
        selectedPropIdsWithP:[],//带父id属性id
        selectedPropIds:'',
        selectedPropIdsList:[],
        selectedBrandIds:[],
        running:false,
        tabIndex:0
    },
    ready: function() {
        //类目id
        if (urlParams.categoryId) {
            this.paramCategoryId = urlParams.categoryId;
        }
        //关键字
        if (urlParams.keyword) {
            this.keyword = urlParams.keyword;
        }
        //价格区间
        if(urlParams.price){
            this.prices.from=urlParams.price.split(',')[0]||'';
            this.prices.to=urlParams.price.split(',')[1]||'';
        }
        //属性id
        if(urlParams.attrValueIds){
            this.selectedPropIds=urlParams.attrValueIds;
            //this.selectedPropIdsWithP=urlParams.attrValueIds.split(',');
            //this.selectedPropIdsWithP.forEach((v)=>{
            //    "use strict";
            //    this.selectedPropIds.push(v.split('_')[0])
            //})
        }
        //品牌id
        if(urlParams.brandIds){
            this.selectedBrandIds=urlParams.brandIds.split(',');
        }
        this.getProductList();
        this.getRecommendList();
        this.getCategory();
        //滚动加载更多数据
        Vue.scrollLoading(() => {

            if(!this.showSearchPop){
                if(this.getCurrentTab()==0) {
                    if (this.merchList.length < this.totalCount) {
                        this.pageNo += 1;
                        this.getProductList();
                    } else if (this.merchList.length >= this.totalCount) {
                        this.showNoMore = true;
                    }
                }else{
                    if (this.recommendList.length < this.totalCountR) {
                        this.rePageNo += 1;
                        this.getRecommendList();
                    } else if (this.merchList.length >= this.totalCountR) {
                        this.showNoMoreR = true;
                    }
                }
            }
        });
        $('body').bind('touchend',(e)=>{
            "use strict";
            this.getCurrentTab();
        })
    },
    methods: {
        //获取可推荐商品
        getProductList: function(isInit) {
            var params = {
                ut: this.ut,
                //companyId: this.companyId,
                pageNo: this.pageNo,
                pageSize: this.pageSize,
                platformId:config.platformId,
                keyword:location.search.length>0&&this.keyword?this.keyword:'all',
                navCategoryIds:this.paramCategoryId||'',
                brandIds: this.selectedBrandIds.join(),//品牌id
                sortTypes:this.sortType, //排序
                guideJson: this.getAttrJson(this.selectedPropIds)//导购属性id
            };
            params=this.paramFormat(params);
            Vue.api.get("/api/seller/product/list", params, (result) => {
                this.loaded=true;
                this.totalCount = result.data.totalCount;
                if(isInit){
                    this.merchList=[];
                }
                if (result.data&&result.data.productList instanceof Array&&result.data.productList.length > 0) {
                    this.merchList = this.merchList.concat(result.data.productList);
                }

                //排序列表
                if (result.data.sortByList) {
                    this.sortByList = result.data.sortByList;
                } else {
                    this.sortByList = [];
                }
                //品牌列表
                if(this.brandList.length==0) {
                    this.brandList = result.data.brandResult || [];
                    this.brandListBak=JSON.stringify(this.brandList);
                    this.brandList.forEach((v)=>{
                        "use strict";
                        if(this.selectedBrandIds.indexOf(v.id.toString())>=0){
                            v.checked=true;
                        }else{
                            v.checked=false;
                        }
                    })
                }
                //属性列表
                if(this.properties.length==0) {
                    this.properties = result.data.attributeResult || [];
                    this.propertiesBak=JSON.stringify(this.properties);
                    for(var i in this.properties){
                        for(var j in this.properties[i].attributeValues)
                            if(this.selectedPropIdsList.indexOf(this.properties[i].attributeValues[j].id.toString())>=0){
                                this.properties[i].attributeValues[j].checked=true;
                                this.properties[i].exist=true;
                            }
                    }
                }
            });
        },
        paramFormat:function(params){
            "use strict";
            var params=params;
            //价格区间(筛选用)
            var prices=[parseFloat(this.prices.from)||0,parseFloat(this.prices.to)||0];
            if(prices[0]==''&&prices[1]=='') prices=[];
            params.priceRange = prices.join()
            return params;
        },
        setToUrl:function(arrays){
            "use strict";
            var urlAttr=[]
            var arrays=arrays.replace(/\"/g,'').split(',')
            if(this.propertiesBak.length==0) return '';
            var attrs=JSON.parse(this.propertiesBak);
            if(attrs instanceof Array){
                attrs.forEach((v)=>{
                    var ids=[]
                    if(v.attributeValues instanceof Array){
                        v.attributeValues.forEach((V)=>{
                            if(arrays.indexOf(V.id.toString())>=0){
                                ids.push(V.id)
                            }
                        })
                    }
                    if(ids.length>0)
                        urlAttr.push(v.id+':'+ids.join('-'))
                })
            }
            return JSON.stringify(urlAttr.join()).replace(/\"/g,'');
        },
        getAttrJson:function(attrParam){
            "use strict";
            var attrJson={
                attributeJson:[]
            }
            this.selectedPropIdsList=[];
            if(attrParam.length>0){
                var l1=attrParam.replace(/\"/g,'').split(',');
                if(l1.length>0){
                    l1.forEach((v)=>{
                        var l2=[];
                        if(v.length>0&&v.indexOf(":")>0&&(l2=v.split(":")).length==2) {
                            var l21=[];
                            if(l2[1].split("-").length>0){
                                l2[1].split("-").forEach((v)=>{
                                    l21.push(v-0);
                                    this.selectedPropIdsList.push(v);
                                })
                            }
                            attrJson.attributeJson.push({
                                attributeId: l2[0]-0,
                                attrValueIds: l21
                            })
                        }
                    })
                }
            }
            return JSON.stringify(attrJson);
        },
        getCategory:function(parentId){
            "use strict";
            var params={
                parentId:parentId||0,
                level:1
            }
            Vue.api.get("/api/category/list",params,(result)=>{
                this.categoryList=result.data.categorys||[];
                if(this.categoryList.length>0){
                    this.getChildrenCategories(this.categoryList[0].categoryId)
                }
            })

        },
        getChildrenCategories:function(parentId){
            "use strict";
            this.currentCategoryId=parentId;
            if(this.categoryChildrenList[parentId]){
                this.currentCategory=this.categoryChildrenList[parentId];
                return;
            }
            var params={
                parentId:parentId||0,
                level:2
            }
            Vue.api.get("/api/category/list",params,(result)=>{
                this.categoryChildrenList[parentId]=result.data.categorys||[];
                this.currentCategory=this.categoryChildrenList[parentId];
            })
        },

        //获取已推荐商品
        getRecommendList:function(isInit) {
            "use strict";
            var params = {
                ut: this.ut,
                platformId: config.platformId,
                pageNo: this.rePageNo,
                pageSize: this.rePageSize
            };
            Vue.api.get("/api/seller/product/recoList", params, (result) => {
                if (isInit)
                    this.recommendList=[];
                this.recommendList = this.recommendList.concat(result.data.data || [])
                this.totalCountR = result.data.totalCount;
            });
        },
        //推荐商品
        recommend:function(mpId){
            "use strict";
            if(this.running) return;
            this.running=true;
            var params = {
                ut: this.ut,
                companyId: this.companyId,
                mpId:mpId
            };
            Vue.api.postForm("/api/seller/product/recommend", params, (result) => {
                $.tips({
                    content:"推荐成功",
                    stayTime:2000,
                    type:"success"
                });
                setTimeout(()=> {
                    this.running = false;
                },1000)
                this.pageNo=1;
                this.rePageNo=1;
                this.getProductList(true);
                this.getRecommendList(true);
            });
        },
        //取消推荐商品
        cancelRecommend:function(mpId){
            "use strict";
            if(this.running) return;
            this.running=true;
            var params = {
                ut: this.ut,
                companyId: this.companyId,
                mpId:mpId
            };
            Vue.api.postForm("/api/seller/product/cancel", params, (result) => {
                $.tips({
                    content:"取消推荐成功",
                    stayTime:2000,
                    type:"success"
                });
                setTimeout(()=> {
                    this.running = false;
                },1000)
                this.pageNo=1;
                this.rePageNo=1;
                this.getProductList(true);
                this.getRecommendList(true);
            });
        },
        //关闭所有弹窗
        closeAllPop:function(){
            "use strict";
            this.showCategory=false;
            this.showSequencePop = false;
            this.showFilter=false;
            this.sortMode=false;
        },
        //展示全部商品
        toShowAll:function(){
            "use strict";
            if(this.showCategory){
                this.closeAllPop();
                return;
            }
            this.closeAllPop();
            this.showCategory=true;

        },
        //筛选
        toFilter:function(){
            "use strict";
            if(this.showFilter){    //如果没有商品或如果筛选弹窗打开
                this.closeAllPop();
                return;
            }else{
                this.closeAllPop();
                this.showFilter=true;;
            }
        },
        //排序
        toComplexSort: function(){
            if(this.merchList.length==0||this.showSequencePop){
                this.closeAllPop();
                return;
            }else{
                this.closeAllPop();
                this.sortMode=true;
                this.showSequencePop = true;
            }

        },
        //完成排序
        complexSort: function(sort){
            this.sortType = sort.sortTypeCode;
            this.complexText = sort.sortTypeDesc;
            this.closeAllPop();
            this.sortMode=true;
            this.getProductList(true);
        },
        //提交搜索
        submitSearch: function(key){
            if(key) this.keyword = key;
            if(this.keyword == ''){
                $.tips({
                    content: '请输入关键词',
                    stayTime: 2000,
                    type: "warn"
                });
            }else{
                //刷新页面
                window.location.href = '' + "/my/merch-manage.html?keyword="+this.keyword;
            }
        },
        //获取当前tab
        getCurrentTab:function(){
            "use strict";
            if($('.ui-tab-content>li').eq(0).hasClass('current')){
                this.tabIndex = 0;
            }else this.tabIndex= 1;
            return this.tabIndex
        },
        //筛选相关
        //选择全部属性
        selectAll:function(id){
            $('#'+id).addClass('ui-sift-lable-active');
            $('#' + id).parent().siblings().find('span').removeClass('ui-sift-lable-active');
        },
        //选择单个属性
        selectSingle:function(id,pid){
            $('#'+pid).removeClass('ui-sift-lable-active');
            if($('#'+id).hasClass('ui-sift-lable-active'))
                $('#'+id).removeClass('ui-sift-lable-active');
            else
                $('#'+id).addClass('ui-sift-lable-active');
        },
        //重置
        resetAttrAndBrand:function(){
            this.brandList=[];
            this.properties=[];
            this.selectedPropIds=[];
            this.selectedBrandIds=[];
            //var urlParams=Vue.utils.paramsFormat(decodeURIComponent(window.location.href));
            //if(urlParams.price){
            //    this.prices.from=urlParams.price.split(',')[0]||'';
            //    this.prices.to=urlParams.price.split(',')[1]||'';
            //}else{
            //    this.prices.from='';
            //    this.prices.to='';
            //}
            //if(urlParams.attrValueIds){
            //    this.selectedPropIds=[];
            //    this.selectedPropIdsWithP.forEach((v)=>{
            //        "use strict";
            //        this.selectedPropIds.push(v.split('_')[0])
            //    })
            //}
            //if(urlParams.brandIds){
            //    this.selectedBrandIds=urlParams.brandIds.split(',');
            //}
            this.prices.from='';
            this.prices.to='';
            //初始状态有品牌,把全部去掉
            if(this.selectedBrandIds.length>0){
                $('#b_0000').removeClass('ui-sift-lable-active');
            }
            if(this.brandListBak)
                this.brandList=JSON.parse(this.brandListBak);
            if(this.propertiesBak)
                this.properties=JSON.parse(this.propertiesBak);
            //this.brandList=JSON.parse(this.brandListBak);
            //this.properties=JSON.parse(this.propertiesBak);


        },
        //确定选择
        submitAllSelection:function() {
            var ids1 = [], ids2 = [], selectedPropIds, selectedBrandIds;
            for (var i = 0; i < $('.select-prop .ui-sift-lable-active').length; i++) {
                ids1.push($('.select-prop .ui-sift-lable-active')[i].id.split('_').pop());
                //var tIds=$('.select-prop .ui-sift-lable-active')[i].id.split('_');
                //ids1.push([tIds.pop(),tIds.pop()].join('_'));
            }
            selectedPropIds = ids1.join(',')

            for (var j = 0; j < $('.select-brand .ui-sift-lable-active').length; j++) {
                ids2.push($('.select-brand .ui-sift-lable-active')[j].id.split('_').pop());
            }
            selectedBrandIds = ids2.join(',')

            //如果两个价格大小相反,需要调换
            if(this.prices.from.length>0 && this.prices.to.length>0 && parseFloat(this.prices.from)>parseFloat(this.prices.to)){
                var temp=this.prices.from;
                this.prices.from=this.prices.to;
                this.prices.to=temp;
            }
            //跳转
            location.href = "/my/merch-manage.html?keyword=" + this.keyword +
                (this.prices.from.length>0||this.prices.to.length>0?"&price=" + this.prices.from + ',' + this.prices.to :'')+
                (selectedPropIds.length>0?("&attrValueIds=" + this.setToUrl(JSON.stringify(selectedPropIds))):'') +
                (selectedBrandIds.length>0?"&brandIds=" + selectedBrandIds:'')
        },
        dropdownProp:function(e,id){
            if($(e.target).text()=='展开') {
                $(e.target).text('收起').siblings().removeClass('icons2-arrow-b').addClass('icons2-arrow-t');
                $('#'+id).parent().siblings().filter('.gt2').show();
            }else {
                $(e.target).text('展开').siblings().removeClass('icons2-arrow-t').addClass('icons2-arrow-b');
                $('#'+id).parent().siblings().filter('.gt2').hide();
            }
        },
        //统计所有促销标签
        formatPromotionText:function(prod){
            "use strict";
            var iconText=[];
            if(prod.promotionInfo instanceof Array&&prod.promotionInfo.length>0){
                if(prod.promotionInfo[0].promotions instanceof Array&&prod.promotionInfo[0].promotions.length>0){
                    prod.promotionInfo[0].promotions.forEach((v)=>{
                        iconText.push(v.iconText);
                    })
                }
            };
            return (prod.promotionIconTexts||[]).concat(iconText);
        },
    },
    computed:{
        noRecommend:function(){
            "use strict";
            var boo=true;
            this.merchList.forEach((v)=>{
                if(v.isRecommend==1) boo=false;
            })
            return boo;
        },
        showPop:function(){
            "use strict";
            return this.showCategory||this.showSequencePop||this.showFilter;
        }
    }
});
window.addEventListener('load', function(){

    var tab = new fz.Scroll('.ui-tab', {
        role: 'tab'
       // autoplay: true,
       // interval: 3000
    });

    /* 滑动开始前 */
    tab.on('beforeScrollStart', function(from, to) {
        // from 为当前页，to 为下一页
    })

    /* 滑动结束 */
    tab.on('scrollEnd', function(curPage) {
        // curPage 当前页
    });

})