## 开始

1. 日常运行项目
  ``` bash
  npm run dev           //开发
  npm run build         //发布
  npm run zip 项目名     //ZIP打包
  npm run clean         //清理
  ```

## 目录结构

```
- apps            // 将页面按功能和业务切分后的模块
  + common        // 命名规范：[业务名称] / [业务名称]-[模块名称] .[html,js,css,less]
  - gf             // gf 业务下的 user 模块
    - gf-user.html      // 模块的页面结构
    - gf-user.js        // 模块的业务逻辑
    - gf-user.css       // 模块的表现样式
    - gf-group.js
    - ...
- mock                  // 模拟后端服务的数据
  - server.conf         // api数据路由（此文件不能删除或改名）
  - ......              // 自定义的json数据
+ pages                 // 除 index.html 的完整 HTML 页面，用于多页面应用
- services              // 超脱页面的业务逻辑模块
  - ajaxService.js      // 封装 ajax 方法，规范请求参数和响应数据的格式, 根据响应结果显示提示信息
  - configService.js    // 应用的配置项，可在构建时动态替换配置项
  - filterService.js    // 自定义的 Avalon2 过滤器
  - menuService.js      // 功能菜单的逻辑，权限过滤
  - routerService.js    // 路由配置
  - storeService.js     // 数据服务，包括后端数据交互和全局状态管理
- static                // 非 commonjs 模块化的资源
  - mod.js
+ vendor                // 不能通过 npm 安装的模块
- index.html            // 应用主页面
- index.css             // 应用主样式
- index.js              // 应用启动，包括 polyfill/必要的依赖/root VM/路由启动
```

## 浏览器支持

现代浏览器、IE8 及以上

#### 项目截图
![首页.png](https://upload-images.jianshu.io/upload_images/7084049-5ea67ed3250a8dbb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![授权信息.png](https://upload-images.jianshu.io/upload_images/7084049-0a8b514ace8e25f3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![4G 视频存储.png](https://upload-images.jianshu.io/upload_images/7084049-a13ea7c87545af2f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![Statistics.png](https://upload-images.jianshu.io/upload_images/7084049-5b89a2dd17ec80ef.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![本域管理.png](https://upload-images.jianshu.io/upload_images/7084049-fa756df60c7d2f4e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![本域管理-视图.png](https://upload-images.jianshu.io/upload_images/7084049-358048d0cba20f43.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![部门管理.gif](https://upload-images.jianshu.io/upload_images/7084049-39f743cc5e21a97f.gif?imageMogr2/auto-orient/strip)

![告警查询.png](https://upload-images.jianshu.io/upload_images/7084049-f3643f23e45ac360.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![轨迹查询.png](https://upload-images.jianshu.io/upload_images/7084049-b25edb1f09987cda.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![轨迹回放.gif](https://upload-images.jianshu.io/upload_images/7084049-a7d8291aec27be28.gif?imageMogr2/auto-orient/strip)

![权限角色.png](https://upload-images.jianshu.io/upload_images/7084049-de1fed7725495414.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![日志.png](https://upload-images.jianshu.io/upload_images/7084049-2024a658ace80bcc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![执法仪管理.png](https://upload-images.jianshu.io/upload_images/7084049-f386c94411282b3b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![上传升级包.png](https://upload-images.jianshu.io/upload_images/7084049-c4e91ec07adca156.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![上传升级包-上传.png](https://upload-images.jianshu.io/upload_images/7084049-eb53f5e02c4c219c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![设备.png](https://upload-images.jianshu.io/upload_images/7084049-34ef3a8163398902.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![升级状态.png](https://upload-images.jianshu.io/upload_images/7084049-94ece7c0c30884d7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![实时指挥.png](https://upload-images.jianshu.io/upload_images/7084049-f5e9718f25a0b9b1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![视频监控.png](https://upload-images.jianshu.io/upload_images/7084049-8a905e3135ea883e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![数字证据存储.png](https://upload-images.jianshu.io/upload_images/7084049-b8d21b883634d433.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![数字证据存储-存储分配.png](https://upload-images.jianshu.io/upload_images/7084049-d3c81eb393be34c0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![数字证据存储-天数.png](https://upload-images.jianshu.io/upload_images/7084049-936e034223571bac.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![数字证据存储-添加.png](https://upload-images.jianshu.io/upload_images/7084049-a7a43a52963452c9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![添加用户.png](https://upload-images.jianshu.io/upload_images/7084049-bd20f31ebf94bc0e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![添加执法仪.png](https://upload-images.jianshu.io/upload_images/7084049-25b821e3577e05fc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![用户部门.png](https://upload-images.jianshu.io/upload_images/7084049-286887dd80636a4d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



