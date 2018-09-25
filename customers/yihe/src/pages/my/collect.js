import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../config/default.js";


const itemId = Vue.utils.paramsFormat(window.location.href).itemId;
var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        goodList: [],  //商品收藏列表
        passageList:[],//文章收藏列表
        companyId: Vue.mallSettings.getCompanyId(),
        pageSize: 10,
        pageNo_good: 1,
        pageNo_article: 1,
        pageNo_foot: 1,
        detailTab: 1,
        checkbox:1,
        totalCount: 0,
        totalCountpassage:0,//文章总数量
        editStatus: false,   //编辑状态
        showDelete:false,   //删除确认
        isFavorite:0,//编辑状态
        cartInfo:{} ,//商品信息
        passageInfo:{},//文章信息
        footIfo:{},//足迹信息
        // goodFlags:{},//商品标识
        // passageFlags:{},//文章标识
        // footFlags:{},//足迹标识
        footList:[],//足迹列表
        footGood:[],//
        totalCountfoot:0,//足迹总数
        footValues:[]

    },
    ready: function() {
        let urlParams = Vue.utils.paramsFormat(window.location.href);
        if(urlParams.t==2)//当参数为2时，为文章
            this.detailTab=urlParams.t;
        else if(urlParams.t==3)
            this.detailTab=urlParams.t;
        //输入别的值为商品
        else
            this.detailTab=1;
        //加载首屏内容
        this.changeTab(this.detailTab);
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            if(this.detailTab == 1){
                if(this.goodList.length < this.totalCount){
                    this.pageNo_good += 1;
                    this.getGoodList();
                }

            }else if(this.detailTab == 2){
                if(this.passageList.length < this.totalCountpassage) {
                    this.pageNo_article += 1;
                    this.getPassageList();
                }
            }else{
                if(this.footList.length < this.totalCountfoot) {
                    this.pageNo_foot += 1;
                    this.getFootList();
                }
            }

        });
        // this.getGoodList();
        // this.getPassageList()
    },
    methods: {
        changeTab:function (index) {
            this.detailTab = index;
            if (this.detailTab == 1) {
                this.editStatus = false;//切换编辑状态
                if (this.goodList.length == 0)
                //列表为空时，请求数据
                    this.getGoodList();
                else
                //不为空时，把上一次选中的状态置为未选中
                    this.goodList.forEach((v)=> {
                        v.checked = false;
                    })
            } else if (this.detailTab == 2) {
                this.editStatus = false;//切换编辑状态
                if (this.passageList.length == 0)
                //列表为空时，请求数据
                    this.getPassageList();
                else
                //不为空时，把上一次选中的状态置为未选中
                    this.passageList.forEach((v)=> {
                        v.checked = false;
                    })
            }
            else{
                this.editStatus = false;//切换编辑状态
                if (this.footList.length == 0)
                //列表为空时，请求数据
                    this.getFootList();
                else
                //不为空时，把上一次选中的状态置为未选中
                    this.footList.forEach((v)=> {
                        v.checked = false;
                    })
            }
        },
        deleteFavorite : function(all){
        	if((all||[]).length===0){
                $.tips({
                    content:"请先选择商品",
                    stayTime:2000,
                    type:"success"
                });
                return;
           }
            let params;
            if(this.detailTab == 1){
                //取消商品收藏
                if(all.length>1){
                    params= {
                        ut:this.ut,
                        companyId: this.companyId,
                        ids:all.join(',')
                    };
                }else{
                    params= {
                        ut:this.ut,
                        companyId: this.companyId,
                        type: 1,
                        entityId:all.join(',')//商品id,
                    };
                }
                //以form提交而不是json格式
                Vue.api.postForm("/api/my/favorite/clear", params, (result) => {
                    $.tips({
                        content:"取消收藏商品成功",
                        stayTime:2000,
                        type:"success"
                    });
                    setTimeout(()=>{
                        location.href = '${contextPath}/my/collect.html?t='+this.detailTab;
                    },2000)

                });
            }
            else if(this.detailTab == 2){
                if(all.length>1){
                    params= {
                        ut:this.ut,
                        companyId: this.companyId,
                        ids:all.join(',')
                    };
                }else{
                    params= {
                        ut:this.ut,
                        companyId: this.companyId,
                        // type: 5,
                        ids:all.join(',')//商品id,
                    };
                }
                //以form提交而不是json格式
                Vue.api.postForm("/api/my/favorite/clear", params, (result) => {
                    $.tips({
                        content:"取消收藏文章成功",
                        stayTime:2000,
                        type:"success"
                    });
                    setTimeout(()=>{
                        //刷新当前页
                        location.href = '${contextPath}/my/collect.html?t='+this.detailTab;
                    },2000)

                });
            }
            else{
                let params = {
                    ut:this.ut,
                    mpIds: all.join(',')//足迹商品mpIds
                };
                //以form提交而不是json格式
                Vue.api.postForm("/api/my/foot/delete", params, (result) => {
                    $.tips({
                        content:"删除足迹成功",
                        stayTime:2000,
                        type:"success"
                    });
                    setTimeout(()=>{
                        //刷新当前页
                        location.href = '${contextPath}/my/collect.html?t='+this.detailTab;
                    },2000)

                });
            }
        },
        getGoodList:function () {
            var param = {
                ut: this.ut,
                companyId: this.companyId,
                pageNo: this.pageNo_good,
                pageSize: this.pageSize
            };
            Vue.api.get(config.apiHost + "/api/my/favorite/goods", param, (result) => {
                if(result.data.data && result.data.data.length>0){
                    var itemIds=[];
                    for(let p of result.data.data){
                        itemIds.push(p.mpId)
                    }
                    itemIds = itemIds.join();
                    //获取实时价格
                    Vue.getPriceAndStock(itemIds,result.data.data,null,(obj)=> {
                        //循环选中的商品，置为未选中
                        (obj||[]).forEach((v)=>{
                            v.checked=false;
                        })
                        //this.cartInfo = data;
                        this.goodList = this.goodList.concat(obj||[]);
                    });
                }
                this.totalCount = result.data.totalCount;
            });
        },
        getPassageList:function () {

            var params = {
                ut: this.ut,
                companyId: this.companyId,
                pageNo: this.pageNo_article,
                pageSize: this.pageSize
            };

            Vue.api.get(config.apiHost + "/api/my/favorite/articleList", params, (result) => {
                //循环选中的文章，置为未选中
                var passageInfo = result.data;
                (passageInfo.data||[]).forEach((v)=>{
                    v.checked=false;
                })
                //this.passageInfo = data;
                this.totalCountpassage = result.data.totalCount;
                this.passageList = this.passageList.concat(result.data.data||[]);
            });
        },
        //比较name是否相同
        getFootCompare:function(list){
            var finalList=[];
            var mapping={};
            for (let p of list || []) {
                if(mapping[p.name]){
                    mapping[p.name]=mapping[p.name].concat(p.values)
                }else{
                    mapping[p.name]=p.values
                }
            }
            for(var k in mapping){
                finalList.push({
                    name:k,
                    values:mapping[k]
                })
            }
            return finalList;
        },
        getFootList:function () {
            var params = {
                ut: this.ut,
                platformId: 3,
                pageNo: this.pageNo_foot,
                pageSize: this.pageSize
            };

            Vue.api.get(config.apiHost + "/api/my/foot/list", params, (result) => {
                //循环选中的商品，置为未选中
                var footInfo = result.data;
                (footInfo.data||[]).forEach((v)=>{
                    v.checked=false;
                })
                this.totalCountfoot = result.data.totalCount;
                this.footList = this.footList.concat(result.data.data);
                this.footList=this.getFootCompare(this.footList);
            });
        }
    },
    computed: {
        //计算商品选中的个数
        checkedCount: function () {
            var i = 0;
            for (let p of this.goodList || []) {
                if (p.checked) i++
            }
            return i;
        },
        //得到每个选中的商品id
        selectAll: function () {
            var ids = [],mpIds=[];
            for (let p of this.goodList || []) {
                if (p.checked) {
                    mpIds.push(p.mpId);
                    ids.push(p.id);
                }
            }
            if(ids.length>1){
                return ids;
            }else{
                return  mpIds;
            }

        },
        //计算文章选中的个数
        checkedCount2: function () {
            var j = 0;
            for (let n of this.passageList || []) {
                if (n.checked) j++
            }
            return j;
        },
        //得到每个选中的文章id
        selectAll2: function () {
            if(this.passageList==null){
                return;
            }else{
                var ids = [];
                for (let n of this.passageList || []) {
                    if (n.checked)
                        ids.push(n.id)
                }
                return ids;
            }
        },
        //计算足迹商品选中的个数
        checkedCount3: function () {
            var f = 0;
            for (let t of this.footList || []) {
                for(let m of t.values){
                    if (m.checked) f++
                }
            }
            return f;
        },
        //得到每个选中的商品id
        selectAll3: function () {
            if(this.footList==null){
                return;
            }else{
                var mpIds = [];
                for (let t of this.footList || []) {
                    for(let m of t.values){
                        if (m.checked)
                            mpIds.push(m.mpId)
                    }
                }
                return mpIds;
            }
        }
    }
});