/**
 * Created by Roy on 16/7/29.
 */
import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiActionsheet from "../../components/ui-actionsheet.vue";
import UiActionsheetPop from "../../components/ui-actionsheet-pop.vue";
import UiDialogCaptchas from "../../components/ui-dialog-captchas.vue";
import config from "../../../env/config.js";

let urlParams = Vue.utils.paramsFormat(window.location.href);
let locationInfo=Vue.localStorage.getItem('areaInfo');
//区域code与地址id
let areaCode=locationInfo?locationInfo.region.code:'';
let receiverId=Vue.localStorage.getItem('receiverId');
var str = [];//埋点商品信息
const urls={
	common:{
		initOrder:'/api/checkout/initOrder',
		showOrder:'/api/checkout/showOrder',
		submit:'/api/checkout/submitOrder'
	},
	group:{
		initOrder:'',
		showOrder:'/api/checkout/showGroupBuyOrder',
		submit:'/api/checkout/submitGroupBuyOrder'
	}
};
let vm =new Vue({
	el: 'body',
	components: {UiHeader, UiActionsheet, UiActionsheetPop,UiDialogCaptchas},
	data: {
		ut: Vue.auth.getUserToken(),
		isCutOrder: urlParams.type == 4,
		isGroupOrder:urlParams.type==1,
		preAddrId:null,//备份地址, 如果保存地址出错, 删除商品后需要再保存一次
		locationSearch: '',
		orderInfo: {},
		preOrderInfo: {},
		unusualStatus: false,
		isLoaded: false,
		defaultPayment: {},
		selectedPaymentId: '',
		showPayment: false,
		showDeliver: false,
		//showPaymentType:false,
		showInvoiceError: false,
		headTitle: '',

		//发票相关
		merchantSupportInvoiceType:0,//是否支持增值税发票
		showInvoice: false,
		showReceiptNotice: false,//发票须知
		isNeed: false,//是否需要发票
		invoiceCont: {},//发票内容
		soInviceConfig:[],//发票类型
		invoice: {
			invoiceType: 0,//发票类型(0:不需要发票;1：普通；2：增值税)
			invoiceMode:0,//默认为纸质发票（1：电子 2：纸质）
			invoiceTitleType: 0,//发票抬头类型（1：个人；2：单位）
			invoiceTitleContent: '',//发票抬头内容
			isNeedDetails: 0,//是否需要明细（1：需要 0:不需要）
			invoiceContentId: 1,//默认1
			invoiceContent: '',//发票内容,
			departmentTaxpayerIdentificationCode:'',//纳税人识别号

		},
		invoiceBak:{},//备份
		VATInvoice:{},//增值税发票
		isInitInvoice:true, //是否是原始发票,原始发票是指invoice初始化时还没从接口中取回上次发票的场景
		canSubmitInvoice:false,
		// 配送信息
		deliverState:0,//配送信息显示状态
		showDeliveryMode_step1: false,//配送方式
		showDeliveryMode_step2: false,//选择门店地址
		showDeliveryMode_step3: false,//门店代收
		// 配送方式
		merchantDeliveryModeList_index:0,
		merchantDeliveryModeList:{},
		save_merchantId:'',
		save_deliveryModeCodeChecked:'',
		chooesdMerchant:{
			deliveryModeList:[]
		},//选中的商家,用于选择配送方式
		deliveryMode_name: '',

		deliveryMode_pickMobile: '',
		smsBtn:'发送验证码',
		captchas: '',
		// 查询门店
		queryBaseMerchantList_keywords: '',//查询门店的关键字
		pageNo: 1,
		pageSize: 10,
		isEnd: false,
		noData: false,
		platformId: config.platformId,
		merchantListdataList:[],
		notVatInvoice:[],//不支持增值税发票的商品
		notVatInvoiceSimple:[],//不支持发票的商品


		payGateWays: [],
		payGateWayConfigId: '',
		order: {},

		totalProdNum: 0,  //全部商品数目
		popNoAddress: false, //显示无地址

		coupons: [], //优惠券列表
		myCoupon: {  //优惠券操作变量
			history: null, //初始化优惠券
			thisCoupon: null //选中优惠券
		},
		showCoupon: false,//优惠券
		runningFlag: false,
		usePoints: false, //是否使用积分
		usebrokerage: false, //是否使用积分
		useCoupons: false, //是否使用优惠券
		dontuseCoupons: false, //不使用优惠券按钮
		notUserCouponId: '', //不使用优惠券时 对应的id

		useOrderUCard: false, //是否使用悠点卡
		useOrderECard: false, //是否使用伊点卡
		expenseList : [], //费用清单数组对象

		showGiftcard: false,//礼金卡弹窗
		giftCards: [], //礼金卡列表
		// myGiftcard:{  //礼金卡操作变量
		//     history:null, //初始化礼金卡
		//     thisGiftcard:null //选中礼金卡
		// },
		useGiftCard: false,//是否使用礼金卡
		useBrokerage: null,
		presell: {},        //预售模块
		isDownPayment: urlParams.type == 5,//支付定金
		isFinalPayment: urlParams.type == 6,//支付尾款
		orderCode: urlParams.orderCode, //预售支付尾款的订单号
		delMpIds:null,

		selectCouponWrap:false,//选择优惠券
		addCouponWrap:false,//添加优惠券
		couponCode: '',//卡号
		couponPsw: '',//密码

		iShowNotice: false,
		noticeList: [],//公告
		iShowNoticeAction: false,
		tmpTitle:'',
		receiverStatus:0,
		showProCode:false,
		proCodeIsVal:1,//优惠码tab切换
		proCode:{},//优惠码大对象
		proCodeCanuseList:[],//优惠码可用列表，
		proCodeCanNotuseList:[],//优惠码不可用列表，
		proCodeShowList:[],//展示的优惠码列表
		proCodeSeleted:{},//选中的优惠码
		addProCodeShow:false,//添加优惠码显示
		userAddProCode:'',//用户输入的优惠码code
	},
	watch:{
		showInvoice:function(v){
			if(v) {
				Vue.set(this, 'invoice', $.extend({}, this.invoiceBak,{invoiceTitleType:this.invoiceBak.invoiceTitleType||1},{invoiceMode:this.invoiceBak.invoiceMode||2},this.VATInvoice));
				this.isNeed=this.invoiceBak.invoiceType>0;
			}
		},
		isNeed(n,o){
			if(o==0&&n>0){//从不需要发票到需要发票,默认选择普通发票
				this.invoice.invoiceType=this.invoice.invoiceType||1;
				this.invoice.invoiceMode=(this.orderInfo.orderInvoice)&&(this.orderInfo.orderInvoice.soInviceConfig[0].invoiceMode)||this.invoice.invoiceMode;
			}
		},
		'invoice.invoiceTitleType':function(n,o){
			if(n==2&&o==1&&this.invoice.invoiceTitleContent=='个人'){
				[this.tmpTitle,this.invoice.invoiceTitleContent]=[this.invoice.invoiceTitleContent,this.tmpTitle];
			}else if(n==1&&o==2&&this.invoice.invoiceTitleContent!='个人'){
				[this.tmpTitle,this.invoice.invoiceTitleContent]=[this.invoice.invoiceTitleContent,'个人']
			}
			this.tmpTitle=this.tmpTitle=='个人'?'':this.tmpTitle
		}

	},
	ready: function () {
		//伊点卡支付引导 只弹屏一次
		var flag = Vue.localStorage.getItem('yiCradShow_flag');
		if(flag){
			this.yiCradShow = false;
		} else{
			this.yiCradShow = true;
			if(Vue.auth.loggedIn){
				Vue.localStorage.setItem('yiCradShow_flag',new Date().getTime())
			}
		}
		if(urlParams.back==1&&urlParams.code&&urlParams.m_id) {//从门店提取页返回url,先保存门店地址再刷新页面
			this.saveDeliveryMode(0,null,urlParams.code,urlParams.m_id);
		}else if(urlParams.back==2&&urlParams.r_id){ //从选择地址返回
			this.saveReceiver(urlParams.r_id);
		}else if(urlParams.back==3&&urlParams.r_id){ //从选择地址返回，安装地址
			this.saveInstallReceiver(urlParams.r_id);
		}else if (urlParams.t || urlParams.q || urlParams.type == 5 || urlParams.type == 7) {
			this.getOrder('/api/checkout/showOrder');
		}else if(urlParams.quickBuy){//快速购买，立即兑换。
			var params = Vue.localStorage.getItem('quick_buy');
			this.getOrder(null,null,null,params);
		}else {
			this.getOrder();
		}
		this.getNotice();
	},
	computed: {
		invoiceDisplayName: {
			get() {
				if (this.invoiceBak.invoiceType == 0) {
					return '不需要';
				} else if (this.invoiceBak.invoiceType == 1) {
					return this.invoiceBak.invoiceTitleContent;
				} else if (this.invoiceBak.invoiceType == 2) {
					return '增值税发票'
				}
			}
		},
		headTitle: {
			get() {
				let t = '确认订单';
				if (this.showPayment) t = '支付方式';
				else if (this.showInvoice) t = '发票信息';
				else if (this.showCoupon) t = '使用优惠券';
				else if (this.showProCode) t = '使用优惠码';
				else if (this.showDeliveryMode_step1) t = '配送方式';
				else if (this.showDeliveryMode_step2) t = '门店代收';
				else if (this.showDeliveryMode_step2) t = '选择门店地址';
				return t;
			}
		},
		showSubPage: {
			get() {
				return this.showDeliver || this.showPayment || this.showInvoice || this.showCoupon || this.showProCode || this.showGiftcard || this.showDeliveryMode_step1 || this.showDeliveryMode_step2 || this.showDeliveryMode_step3;
			}
			//},
			//popNoAddress:{
			//    get:function(){
			//        return this.isLoaded&&!this.orderInfo.receiver;
			//    }
		},
	},
	methods: {
		//展示优惠码选择
		showProCodeTab:function () {
			this.getProCodeList();//获取优惠码列表
		},
		beforesaveProCode:function (params) {
			
		},
		//保存优惠码
		saveProCode:function (params) {
			var that = this;
			if(!this.proCodeSeleted.referralCodeId){
				this.showProCode = false;
				Vue.api.get(config.apiHost + '/api/checkout/saveReferralCode', null, (res) => {
					that.getOrder('/api/checkout/showOrder');
				})
				return;
			}
			var dia=$.dialog({
					title:'',
					content:'优惠码不可与促销和优惠券叠加使用，您确认要使用优惠码吗',
					button:["暂不使用","确认使用"]
			});

			dia.on("dialog:action",function(e){
					if(e.index == 1){
						var url = config.apiHost + '/api/checkout/saveReferralCode';
						var params = {
							referralCodeId:that.proCodeSeleted.referralCodeId
						}
						Vue.api.get(url, params, (res) => {
							that.showProCode = false;
							that.getOrder('/api/checkout/showOrder');
							Vue.utils.showTips('保存优惠码成功');
						})
					}
			});
		},
		//选择优惠码
		selectProcode:function (proCodes,item) {
			"use strict";
			//无效优惠券
			if (item.isAvailable == 0) return;
			//取消选中
			if (item.selected == 1) {
				item.selected = 0;
				this.proCodeSeleted = {};
				return;
			}
			//选中一个优惠券
			if (proCodes instanceof Array) {
				proCodes.forEach(function (v) {
					v.selected = 0;
				})
			}
			item.selected = 1;
			this.proCodeSeleted = item;
		},
		//切换优惠码可用与不可用tab
		switchProTab:function (num) {
			if(this.proCodeIsVal == num){
				return;
			}
			this.proCodeIsVal = num;
			if(this.proCodeIsVal == 1){
				this.proCodeShowList = this.proCodeCanuseList;
			} else{
				this.proCodeShowList = this.proCodeCanNotuseList;
			}
		},
		//获取我的优惠码列表
		getProCodeList:function (params) {
			var url = config.apiHost + '/api/checkout/getOrderReferralCode';
			Vue.api.get(url, null, (res) => {
				if(res.data && res.data.referralCodes){
					var tempArr1 = [], tempArr2 = [];
					res.data.referralCodes.forEach((item) => {
						if(item.isAvailable){//可用
							tempArr1.push(item);
						} else{
							tempArr2.push(item);
						}
					});
					this.proCodeCanuseList = tempArr1;
					this.proCodeCanNotuseList = tempArr2;
					this.proCodeShowList = this.proCodeCanuseList;
					this.proCodeShowList.forEach((item) => {
						item.selected = 0;
					})
					if(this.orderInfo.orderReferralCode && this.orderInfo.orderReferralCode.selected){
						this.orderInfo.orderReferralCode.referralCodes.forEach((items) => {
							if(items.selected){
								this.proCodeShowList.forEach((item) => {
									if(item.referralCodeId == items.referralCodeId){
										item.selected = 1;
										return;
									}
								})
							}
						})
					}
					this.showProCode = true;
				}
			})
		},
		//添加优惠码(与用户绑定)
		addProCode: function () {
			if(!this.userAddProCode){
				Vue.utils.showTips('请输入优惠码');
				return;
			}
			var url = config.apiHost + '/api/promotion/referralCode/receive';
			var params = {
				"type": 2,
				"referralCode": this.userAddProCode,
				"ut": Vue.auth.getUserToken(),
				"platformId": 3	//微信(H5)
			}
			
			Vue.api.get(url, params, (res) => {
				this.getProCodeList();
				this.addProCodeShow = false;
			})
		},

		hideYiCard:function(){this.yiCradShow = false},
		/**
		 *
		 * @param lv(0:ut,businessType,1: +companyId,2:+sessionId,3:+platformId)
		 * @returns {{ut: *}}
		 */
		formatParams: function (lv) {
			"use strict";
			//基本入参
			var params = {ut: Vue.auth.getUserToken()};
			if (urlParams.type==1 || urlParams.type == 4 || urlParams.type == 5 || urlParams.type == 6) params.businessType = urlParams.type;
			if (lv == 1) params.companyId = Vue.mallSettings.getCompanyId();
			if (lv == 2) params.sessionId = Vue.session.getSessionId();
			if (lv == 3) {
				params.sessionId = Vue.session.getSessionId();
				params.platformId = config.platformId;
			};
			if(lv==4){
				params.companyId = Vue.mallSettings.getCompanyId();
				params.platformId = config.platformId;
			};
			return params;
		},
		//初始化订单/刷新订单
		getOrder: function (api, callback, ignore, quickBuyParams) {
			//当type=1时订单是拼团订单, 只有showOrder, type不是1时,api有值, 就用普通showOrder, 否则用普通initOrder
			let url = config.apiHost;
			if(urlParams.type==1){
				url+=urls.group.showOrder;
			}else{
				url+=(api ? urls.common.showOrder : urls.common.initOrder);
			}
			let params = this.formatParams(3);
			if(quickBuyParams){
				params = quickBuyParams;
			}
			if (ignore) params.ignoreChange = 1;
			if(!api&&areaCode) params.areaCode=areaCode;
			if(!api&&receiverId) params.receiverId=receiverId;
			if(this.delMpIds) params.delMpIds=this.delMpIds.join();
			if (this.isCutOrder) {
				params.cutPriceId = urlParams.id;
				params.businessType = urlParams.type;
			}
			
			if(Vue.cookie.getCookie('shareCode')){
				params.shareCode = Vue.cookie.getCookie('shareCode');
			}
			//尾款类型
			// if(urlParams.type==6){params.orderCode=this.orderCode;}
			Vue.loading.show();
			Vue.api.postForm(url, params, (res)=> {

				Vue.loading.hide();
				//如果存在非法商品
				if (res.code != 0 && res.code != '0') {
					this.unusualExecute(res.data.error);
					this.isLoaded = true;
					this.unusualStatus = true;
					//type为0,1,2时错误阻断
					if(res.data.error.type<=2) {
						return;
					}
				}
				this.unusualStatus = false;

				if(res.data.allCoupon) {
					(res.data.allCoupon.orderCoupons || []).forEach(function (v) {
						v.isFold = true;
					})
				};
				if(res.data.merchantList && res.data.merchantDeliveryModeList) {
					(res.data.merchantList || []).forEach((v) => {
						(res.data.merchantDeliveryModeList || []).forEach((s) => {
							if(v.id == s.id){
								v.deliveryModeList = s.deliveryModeList;
							}
						})
					})
				}
				this.orderInfo = res.data;
				//###优惠券相关###
				this.myCoupon= {
					history: null,
					thisCoupon: null,
					index:-1
				}
				if(this.orderInfo.allCoupon) {
					this.coupons= this.orderInfo.allCoupon.orderCoupons;
				}

				this.coupons.forEach((v,i)=>{
					"use strict";
					if(v.selected==1) {
						this.myCoupon.history = v;
						this.myCoupon.thisCoupon = v;
						this.myCoupon.index=i;
					}
				});
				if(this.myCoupon.index<0) this.dontuseCoupons=true;//如果所有优惠券都没有选中, 则展示不使用优惠券
				//获取不支持增值税发票的商品
				this.getNotVatInvoice();
				//获取不支持发票的商品
				this.getNotVatInvoiceSimple();
				//积分判断
				if ((this.orderInfo.points || {}).isAvailable && (this.orderInfo.points || {}).discount) {
					this.usePoints = true;
				}
				//佣金相关
				if(this.orderInfo.brokerage&&this.orderInfo.brokerage.usageAmount==0)
						this.orderInfo.brokerage.usageAmount='';
				// 悠点卡判断
				this.useOrderUCard = (this.orderInfo.orderUCard || {}).isAvailable && (this.orderInfo.orderUCard || {}).usageAmount;

				// 伊点卡判断
				this.useOrderECard=(this.orderInfo.orderECard || {}).isAvailable && (this.orderInfo.orderECard || {}).usageAmount;

				 // 费用清单
				this.expenseList = this.orderInfo.expenseList;

			   //获取默认支付方式
				this.getDefaultPayment();

				//invoice为空的时候才从initOrder/showOrder中取发票信息
				if (this.orderInfo.orderInvoice) {
					this.isInitInvoice=false;
					//this.invoice=this.orderInfo.orderInvoice.invoice || {};
					var {invoiceType,invoiceTitleType,invoiceTitleContent,isNeedDetails,invoiceContentId,invoiceContent,invoiceMode}=this.orderInfo.orderInvoice.invoice || {};
					Vue.set(this,'invoice',{invoiceType,invoiceTitleType,invoiceTitleContent,isNeedDetails,invoiceContentId,invoiceContent,invoiceMode});
					
					if(this.orderInfo.orderInvoice && this.orderInfo.orderInvoice.invoice.taxpayerIdentificationCode){
						Vue.set(this.invoice,'departmentTaxpayerIdentificationCode',this.orderInfo.orderInvoice.invoice.taxpayerIdentificationCode);
					}
					this.invoiceCont = this.orderInfo.orderInvoice.invoiceContentList;
					this.merchantSupportInvoiceType=this.orderInfo.orderInvoice.merchantSupportInvoiceType;
					this.soInviceConfig = this.orderInfo.orderInvoice.soInviceConfig;

					//如果可以开增值税发票,获取增值税发票信息
					if(this.orderInfo.orderInvoice.merchantSupportInvoiceType>1){
						this.getVATInvoice(true);
					}
				}

				//备份
				var {invoiceType,invoiceTitleType,invoiceTitleContent,departmentTaxpayerIdentificationCode,isNeedDetails,invoiceContentId,invoiceContent,invoiceMode}=this.invoice;
				Vue.set(this,'invoiceBak',{invoiceType,invoiceTitleType,invoiceTitleContent,departmentTaxpayerIdentificationCode,isNeedDetails,invoiceContentId,invoiceContent,invoiceMode});
				try {
					this.invoice.invoiceContentId=this.invoiceBak.invoiceContentId=this.invoiceBak.invoiceContentId||this.invoiceCont[0].invoiceContentId;
				} catch (error) {
					
				}
				//this.invoiceCont
				this.isLoaded = true;
				//只有在初始化的时候才需要判断是否有没有地址
				// if (!api) {
					// this.popNoAddress = !this.orderInfo.receiver;
					this.receiverStatus = this.orderInfo.receiverStatus;
					//如果没有收货地址，弹窗提示
					if (this.receiverStatus!=0 && this.receiverStatus!=3&& this.receiverStatus!=null) {
						this.checkAddress();
						return;
					}
				// }

				//安装地址为空判断，借用收货地址处理方式
				if(this.orderInfo.installReceiver && this.orderInfo.installReceiver.receiverId == null){
					this.receiverStatus = 1;
					this.checkAddress(true);
				}
				//如果提交订单时,需要调用回调;
				if (callback) callback();

			},(res) => {
				Vue.utils.showTips(res.message);
				Vue.loading.hide();
				//同一商品H5、PC同时下单，出现的并发问题,回到购物车
				if(res.code == '10200101'){
					setTimeout(function() {
						location.replace("/cart.html");
					}, 800);
				} else {
					setTimeout(function() {
						history.back();
					}, 800);
				}
			})
		},
		//选择配送方式
		chooseDelivery:function (merchant) {
			this.chooesdMerchant = merchant;
			this.showDeliver = true;
		},
		//保存配送方式
		saveDelivery: function (mode) {
			var url = config.apiHost + '/api/checkout/saveDeliveryMode';
			var params = Object.assign(this.formatParams(1), {id: this.chooesdMerchant.id,deliveryModeCodeChecked:mode.code})
			setTimeout(()=> {
				Vue.api.postForm(url, params, (res)=> {
					this.showDeliver = false;
					$.tips({
						content: '保存配送方式成功',
						stayTime: 2000,
						type: "warn"
					});
					this.getOrder('/api/checkout/showOrder');
				})
			}, 300)
		},
		//商品不正常状态处理 0 选购的商品总价发生了变化,1 商品失效或下架 2 选购的商品全部失效 提示后,直接返回购物车 3 部分商品不在销售区域内 4 所有商品都不在销售区域内
		unusualExecute: function (data) {
			"use strict";
			this.preOrderInfo = data;
			var dia, title, button, content = '';
			if (this.preOrderInfo.type == 0 || this.preOrderInfo.type == 1) {
				title = '<div class="c9 text-center">'+this.preOrderInfo.message+'</div>';
				button = ['<span style="color:gray">返回购物车</span>', '继续结算'];
			}  else if (this.preOrderInfo.type == 2) {
				title = '<div class="c9 text-center">'+this.preOrderInfo.message+'</div>'
				button = ['<span style="color:gray">返回购物车</span>'];
			} else if(this.preOrderInfo.type == 3){
				title = '<div class="c9 text-center">'+this.preOrderInfo.message+'</div>'
				button = ['<span style="color:gray">修改收货地址</span>', '删除无效商品'];
			} else if(this.preOrderInfo.type == 4){
				title = '<div class="c9 text-center">'+this.preOrderInfo.message+'</div>'
				button = ['<span style="color:gray">修改收货地址</span>', '回去看看'];
			} else if(this.preOrderInfo.type == 6 || this.preOrderInfo.type == 7){
				title = '<div class="c9 text-center">'+this.preOrderInfo.message+'</div>'
				button = ['<span style="color:gray">修改安装地址</span>', '回去看看'];
			} else {
				return;
			}

			if (this.preOrderInfo.type == 0 || this.preOrderInfo.type == 1|| this.preOrderInfo.type == 3) {
				for (let item of (this.preOrderInfo.data || [])) {
					content+=`
					<li class="ui-border-b" style="margin:0;margin: 0;">
						<div class="ui-list-thumb">
							<img src="${item.imgUrl}" width="60" height="60">
						</div>
						<div class="ui-list-info">
							<p class="name ui-nowrap-multi">${item.name}</p>
						</div>
					</li>
					`;
				}
			}
			content = `<ul class="ui-list ui-list-customize" style="background:none;overflow: auto;max-height: 200px;">${content}</ul>`;

			dia = $.dialog({
				title: title,
				content: content,
				button: button
			});

			dia.on("dialog:action", (e)=> {
				if (this.preOrderInfo.type <= 2) {
					//返回购物车
					if (e.index == 0){
						if(Vue.browser.isApp()){
							location.href = '${appSchema}://shoppingCar';
						} else{
							location.replace("/cart.html");
						}
						return;
					}
					//继续结算
					else {
						if(Vue.localStorage.getItem('quick_buy')){
							this.getOrder(null, ()=>{
								if(this.preAddrId)
									this.saveReceiver(this.preAddrId);
								this.preAddrId=null;
							}, true,Vue.localStorage.getItem('quick_buy'));
						} else{
							this.getOrder(null, ()=>{
								if(this.preAddrId)
									this.saveReceiver(this.preAddrId);
								this.preAddrId=null;
							}, true);
						}
					}
					//修改收货地址
				} else if ((this.preOrderInfo.type == 3||this.preOrderInfo.type == 4 )&&e.index == 0) {
					//location.href=this.getAddressUrl(1);
					this.gotoAddressChose(urlParams.r_id||this.orderInfo.receiver.receiverId);
				}else if ((this.preOrderInfo.type == 6||this.preOrderInfo.type == 7 )&&e.index == 0) {
					//location.href=this.getAddressUrl(1);
					this.gotoAddressChose(urlParams.r_id||this.orderInfo.receiver.receiverId,true);//修改安装地址
				}else if((this.preOrderInfo.type == 4 || this.preOrderInfo.type == 6 || this.preOrderInfo.type == 7)&&e.index == 1){//回去看看
					if(urlParams.type == 4) {
						location.replace('/cut/index.html');
					}else {
						if(this.preOrderInfo.type == 4){
							if(Vue.browser.isApp()){
								location.href = '${appSchema}://shoppingCar';
							}
							else{
								// location.replace("/cart.html");
								history.back();
							}
						} else{
							history.back();
						}
					}
				}else if(this.preOrderInfo.type == 3&&e.index == 1){//删除无效商品
					//获取失效商品id
					(this.preOrderInfo.data||[]).forEach((p)=>{
						this.delMpIds=this.delMpIds||[];
						this.delMpIds.push(p.id)
					})
					//删除失效商品，要判断存在快速购买的逻辑。
					if(Vue.localStorage.getItem('quick_buy')){
						this.getOrder(null, ()=>{
							if(this.preAddrId)
								this.saveReceiver(this.preAddrId);
							this.preAddrId=null;
						}, true,Vue.localStorage.getItem('quick_buy'));
					} else{
						this.getOrder(null, ()=>{
							if(this.preAddrId)
								this.saveReceiver(this.preAddrId);
							this.preAddrId=null;
						}, true);
					}
				}

			});
		},

		//获取默认支付方式
		getDefaultPayment: function () {
			for (let payment of this.orderInfo.payments || []) {
				if (payment.selected == 1) {
					this.defaultPayment = payment;
					this.selectedPaymentId = this.defaultPayment.paymentId;
				}
			}
		},

		//获取商家id,对于O2O需要传商家id，但对于商城则不需要
		getMerchantId: function () {
			//只考虑一个商家，所以在数组中只取一个
			if (this.orderInfo.merchantList || this.orderInfo.merchantList.length > 1)
				return this.orderInfo.merchantList[0].merchantId;
			return '';
		},

		//获得所有不支持增值税发票的订单
		getNotVatInvoice:function(){
			this.notVatInvoice=[];
			(this.orderInfo.merchantList||[]).forEach((m)=>{
				m.productList.forEach((p)=>{
					if(p.supportInvoiceType != 3&&p.supportInvoiceType != 0){
						this.notVatInvoice.push(p);
					}
				})
			})
		},
		//获得所有不支持发票的订单
		getNotVatInvoiceSimple:function(){
			this.notVatInvoiceSimple=[];
			(this.orderInfo.merchantList||[]).forEach((m)=>{
				m.productList.forEach((p)=>{
					if(p.supportInvoiceType == 0){
						this.notVatInvoiceSimple.push(p);
					}
				})
			})
		},
		//提交订单
		submitOrder: function () {
			var self = this;
			var url = config.apiHost;
			var params=null;
			Vue.loading.show();
			if(urlParams.type==1){//拼团
				url+=urls.group.submit;
				params = this.formatParams(4);//有sessionId
			}else{//普通商品
				url+=urls.common.submit;
				params = this.formatParams(2);//有platformId
			}
			//如果是O2O,需要传商家id
			if (config.isO2O) params.merchantId = this.getMerchantId();
			if (this.isCutOrder) {
				params.cutPriceId = urlParams.id;
				params.businessType = urlParams.type;
			}
			if(Vue.cookie.getCookie('shareCode')){
				params.shareCode = Vue.cookie.getCookie('shareCode');
			}
			this.runningFlag = true;
			Vue.api.postForm(url, params, (res)=> {
				Vue.loading.hide();
				//提交订单成功，将快速购买暂存的接口参数清空
				Vue.localStorage.removeItem('quick_buy');
				//跟踪云埋点
				try {
					window.eventSupport.emit('heimdallTrack', {
						ev: "6",
						oid: res.data.orderCode,
						otp: res.data.amount,
						sp: self.orderInfo.totalDeliveryFee,
						prs: self.returnHeimdall(self.orderInfo.merchantList),
						pc: self.orderInfo.totalNum
					});
				} catch (err) {
					console.log(err);
				}
				//如果存在非法商品
				if (res.code != 0 && res.code != '0') {
					if(res.data.error.type>2) {
						this.unusualStatus = false;
						this.unusualExecute(res.data.error);
						this.isLoaded = true;
						return;
					}
				}
				//this.unusualStatus=false;
				this.runningFlag = false;
				this.order = res.data;
				//如果金额是0元,直接为支付成功
				if (res.data.isPaid == 1) {
					
					window.location.replace("/pay/pay-success.html?orderCode=" + this.order.orderCode + (res.data.groupOrderCode ? '_' + res.data.groupOrderCode : ''));
					return;
				}
				//如果订单是团单，要传orderType = 2 给 App
				if (this.defaultPayment.paymentId == 1||urlParams.type==1){//拼团默认使用在线支付
					if(Vue.browser.isApp()) {
						var url = '${appSchema}://pay?body={"orderType":"'+ (res.data.groupOrderCode ? '2':'') +'","orderCode":"'+ res.data.orderCode +'","amount":'+ res.data.amount +', "url": "'+
							Vue.utils.getPayBackUrl(res.data.orderCode + (res.data.groupOrderCode ? '_' + res.data.groupOrderCode:''))+'"}';
						location.href = url;
					}else {
						var url = Vue.utils.getPayUrl(this.order.orderCode + (res.data.groupOrderCode ? '_' + res.data.groupOrderCode : ''), '&paystate=1');
						window.location.replace(url);
					}
				}else {
					window.location.replace("/pay/pay-success.html?p=" + this.defaultPayment.name + "&a=" + this.order.amount + "&orderCode=" + this.order.orderCode + (res.data.groupOrderCode ? '_' + res.data.groupOrderCode : ''));
				}

			},(res) => {
				Vue.utils.showTips(res.message);
				this.runningFlag = false;
				Vue.loading.hide();
			})
			//});

		},
		//如果选择不需要发票, 直接保存并关闭弹窗
		checkIsNeed:function(){
			if(!this.isNeed){
				this.saveOrderInvoice();
			}
		},
		//初始化各窗口
		setInit: function () {
			if (this.showSubPage) {
				this.showInvoice = false;
				this.showPayment = false;
				this.showCoupon = false;
				this.showProCode = false;
				this.showGiftcard = false;
				this.showDeliver = false;

				this.showDeliveryMode_step1 = false;
				this.showDeliveryMode_step2 = false;
				this.showDeliveryMode_step3 = false;
				//this.showPaymentType = false;
			} else {
				if (urlParams.q || urlParams.id || urlParams.type|| urlParams.quickBuy) {
					if(Vue.browser.isApp()) {
					  Vue.app.back();
					}else {
					  history.back();
					}
				} else {
					var dia = $.dialog({
						title: '<p style="text-align:center;">您确定要取消订单返回购物车吗？</p>',
						content: '',
						button: ['<span style="color:#00a5e0!important">继续逛逛', '不取消']
					});

					dia.on("dialog:action", (e) => {
						if (e.index == 0) {
							// location.replace = '/cart.html';
							location.replace("/cart.html")
						}
					});
				}
			}
		},
		initScroll1: function () {
			Vue.nextTick(function () {
				var scroll = new fz.Scroll('.ui-scroller1', {
					scrollY: true
				});
			})
		},
		//跳转到地址选择页
		gotoAddressChose:function(receiverId,flag){
			// 自提
			var params=[],_r=this.orderInfo.receiver;
			if(Object.getOwnPropertyNames.length>0) {
				for (var k in urlParams) {
					if (['type','q','id'].indexOf(k) >= 0)
						params.push(k + '=' + urlParams[k]);
				}
			}
			if(urlParams.q==1){
				params.push("from=/pay/pay.html?q=1");
			} else{
				params.push("from=/pay/pay.html");
			}
			if(flag){
				params.push("install=true")
			}
			if(urlParams.quickBuy){
				params.push("quickBuy=1");
			}
			if (receiverId) {
				params.push("r_id=" + receiverId);
				location.replace('/my/address-chose.html?' + params.join('&'));
			}
		},
		//保存佣金
		saveBrokerage:function(amount){
				"use strict";
				var amount=this.orderInfo.brokerage.usageAmount=this.checkedBrokerage(amount);
				//if(!amount) return;
				let url=config.apiHost + "/api/checkout/saveBrokerage";
				//let params = {
				//    ut: Vue.auth.getUserToken(),
				//    usageAmount:amount||0
				//}
				let params=Object.assign(this.formatParams(),{usageAmount:amount||0});
				Vue.api.postForm(url, params, (res)=> {
						this.getOrder('/api/checkout/showOrder');
				},(res)=>{
						$.tips({
								content: res.message,
								stayTime: 2000,
								type: "warn"
						});
						if(res.code=='10200006')
								this.getOrder('/api/checkout/showOrder');
				})
		},
		checkedBrokerage:function(amount){
				"use strict";
				var checkReg=/\.$/g;
				var db=/^[0-9]+([.]{1}[0-9]{1,2})?$/
				var amount=amount?amount.replace(/[^\d\.]/g,''):0;
				if(checkReg.test(amount)){
						if(amount.indexOf(".")!=(amount.length-1)){
								amount=amount.replace(/\.$/,'');
						}

				}else{
						if(!db.test(amount)){
								amount=amount.replace(/\d$/,'');
						}
				}
				amount=amount>this.orderInfo.brokerage.residualAmount?this.orderInfo.brokerage.residualAmount:amount;
				//amount=amount>this.orderInfo.productAmount?this.orderInfo.productAmount:amount;
				return amount;

		},
		//保存收货地址
		saveReceiver: function(receiverIds){
			var params = Object.assign(this.formatParams(),{receiverId: receiverIds});
			Vue.api.postForm(config.apiHost + "/api/checkout/saveReceiver", params, (res) => {
				//如果存在非法商品
				if (res.code != 0 && res.code != '0') {
					this.unusualStatus = true;
					this.preAddrId=receiverIds;
					if(res.code == '10200002') {
						Vue.localStorage.setItem('receiverId',receiverIds);
						receiverId = receiverIds;
					};
					this.unusualExecute(res.data.error);
					return;
				}
				this.unusualStatus =false;
				this.getOrder('/api/checkout/showOrder',(result)=>{
					var receiver = this.orderInfo.receiver;
					if(receiver.provinceCode){//暂时接口还没加上
						Vue.localStorage.setItem('receiverId',receiverIds);
						Vue.area.setArea(receiver.provinceName,receiver.provinceCode,receiver.cityName,receiver.cityCode,receiver.areaName,receiver.areaCode,1);
					}

					var params=['t=1'];
					for(var k in urlParams){
						if(['type','q','id'].indexOf(k)>=0)
							params.push(k+'='+urlParams[k]);
					}
					window.history.replaceState(null,'','?'+params.join('&'));
					//window.history.replaceState(null,'','?t=1'+(urlParams.type?('&type='+urlParams.type):''));
				});
				//window.location.href = url;
			});
		},
		//保存收货地址
		saveInstallReceiver: function(receiverId){
			var params = Object.assign(this.formatParams(),{receiverId: receiverId});
			Vue.api.postForm(config.apiHost + "/api/checkout/saveInstallReceiver", params, (res) => {
				//如果存在非法商品
				if (res.code != 0 && res.code != '0') {
					this.unusualStatus = true;
					this.preAddrId=receiverId;
					this.unusualExecute(res.data.error);
					return;
				}
				this.unusualStatus =false;
				this.getOrder('/api/checkout/showOrder',(result)=>{
					var receiver = this.orderInfo.receiver;
					if(receiver.provinceCode){//暂时接口还没加上
						Vue.localStorage.setItem('receiverId',receiverId);
						Vue.area.setArea(receiver.provinceName,receiver.provinceCode,receiver.cityName,receiver.cityCode,receiver.areaName,receiver.areaCode,1);
					}

					var params=['t=1'];
					for(var k in urlParams){
						if(['type','q','id'].indexOf(k)>=0)
							params.push(k+'='+urlParams[k]);
					}
					window.history.replaceState(null,'','?'+params.join('&'));
					//window.history.replaceState(null,'','?t=1'+(urlParams.type?('&type='+urlParams.type):''));
				});
				//window.location.href = url;
			});
		},

		//保存支付方式
		savePayment: function (paymentId) {
			var url = config.apiHost + '/api/checkout/savePayment';
			var params = Object.assign(this.formatParams(1), {paymentId: paymentId})
			setTimeout(()=> {
				Vue.api.postForm(url, params, (res)=> {
					this.showPayment = false;
					$.tips({
						content: '保存支付方式成功',
						stayTime: 2000,
						type: "warn"
					});
					this.getOrder('/api/checkout/showOrder');
				})
			}, 300)
		},

		getCouponsUrl:function(){
			var url = "/my/coupons-list.html";
			if (location.search.length > 1) {
				url += '?from=' + encodeURIComponent(Vue.utils.getRelatedUrl());
				if (urlParams.type) {
					url += "&type=" + urlParams.type;
				}
			}
			return url
		},

		/**
		 * 增加内容
		 */
		//弹窗提示没有收货地址
		checkAddress: function (flag) {
			"use strict";
			var text = flag?'安装':'收货';
			var titleText = this.receiverStatus==1?'您还没有' + text + '地址，请新增' + text + '地址':'当前位置没有' + text + '地址，请选择其他地址';
			var buttonText = this.receiverStatus==1?'新增' + text + '地址':'选择' + text + '地址';
			var dia = $.dialog({
				title: titleText,
				content: '',
				button: ['取消', buttonText]
			});
			dia.on("dialog:action", (e)=> {
				if (e.index == 0) {
					this.popNoAddress = false;
				} else {
					var url = '/my/address-chose.html';
					if (location.search.length > 1) {
						url += '?from=' + encodeURIComponent(Vue.utils.getRelatedUrl());
						if (urlParams.type)
							url += "&type=" + urlParams.type;
						if(this.receiverStatus==2){
							url += '&receiverStatus=2'
						}
						if(this.receiverStatus==2){
							url += '&receiverStatus=2'
						}
						if(flag){
							url += '&noInstall=1'
						}
						if(urlParams.q == 1){
							url += '&q=1'
						}
					}
					location.replace(url);
				}
			});
		},
		// 直接跳转地址添加
		goToAddAddress:function () {
			var url = '/my/address-chose.html';
			if (location.search.length > 1) {
				url += '?from=' + encodeURIComponent(Vue.utils.getRelatedUrl());
				if (urlParams.type)
					url += "&type=" + urlParams.type;
			}
			location.href = url;
		},

		//保存买家备注
		saveRemark: function (remark, id) {
			"use strict";
			let url = config.apiHost + "/api/checkout/saveRemark";
			let params = Object.assign(this.formatParams(), {remark: (remark || ''), id: id});
			if (params.remark.length == 0) return;
			Vue.api.postForm(url, params, (res)=> {
				this.getOrder('/api/checkout/showOrder');
			})
		},

		//保存使用积分
		savePoints: function (point) {
			"use strict";
			let url = config.apiHost + "/api/checkout/savePoints";
			let params = Object.assign(this.formatParams(), {points: this.usePoints ? (point || 0) : 0});
			Vue.api.postForm(url, params, (res)=> {
				this.getOrder('/api/checkout/showOrder');
			}, (res)=> {
				if (['10200003', '10200004', '10200005', '10200006'].indexOf(res.code.toString()) >= 0) {
					this.usePoints = false;
					$.tips({
						content: res.message,
						stayTime: 2000,
						type: "warn"
					});
					this.getOrder('/api/checkout/showOrder');
				}
			})
		},

		// 保存使用悠点卡
		saveUCard:function (usageAmount) {
			"use strict";
			let url = config.apiHost + "/api/checkout/saveUCard";
			let params = Object.assign(this.formatParams(), {selected:this.useOrderUCard?1:0});
			Vue.api.postForm(url, params, (res)=> {
				this.getOrder('/api/checkout/showOrder');
			}, (res)=> {
				$.tips({
					content: res.message,
					stayTime: 2000,
					type: "warn"
				});
				this.getOrder('/api/checkout/showOrder');
			});
		},
		// 保存使用伊点卡
		saveECard:function (usageAmount) {
			"use strict";
			let url = config.apiHost + "/api/checkout/saveECard";
			let params = Object.assign(this.formatParams(), {selected:this.useOrderECard?1:0});
			Vue.api.postForm(url, params, (res)=> {
				this.getOrder('/api/checkout/showOrder');
			}, (res)=> {
				$.tips({
					content: res.message,
					stayTime: 2000,
					type: "warn"
				});
				this.getOrder('/api/checkout/showOrder');
			});
		},
		//选择订单优惠券
		selectCoupon: function (coupons, coupon) {
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
				})
				this.dontuseCoupons = false
			}
			coupon.selected = 1;
			this.useCoupons = true;
			this.myCoupon.thisCoupon = coupon;
		},

		//保存订单优惠券
		saveCoupon: function (selected) {
			"use strict";
			if(this.dontuseCoupons&&arguments.length==0){//如果状态是不使用优惠券,确定按钮不做其他操作
				this.selectCouponWrap = false;
				return;
			}
			var _selected=selected;
			var selected, couponId;
			if (_selected!=0&&this.myCoupon.thisCoupon) {
				selected = 1;
				couponId = this.myCoupon.thisCoupon.couponId
			} else if (_selected==0||this.myCoupon.history) {
				selected = 0;
				couponId = this.myCoupon.history.couponId
			} else {
				this.showCoupon = false;
				this.selectCouponWrap = false;
				return;
			}
			let url = config.apiHost + "/api/checkout/saveCoupon";
			let params = Object.assign(this.formatParams(), {
				selected: selected,
				couponId: couponId
			});
			Vue.api.postForm(url, params, (res)=> {
				this.showCoupon = false;
				this.selectCouponWrap = false;
				this.getOrder('/api/checkout/showOrder');
				$.tips({
					content: '保存订单优惠券成功',
					stayTime: 2000,
					type: "warn"
				});
			})
		},

		// 选择订单礼金卡
		selectGiftCard: function (giftCards, giftCard) {
			"use strict";
			//无效礼金卡
			if (giftCard.giftCartVO.available == false) return;
			//取消选中
			if (giftCard.selected == 1) {
				giftCard.selected = 0;
				return;
			}
			giftCard.selected = 1;
			this.useGiftCard = true;
		},

		// 保存订单礼金卡
		saveGiftCard: function (all) {
			"use strict";
			let url = config.apiHost + "/api/checkout/saveGiftCardSelect";
			let params = Object.assign(this.formatParams(), {giftCardIds: all.join(',')});
			Vue.api.postForm(url, params, (res)=> {
				this.showGiftcard = false;
				this.getOrder('/api/checkout/showOrder');
				$.tips({
					content: '已选择礼金卡',
					stayTime: 2000,
					type: "warn"
				});
			})
		},

		//积分

		//返回跟踪云可用字符串
		returnHeimdall: function (data) {
			var str = [];
			for (var i in data) {
				for (var j in data[i].productList) {
					str.push({"pri": data[i].productList[j].mpId ,"prm": data[i].productList[j].num, "prp": data[i].productList[j].price})
				}
			}
			str = JSON.stringify(str);
			return str;
		},

		getMerchantDeliveryModeList_index:function (index) {
			this.merchantDeliveryModeList_index = index;
			this.showDeliveryMode_step1 = true;

			this.merchantDeliveryModeList = this.orderInfo.merchantDeliveryModeList[index];
		},
		// 保存商家包裹配送方式
		saveDeliveryMode: function (isTakeTheir,merchantId,deliveryModeCodeChecked,pickSiteId) {
			"use strict";
			if(isTakeTheir == 0){
				// 不是自提
				this.showDeliveryMode_step1 = false;

				let url = config.apiHost + "/api/checkout/saveDeliveryMode";
				let params = Object.assign(this.formatParams(), {
					deliveryModeCodeChecked: deliveryModeCodeChecked
				});
				if(pickSiteId) params.pickSiteId=pickSiteId;
				Vue.api.postForm(url, params, (res)=> {
					//如果存在非法商品
					if (res.code != 0 && res.code != '0') {
						this.unusualStatus = true;
						this.unusualExecute(res.data.error);
						return;
					}
					this.unusualStatus =false;
					this.getOrder('/api/checkout/showOrder',()=>{
						var params=['t=1'];
						for(var k in urlParams){
							if(['type','q','id'].indexOf(k)>=0)
								params.push(k+'='+urlParams[k]);
						}
						window.history.replaceState(null,'','?'+params.join('&'));
						//window.history.replaceState(null,'','?t=1'+(urlParams.type?('&type='+urlParams.type):''));
					});
				}, (res)=> {
					this.getOrder('/api/checkout/showOrder');
				});
			}else{
				// 自提
				var params=[],_r=this.orderInfo.receiver;
				if(Object.getOwnPropertyNames.length>0)
				for(var k in urlParams){
					if(['type','q','id'].indexOf(k)>=0)
						params.push(k+'='+urlParams[k]);
				}
				params.push("code="+deliveryModeCodeChecked);
				params.push("from=pay.html");
				params.push("addr="+_r.provinceName+_r.cityName+_r.areaName+_r.detailAddress);
				location.href='/specialFun/findShop.html?'+params.join('&');
			};
		},

		//选择发票
		switchInvoice:function(invoiceType){
			this.invoice.invoiceType=invoiceType;//切换相关invoiceType
			this.invoice.invoiceMode=2;//切换相关invoiceType
			if(invoiceType==2) this.getVATInvoice(); //选择增值税发票时, 去拿相关发票
		},
		//选择增票方式
		switchSoInviceConfig:function(invoiceMode){
			this.invoice.invoiceMode = invoiceMode;
		},
		//获取增值税发票
		getVATInvoice: function (init) {
			if(Object.keys(this.VATInvoice).length > 0){//如果增值税发票已经存在, 直接赋给发票对象, 不再请求接口
				this.canSubmitInvoice = true;
				Vue.set(this, 'invoice', $.extend({}, this.invoice, this.VATInvoice));
				return;
			}
			var url = config.apiHost + '/api/my/showVATInvoice';
			var params = this.formatParams(1);
			Vue.api.postForm(url, params, (result) => {
				this.VATInvoice=result.data;
				Vue.set(this, 'invoice', $.extend({}, this.invoice, this.VATInvoice)); //把增值税发票添加进发票对象
			},(error)=> {
                if (!init){
					$.tips({
						content: error.message,
						stayTime: 2000,
						type: "warn"
					});
				}


            });//用户没有增值税发票信息时不再提示
		},

		//保存发票信息
		saveOrderInvoice: function () {
			if (this.isNeed&&this.invoice.invoiceTitleType == 2 && (this.invoice.invoiceTitleContent == ''|| this.invoice.invoiceTitleContent == null || this.invoice.invoiceTitleContent.replace(/\s/g, "") == '' )) {
				var el = $.tips({
					content: '请填写发票抬头',
					stayTime: 2000,
					type: "warn"
				})
			} else if(this.isNeed&&this.invoice.invoiceTitleType == 2 && (this.invoice.departmentTaxpayerIdentificationCode == ''||this.invoice.departmentTaxpayerIdentificationCode == null||this.invoice.departmentTaxpayerIdentificationCode.replace(/\s/g, "") == '')){
				var el = $.tips({
					content: '请填写纳税人识别号',
					stayTime: 2000,
					type: "warn"
				})
			}else {
				if (!this.isNeed) this.invoice.invoiceType = 0;
				if (this.invoice.invoiceContent == '')
					this.invoice.isNeedDetails = 1;
				else
					this.invoice.isNeedDetails = 0;
				if (this.invoice.invoiceTitleType == 1) this.invoice.invoiceTitleContent = '个人';

				var param=this.formatParams(1);
				//共通参数
				param=Vue.utils.mergeObj(param,{
					invoiceType:this.invoice.invoiceType,
					invoiceMode:this.invoice.invoiceMode,
					isNeedDetails:this.invoice.isNeedDetails||0
				});
				//普通发票参数
				//invoiceContent:this.invoice.invoiceContent|| this.invoiceCont[0].invoiceContentValue, 注释：默认不取出任何值oupu
				if(this.invoice.invoiceType==1){
					param=Vue.utils.mergeObj(param,{
						invoiceTitleType:this.invoice.invoiceTitleType,
						invoiceTitleContent:this.invoice.invoiceTitleType==1?'个人':this.invoice.invoiceTitleType==2?this.invoice.invoiceTitleContent:'',
						// taxpayerIdentificationCode:this.invoice.taxpayerIdentificationCode,
						invoiceContentId:this.invoice.invoiceContentId || this.invoiceCont[0].invoiceContentId ,
						invoiceContent:this.invoice.invoiceContent,
						taxpayerIdentificationCode:this.invoice.invoiceTitleType==1?'':this.invoice.invoiceTitleType==2?this.invoice.departmentTaxpayerIdentificationCode:''
					});
				}
				var url = config.apiHost + '/api/checkout/saveOrderInvoice';
				Vue.api.postForm(url, param, (res) => {
					var el = $.tips({
						content: '发票保存成功',
						stayTime: 2000,
						type: "warn"
					});
					this.showInvoice = false;
					this.tmpTitle='';
					this.getOrder('/api/checkout/showOrder');
				})

			}
		},

		//更新发票内容
		updateInvoiceContent: function () {
			if (this.invoice.invoiceContentId && this.invoiceCont) {
				for (var i = 0; i < this.invoiceCont.length; i++) {
					if (this.invoiceCont[i].invoiceContentId == this.invoice.invoiceContentId) {
						this.invoice.invoiceContent = this.invoiceCont[i].invoiceContentValue;
						return;
					}
				}
			}
		},

		//获得当前位置
		getGeoLocation: function () {
			return {longitude: 121.473701, latitude: 31.230416};
		},

		//阻止冒泡
		stopPropagation: function (e) {
			e.stopPropagation();
		},
		// 不使用优惠券
		dontUseCoupons:function () {

			if(this.dontuseCoupons){
				// 不使用优惠券
				this.coupons.forEach((v)=>{
					"use strict";
					if(v.selected==1) {
						// this.notUserCouponId = v.couponId;
						v.selected=0;
						this.myCoupon.thisCoupon=v;
						// this.myCoupon.history = null;
						// this.myCoupon.thisCoupon = null;
					}
				});
				this.saveCoupon(0);
			}else{
				// 使用优惠券

			}
		},
		// 关闭选择优惠券
		closeSelectCouponWrap:function () {
			this.dontuseCoupons = true;
			this.coupons.forEach((v,i)=>{//不保存数据, 并且还原选中的优惠券
				if(this.myCoupon.index>=0&&i==this.myCoupon.index) {
					v.selected = true;
					this.dontuseCoupons = false;
				}else
					v.selected=false;
			})
			this.selectCouponWrap = false;
		},
		// 选择弹窗里 点击添加券
		toAddCoupon:function () {
			this.selectCouponWrap = false;
			this.addCouponWrap = true;
		},
		// 添加优惠券
		addCoupon: function () {
			var url = config.apiHost + '/api/my/coupon/bindCoupon';
			var param = {
				ut: this.ut,
				companyId: this.companyId,
				couponCode: this.couponCode,
				pwd: this.couponPsw
			};
			Vue.api.postForm(url, param, (res) => {
				$.tips({
					content:"添加优惠券成功！",
					stayTime:2000,
					type:"success"
				});
				this.couponCode = '';
				this.couponPsw = '';
				this.getOrder('/api/checkout/showOrder');
			});
		},
		// 返回到选择优惠券列表
		backToSelectCouponWrap:function () {
			this.addCouponWrap = false;
			this.selectCouponWrap = true;
		},
		// 关闭添加优惠券
		closeAddCoupon:function () {
			this.addCouponWrap = false;
		},
		//公告
		getNotice: function(){
			var url = config.apiHost + '/api/dolphin/list';
			var param = {
				platform: config.platform,
				pageCode: 'H5_SETTLEMENT_PAGE',
				adCode: 'notice_settle',
				companyId: Vue.mallSettings.getCompanyId(),
				areaCode: Vue.area.getArea().aC,
			};
			Vue.api.get(url, param, (res) => {
				this.noticeList = res.data.notice_settle;
				if(this.noticeList.length>0){
					this.iShowNotice=true
				}
				this.initNoticeScroll();
			}, () => {
				//处理掉不显示报错
			});
		},
		showNoticeAction: function () {
			this.initScroll();
			this.iShowNoticeAction = true;
		},
		initScroll: function () {
			Vue.nextTick(function () {
				var scroll = new fz.Scroll('.ui-scroller', {
					scrollY: true
				});
			})
		},
		//公告滚动初始化
		initNoticeScroll: function () {
			Vue.nextTick(function () {
				var $ul = $('.t-notice ul');
				var $lis = $ul.find('li');
				var liHeight = $lis.height();
				if($lis.length > 1) {
					setInterval(function() { //终于解决了安卓滚动重影问题！！！背景色
						$ul.css({
							'-webkit-transform':'translate3d(0,-42px,0)',
							'-webkit-transition':'-webkit-transform .5s'
						});
						setTimeout(function () {
							$ul.css({
								'-webkit-transform': 'translate3d(0,0,0)',
								'-webkit-transition': null
							});
							$ul.append($ul.children().first());
						}, 500);
					}, 5000);
				}
			})
		},
	}
})
