 import Vue from "vue";
/**
 * 提供H5接口供app调用
 */
    //alias, 方便app调用
    window.h5EventEmit = eventSupport.emit;
    
    //alias，方便页面js使用
    Vue.event = eventSupport;
