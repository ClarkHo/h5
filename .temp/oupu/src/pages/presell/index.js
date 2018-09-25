import Vue from "vue";
import config from "../../../env/config.js";
import UiHeader from "../../components/ui-header.vue";


let urlParams = Vue.utils.paramsFormat(window.location.href);

new Vue({
    el: 'body',
    components: { UiHeader},
    data: {
        pageNo:1,
        pageSize:10,
        preSellList:[],
        isEnd:false,
    },
    ready: function() {
        this.initSwipe();
        this.getPreSellList();
        Vue.scrollLoading(() => {
            if (!this.isEnd) {
                this.pageNo += 1;
                this.getPreSellList();
            }
        });
    },
    methods: {
        //轮播初始化
        initSwipe: function () {
            Vue.nextTick(function () {
                $('.swipe').each(function () {
                    var points = $(this).find('.swipe-point li');
                    Swipe(this, {
                        auto: 3000,
                        continuous: true,
                        disableScroll: false,
                        callback: function (i, ele) {
                            points.removeClass('active').eq(i).addClass('active');
                        }
                    });
                });

            })
        },
        getPreSellList:function () {
            var url = config.apiHost + '/api/promotion/mpList';
            var params ={
                frontPromotionTypes:"1022,1024",//促销前台类型列表， 1022 定金预售, 1024 全款预售
                //sortType:'',//排序方式，11是活动结束时间顺序，12是活动时间倒序，21是活动商品销量顺序，22是活动商品销量倒序	
                pageSize:this.pageSize,
                pageNo:this.pageNo
            }
            Vue.api.get(url, params, (res) => {
                if(res.data && res.data.listObj){
                    this.preSellList = this.preSellList.concat(res.data.listObj || []);
                    if(res.data.listObj.length < this.pageSize){
                        this.isEnd = true;
                    }
                }
            })
        }
    }
});