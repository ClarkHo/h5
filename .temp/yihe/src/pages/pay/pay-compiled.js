"use strict";

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _vue = require("vue");

var _vue2 = _interopRequireDefault(_vue);

var _uiHeader = require("../../components/ui-header.vue");

var _uiHeader2 = _interopRequireDefault(_uiHeader);

var _uiActionsheet = require("../../components/ui-actionsheet.vue");

var _uiActionsheet2 = _interopRequireDefault(_uiActionsheet);

var _uiActionsheetPop = require("../../components/ui-actionsheet-pop.vue");

var _uiActionsheetPop2 = _interopRequireDefault(_uiActionsheetPop);

var _default = require("../../../env/config.js");

var _default2 = _interopRequireDefault(_default);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//let urlParams = Vue.utils.paramsFormat(window.location.href);
var vm = new _vue2.default({
    el: 'body',
    components: { UiHeader: _uiHeader2.default, UiActionsheet: _uiActionsheet2.default, UiActionsheetPop: _uiActionsheetPop2.default },
    data: {
        locationSearch: '',
        orderInfo: {},
        preOrderInfo: {},
        unusualStatus: false,
        isLoaded: false,
        defaultPayment: {},
        selectedPaymentId: '',
        showPayment: false,
        showInvoice: false,
        //showPaymentType:false,
        showInvoiceError: false,
        headTitle: '',

        //发票相关
        showReceiptNotice: false, //发票须知
        //isNeed: false,//是否需要发票
        invoiceCont: {
            detail: 1, //需要明细
            computer: '电脑配件',
            things: '办公用品',
            material: '耗材'
        },
        invoice: {
            invoiceType: 0, //发票类型(0:不需要发票;1：普通；2：增值税)
            invoiceTitleType: 1, //发票抬头类型（1：个人；2：单位）
            invoiceTitleContent: '', //发票抬头内容
            isNeedDetails: 0, //是否需要明细（1：需要 0:不需要）
            invoiceContentId: 1, //默认1
            invoiceContent: '' },
        payGateWays: [],
        payGateWayConfigId: '',
        order: {},

        totalProdNum: 0, //全部商品数目
        popNoAddress: false, //显示无地址

        coupons: [], //优惠券列表
        myCoupon: { //优惠券操作变量
            history: null, //初始化优惠券
            thisCoupon: null //选中优惠券
        },
        showCoupon: false,
        runningFlag: false,
        usePoints: false //是否使用积分

    },
    ready: function ready() {
        this.locationSearch = location.search;
        if (this.locationSearch.length > 0) this.getOrder('/api/checkout/showOrder');else this.getOrder();
    },
    computed: {
        invoiceDisplayName: {
            get: function get() {
                if (this.invoice.invoiceType == 0) {
                    return '不需要';
                } else if (this.invoice.invoiceType == 1) {
                    return '明细（普通）-' + this.invoice.invoiceTitleContent;
                } else if (this.invoice.invoiceType == 2) {
                    return '增值税发票';
                }
            }
        },
        headTitle: {
            get: function get() {
                var t = '确认订单';
                if (this.showPayment) t = '支付方式';else if (this.showInvoice) t = '发票信息';
                return t;
            }
        },
        showSubPage: {
            get: function get() {
                return this.showPayment || this.showInvoice || this.showCoupon;
            }
            //},
            //popNoAddress:{
            //    get:function(){
            //        return this.isLoaded&&!this.orderInfo.receiver;
            //    }
        },
        //佣金剩余可用金额
        residualAmount: function residualAmount() {
            "use strict";

            if (this.orderInfo.brokerage) {
                return this.orderInfo.brokerage.residualAmount || 0;
            }
            return 0;
        }
    },
    methods: {
        getOrder: function getOrder(api, callback, ignore) {
            var _this = this;

            var url = _default2.default.apiHost + (api ? api : "/api/checkout/initOrder");
            var params = {
                ut: _vue2.default.auth.getUserToken(),
                sessionId: _vue2.default.session.getSessionId(),
                companyId: _vue2.default.mallSettings.getCompanyId(),
                platformId: _default2.default.platformId
            };
            if (ignore) params.ignoreChange = 1;
            _vue2.default.api.postForm(url, params, function (res) {
                //如果存在非法商品
                if (res.code != 0 && res.code != '0') {
                    _this.unusualStatus = true;
                    _this.unusualExecute(res.data.error);
                    return;
                }
                _this.unusualStatus = false;
                //
                //if(res.data&&typeof res.data.merchantList=='undefined') {
                //    if (this.locationSearch=='?q') {
                //        history.back();
                //    } else {
                //        window.location.href=config.contextPath+"/cart.html";
                //    }
                //    return;
                //}

                if (res.data.allCoupon) {
                    (res.data.allCoupon.orderCoupons || []).forEach(function (v) {
                        v.isFold = true;
                    });
                }
                _this.orderInfo = res.data;
                //###优惠券相关###
                _this.myCoupon = {
                    history: null,
                    thisCoupon: null
                };
                _this.coupons = _this.orderInfo.allCoupon.orderCoupons;
                _this.coupons.forEach(function (v) {
                    "use strict";

                    if (v.selected == 1) {
                        _this.myCoupon.history = v;
                        _this.myCoupon.thisCoupon = v;
                    }
                });

                //获取默认支付方式
                _this.getDefaultPayment();
                if (!api) {
                    var url = location.pathname + _this.locationSearch;
                    window.history.replaceState(null, "", url);
                }
                var invoice = _this.orderInfo.orderInvoice.invoice || {};
                _this.invoice = {
                    invoiceType: invoice.invoiceType || _this.invoice.invoiceType,
                    invoiceTitleType: invoice.invoiceTitleType || _this.invoice.invoiceTitleType,
                    invoiceTitleContent: invoice.invoiceTitleContent || _this.invoice.invoiceTitleContent,
                    isNeedDetails: invoice.isNeedDetails || _this.invoice.isNeedDetails,
                    invoiceContentId: invoice.invoiceContentId || _this.invoice.invoiceContentId,
                    invoiceContent: invoice.invoiceContent || _this.invoice.invoiceContent
                };

                _this.invoiceCont = _this.orderInfo.orderInvoice.invoiceContentList;
                _this.isLoaded = true;

                //只有在初始化的时候才需要判断是否有没有地址
                if (!api) {
                    _this.popNoAddress = !_this.orderInfo.receiver;
                    //如果没有收货地址，弹窗提示
                    if (_this.popNoAddress) {
                        _this.checkAddress();
                        return;
                    }
                }
                //如果提交订单时,需要调用回调;
                if (callback) callback();
            });
        },
        //商品不正常状态处理
        unusualExecute: function unusualExecute(data) {
            "use strict";

            var _this2 = this;

            this.preOrderInfo = data;
            var dia,
                title,
                button,
                content = '';
            if (this.preOrderInfo.type == 0) {
                title = '<div class="c9 text-center">选购的商品总价发生了变化</div>';
                button = ['<span style="color:gray">返回购物车</span>', '继续结算'];
            } else if (this.preOrderInfo.type == 1) {
                title = '<div class="c9 text-center">以下商品暂时无货!</div>';
                button = ['<span style="color:gray">返回购物车</span>', '继续结算'];
            } else if (this.preOrderInfo.type == 2) {
                title = '<div class="c9 text-center">选购商品全部无货!</div>';
                button = ['<span style="color:gray">返回购物车</span>'];
            } else {
                return;
            }

            if (this.preOrderInfo.type == 0 || this.preOrderInfo.type == 1) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = (0, _getIterator3.default)(this.preOrderInfo.data || []), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var item = _step.value;

                        content += '<li class="ui-border-b" style="margin:0;margin: 0;">' + '<div class="ui-list-thumb">' + '<img src="' + item.imgUrl + '" width="60" height="60"></div>' + '<div class="ui-list-info">' + '<p class="name ui-nowrap-multi">' + item.name + '</p></div></li>';
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
            content = '<ul class="ui-list ui-list-customize" style="background:none;overflow: auto;max-height: 200px;">' + content + '</ul>';

            dia = $.dialog({
                title: title,
                content: content,
                button: button
            });

            dia.on("dialog:action", function (e) {
                if (e.index == 0) location.href = '/cart.html';else {
                    _this2.getOrder(null, null, true);
                }
            });
        },
        //获取默认支付方式
        getDefaultPayment: function getDefaultPayment() {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = (0, _getIterator3.default)(this.orderInfo.payments || []), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var payment = _step2.value;

                    if (payment.selected == 1) {
                        this.defaultPayment = payment;
                        this.selectedPaymentId = this.defaultPayment.paymentId;
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        },
        //获取商家id,对于O2O需要传商家id，但对于商城则不需要
        getMerchantId: function getMerchantId() {
            //只考虑一个商家，所以在数组中只取一个
            if (this.orderInfo.merchantList || this.orderInfo.merchantList.length > 1) return this.orderInfo.merchantList[0].merchantId;
            return '';
        },
        //提交订单
        submitOrder: function submitOrder() {
            var _this3 = this;

            //showOrder目前暂时不支持
            //this.getOrder('/api/checkout/showOrder',()=>{
            //    "use strict";
            //    //判断地址
            //    this.popNoAddress = !this.orderInfo.receiver;
            //    //如果没有收货地址，弹窗提示
            //    if (this.popNoAddress) {
            //        this.checkAddress();
            //        return;
            //    }
            var url = _default2.default.apiHost + '/api/checkout/submitOrder';
            var params = {
                ut: _vue2.default.auth.getUserToken(),
                sessionId: _vue2.default.session.getSessionId(),
                companyId: _vue2.default.mallSettings.getCompanyId()
            };
            //如果是O2O,需要传商家id
            if (_default2.default.isO2O) params.merchantId = this.getMerchantId();
            this.runningFlag = true;
            _vue2.default.api.postForm(url, params, function (res) {
                _this3.runningFlag = false;
                _this3.order = res.data;
                //如果是在线支付
                if (_this3.defaultPayment.paymentId == 1) window.location.href = "/pay/pay-way.html?orderCode=" + _this3.order.orderCode;else window.location.href = "/pay/pay-success.html?p=" + _this3.defaultPayment.name + "&a=" + _this3.order.amount + "&orderCode=" + _this3.order.orderCode;
            });
            //});
        },
        //初始化各窗口
        setInit: function setInit() {
            if (this.showSubPage) {
                this.showInvoice = false;
                this.showPayment = false;
                this.showCoupon = false;
                //this.showPaymentType = false;
            } else {
                if (this.locationSearch == '?q') {
                    history.back();
                    return;
                }
                var dia = $.dialog({
                    title: '您确定要取消订单返回购物车吗？',
                    content: '',
                    button: ['<span style="color:gray">取消订单</span>', '再看看']
                });

                dia.on("dialog:action", function (e) {
                    if (e.index == 0) location.href = '/cart.html';
                });
            }
        },
        //保存支付方式
        savePayment: function savePayment(paymentId) {
            var _this4 = this;

            var url = _default2.default.apiHost + '/api/checkout/savePayment';
            var params = {
                ut: _vue2.default.auth.getUserToken(),
                paymentId: paymentId,
                companyId: _vue2.default.mallSettings.getCompanyId()
            };
            setTimeout(function () {
                _vue2.default.api.postForm(url, params, function (res) {
                    _this4.showPayment = false;
                    $.tips({
                        content: '保存支付方式成功',
                        stayTime: 2000,
                        type: "warn"
                    });
                    _this4.getOrder('/api/checkout/showOrder');
                });
            }, 300);
        },
        //获取上一次使用发票
        getLastUsedInvoice: function getLastUsedInvoice(invoiceType) {
            var _this5 = this;

            if (invoiceType != 1 && invoiceType != 2) return;
            var url = _default2.default.apiHost + '/api/checkout/lastUsedInvoice';
            var params = {
                ut: _vue2.default.auth.getUserToken(),
                invoiceType: invoiceType,
                companyId: _vue2.default.mallSettings.getCompanyId()
            };
            _vue2.default.api.postForm(url, params, function (result) {
                var invoice = result.data || {};
                _this5.invoice = {
                    invoiceType: invoice.invoiceType || _this5.invoice.invoiceType,
                    invoiceTitleType: invoice.invoiceTitleType || _this5.invoice.invoiceTitleType,
                    invoiceTitleContent: invoice.invoiceTitleContent || _this5.invoice.invoiceTitleContent,
                    isNeedDetails: invoice.isNeedDetails || _this5.invoice.isNeedDetails,
                    invoiceContentId: invoice.invoiceContentId || _this5.invoice.invoiceContentId,
                    invoiceContent: invoice.invoiceContent || _this5.invoice.invoiceContent
                };
            });
        },
        //保存发票信息
        saveOrderInvoice: function saveOrderInvoice() {
            var _this6 = this;

            if (this.invoice.invoiceTitleType == 2 && this.invoice.invoiceTitleContent == '') {
                $.tips({
                    content: '请填写发票抬头',
                    stayTime: 2000,
                    type: "warn"
                });
            } else {
                if (this.invoice.invoiceTitleType == 1) {
                    this.invoice.invoiceTitleContent = '个人';
                }

                this.updateInvoiceContent();
                var param = this.invoice;
                param.ut = _vue2.default.auth.getUserToken();
                param.companyId = _vue2.default.mallSettings.getCompanyId();

                var url = _default2.default.apiHost + '/api/checkout/saveOrderInvoice';
                _vue2.default.api.postForm(url, param, function (res) {
                    var el = $.tips({
                        content: '发票保存成功',
                        stayTime: 2000,
                        type: "warn"
                    });
                    _this6.getOrder('/api/checkout/showOrder');
                    _this6.showInvoice = false;
                    //延时操作
                    //var that=this;
                    //setTimeout(function(){
                    //    that.showInvoice=false;
                    //},100)
                }, function (res) {
                    console.log(res);
                });
            }
        },

        //更新发票内容
        updateInvoiceContent: function updateInvoiceContent() {
            if (this.invoice.invoiceContentId && this.invoiceCont) {
                for (var i = 0; i < this.invoiceCont.length; i++) {
                    if (this.invoiceCont[i].invoiceContentId == this.invoice.invoiceContentId) {
                        this.invoice.invoiceContent = this.invoiceCont[i].invoiceContentValue;
                        return;
                    }
                }
            }
        },

        //地址选择url
        getAddressUrl: function getAddressUrl() {
            var base = "/my/address-chose.html";
            if (this.orderInfo.receiver) {
                base += "?receiverId=" + this.orderInfo.receiver.receiverId;
            }

            return base;
        },

        /**
         * 德升增加内容
         */
        //弹窗提示没有收货地址
        checkAddress: function checkAddress() {
            "use strict";

            var _this7 = this;

            var dia = $.dialog({
                title: '您还没有收货地址，是否新建',
                content: '',
                button: ['取消', '新建']
            });
            dia.on("dialog:action", function (e) {
                if (e.index == 0) {
                    _this7.popNoAddress = false;
                } else location.href = '/my/address-chose.html';
            });
        },

        //保存买家备注
        saveRemark: function saveRemark(remark, id) {
            "use strict";

            var _this8 = this;

            var url = _default2.default.apiHost + "/api/checkout/saveRemark";
            var params = {
                ut: _vue2.default.auth.getUserToken(),
                remark: (remark || '').substr(0, 12),
                id: id
            };
            if (params.remark.length == 0) return;
            _vue2.default.api.postForm(url, params, function (res) {
                _this8.getOrder('/api/checkout/showOrder');
            });
        },
        //保存佣金
        saveBrokerage: function saveBrokerage(amount) {
            "use strict";

            var _this9 = this;

            if (!amount) return;
            var url = _default2.default.apiHost + "/api/checkout/saveBrokerage";
            var params = {
                ut: _vue2.default.auth.getUserToken(),
                usageAmount: amount || 0
            };
            _vue2.default.api.postForm(url, params, function (res) {
                _this9.getOrder('/api/checkout/showOrder');
            });
        },
        //保存使用积分
        savePoints: function savePoints(point) {
            "use strict";

            var _this10 = this;

            var url = _default2.default.apiHost + "/api/checkout/savePoints";
            var params = {
                ut: _vue2.default.auth.getUserToken(),
                points: this.usePoints ? point || 0 : 0
            };
            _vue2.default.api.postForm(url, params, function (res) {
                _this10.getOrder('/api/checkout/showOrder');
            }, function (res) {
                if (['10200003', '10200004', '10200005', '10200006'].indexOf(res.code.toString()) >= 0) {
                    _this10.usePoints = false;
                    $.tips({
                        content: res.message,
                        stayTime: 2000,
                        type: "warn"
                    });
                    _this10.getOrder('/api/checkout/showOrder');
                }
            });
        },
        //选择订单优惠券
        selectCoupon: function selectCoupon(coupons, coupon) {
            "use strict";
            //无效优惠券

            if (coupon.isAvailable == 0) return;
            //取消选中
            if (coupon.selected == 1) {
                coupon.selected = 0;
                this.myCoupon.thisCoupon = null;
                return;
            }
            //选中一个优惠券
            if (coupons instanceof Array) {
                coupons.forEach(function (v) {
                    v.selected = 0;
                });
            }
            coupon.selected = 1;
            this.myCoupon.thisCoupon = coupon;
        },
        //保存订单优惠券
        saveCoupon: function saveCoupon(selected, couponId) {
            "use strict";

            var _this11 = this;

            var selected, couponId;
            if (this.myCoupon.thisCoupon) {
                selected = 1;
                couponId = this.myCoupon.thisCoupon.couponId;
            } else if (this.myCoupon.history) {
                selected = 0;
                couponId = this.myCoupon.history.couponId;
            } else {
                this.showCoupon = false;
                return;
            }
            var url = _default2.default.apiHost + "/api/checkout/saveCoupon";
            var params = {
                ut: _vue2.default.auth.getUserToken(),
                companyId: _vue2.default.mallSettings.getCompanyId(),
                selected: selected,
                couponId: couponId
            };
            _vue2.default.api.postForm(url, params, function (res) {
                _this11.showCoupon = false;
                _this11.getOrder('/api/checkout/showOrder');
                $.tips({
                    content: '保存订单优惠券成功',
                    stayTime: 2000,
                    type: "warn"
                });
            });
        }
        //积分
    }
}); /**
     * Created by Roy on 16/7/29.
     */

//# sourceMappingURL=pay-compiled.js.map