"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
//default  config
var config = {
    //api的host
    apiHost: "",
    //ouser web host
    ouserHost: "",
    //opay web host
    opayHost: "${opayHost}",
    //html文件的根路径
    contextPath: "",
    //css，js，图片等静态文件根路径
    staticPath: "${staticPath}",
    //company id
    // companyId: 2, //zs
    // companyId: 1001, //SAAS
    platformId: 3, //H5
    pageCode: "H5_HOME",
    businessType: 1,
    //用户类型
    userPlatformId: 4, //运营后台传1 机构用户传2 普通用户传4
    afterSaleType: '1,2,4', //只有退货
    isO2O: false
};

exports.default = config;

//# sourceMappingURL=default-compiled.js.map