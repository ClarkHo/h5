//百度推广
//src后面参数做成函数入参
module.exports = function baiduHm(){
    var _hmt = _hmt || [],lp = location.pathname;
    if(lp == '/index.html' || lp == '/'){//首页才加载
        (function() { 
            var hm = document.createElement("script"); 
            hm.async = true;
            hm.src = "https://hm.baidu.com/hm.js?32d77d6711aa8b79c0a3b8032362adca";
            var s = document.getElementsByTagName("script")[0]; 
            s.parentNode.insertBefore(hm, s); 
          })();
    }
    
}
