import Vue from "vue";
import config from "../../env/config.js";
   
var vm = new Vue({ 
    el: 'body',
    components: {},
    data: {
        isDisplay:true,
        itemInfo:{
            price:0
        },
        itemAmount:0  
    },
    ready: function() {
         
    }, 
    methods: {
        hideActionsheet:function(){
            this.isDisplay = false;
        },
        plusAmount: function (step) {
            var num = this.itemAmount - 0 + (step - 0);
            this.itemAmount = num;
        },
    }
});      