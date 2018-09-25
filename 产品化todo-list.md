# 待完成
## 模版相关
* css变量和UI统一
* jd模板的打包整合
* 雪碧图、iconfont、图片上cdn
* customer 和core 的css区分
* 模版（首页，分类，详情，个人中心，搜索）规范化，尽可能组件化
* 订制页面分拆到customer中
## 合代码
* b2c 店铺进core
* 升级vue2 并进 prod1.0
* 整合B2B 平安租赁
## js相关
* script 扩展
* 公共js引入
* js增加事件回调供第三方调用
* 自动跳转、回退（Ui-Header的跳转问题，如果没有上一页，可以不展示返回）
* common中的业务代码抽取（自动删除cookie->browser.js自动执行了app直接删除cookie的函数，是业务代码，更适合放到deep link里去）
* app-api有隐藏行为
* 公共js去除vue依赖？
## 代码相关
* 模块分责任人
## 配置相关
* title 配置
* 微信share默认信息未产品化
* 客服配置
* 国际化
* 页面打包时自动引入扩展的css login.html,login.css,login.extent.css
* 微信支付支持多域名和后端跳转












