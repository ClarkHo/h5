import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {

    },
    ready: function() {
        this.init();
    },
    methods: {
        init: function() {
        }
    }
});


window.addEventListener('load', function(){

    var tab = new fz.Scroll('.ui-tab', {
        role: 'tab',
        autoplay: true,
        interval: 3000
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