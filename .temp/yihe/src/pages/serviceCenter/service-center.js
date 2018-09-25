import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";
import UiFooter from "../../components/ui-footer.vue";

let urlParams = Vue.utils.paramsFormat(window.location.href);


new Vue({
    el: 'body',
    components: {
        UiHeader,UiFooter
    },
    data:{
        PicListDolp:[],
        ServicePictoCms:[],
        serviceCenter_afterSales_adCode:[],
        serviceCenter_newBuy_adCode:[],
    },

    ready : function(){
        this.getPicListDolp();
    },

    methods:{
        //获取轮播的广告
        getPicListDolp:function () {
            var url = config.apiHost + '/api/dolphin/list';
            var param = {
                platform: config.platform,
                pageCode: "H5_HOME",
                adCode: 'slider_pic,service_cms,serviceCenter_afterSales_adCode,serviceCenter_newBuy_adCode',
                companyId: Vue.mallSettings.getCompanyId(),
                areaCode: Vue.area.getArea().aC,
            };
            Vue.api.get(url, param, (res) => {
                if(res.code == 0) {
                    this.PicListDolp = res.data.slider_pic;
                    this.ServicePictoCms = res.data.service_cms;
                    this.serviceCenter_afterSales_adCode = res.data.serviceCenter_afterSales_adCode;
                    this.serviceCenter_newBuy_adCode = res.data.serviceCenter_newBuy_adCode;
                    /*Vue.nextTick(() => {
                            var slider = new fz.Scroll('.ui-slider', {
                                role: 'slider',
                                indicator: true,
                                autoplay: true,
                                interval: 3000
                            });
                    })*/
                Vue.nextTick(function () {
                    $('.swipe').each(function () {
                        var $this = $(this);
                        if ($this.find('figure').length >= 1) {
                            // if($this.css('visibility') == 'visible') {//如果元素可见，代表已经初始化，防止二次初始化
                            //     return;
                            // }
                            Swipe(this, {
                                auto: 3000,
                                continuous: true,
                                disableScroll: false,
                                callback: function (i, ele) {
                                    var points = $this.find('.swipe-point li');
                                    if (points.length == 2 && i >= 2) {
                                        i -= 2;
                                    }
                                    points.removeClass('active').eq(i).addClass('active');
                                }
                            });

                        }
                    });

                })
                }
            });

        },
    }
});