import Vue from "vue";
import config from "../../env/config.js";


/**
 * 返回顶部
 */
Vue.directive('scroll-top', {
    bind: function () {
        this.handler = function(){
            var backTop = $(window).scrollTop();
            var timer = setInterval(function() {
                var scrollTop = $(window).scrollTop();
                //如果用户向下滚动了页面
                if (scrollTop > backTop) {
                    clearInterval(timer);
                    return;
                }
                var speed = scrollTop / 5;
                backTop = scrollTop - speed;
                //
                $(window).scrollTop(backTop);
                //如果已到顶部
                if (backTop == 0) {
                    clearInterval(timer);
                }
            }, 40);
        }
        this.el.addEventListener("click",this.handler);
    }
})

$(function () {
    var xiaonengEl, settingid;
    function showXiaoNeng(data) {
        var itemId = '';
        let uid = Vue.auth.getUserToken();
        let username = localStorage.username;
        if(Vue.utils.getRelatedUrl().indexOf('/detail.html') == 0) {
            itemId = Vue.utils.paramsFormat(location.href).itemId;
        }
        settingid = data.settingId;
        window.NTKF_PARAM = {
            "siteid": data.siteId /*网站siteid*/,
            "settingid": data.settingId /*代码ID*/,
            "erpparam": uid || "" /*会员ID*/,
            "uid": username || "",
            "uname": ""/*会员名*/,
            "userlevel": data.userLevel,/*会员等级*/
            "itemid": itemId,
            "itemparam": config.platformId
        }
        var da = document.createElement("script");
        da.src = 'http://dl.ntalker.com/js/xn6/ntkfstat.js?siteid='+data.siteId;
        document.body.appendChild(da);
        resizeStyle();
        //foldingIcon();
    }
    //重置显示
    function resizeStyle() {
        var left = $(window).width()-50,    
            bottom = 160,
            xnxy = sessionStorage.xnxy;
        //读取缓存的位置
        if(sessionStorage.xnxy) {
            left = xnxy.split(',')[0];
            bottom = xnxy.split(',')[1];
        }

        xiaonengEl = $('<div onclick="NTKF.im_openInPageChat(\''+ settingid +'\')" style="position:fixed;background:url(${staticPath}/images/oupu-kefu.png?v=${version}) center center no-repeat;background-size:100% 100%;width:38px;height:38px;z-index: 1000;left:'+left+'px;bottom:'+bottom+'px;border-radius:50%;"></div>');
        $('body').append(xiaonengEl);
        freeDrag();
    }
    //拖动
    function freeDrag() {
        var winHeight = $(window).height(),
            winWidth = $(window).width(),
            left = 12,
            bottom = 61;

        xiaonengEl[0].addEventListener('touchstart', function (e) {
            left = parseFloat(xiaonengEl.css('left'));
            bottom = parseFloat(xiaonengEl.css('bottom'));
            /*xiaonengEl.css({
             'box-shadow': '0 0 10px rgba(0,0,0,0.3)'
             });*/

            document.body.addEventListener('touchmove', preventDefault);
            xiaonengEl[0].addEventListener('touchmove', move);
        });
        xiaonengEl[0].addEventListener('touchend', function (e) {
            xiaonengEl[0].removeEventListener('touchmove', move);
            document.body.removeEventListener('touchmove', preventDefault);
            /*xiaonengEl.css({
             'box-shadow': 'none'
             });*/

            if(left <= 12) {
                left = 12;
            }
            if((winWidth - left) <= 50) {
                left = winWidth - 50;
            }
            if(bottom <= 61) {
                bottom = 61;
            }
            if((winHeight - bottom) <= 86) {
                bottom = winHeight - 86;
            }
            xiaonengEl.css({
                'left': left,
                'bottom': bottom
            })

            //保存之前的位置 
            sessionStorage.xnxy = left + ',' + bottom;
        });

        function move(e) {
            left = e.touches[0].clientX-19;
            bottom = winHeight-e.touches[0].clientY-19;
            xiaonengEl.css({
                'left': left,
                'bottom': bottom
            })
        }
        function preventDefault(e) {
            e.preventDefault();
        }
    }
    //折叠
    /*function foldingIcon() {
     var img = $('<img style="position:fixed;right:0;bottom:60px;height:44px;" src="${staticPath}/images/kefu_x.png?v=${version}" alt="" />');
     $('body').append(img);
     img.click(function () {
     xiaonengEl.show();
     img.hide();
     setTimeout(function () {
     xiaonengEl.hide();
     img.show();
     }, 5000);
     });
     }*/

    //判断当前页面是否需要隐藏小能客服
    function hideXiaoneng() {
        let excludes = ["/weixin/share.html","/detail.html"];
        let path = location.pathname;

        for (var i = 0; i < excludes.length; i++) {
            if (path.indexOf(excludes[i]) === 0) {
                return true;
            }
        }

        return false
    }

    function getXnConfig(name, code) {
        if(sessionStorage[name]) {
            showXiaoNeng(JSON.parse(sessionStorage[name]));
        }else {
            var url = config.apiHost + '/search-backend-web/getCustomerSiteInfo.json';
            var param = {
                merchantId: -99,
                platformId: 0,
                sessionId: Vue.session.getSessionId(),
                pageCode: code,
                companyId: Vue.mallSettings.getCompanyId()
            };
            Vue.api.get(url, param, (res) => {
                if(res.data && res.data.siteId && res.data.settingId) {
                    sessionStorage[name] = JSON.stringify(res.data);
                    showXiaoNeng(res.data);
                }
            });
        }
    }

    if(!Vue.browser.isApp() && !hideXiaoneng()) {
        var page = Vue.utils.getRelatedUrl();
        if(page.indexOf('/feedback/') == 0) {
            return;
        }
        if(page.indexOf('/my/') == 0 || page.indexOf('/setting/') == 0 || page.indexOf('/receipt/') == 0) {
            getXnConfig('xnConfigAfter', 4);
        }else {
            getXnConfig('xnConfigPre', 1);
        }

    }
})