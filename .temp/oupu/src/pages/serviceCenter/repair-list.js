import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import uiFileUpload from "../../components/ui-file-upload.vue";
import config from "../../../env/config.js";

let urlParams = Vue.utils.paramsFormat(window.location.href);


new Vue({
    el: 'body',
    components: {
        UiHeader,uiFileUpload
    },
    data:{
        ut:Vue.auth.getUserToken(),
        orderObj:{},
        choosedPro:{},
        step:1,
        returnReasonList:[],//原因列表
        chooseType:{},//选中的维修类型
        showChoose:false,//打开维修原因列表
        describe:'',//问题描述
        imgBox:[],//用户上传的图片地址
        address:[],//收货地址
        noAddress:false,//是否有收货地址
        choosedAddress:{},//选中的收货地址
        applyDetail:{},//修改时候的订单详情
    },
    methods:{
        getRepairDetail:function () {
            let url = config.apiHost + '/back-order-web/restful/afterSales/queryReturnMaintainInfo.do';
            let params = {
                ut:this.ut,
                returnId:urlParams.id
            }
            Vue.api.postForm(url,params,(res) => {
                if(res.data){
                    this.applyDetail = res.data;
                    res.data.returnItems[0].choosedNum = res.data.returnItems[0].returnProductItemNum;
                    this.choosedPro = res.data.returnItems[0];
                    try {
                        this.chooseType = {
                            returnReason:res.data.returnReason,
                            returnReasonId:res.data.returnReasonId
                        }
                    } catch (error) {
                        
                    }
                    this.describe = res.data.returnRemark;
                    res.data.returnPics.forEach((item) => {
                        this.imgBox.push(item.picUrl);
                    })
                }
            })
        },
        getOrderObj:function (flag) {
            let url = config.apiHost + '/back-order-web/restful/order/queryApplyMaintainGoodsInfo.do';
            let params = {
                ut:this.ut,
                orderCode:urlParams.orderCode
            };
            Vue.api.postForm(url, params, (res) => {
                if(res.data){
                    this.orderObj = res.data;
                }
            })
        },
        choosePro:function (pro) {
            if(!pro.guaranteeDays||pro.guaranteeDays<0 || pro.canReturnNumber < 1){
                Vue.utils.showTips('该商品不支持维修');
                return;
            }
            this.choosedPro = pro;
            if(!this.choosedPro.choosedNum){
                Vue.set(this.choosedPro,'choosedNum',1)
            }
            this.step = 2;
        },
        back:function () {
            if(urlParams.id){
                history.back();
                return;
            }
            if(this.step == 2){
                this.step = 1;
            } else{
                history.back();
            }
        },
        getReturnReason:function () {
            let url = config.apiHost + '/back-order-web/restful/afterSales/queryReturnReason.do';
            let params = {
                ut:this.ut,
                type:1,//1、维修
            }
            Vue.api.postForm(url,params,(res) => {
                if(res.data){
                    this.returnReasonList = res.data.returnReasonVOList;
                }
            })
        },
        changeNum:function (flag) {
            if(urlParams.id){
                Vue.utils.showTips('暂不支持修改数量');
                return;
            }
            if(flag){
                if(this.choosedPro.choosedNum<this.choosedPro.canReturnNumber){
                    Vue.set(this.choosedPro,'choosedNum',this.choosedPro.choosedNum+1);
                } else{
                    Vue.utils.showTips('达到可维修上限');
                }
            } else{
                if(this.choosedPro.choosedNum > 1){
                    Vue.set(this.choosedPro,'choosedNum',this.choosedPro.choosedNum-1);
                }
            }
        },
        uploadSuccess:function (data) {
            if(data&&data.filePath && this.imgBox.length < 3){
                this.imgBox.push(data.filePath)
            } else{
                this.imgBox.splice(2,1,data.filePath);
            }
        },
        deleteImg:function (index) {
            this.imgBox.splice(index,1);
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

                this.address.forEach((item) => {
                    if(item.defaultIs == 1){
                        Vue.set(item,"checked",true);
                        this.choosedAddress = item;
                    } else{
                        Vue.set(item,"checked",false);
                    }
                })
            });
        },
        //选择收货地址
        choseAddress:function (add) {
            if(add && add.id && this.choosedAddress.id != add.id){
                this.choosedAddress.checked = false;
                add.checked = true;
                this.choosedAddress = add;
            }
            this.step = 2;
        },
        applyMaintain:function () {
            /**
             * urlParams.id,表示是修改申请
             */
            if($.isEmptyObject(this.chooseType)){
                Vue.utils.showTips('请选择故障类型');
                return;
            }

            let url = config.apiHost + (urlParams.id?'/back-order-web/restful/afterSales/updateSoReturn.do':'/back-order-web/restful/afterSales/applyMaintainSoReturn.do');
            let params = {
                ut:this.ut,
                type: 11, //维修类型
                returnProductListStr: JSON.stringify([{
                    soItemId:urlParams.id?this.choosedPro.soItemId:this.choosedPro.id,
                    productNum:this.choosedPro.choosedNum
                }]),
                returnReasonId: this.chooseType.returnReasonId,
                returnReason: this.chooseType.returnReason,
                returnRemark: this.describe,
                picListStr: JSON.stringify(this.imgBox.map(item => {
                    return {url:item}
                })),
                receiverId: this.choosedAddress.id
            }

            if(urlParams.id){
                params.returnCode = this.applyDetail.returnCode;
            } else{
                params.orderCode = urlParams.orderCode;
            }

            Vue.api.postForm(url,params,(res) => {
                Vue.utils.showTips('提交申请成功');
                setTimeout(function() {
                    history.back();
                }, 1000);
            })
        }
    },
    ready:function () {
        this.getOrderObj();
        this.getReturnReason();
        this.getAllAddress();
        //有id，表示是修改
        if(urlParams.id){
            this.getRepairDetail();
            this.step = 2;
        }
    }
});