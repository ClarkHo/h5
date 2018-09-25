import Vue from "vue";
import config from "../../../env/config.js";
import UiHeader from "../../components/ui-header.vue";


let urlParams = Vue.utils.paramsFormat(window.location.href);

new Vue({
    el: 'body',
    components: { UiHeader},
    data: {
      consultContent:'',
      showChoose:false,
      consultTypeList:[],
      chooseType:'',
      submitting: false
    },
    ready: function() {
      this.getConsultType();
    },
    methods: {
      getConsultType:function () {
        var url = '/back-product-web/consultAppAction/getConsultTypeList.do';
        var params = {
          currentPage:1,
          itemsPerPage   :100
        }
        Vue.api.post(url, params, (res) => {
          if(res.data && res.data.listObj){
            this.consultTypeList = this.consultTypeList.concat(res.data.listObj || []);
          }
        })
      },
      pushConsult:function () {
        if(!this.chooseType){
          return;
        }
        if(!this.consultContent){
          return;
        }
        if(this.submitting){
          Vue.utils.showTips('你点的太快啦');
          return;
        }
        var url = '/back-product-web/consultAppAction/insertNewConsult.do';
        var params = {
          merchantProductId:urlParams.mpId || '',
          type:this.chooseType.id,
          content:this.consultContent
        }
        this.submitting = true;
        Vue.api.post(url, params, (res) => {
          Vue.utils.showTips('发布成功');
          setTimeout(() => {
            history.back();
          }, 1000);
        })
      }
    }
});