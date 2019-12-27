//菜单配置文件

// 执法视音频
export let list = [{
        //     key: 'zfsypsjglpt-xtsy-index',
        //     title: '系统首页',
        //     icon: 'xtsy',
        //     lic: 'AUDIO_MENU_XTSY', // lic 授权校验字段
        //     childrenArray: [],
        //     url: '/zfsypsjglpt-xtsy-index'
        // },
        // {
        // key: 'sypgl',
        // title: '视音频管理',
        // icon: 'yspk',
        // lic: 'AUDIO_MENU_SYPGL', // lic 授权校验字段
        // childrenArray: [{
        key: 'zfsypsjglpt-sypgl-zfjlysyp',
        title: '执法记录仪视音频',
        lic: 'AUDIO_MENU_SYPGL_ZFYSYP_JJ',
        // childrenArray: [],
        url: '/zfsypsjglpt-sypgl-zfjlysyp'
        // }]
    },
    {
        key: 'zfsypsjglpt-sypgl-tjfx',
        title: '统计分析',
        lic: 'AUDIO_MENU_TJFX',
        showChildren: true,
        childrenArray:[
            {
                key: 'zfsypsjglpt-sypgl-tjfx',
                title: '媒体统计',
                lic: 'AUDIO_MENU_TJFX_SLQKTJ_JJ',
                url: '/zfsypsjglpt-sypgl-tjfx'
            },{
                key: 'zfsypsjglpt-sypgl-tjfx-nd',
                title: '资产统计',
                lic: 'AUDIO_MENU_TJFX_ZCTJ_JJ',
                url: '/zfsypsjglpt-sypgl-tjfx-nd'
            }
        ],
        url: '/zfsypsjglpt-sypgl-tjfx'
    }
];