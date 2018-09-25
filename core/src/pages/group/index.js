import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiFooter from "../../components/ui-footer.vue";
import UiScrollTop from "../../components/ui-scroll-top.vue";
import UiDropDown from "../../components/ui-drop-down.vue";
import config from "../../../env/config.js";

var url;
var maxpagesize;

var vm = new Vue({
    el: 'body',
    components: { UiHeader,UiScrollTop,UiFooter,UiDropDown },
    data: {
        items: [],
        pageNu: 1,
        pageSize: 10,
        swiperList: [],
        isApp: Vue.browser.isApp(),
        weixin: Vue.browser.weixin(),
        nomore: false,
        stopDropDown:false,
    },
    ready: function() {
        //初始化PageRestorer
        Vue.pageRestorer.init(this, "group-index");
        //restore页面的内容
        if (Vue.pageRestorer.restore()) {
            this.initSwipe();
        } else {
            this.getAllPatchGrouponInfoList();
            this.list();
        }

        Vue.scrollLoading(() => {
            if (this.pageNu * this.pageSize < maxpagesize) {
                this.pageNu++;
                this.getAllPatchGrouponInfoList();
            }else {
                this.nomore = true;
            }
        });

    },

    methods: {
        dropDown: function () {
            this.pageNu = 1;
            this.items = [];
            this.getAllPatchGrouponInfoList();
            setTimeout(() => {
                this.stopDropDown = true;
            }, 2000);
        },
        //查看活动详情
        groupDetail: function (item) {
            var url = '/group/detail.html?patchGrouponId='+item.patchGrouponId + (item.grouponType == 0 ? '&mpId='+item.productInfo[0].mpId : '');

            if(item.grouponType == 0 && item.productInfo && item.productInfo[0] && !item.productInfo[0].canAreaSold) {
                return;
            }
            location.href = url;
        },
        getAllPatchGrouponInfoList: function() {
            url = config.apiHost + "/api/patchgroupon/getAllPatchGrouponInfoList";
            var datacall = {
                platformId: config.platformId,
                currentPage: this.pageNu,
                itemsPerPage: this.pageSize,
                areaCode: Vue.area.getArea().aC,
            };
            Vue.api.get(url, datacall, (res) => {
                for(var i in res.data.listObj) {
                    var obj = res.data.listObj[i];
                    if(obj.grouponType == 0 && obj.productInfo && obj.productInfo[0] && !obj.productInfo[0].canAreaSold) {
                        obj.disabled = true;
                    }
                }
                if(res.data.listObj) {
                    this.items = this.items.concat(res.data.listObj);    
                }
                maxpagesize = res.data.total;
            }, (res) => {

            });
        },
        list: function() {
            url = config.apiHost + "/api/dolphin/list";
            var test = {
                pageCode: 'H5_PINTUAN_PAGE',
                adCode: 'pintuan_lunbo',
                platform: config.platform,
                areaCode: Vue.area.getArea().aC,
            }
            Vue.api.get(url, test, (res) => {
                vm.swiperList = res.data.pintuan_lunbo;
                // vm.swiperList = res.data.h5_lunbo;
                this.initSwipe();
            }, function(res) {

            });
        },
        //初始化轮播
        initSwipe: function () {
            Vue.nextTick(function() {
                var points = $('#slider .swipe-point li');
                Swipe(document.getElementById('slider'), {
                    auto: 3000,
                    continuous: true,
                    disableScroll: false,
                    callback: function (i, ele) {
                        points.removeClass('active').eq(i).addClass('active');
                    }
                });
            });
        },
        scrollToTop: function() {
            var backTop = document.body.scrollTop;

            var timer = setInterval(function() {
                var scrollTop = document.body.scrollTop;
                //如果用户向下滚动了页面
                if (scrollTop > backTop) {
                    clearInterval(timer);
                    return;
                }

                var speed = scrollTop / 5;
                backTop = scrollTop - speed;
                document.body.scrollTop = backTop;
                //如果到已到顶部
                if (backTop == 0) {
                    clearInterval(timer);
                }
            }, 40);
        }
    }
});




// window.addEventListener('load', function(){
//     /* fz 即 FrozenJS 的意思 */
//     var slider = new fz.Scroll('.ui-slider', {
//         role: 'slider',
//         indicator: true,
//         autoplay: true,
//         interval: 3000
//     });
//
// })