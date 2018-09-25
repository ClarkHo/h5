import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiAddress from "../../components/ui-address.vue";
import config from "../../../env/config.js";

const urlParams = Vue.utils.paramsFormat(window.location.href);
//当前订单选中的收货地址
const receiverId = urlParams.r_id;
const receiverStatus = urlParams.receiverStatus;
/**
 * 使用地址选择的场景scene
 * order - 在确认订单时使用，默认方式
 * lottery - 领取奖品时选择地址
 */
const scene = urlParams.scene || "order";

new Vue({
    el: 'body',
    components: {
        UiHeader,
        UiAddress
    },
    data: {
        address: [],//地址列表
        noAddress: false, //无地址列表
        addressSaveButton: '',//保存地址按钮名字
        showAddress: false,  //显示收货地址
        isApp: Vue.browser.isApp(),
        preOrderInfo:{},
    mid: urlParams.mid,
    install:urlParams.install || null
    },
    ready: function(){
        if(!receiverId && receiverId != undefined) {
            if(receiverStatus==2){
            }else{
                this.showAddAddress(); 
            }
        }
        this.getAllAddress();
    },
    methods: {
        //后退
        backEvent: function () {
            if(this.mid || receiverId) {
                var url = decodeURIComponent(urlParams.from);
                if(urlParams.quickBuy){
                    url += '?quickBuy=1'
                }
                location.replace(url);
            }else {
                if(this.isApp) {
                    Vue.app.back();
                }else {
                    history.back();    
                }
            }
        },
        //得到所有的收货地址
        getAllAddress: function() {
            var params = {
                ut: Vue.auth.getUserToken(),
                nocache: new Date().getTime()
            };
            Vue.api.postForm(config.ouserHost + '/ouser-web/address/getAllAddressForm.do', params,(res) => {
                this.address = res.data || [];
                this.noAddress = this.address.length == 0;

                var addr;
                for(var i=0; i<this.address.length; i++) {
                    addr = this.address[i];
                    //如果已经有收货地址
                    if (receiverId) {
                        addr.checked = addr.id == receiverId;
                    } else {
                        //选择默认地址
                        addr.checked = addr.defaultIs == 1;
                    }
                }

            });
        },

        //选择地址
        choseAddress: function(item) {
            for (var i = 0; i < this.address.length; i++) {
                this.address[i].checked = false;
            }
            
            item.checked = true;

            if (scene == "order") {
                 this.saveReceiver(item.id);
             } else if (scene == "lottery") {
                this.backLottery(item.id);
             }
           
        },

        //保存地址 跳转至订单页
        saveReceiver: function(receiverId){
            var url='/pay/pay.html?';
            var param=[];
            for(var k in urlParams||{}){
                if(['type','q','id'].indexOf(k)>=0){
                    param.push(k+'='+urlParams[k]);
                }
            }
            param.push('r_id='+receiverId);
            if(this.install || urlParams.noInstall){
                param.push('back=3');//保存安装地址
            }else{
                param.push('back=2');
            }
            window.location.replace(url+param.join('&'));

            //var params = {
            //    ut: Vue.auth.getUserToken(),
            //    receiverId: receiverId
            //};
            //if(urlParams.type)
            //    params.businessType=urlParams.type;
            //
            //Vue.api.get(config.apiHost + "/api/checkout/saveReceiver", params, (res) => {
            //    //如果存在非法商品
            //    if (res.code != 0 && res.code != '0') {
            //        this.unusualStatus = true;
            //        this.unusualExecute(res.data.error);
            //        return;
            //    }
            //
            //    var url = config.contextPath + '/pay/pay.html?t=1';
            //    if(urlParams.from) {
            //        url = decodeURIComponent(urlParams.from);
            //        if(url.indexOf('t=1')<0)
            //            url += url.indexOf('?') > -1 ? "&t=1" : '?t=1';
            //    }
            //    location.replace(url);
            //    //window.location.href = url;
            //});
        },

        //回领奖页面
        backLottery: function (id) {
            var url = "/lottery/receive-award.html?receiverId=" + id + "&id=" + urlParams.id;
            location.replace(url);
        },

        //新增地址成功后回调
        afterAddAddress: function (id) {
            //新增并使用(id是新建的,
            if (!receiverId && scene == "order"||receiverId&&receiverId!=id) {
                this.saveReceiver(id);
            } else if (scene == "lottery"){
                this.backLottery(id);
            } else {
                this.getAllAddress();
            }
        },

        //新增地址
        showAddAddress: function () {
            //如果用户没有地址
            if(!receiverId) {
                this.addressSaveButton = '保存并使用';
            }
            this.showAddress = true;//显示新增地址
        },
        //商品不正常状态处理 0 选购的商品总价发生了变化,1 商品失效或下架 2 选购的商品全部失效 提示后,直接返回购物车 3 部分商品不在销售区域内 4 所有商品都不在销售区域内
        unusualExecute: function (data) {
            "use strict";
            this.preOrderInfo = data;
            var dia, title, button, content = '';
            if (this.preOrderInfo.type == 0) {
                title = '<div class="c9 text-center">选购的商品总价发生了变化</div>';
                button = ['<span style="color:gray">返回购物车</span>', '继续结算'];
            } else if (this.preOrderInfo.type == 1) {
                title = '<div class="c9 text-center">以下商品暂时无货!</div>';
                button = ['<span style="color:gray">返回购物车</span>', '继续结算'];
            } else if (this.preOrderInfo.type == 2) {
                title = '<div class="c9 text-center">选购商品全部无货!</div>'
                button = ['<span style="color:gray">返回购物车</span>'];
            } else if(this.preOrderInfo.type == 3){
                title = '<div class="c9 text-center">{{preOrderInfo.message}}</div>'
                button = ['<span style="color:gray">删除无效商品</span>', '修改收货地址'];
            }else if(this.preOrderInfo.type == 4){
                title = '<div class="c9 text-center">{{preOrderInfo.message}}</div>'
                button = ['<span style="color:gray">修改收货地址</span>', '回去看看'];
            } else {
                return;
            }

            if (this.preOrderInfo.type == 0 || this.preOrderInfo.type == 1) {
                for (let item of (this.preOrderInfo.data || [])) {
                    content += '<li class="ui-border-b" style="margin:0;margin: 0;">' +
                        '<div class="ui-list-thumb">' +
                        '<img src="' + item.imgUrl + '" width="60" height="60"></div>' +
                        '<div class="ui-list-info">' +
                        '<p class="name ui-nowrap-multi">' + item.name + '</p></div></li>';
                }
            }
            content = '<ul class="ui-list ui-list-customize" style="background:none;overflow: auto;max-height: 200px;">' + content + '</ul>';

            dia = $.dialog({
                title: title,
                content: content,
                button: button
            });

            dia.on("dialog:action", (e)=> {
                if (e.index == 0)
                    location.href = '/cart.html';
                else {
                    this.getOrder(null, null, true);
                }
            });
        },
    }
});