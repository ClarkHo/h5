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