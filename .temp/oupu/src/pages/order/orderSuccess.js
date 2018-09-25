import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiGuessLike from "../../components/ui-guess-like.vue";
import config from "../../../env/config.js";

let urlParams = Vue.utils.paramsFormat(window.location.href);

var vm = new Vue({
    el: 'body',
    components: { UiHeader, UiGuessLike},
    data: {
        ut:Vue.auth.getUserToken(),
        orderCode:urlParams.orderCode,
        recoList:[],
    },
    ready: function() {
        this.getRecoList();
    },
    methods: {
        //猜你喜欢
        getRecoList: function (did) {
            var url = config.apiHost + '/api/read/product/recommendProductList';
            var param = {
                //distributorId: did,
                sceneNo:1,
                ut:this.ut,
                pageSize: 20,
                pageNo: 1,
                platformId: config.platformId,
                mpIds:urlParams.mpId,//商品id
                areaCode: Vue.area.getArea().aC,
            };
            Vue.api.get(url, param, (res) => {
                if(res.data && res.data.dataList.length>0) {
                    var itemIds=[];
                    for(let p of res.data.dataList){
                        itemIds.push(p.mpId)
                    }
                    itemIds = itemIds.join();
                    //获取实时价格
                    Vue.getPriceAndStock(itemIds,res.data.dataList,null,(obj)=>{
                        var list = [];
                        var temp = [];
                        for(var i in obj) {
                            if(i % 4 == 0) {
                                temp = [];
                            }
                            temp.push(obj[i]);
                            if(i % 4 == 0) {
                                list.push(temp);
                            }
                        }
                        this.recoList = list;
                        // this.resizeImgHeight();
                    });
                }
            }, () => {
                //处理掉不显示报错
            });
        },
    }
});

