import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";

let urlParams = Vue.utils.paramsFormat(window.location.href);


new Vue({
    el: 'body',
    components: {
        UiHeader
    },

    /*methods: {

        // ������鿴�������ۡ��л�Tabҳ
        camePop:function(){
            $('.ui-tab-nav li:first-child').removeClass('current');
            $('ui-actionsheet').addClass('show');

            $(body).css({
                overflow:"hidden!important"
            });
        }
    }*/
});