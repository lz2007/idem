import avalon from "avalon2"
import "./contentright.less"
import "../chartbox/chartbox"
import {
    MrYangUtil
} from './getTimes'
import {
    option as option1
}
from './chart1Opt'

import {
    option as option2
}
from './chart2Opt'

import {
    option as option3
}
from './chart3Opt'

import {
    option as option4
}
from './chart4Opt'

import ajax from '/services/ajaxService'

let echarts = require("../echarts")
let storage = require('/services/storageService.js').ret
let orgId = storage.getItem("orgId")
let orgPath = storage.getItem("orgPath")
let getTime = new MrYangUtil()
let orgName = storage.getItem("orgName")

let xAxisData = [
    orgName
]

let seriesData = [0]

//开始时间默认 本月
// let beginTime = Date.parse(getTime.getCurrentYear()[0])
let beginTime = Date.parse(getTime.getCurrentMonth()[0])
let comAjaxfn = (url, data) => {
    let comData = {
        orgId,
        orgPath,
        beginTime,
        endTime: Date.parse(new Date()),
        page: 0,
        pageSize: 6
    }

    if (data) {
        data = avalon.mix(comData, data)
    } else {
        data = comData
    }

    return ajax({
        url,
        method: 'post',
        data
    })
}

let mysubstr = (str, len = 15) => {
    if (str.length > len) {
        return str.substr(0, len) + '...'
    } else {
        return str
    }
}

// 查询时间间隔
let searchtime = 30000
let zhdf
let slqk
let glqk
let kptj

export const name = "ms-contentright"

let myChart1, myChart2, myChart3, myChart4
avalon.component(name, {
    template: __inline("./contentright.html"),
    defaults: {
        echarsflex: 800,
        dateDate: [{
            active: false,
            value: '本周'
        }, {
            active: true,
            value: '本月'
        }, {
            active: false,
            value: '本年'
        }],
        itemClick(item) {
            avalon.each(this.dateDate, (i, val) => {
                val.active = false
            })
            item.active = true
            switch (item.value) {
                case '本周':
                    beginTime = Date.parse(getTime.getCurrentWeek()[0])
                    break;
                case '本月':
                    beginTime = Date.parse(getTime.getCurrentMonth()[0])
                    break;
                case '本年':
                    beginTime = Date.parse(getTime.getCurrentYear()[0])
                    break;
                default:
                    beginTime = Date.parse(getTime.getCurrentMonth()[0])
                    break;
            }
            this.feachchart()
        },
        onReady() {

            myChart1 = echarts.init(document.getElementById("zhdf"))

            zhdf = $('#zhdf')
            zhdf.on('mouseover', () => {
                clearTimeout(this.zhdfTime)
            })
            zhdf.on('mouseout', () => {
                this.zhdfTime = setTimeout(() => {
                    this.zhdfInfo(this.zhdfcurrentPages)
                }, searchtime)
            })

            myChart2 = echarts.init(document.getElementById("slqk"))

            slqk = $('#slqk')
            // 设置图片位置
            let slqkWidth = slqk.width() * 0.16645326504481434
            option2.graphic.left = slqkWidth + slqkWidth * 0.1
            option2.graphic.style.width = slqkWidth * 0.8
            option2.graphic.style.height = slqkWidth * 0.8

            slqk.on('mouseover', () => {
                clearTimeout(this.slqkTime)
            })
            slqk.on('mouseout', () => {
                this.slqkTime = setTimeout(() => {
                    this.slqkInfo(this.slqkcurrentPages)
                }, searchtime);
            })

            myChart3 = echarts.init(document.getElementById("glqk"))

            glqk = $('#glqk')
            glqk.on('mouseover', () => {
                clearTimeout(this.glqkTime)
            })
            glqk.on('mouseout', () => {
                this.glqkTime = setTimeout(() => {
                    this.glqkInfo(this.glqkcurrentPages)
                }, searchtime);
            })

            myChart4 = echarts.init(document.getElementById("kptj"))

            kptj = $('#kptj')
            kptj.on('mouseover', () => {
                clearTimeout(this.kptjTime)
            })
            kptj.on('mouseout', () => {
                this.kptjTime = setTimeout(() => {
                    this.kptjInfo(this.kptjcurrentPages)
                }, searchtime);
            })

            this.feachchart()

            this.onresizeChart()
        },
        onresizeChart() {
            let _this = this

            window.onresize = function () {

                myChart1.resize()
                myChart2.resize()
                myChart3.resize()
                myChart4.resize()
    
                let slqkWidth = slqk.width() * 0.16645326504481434
                option2.graphic.left = slqkWidth + slqkWidth * 0.1
                option2.graphic.style.width = slqkWidth * 0.8
                option2.graphic.style.height = slqkWidth * 0.8
                myChart2.setOption(option2)

            }
        },
        /**
         * 查询数据
         *
         */
        feachchart() {
            clearTimeout(this.zhdfTime)
            clearTimeout(this.slqkTime)
            clearTimeout(this.glqkTime)
            clearTimeout(this.kptjTime)

            this.zhdfInfo()
            this.slqkInfo()
            this.glqkInfo()
            this.kptjInfo()
        },

        // 清除定时器
        clearTimeoutfn() {

        },

        zhdfTime: '',
        zhdfcurrentPages: 0,
        zhdftotalPages: 0,
        zhdfcurrentPage: 0,
        zhdfleft() {
            if (this.zhdfcurrentPage > 0) {
                this.zhdfInfo(this.zhdfcurrentPage - 1)
            }
        },
        zhdfright() {
            if (this.zhdfcurrentPage < this.zhdftotalPages - 1) {
                this.zhdfInfo(this.zhdfcurrentPage + 1)
            }
        },
        /**
         * zhdfInfo fn 综合得分统计信息
         * @param {*} page 当前页数
         */
        zhdfInfo(page = 0) {

            comAjaxfn('/gmvcs/stat/comprehensive/eva/complete/info', {
                page
            }).then(ret => {
                if (ret.code == 0 && ret.data.totalElements) {
                    option1.xAxis[0].data = []
                    option1.series[0].data = []
                    avalon.each(ret.data.currentElements, (index, item) => {
                        option1.xAxis[0].data[index] = item.orgName
                        option1.series[0].data[index] = item.totalScore
                    })

                    if (ret.data.totalPages == 1) {
                        myChart1.setOption(option1)
                        return
                    }

                    if (ret.data.totalPages > 1 && ret.data.currentPages < ret.data.totalPages - 1) {
                        this.zhdfcurrentPages = ret.data.currentPages + 1
                    } else {
                        this.zhdfcurrentPages = 0
                    }

                    clearTimeout(this.zhdfTime)
                    this.zhdfTime = setTimeout(() => {
                        this.zhdfInfo(this.zhdfcurrentPages)
                    }, searchtime)
                } else {
                    option1.xAxis[0].data = xAxisData
                    option1.series[0].data = seriesData
                }

                this.zhdfcurrentPage = ret.data.currentPages
                this.zhdftotalPages = ret.data.totalPages

                myChart1.setOption(option1)

            })
        },

        slqkTime: '',
        slqkcurrentPages: 0,
        slqktotalPages: 0,
        slqkcurrentPage: 0,
        slqkleft() {
            if (this.slqkcurrentPage > 0) {
                this.slqkInfo(this.slqkcurrentPage - 1)
            }
        },
        slqkright() {
            if (this.slqkcurrentPage < this.slqktotalPages - 1) {
                this.slqkInfo(this.slqkcurrentPage + 1)
            }
        },
        /**
         * 摄录情况统计信息 /gmvcs/stat/comprehensive/ rs/info
         *  
         * @param {*} page 当前页数
         */
        slqkInfo(page = 0) {

            comAjaxfn('/gmvcs/stat/comprehensive/rs/info', {
                page
            }).then(ret => {

                if (ret.code == 0 && ret.data.totalElements) {
                    option2.legend.data = []
                    option2.series[0].data = []

                    avalon.each(ret.data.currentElements, (index, item) => {
                        option2.legend.data[index] = item.videoDurationTotal + '小时 | ' + mysubstr(item.orgName)
                        option2.series[0].data.push({
                            name: item.videoDurationTotal + '小时 | ' + mysubstr(item.orgName),
                            value: item.videoDurationTotal
                        })
                    })

                    if (ret.data.totalPages == 1) {
                        myChart2.setOption(option2)
                        return
                    }

                    if (ret.data.totalPages > 1 && ret.data.currentPages < ret.data.totalPages - 1) {
                        this.slqkcurrentPages = ret.data.currentPages + 1
                    } else {
                        this.slqkcurrentPages = 0
                    }

                    clearTimeout(this.slqkTime)
                    this.slqkTime = setTimeout(() => {
                        this.slqkInfo(this.slqkcurrentPages)
                    }, searchtime)
                } else {

                    option2.legend.data = [xAxisData[0]]
                    option2.series[0].data = [{
                        value: 12,
                        name: xAxisData[0]
                    }]

                }
                this.slqkcurrentPage = ret.data.currentPages
                this.slqktotalPages = ret.data.totalPages

                myChart2.setOption(option2)

            })
        },

        glqkTime: '',
        glqkcurrentPages: 0,
        glqktotalPages: 0,
        glqkcurrentPage: 0,
        glqkleft() {
            if (this.glqkcurrentPage > 0) {
                this.glqkInfo(this.glqkcurrentPage - 1)
            }
        },
        glqkright() {
            if (this.glqkcurrentPage < this.glqktotalPages - 1) {
                this.glqkInfo(this.glqkcurrentPage + 1)
            }
        },
        /**
         * 关联情况统计信息 /gmvcs/stat/comprehensive/ rs/info
         * @param {*} page 当前页数
         */
        glqkInfo(page = 0) {

            comAjaxfn('/gmvcs/stat/comprehensive/match/info', {
                page
            }).then(ret => {
                if (ret.code == 0 && ret.data.totalElements) {
                    option3.xAxis[0].data = []
                    option3.series[0].data = []
                    option3.series[1].data = []
                    option3.series[2].data = []
                    option3.series[3].data = []
                    avalon.each(ret.data.currentElements, (index, item) => {
                        option3.xAxis[0].data.push(item.orgName)
                        option3.series[0].data.push(item.jtwfRate * 100)
                        option3.series[1].data.push(item.sgclRate * 100)
                        option3.series[2].data.push(item.jqRate * 100)
                        option3.series[3].data.push(item.ajRate * 100)
                    })

                    if (ret.data.totalPages == 1) {
                        myChart3.setOption(option3)
                        return
                    }
                    if (ret.data.totalPages > 1 && ret.data.currentPages < ret.data.totalPages - 1) {
                        this.glqkcurrentPages = ret.data.currentPages + 1
                    } else {
                        this.glqkcurrentPages = 0
                    }

                    clearTimeout(this.glqkTime)
                    this.glqkTime = setTimeout(() => {
                        this.glqkInfo(this.glqkcurrentPages)
                    }, searchtime)
                } else {
                    option3.xAxis[0].data = xAxisData
                    option3.series[0].data = seriesData
                    option3.series[1].data = seriesData
                    option3.series[2].data = seriesData
                    option3.series[3].data = seriesData
                }
                this.glqkcurrentPage = ret.data.currentPages
                this.glqktotalPages = ret.data.totalPages
                myChart3.setOption(option3)

            })
        },

        kptjTime: '',
        kptjcurrentPages: 0,
        kptjtotalPages: 0,
        kptjcurrentPage: 0,
        kptjleft() {
            if (this.kptjcurrentPage > 0) {
                this.kptjInfo(this.kptjcurrentPage - 1)
            }
        },
        kptjright() {
            if (this.kptjcurrentPage < this.kptjtotalPages - 1) {
                this.kptjInfo(this.kptjcurrentPage + 1)
            }
        },
        /**
         * 考评统计信息 /gmvcs/stat/comprehensive/eva/info
         * @param {*} page 当前页数
         */
        kptjInfo(page = 0) {

            comAjaxfn('/gmvcs/stat/comprehensive/eva/info', {
                page
            }).then(ret => {
                if (ret.code == 0 && ret.data.totalElements) {
                    option4.xAxis[0].data = []
                    option4.series[0].data = []
                    option4.series[1].data = []
                    option4.series[2].data = []

                    avalon.each(ret.data.currentElements, (index, item) => {
                        option4.xAxis[0].data.push(item.orgName)
                        option4.series[0].data.push(item.evaCount)
                        option4.series[1].data.push(item.evaPassRate * 100)
                        option4.series[2].data.push(item.reviewRate * 100)
                    })

                    if (ret.data.totalPages == 1) {
                        myChart4.setOption(option4)
                        return
                    }
                    if (ret.data.totalPages > 1 && ret.data.currentPages < ret.data.totalPages - 1) {
                        this.kptjcurrentPages = ret.data.currentPages + 1
                    } else {
                        this.kptjcurrentPages = 0
                    }

                    clearTimeout(this.kptjTime)
                    this.kptjTime = setTimeout(() => {
                        this.kptjInfo(this.kptjcurrentPages)
                    }, searchtime)
                } else {
                    option4.xAxis[0].data = xAxisData
                    option4.series[0].data = seriesData
                    option4.series[1].data = seriesData
                    option4.series[2].data = seriesData
                }

                this.kptjcurrentPage = ret.data.currentPages
                this.kptjtotalPages = ret.data.totalPages
                myChart4.setOption(option4)

            })
        },
        onDispose() {
            clearTimeout(this.zhdfTime)
            clearTimeout(this.slqkTime)
            clearTimeout(this.glqkTime)
            clearTimeout(this.kptjTime)

            zhdf.off('mouseover').off('mouseout')
            slqk.off('mouseover').off('mouseout')
            glqk.off('mouseover').off('mouseout')
            kptj.off('mouseover').off('mouseout')
        }
    }
})