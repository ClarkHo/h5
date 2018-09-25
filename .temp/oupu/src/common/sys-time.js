
import Vue from "vue";
import config from "../../env/config.js";


Vue.getSysTime = function(fun){
    "use strict";
    var url = "" + '/api/realTime/getTimestamp?nocache=' + (new Date().getTime());
    Vue.api.get(url, null, (res) => {
        if(fun){
            fun(res);
        }
    })

}


