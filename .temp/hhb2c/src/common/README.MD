组件README
=

#### 说明

- 列举出目前已有的通用方法。

#### 目前有

- analytics.js ：这个js中全部放跟业务不相关的代码， 比如百度客服，跟踪云，百度统计等

- api-request.js：封装get、post、postForm接口请求方法，用了第三方 vue-rerouce 解析请求

- app-api.js：封装了与App交互的各种方法，登录、页面返回、退出登录、发送App事件

- area-code.js：区域code获取

- auth.js：用户token获取，判断登录

- browser.js：浏览器信息获取，微信、ios、Android平台判断，ua信息获取

- cookie.js：cookie操作，设置cookie，取某个cookie的值

- date：日期格式化过滤器

- eventSupport.js:

- filters：通用过滤器

- h5-api.js：

- heimdall.js：

- link-page.js：Vue指令，跳转页面

- loading.js：加载中全局动画

- localStorage.js：localStorage操作封装，增删查

- mall-setting.js：商城基本设定，

- money.js：特殊金额格式化

- page-restorer.js：页面缓存

- scroll-loading.js：滚动加载

- scroll-top.js：滚动到顶部指令，目前悬浮窗也写在这里面

- session-id.js：操作用户客户端session id

- sessionStorage.js：sessionStorage操作

- sys-time.js：获取服务器上的实时时间

- utils.js：封装的通用方法

  #### 调用方法：Vue.utils.name,具体有下面的这些
  - getHost：返回主机名，host

  - getRelatedUrl：返回相对路径

  - getPayUrl：构造支付的路径

  - getPayBackUrl：构建支付完成的回调页面路径

  - paramsFormat:地址栏参数格式化

  - getHhmmss：返回时间的天、时、分、秒

  - showTips：toast提示信息

  - hashFormat：获取url hash的值，#号后面的

  - goLogin：用于js判断是否登录

  - quickPurchase：立即购买方法封装

  - safeDomainCheck：安全域名检测

- weixinshare.js：微信分享初始化