### 搭建环境
	1. 请安装nodejs 6.x 版本
	2. 请安装cnpm 
		npm install cnpm -g
	3. 请安装gulp
		npm install gulp -g
### 安装依赖
	
	npm i

### （方式一）本地开发(打包和起本地server 默认80端口) host指向127.0.0.1
### npm run [dev,test,stg,edu,online] [oupu,hh,hhb2c,hhb2b,lyf,ds,yihe]
	npm run dev oupu
	第一个参数为环境 第二个参数为项目名


### （方式二）本地只打包（用花瓶和fiddler代理到dist目录）host为域名对应host
### gulp watch -c [oupu,hh,hhb2c,hhb2b,lyf,ds,yihe] --[dev,test,stg,edu,online]
	gulp watch -c oupu --dev
	第一个为项目名，第二个为环境


### stg 编译打包
	gulp clean build -e stg -o target/stg -c oupu
### node生成日期/tgz包，用于stg和online上线
	node pack-project -o target/stg  -t target/stg -c oupu


### shell 打包
	cd $WORKSPACE/target/online/51/h5_mall
	tar -zcvf h5_mall.tgz *
	mv h5_mall.tgz ../
	cd ..
	md5sum h5_mall.tgz > h5_mall.tgz.md5


### 项目使用的第三方库
fronzenui - frozenui.github.io
zeptojs - http://zeptojs.com/
vuejs - http://cn.vuejs.org/
vue-resource - https://github.com/vuejs/vue-resource

### 其他工具
http-dev-server - https://github.com/bruceman/http-dev-server
