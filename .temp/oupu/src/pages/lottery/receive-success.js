import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";

var urlParams = Vue.utils.paramsFormat(location.href);

new Vue({
    el: 'body',
    components: { UiHeader },
    data:{
        config:config
    },
    methods: {
        back: function ( ) {
            // location.replace('/my/my-awards.html');
            //location.href='/lottery/rotary-table.html?themeId=' + urlParams.themeId;
            if(urlParams.themeId != 'undefined'){
                location.replace('/my/my-awards.html');
            } else{
                history.back();
            }
        }
    }
});
