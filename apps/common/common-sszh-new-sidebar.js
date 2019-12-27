/*
 * @Author: mikey.liangzhu
 * @Date: 2018-10-19 09:44:08
 * @Last Modified by: mikey.liangzhu
 * @Last Modified time: 2019-08-29 10:38:12
 * @modify 重构树 ，查询树 ，采用新街口 旧代码在 common-sszh-slidbar.js
 *
 * 树加载步骤
 *
 * 1.先加载第一级目录树并展开 解决
 *
 * 2.目录树自动异步加载树节点数据 解决
 *
 * 3.等待加载完树 解决
 *
 *
 * 实时指挥目录树说明：
 *
 * 1.目录树一层一层展开，默认只展开第一层； 解决
 *
 * 2.设备节点只有2级（父设备和子设备）；解决
 *
 * 3.勾选设备节点则在地图上进行定位，无定位的设备在地图右上角弹出设备信息框；解决
 *
 * 4.取消勾选设备节点则在地图上清除定位，或关闭右上角设备信息框；解决
 *
 * 5.勾选非设备节点，展开其下一级节点，同时勾选下级所有设备节点并在地图上定位这些设备，不勾选非设备节点； 解决
 *
 * 6.取消勾选非设备节点，同时取消勾选下级所有设备节点并在地图上清除这些设备的定位； 解决
 *
 * 7.单击即勾选或取消勾选； 解决
 *
 * 8.双击非设备节点，无定义；解决
 *
 * 9.双击设备、子设备节点，在地图上定位，并在定位上弹出设备信息框；无定位设备只在地图右上角弹出设备信息框。 解决
 *
 * 10.离线设备不做操作。 解决
 *
 * 12.单击父设备，展开其子设备  暂无
 *
 * 12.双击父设备节点，播放该设备下是所有子设备；如分屏数不够则去前分屏数的子设备的视频进行播放； 暂无
 *
 *
 *
 *
 *视频监控目录树说明：（）暂时忽略 ，按照 时指挥树操作
 *
 *1.目录树一层一层展开，默认只展开第一层；解决
 *
 *2.设备节点只有2级（父设备和子设备）； 解决
 *
 *3.单击非叶子节点，展开其下一级节点；what？
 *
 *4.单击父设备，展开其子设备
 *
 *5.单击子设备，无定义；
 *
 *6.双击父设备节点，播放该设备下是所有子设备；如分屏数不够则去前分屏数的子设备的视频进行播放；
 *
 *7.双击子设备则播放该子设备的视频；
 *
 *8.双击非设备节点，无定义。
 *
 */

//mytype表示自定义设备类型0 执法仪， 1：快速 2：车 3:无人机

/**
 * 实时指挥系统中部分公用的侧边栏
 * @prop {String} owner 标识字符串
 * @prop {Array} recentData 最近项的数据
 * @event {Function} onCheck 当勾选节点时触发
 * @event {Function} extraProcessWhenExpand  当展开节点时进行一些额外操作
 * @event {Function} extraProcessWhenPersonChange  当人员信息变化时进行一些额外操作
 * @event {Function} returnTreeObj: avalon.noop, //放回部门树对象
 * @example
 * ```
 * demo
 * <ms-poll-sidebar :widget="{owner:'videoMonitor',recentData:@recentData,fetchRecent:@fetchRecent,onCheck:@handleTreeCheck,extraProcessWhenExpand:@extraProcessWhenExpand,extraProcessWhenPersonChange:@extraProcessWhenPersonChange}">
        //下面的li为slot
        <li :for="($index, el) in @recentData" :class="[el.type === 'device' ? 'device' : 'person']">{{el.name}}&nbsp;{{el.time}}</li>
    </ms-poll-sidebar>
 * 可参见 sszhxt-spjk 模块
 * 
 * ```
 */

import {
  createForm
} from "ane";

import {
  getPlatformView,
  getStatus
} from "./common-gb28181-tyywglpt-archetype-api";

import {
  checkView,
  ViewItem
} from "./common-gb28181-tyywglpt-view-api";

import {
  orgIcon,
  isDevice,
  isDSJDevice,
  getTypeName
} from "./common-gb28181-tyywglpt-device-type";

import {
  debounce
} from "./common-used";

import {
  languageSelect
} from '../../services/configService';

const storage = require('../../services/storageService.js').ret;
let language_txt = require("../../vendor/language").language;

import "/apps/common/common-sszh-new-sidebar.less";

avalon.component("ms-sszh-sidebar", {
  template: __inline("./common-sszh-new-sidebar.html"),
  defaults: {
    onPollTreeIdFn: avalon.noop,
    onCheck: avalon.noop,
    returnTreeObj: avalon.noop, //放回部门树对象
    extraHandleWhenCheckOrg: avalon.noop,
    extra_class: languageSelect == 'en' ? true : false,
    search_type_title: getLan().placeholder,
    sidebar_txt: getLan(),
    $Form: createForm(),
    handledevTypeChange(e) {},
    owner: '',
    // 传进 treeId 
    treeId:'',
    // 搜索
    searchIng: false,
    isLoading: false,
    noData: false,
    searchData: [],
    expandedKeys: [],
    onSelectTree(selectedKeys, e) {
      // 先加载节点 在 高亮
      this.searchData.clear();
      getNodesByParam(e.node.path, this.treeObj);
      findonExpandtNodes(e.node.path, false, this);
    },
    searchAllData: [],
    searchPage: 0,
    scrollItem(e) {
      let target = e.target;
      let divHeight = target.clientHeight;
      let nScrollHeight = target.scrollHeight;
      let nScrollTop = target.scrollTop;

      this.loading = false;

      if (nScrollTop + divHeight >= nScrollHeight - 300) {
        queryNodesPages(this);
      }
    },
    onBindKeyDown(e) {
      if (e.keyCode == 13 || e.code == "Enter") {
        this.handleTypeValue();
      }
    },
    type_input_enter(e) {
      if (e.target.value != "") {
        this.search_type_title = e.target.value;
      } else {
        this.search_type_title = getLan().placeholder;
      }
    },
    onBlur() {
      this.searchIng = false;
    },
    handleTypeValue(e) {
      this.searchText = e ? e.target.value : this.searchText;
      this.searchIng = true;
      this.isLoading = true;
      this.noData = false;
      this.query();
    },
    query() {
      queryNodes(this);
    },
    devType: "1",
    searchText: "",
    // 平台信息
    platformInfo: {},
    // 设备类型option
    typeOptions: [],
    // 类型显示
    isTypeDSJ: true,
    isTypeKSBK: true,
    isTypeCZSL: true,
    isTypeWRJ: true,
    handleType(type) {
      switch (type) {
        case "DSJ":
          this.isTypeDSJ = !this.isTypeDSJ;
          hideOrShowOffNodes(!this.isTypeDSJ, getDeviceArrayNode(type, this), this);
          break;
        case "KSBK":
          this.isTypeKSBK = !this.isTypeKSBK;
          hideOrShowOffNodes(!this.isTypeKSBK, getDeviceArrayNode(type, this), this);
          break;
        case "CZSL":
          this.isTypeCZSL = !this.isTypeCZSL;
          hideOrShowOffNodes(!this.isTypeCZSL, getDeviceArrayNode(type, this), this);
          break;
        case "WRJ":
          this.isTypeWRJ = !this.isTypeWRJ;
          hideOrShowOffNodes(!this.isTypeWRJ, getDeviceArrayNode(type, this), this);
          break;
      }
    },
    // 是否在线
    isJustOnline: false,
    handleCheckJustOnline() {
      hideOrShowOffNodes(this.isJustOnline, getOutLineArrayNode(this), this);
    },
    // 只看已选
    isJustSelect: false,
    handleCheckJustSelect() {
      hideOrShowOffNodes(this.isJustSelect, getOutSelectArrayNode(this), this);
    },
    // treeId
    pollTreeId: '',

    initSszhZtkb() {
      let sszhStatusDetail = storage.getItem('getSszhStatusDetail');
      if (sszhStatusDetail) {
        sszhStatusDetail = JSON.parse(sszhStatusDetail);
        sszhStatusDetail.data.forEach(element => {
          findonExpandtNodes(element.path, true, this);
        });
      }
    },
    initPollTreeId() {
      if (this.treeId) {
        this.pollTreeId = this.treeId;
      }else{
        this.pollTreeId = "pollTreeId" + new Date().getTime();
      }
      this.onPollTreeIdFn(this.pollTreeId);
    },
    $computed: {
      containerH(){
        if (this.owner == 'sosgjdyTree') {
          return '83%'
        }
        return '90%'
      }
    },
    onInit(event) {
      this.initPollTreeId();
      getTypeOptions(this);
    },
    treeObj: '',
    onReady: function (event) {
      this.zTreeInit(this.pollTreeId, this);
    },
    onDispose() {
      clearInterval(UpdateNodes);
    },
    /**
     *树初始化
     *
     * @param {*} params
     */
    zTreeBeforeAsync(treeId, treeNode) {
      if (!treeNode) {
        return false;
      }
      if (!treeNode.key) {
        return false;
      }
      return !isDSJDevice(treeNode.type);
    },
    /**
     * 节点加载完的回调函数，加载方式依旧是分批加载，但是不是等用户展开节点才去加
     * 载，而是让它自动完成加载，这里不好的地方是依旧要加载全部数据，所以必须等待
     * 它加载完才能使用搜索功能
     *
     * @param {*} event
     * @param {*} treeId
     * @param {*} treeNode
     * @param {*} msg
     */

    onAsyncSuccess(event, treeId, treeNode, ret) {
      // 判断下是否设备
      if (isDevice(treeNode.type, treeNode.online) !== orgIcon) {
        if (ret.code == 0) {
          // 设备下无设备处理
          if (!ret.data.length) {
            treeNode.isParent = false;
            this.treeObj.updateNode(treeNode);
          }
        }

        setChkDisabled(treeNode, this);
      }

      // 更新节点之后判断是否勾选  触发beforeCheck & onCheck 事件回调函数
      if (treeNode.checked) {
        if (treeNode.children.length) {
          treeNode.children.forEach(node => {
            // 5.勾选非设备节点，展开其下一级节点，同时勾选下级所有设备节点并在地图上定位这些设备，不勾选非设备节点；
            if (node.icon != orgIcon) {
              this.treeObj.checkNode(node, treeNode.checked, false, true);
            }
          });
        }
      }
    },
    /**
     *用于捕获异步加载出现异常错误的事件回调函数
     *
     * @param {*} event
     * @param {*} treeId
     * @param {*} treeNode
     * @param {*} XMLHttpRequest
     * @param {*} textStatus
     * @param {*} errorThrown
     */
    zTreeOnAsyncError(
      event,
      treeId,
      treeNode,
      XMLHttpRequest,
      textStatus,
      errorThrown
    ) {
      avalon.error(
        "树异步请求出错",
        event,
        treeId,
        treeNode,
        XMLHttpRequest,
        textStatus,
        errorThrown
      );
    },
    /**
     *勾选时,judege用于判断地图是否设置中心点
     *
     * @param {*} event
     * @param {*} treeId
     * @param {*} treeNode
     * @returns
     */
    onChecked(event, treeId, treeNode) {
      if (!treeNode) {
        return false;
      }

      // 5.勾选非设备节点，展开其下一级节点，同时勾选下级所有设备节点并在地图上定位这些设备，不勾选非设备节点；
      // 6.勾选可能有子设备节点，展开其下一级节点，同时勾选下级所有设备节点并在地图上定位这些设备；
      // if (treeNode.icon == orgIcon || isNotDSJDevice(treeNode.type)) {
      if (treeNode.icon == orgIcon) {
        // 展开节点
        this.treeObj.expandNode(treeNode, true, false, true);

        // 告警订阅需要
        // 更新节点之后判断是否勾选  触发beforeCheck & onCheck 事件回调函数
        if (treeNode.checked && isGJDY(this)) {
          if (treeNode.children.length) {
            treeNode.children.forEach(node => {
              if (node.icon != orgIcon) {
                this.treeObj.checkNode(node, treeNode.checked, false, true);
              }
            });
          }
        }
        return;
      }

      // 判断当前节点是否多通道
      if (treeNode && treeNode.children.length && isDevice(treeNode.type, 1) != orgIcon) {
        //mytype表示自定义设备类型0 执法仪， 1：快速 2：车 3:无人机
        if (treeNode.type == 'KSBK') {
          treeNode.mytype = 1;
        } else
        if (treeNode.type == 'CZSL') {
          treeNode.mytype = 2;
        } else
        if (treeNode.type == 'WRJ') {
          treeNode.mytype = 3;
        } else {
          treeNode.mytype = 0;
        }
        this.treeObj.updateNode(treeNode);
      }
      this.onCheck(event, treeId, treeNode, !this.judge);
    },
    /**
     *用于捕获 勾选 或 取消勾选 之前的事件回调函数，并且根据返回值确定是否允许 勾选 或 取消勾选
     *
     * @param {*} treeId
     * @param {*} treeNode
     * @returns
     */

    judge: null,

    zTreeBeforeCheck(treeId, treeNode) {
      if (treeNode.icon == orgIcon && !isGJDY(this)) {
        //比如勾选部门树，缩放地图层级
        this.extraHandleWhenCheckOrg();

        this.judge = true;
        //点击部门时获取在线设备
        let nodes = this.treeObj.getNodesByParam("online", 1, treeNode);

        let checked = !treeNode.checked;

        if (!nodes.length) {
          return;
        }

        for (let i = 0; i < nodes.length; i++) {
          this.treeObj.checkNode(nodes[i], checked, false, true);
        }

        this.judge = false;

        return true;
      }
    },
    /**
     *双击
     *
     * @param {*} event
     * @param {*} treeId
     * @param {*} treeNode
     */
    zTreeOnDblClick(event, treeId, treeNode) {
      if (!treeNode || treeNode.icon == orgIcon) {
        return;
      }
      this.treeObj.checkNode(treeNode, true, true, true);
    },
    /**
     *1.目录树一层一层展开，默认只展开第一层；
     *
     */
    onExpandFirstNode() {
      // 这个方法是将标准 JSON 嵌套格式的数据转换为简单 Array 格式
      var nodes = this.treeObj.transformToArray(this.treeObj.getNodes());
      for (var i = 0; i < nodes.length; i++) {
        this.treeObj.expandNode(nodes[i], true, false, true);
      }
    },
    /**
     *用于对 Ajax 返回数据进行预处理的函数
     *
     * @param {*} treeId
     * @param {*} parentNode
     * @param {*} responseData
     * @returns 返回已处理成树结构数据
     */
    ajaxDataFilter(treeId, parentNode, responseData) {
      if (responseData.code == 0) {
        return handleToTreeData(this, responseData.data, false, parentNode);
      } else {
        return [];
      }
    },
    zTreeInit(treeId) {
      let setting = {
          data: {
            key: {
              title: "gbcode",
              name: "name"
            }
          },
          view: {
            selectedMulti: false,
            fontCss: getFontCss
          },
          callback: {
            beforeAsync: this.zTreeBeforeAsync,
            onAsyncSuccess: this.onAsyncSuccess,
            onAsyncError: this.zTreeOnAsyncError,
            onCheck: this.onChecked,
            beforeCheck: this.zTreeBeforeCheck,
            onDblClick: this.zTreeOnDblClick
          },
          check: {
            enable: true,
            chkStyle: "checkbox",
            chkboxType: {
              Y: "p",
              N: "ps"
            }
          },
          async: {
            enable: true,
            type: "get",
            dataType: "json",
            url: process.env.NODE_ENV == "development" ?
              "/apis/gmvcs/uom/device/gb28181/v1/view/ViewItemNew" : "/gmvcs/uom/device/gb28181/v1/view/ViewItemNew",
            autoParam: ["rid=parentRid", "platformId=superiorPlatformId"],
            // otherParam: {
            //   flag: false
            // },
            dataFilter: this.ajaxDataFilter
          }
        },
        zTreeNodes = [];

      getPlatformView().then(ret => {
        if (!ret) return;
        zTreeNodes = handleToTreeData(this, ret.data);
        this.treeObj = $.fn.zTree.init($("#" + treeId), setting, zTreeNodes);
        this.returnTreeObj(this.treeObj);
        // 展开第一层并开始异步加载树节点
        this.onExpandFirstNode();
        // 开始定时更新节点
        setIntervalUpdateNodes(this);
        // 状态看板 跳转数据展示
        // this.initSszhZtkb();
      });
    }

  }
});

/**
 *翻译版本
 *
 * @returns
 */
function getLan() {
  return language_txt.sszhxt.sszhxt_sszh;
}

/**
 *定时更新已展开的节点
 *
 * @param {number} [timer=5000]
 */
let UpdateNodes = null;

function setIntervalUpdateNodes(vm, timer = 15000) {
  UpdateNodes = setInterval(() => {
    // 查询已展开的节点数据
    let nodes = vm.treeObj.getNodesByParam("open", true, null);

    for (let i = 0; i < nodes.length; i++) {
      ViewItem(nodes[i].rid, nodes[i].platformId, false).then(ret => {
        if (ret.code != 0) {
          return;
        }
        let retData = ret.data;
        // 修改节点
        retData.forEach(item => {
          // 是否item key存在节点
          let getisChangeNode = isChangeNode(item.deviceId, nodes[i].children);

          if (getisChangeNode.length) {
            let treeNode = getisChangeNode[0];

            if (item.online && item.userCode && item.userName) {
              item.itemName = `${item.userCode}-${item.userName}  ${
                item.onlineStatistics ? "(" + item.onlineStatistics + ")" : ""
              }`;
            } else {
              item.itemName = `${item.itemName}  ${
                item.onlineStatistics ? "(" + item.onlineStatistics + ")" : ""
              }`;
            }

            // 判断名称是否改变
            if (item.itemName != treeNode.name) {
              treeNode.name = item.itemName;
              // 更新节点
              vm.treeObj.updateNode(treeNode);
            }

            // 判断在线是否改变
            if (item.online != treeNode.online) {
              // 不想等则更新节点名称
              treeNode.online = item.online;

              // 取消勾选
              if (treeNode.online == 0) {
                vm.treeObj.checkNode(treeNode, false, false, true);
                // 是否隐藏节点
                if (vm.isJustOnline) {
                  hideOrShowOffNodes(true, treeNode, vm);
                } else {
                  hideOrShowOffNodes(false, treeNode, vm);
                }

                vm.treeObj.updateNode(treeNode);
              }

              // 是否禁用
              setChkDisabled(treeNode, vm);
              // 更新对应图标
              treeNode.icon = isDevice(treeNode.type, treeNode.online);
              // 更新节点
              vm.treeObj.updateNode(treeNode);

              // 上线的设备需要置顶
              if (treeNode.online == 1) {
                let parentNode = treeNode.getParentNode();
                vm.treeObj.showNode(treeNode);
                vm.treeObj.addNodes(parentNode, 0, treeNode);
                vm.treeObj.removeNode(treeNode);
              }
            }
          } else {
            // 新增节点
            let nodeIndex = -1;

            if (item.online == 1) {
              nodeIndex = 0;
            }

            let newNodes = vm.treeObj.addNodes(
              nodes[i],
              nodeIndex,
              handleToTreeData(vm, [item]),
              true
            );
            //设置节点是否能勾选
            newNodes.forEach(treeNode => {
              setChkDisabled(treeNode, vm);
            });
          }
        });

        // 节点不存在返回的数据则删除节点
        nodes[i].children.forEach(node => {
          // 是否item key存在节点
          let getisChangeNode = isChangeNode(node.key, retData);
          if (!getisChangeNode.length) {
            vm.treeObj.checkNode(node, false, false, true);
            vm.treeObj.removeNode(node);
          }
        });
      });
    }
  }, timer);
}

/**
 *节点是否存在key
 *
 * @param {*} key
 * @param {*} nodes
 * @returns
 */
function isChangeNode(key, nodes) {
  for (let i = 0; i < nodes.length; i++) {
    let nodeKey = nodes[i].key ? nodes[i].key : nodes[i].deviceId;

    if (nodeKey == key) {
      return [nodes[i]];
      break;
    }
  }
  return [];
}


/**
 *设置树样式
 *
 * @param {*} treeId
 * @param {*} treeNode
 * @returns
 */
function getFontCss(treeId, treeNode) {
  return !!treeNode.highlight ? {
    color: "#A60000",
    "font-weight": "bold"
  } : {
    color: "#333",
    "font-weight": "normal"
  };
}


/**
 *设置checkbox 禁用
 *
 * @param {*} treeNode 节点
 */
function setChkDisabled(treeNode, vm) {
  if (treeNode.online == 0) {
    vm.treeObj.checkNode(treeNode, false, false, true);
    vm.treeObj.setChkDisabled(treeNode, true);
  } else {
    vm.treeObj.setChkDisabled(treeNode, false);
  }
}

// 查询设备，部门 需要展开加载树 再查找树节点
function findonExpandtNodes(path, checkNode = false, vm) {
  // 将部门路径字符串转化为数组
  let newPath = [];

  path.split("/").forEach(item => {
    if (item) {
      newPath.push(item);
    }
  });

  let tenpPath = [];
  for (let k = 0; k < newPath.length; k++) {
    let str = "";
    for (let l = 0; l <= k; l++) {
      str = str + "/" + newPath[l];
    }
    tenpPath.push(str + "/");
  }

  let len = tenpPath.length;
  let IT = null;
  let i = 0;
  if (len) {
    let parentNode = null;
    IT = setInterval(() => {
      if (i > len - 1) {
        clearInterval(IT);
        if (checkNode) {
          //查找节点
          let node = vm.treeObj.getNodeByParam("path", $.trim(path), null);
          if (node) {
            vm.treeObj.showNode(node); //显示查到节点
            vm.treeObj.checkNode(node, true, true, false);
          }
        } else {
          getNodesByParam(path, vm.treeObj);
        }
        return true;
      }

      let nodes = vm.treeObj.getNodesByParam("path", tenpPath[i++], parentNode);

      if (nodes.length > 0) {
        if (checkNode) {
          // 判断节点是否已经加载过，如果已经加载过则不需要再加载
          if (!nodes[0].zAsync) {
            vm.treeObj.reAsyncChildNodes(nodes[0], "", true);
          }
        } else {
          vm.treeObj.expandNode(nodes[0], true, false, true);
        }
      } else {
        i--;
      }
    }, 60);
  }
}
/**
 * 处理并高亮展开所有查询到的内容
 *
 * @param {*} value 查询内容
 * @param {*} treeObj
 * @returns
 */

let highlightNodes = [];

function getNodesByParam(value, treeObj) {
  // 去除高亮
  if (highlightNodes.length) {
    for (var i = 0; i < highlightNodes.length; i++) {
      highlightNodes[i].highlight = false;
      treeObj.updateNode(highlightNodes[i]);
    }
    highlightNodes = [];
  }

  //查找节点
  var node = treeObj.getNodeByParam("path", $.trim(value), null);
  if (node) {
    treeObj.showNode(node); //显示查到节点
    if (node.getParentNode()) {
      treeObj.showNode(node.getParentNode()); //显示其父节点
      treeObj.expandNode(node.getParentNode(), true, false, true); //展开所有查询到的内容
    }
    node.highlight = true;
    highlightNodes.push(node);
    treeObj.updateNode(node);
  }
}

/**
 * 修改树隐藏节点 | 显示节点
 *
 * @param {*} isHide
 * @param {*} treeNodes
 */
function hideOrShowOffNodes(isHide, treeNodes, vm) {
  if ($.type(treeNodes) !== "array") {
    treeNodes = [treeNodes];
  }
  if (isHide) {
    vm.treeObj.hideNodes(treeNodes);
  } else {
    vm.treeObj.showNodes(treeNodes);
  }
}

/**
 *获取执法仪设备node
 *
 * @returns 返回执法仪设备node
 */
function getDeviceArrayNode(type, vm) {
  return vm.treeObj.getNodesByFilter(
    node => {
      if (type == "DSJ" && node.online == vm.isJustOnline) {
        return (
          node.type == type ||
          node.type == "DSJ4G" ||
          node.type == "DSJ2G" ||
          node.type == "DSJ4GGB" ||
          node.type == "PERIPHERAL_DEVICE" ||
          node.type == "MAIN_DEVICE" ||
          node.type == "DSJNONET"
        );
      } else {
        return node.type == type && node.online == vm.isJustOnline;
      }
    },
    false,
    null
  );
}

/**
 *获取离线设备node
 *
 * @returns 返回离线设备node
 */
function getOutLineArrayNode(vm) {
  return vm.treeObj.getNodesByFilter(
    node => {
      return node.online === 0;
    },
    false,
    null
  );
}

/**
 *获取离线设备node
 *
 * @returns 返回离线设备node
 */
function getOutSelectArrayNode(vm) {
  return vm.treeObj.getNodesByFilter(
    node => {
      return node.checked == false;
    },
    false,
    null
  );
}

/**
 *获取设备类型
 *
 */
function getTypeOptions(vm) {
  vm.typeOptions = [{
      label: getLan().device,
      value: "1"
    },
    {
      label: getLan().department,
      value: "2"
    }
  ];
}

/**
 * 树节点
 *
 * @class treeObject
 */
class treeObject {
  constructor(
    key = "",
    name = "",
    path = "",
    platformId = "",
    type = "",
    online = "",
    icon = "",
    isParent = false
  ) {
    this.key = key; // id
    this.name = name; //名称
    this.title = name; //名称
    this.path = path; // 部门
    this.platformId = platformId; // 平台id
    this.type = type; // 类型
    this.online = online; // 是否在线
    this.icon = icon; // 是否在线
    this.isParent = isParent;
    this.isHidden = false;
    this.check = false;
    this.highlight = false;
    this.children = [];
    this.mytype = 0; //mytype表示自定义设备类型0 执法仪， 1：快速 2：车 3:无人机
    this.gbcode = "";
    this.chkDisabled = false;
    this.open = false;
  }
}

/**
 *树节点处理
 *
 * @param {Array} data
 * @param {boolean} isSearch 是否是查询
 * @param {boolean} parentNode 父节点
 * @returns 返回标准树节点
 */
function handleToTreeData(vm, data = [], isSearch = false, parentNode) {
  if (!data.length) {
    return [];
  }

  let treeData = [];

  data.sort(sequence);

  data.forEach(item => {
    let treeNode = new treeObject();
    treeNode.key = item.deviceId;
    treeNode.rid = item.rid;

    if (isGJDY(vm)) {
      treeNode.chkDisabled = false;
    } else {
      treeNode.chkDisabled = item.online == 0 ? true : false;
    }

    if (item.online && item.userCode && item.userName) {
      item.itemName = `${item.userCode}-${item.userName}  ${
        item.onlineStatistics ? "(" + item.onlineStatistics + ")" : ""
      }`;
    } else {
      item.itemName = `${item.itemName}  ${
        item.onlineStatistics ? "(" + item.onlineStatistics + ")" : ""
      }`;
    }

    treeNode.name = item.itemName;
    treeNode.title = treeNode.key;
    treeNode.path = item.path;
    treeNode.platformId = item.platformId ?
      item.platformId :
      item.superiorPlatformId;
    treeNode.type = item.type;
    treeNode.typeName = getTypeName(item.type);
    treeNode.online = item.online;
    treeNode.isHidden = vm.isJustOnline ? (item.online ? false : true) : false;
    treeNode.icon = getIconPath(item.type, item.online);
    treeNode.isParent = isSearch ?
      false :
      isDSJDevice(item.type) ?
      false :
      parentNode ?
      getTypeName(parentNode.type) ?
      false :
      true :
      true;
    treeNode.children = item.children ?
      item.children.length ?
      handleToTreeData(vm, item.children, true) : [] : [];
    treeNode.gbcode = item.deviceId;
    treeData.push(treeNode);

    if (isSearch) {
      treeNode.title = treeNode.name;
      treeNode.open = true;
      vm.expandedKeys.push(item.deviceId);
    }
  });

  return treeData;
}

/**
 *是否是告警订阅界面
 *
 * @param {*} owner
 * @returns
 */
function isGJDY(vm) {
  if (vm.owner && vm.owner == 'sosgjdyTree') {
    return true;
  } else {
    return false;
  }
}

/**
 * 获取树图标
 *
 * @param {*} type
 * @param {*} online
 * 0 离线
 * 1 在线
 * @returns 返回设备对应图标路径
 */
function getIconPath(type, online) {
  return isDevice(type, online);
}

/**
 *处理查询数据转换为树
 *
 * @param {*} retData
 * @returns 返回标准树节点数据
 */
function handSearchData(retData, vm) {
  let newRetData = [];
  if (retData) {
    retData.forEach(item => {
      item.itemName = item.name;
      let itemObj = {};
      if (item.parent) {
        item.parent.itemName = item.parent.name;
        if (item.parent.parent) {
          item.parent.parent.itemName = item.parent.parent.name;
          itemObj = item.parent.parent;
          itemObj.children = [item.parent];
          itemObj.children.children = [item];
        } else {
          itemObj = item.parent;
          itemObj.children = [item];
        }
      } else {
        itemObj = item;
      }
      newRetData.push(itemObj);
    });
  } else {
    return [];
  }

  return handleToTreeData(vm, newRetData, true);
}

/**
 *在线排序
 *
 * @param {*} a
 * @param {*} b
 * @returns
 */
function sequence(a, b) {
  return b.online - a.online;
}

let queryNodes = debounce(vm => {
  if (!vm.searchText) {
    vm.expandedKeys.clear();
    vm.searchData.clear();
    vm.searchIng = false;
    vm.isLoading = false;
    vm.noData = false;
    return;
  }
  checkView(
      vm.$Form.record.type ? vm.$Form.record.type : vm.devType,
      vm.searchText
    )
    .then(ret => {
      if (ret.code == 0) {
        let data = handSearchData(ret.data, vm);

        vm.searchAllData = chunk(data, 20);
        vm.searchPage = 0;

        if (data.length) {
          vm.noData = false;
          vm.searchData = vm.searchAllData[vm.searchPage];
        } else {
          vm.noData = true;
          vm.searchData = [];
        }
      } else {
        vm.noData = true;
        vm.searchData = [];
      }
    })
    .fail(() => {
      vm.searchIng = false;
    })
    .always(() => {
      vm.isLoading = false;
    });
}, 300);

// 分页查询
var queryNodesPages = debounce(vm => {
  let len = vm.searchAllData.length;
  vm.searchPage += 1;

  if (vm.searchPage > len) {
    return false;
  } else {
    let newData = [];
    vm.searchAllData.forEach((item, index) => {
      if (index <= vm.searchPage) {
        newData = newData.concat(item);
      }
    });
    vm.searchData = newData;
  }
}, 500);

/**
 * 切割数组
 *
 * @param {*} arr
 * @param {*} size
 * @returns
 */
function chunk(arr, size) {
  var arr2 = [];
  for (var i = 0; i < arr.length; i = i + size) {
    arr2.push(arr.slice(i, i + size));
  }
  return arr2;
}