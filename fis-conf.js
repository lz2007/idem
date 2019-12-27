// npm install [-g] fis3-hook-commonjs
fis.hook('commonjs', {
    paths: {
        'moment-locale': './node_modules/moment/locale/zh-cn.js',
        'bootstrap': './node_modules/bootstrap/dist/js/bootstrap.js'
    },
    extList: ['.js']
});

// 某些资源从构建中去除
fis.set('project.ignore', [
    'node_modules/**',
    'output/**',
    '.git/**',
    'build/**',
    'bin/**',
    'fis-conf.js',
    'README.md',
    'readme.txt',
    'cmd.cmd',
    'package.json',
    'LICENSE'
]);

fis.set('baseurl', '');

fis.unhook('apps');
fis.hook('node_modules', {
    ignoreDevDependencies: true,
    shimBuffer: false,
    shimProcess: false,
    shutup: true
});



// 默认情况下不添加hash, '/static/polyfill/*.{ts,js}', 
['/{apps,pages,services}/**.{ts,js}', '/vendor/gosunocx/**.{ts,js}', '/*.{ts,js}', '/node_modules/{babel-runtime,regenerator-runtime}/**.{ts,js}'].forEach(function (blob) {
    fis.match(blob, {
        preprocessor: fis.plugin('js-require-css'),
        parser: [
            fis.plugin('babel-6.x', {
                plugins: [
                    'transform-es3-property-literals',
                    'transform-es3-member-expression-literals',
                    'add-module-exports',
                    'transform-proto-to-assign', ['transform-es2015-classes', {
                        'loose': true
                    }]
                ],
                'compact': false
            }),
            fis.plugin('translate-es3ify')
        ],
        rExt: '.js'
    });
});

//=== global ===
fis.match('**', {
    useHash: false,
    release: false
});
fis.match('/apps/**/*.html', {
    postprocessor: fis.plugin('component-view', {}),
    release: false
});
fis.match('*.less', {
    parser: fis.plugin('less-2.x'),
    rExt: '.css'
});

//=== root ===
fis.match('/*.html', {
    release: '/$0'
});
fis.match('/*.css', {
    release: '/static/$0'
});
fis.match('/pages/**/(*.html)', {
    release: '/$1'
});
fis.match('/apps/**/(*.html)', {
    release: '/apps/$1'
});


//=== /static/ ===
fis.match('**.js.map', {
    release: '/static/$0'
});
fis.match('/*.{ts,js}', {
    isMod: true,
    release: '/static/$0'
});
fis.match('/{pages,apps}/**/(*.{ts,js})', {
    isMod: true,
    release: '/static/js/$1'
});
fis.match('/pages/**/(*.{css,less})', {
    isMod: true,
    release: '/static/css/$1'
});
fis.match('/apps/**/(*.{css,less})', { // 打包归一后需要存在，但不使用
    isMod: true,
    release: '/static/runtime/css/apps/$1'
});


fis.match('/{pages,apps}/(**)/(*.{eot,png,gif,jpg,jpeg,svg,ttf,woff,woff2,map})', {
    release: '/static/image/$1/$2'
});

//=== /other/ ===
fis.match('/node_modules/**/*.{ts,js}', {
    isMod: true, // 设置 comp 下都是一些组件，组件建议都是匿名方式 define
    release: '/$0'
});
fis.match('/node_modules/**/*.{css,eot,png,gif,svg,ttf,woff,woff2,map}', {
    release: '/$0'
});
fis.match('/node_modules/**', {
    release: '/$0'
});
fis.match('/services/*.{ts,js}', { // 打包归一后需要存在，但不使用
    isMod: true,
    release: '/static/runtime/$0'
});
fis.match('/vendor/**', {
    isMod: true,
    release: '/static/$0'
});

//=== /fix/ ===
fis.match('/static/**', {
    release: '/$0'
});

fis.match('::package', {
    // npm install [-g] fis3-postpackager-loader
    // 分析 __RESOURCE_MAP__ 结构，来解决资源加载问题
    postpackager: fis.plugin('loader', {
        resourceType: 'commonJs',
        useInlineMap: true,
        obtainStyle: false,
        allInOne: {
            js: function (file) {
                return "/static/js/" + file.filename + "_aio.js";
            },
            css: function (file) {
                return "/static/css/" + file.filename + "_aio.css";
            }
        }
    })
});


// === 开发调试dev配置 ===
fis.media('dev').match('/services/configService.{ts,js}', {
        postprocessor: function (content, file, settings) {
            return content
                .replace('__DOMAIN__', '')
                .replace('__API_URL__', '/apis')
                .replace('__SERVICE_URL__', '');

        }
    })
    .match('/apps/common/common.{ts,js}', {
        postprocessor: function (content, file, settings) {
            return content
                .replace('__AVDEBUG__', 'true');
        }
    })
    .match('/mock/**', { // mock假数据 
        release: '/$0'
    });
//================


//================
// 正式打包版本配置
fis.media('production').match('**', {
        useHash: false,
        domain: ''
    })
    .match('/services/configService.{ts,js}', {
        postprocessor: function (content, file, settings) {
            return content
                .replace('__DOMAIN__', '')
                .replace('__API_URL__', '')
                .replace('__SERVICE_URL__', '');
        }
    })
    .match('/apps/common/common.{ts,js}', {
        postprocessor: function (content, file, settings) {
            return content
                .replace('__AVDEBUG__', 'false');
        }
    })
    .match('::package', {
        packager: fis.plugin('deps-pack', {
            useTrack: false, // 是否将合并前的文件路径写入注释中
            useSourceMap: false, // 是否开启 souremap 功能 
            'main.js': [
                'index.js',
                'index.js:deps',
                '!node_modules/**',
                '!node_modules/**:deps',
                '!services/configService.js'
            ],
            'vendor.js': [
                'index.js',
                'index.js:deps',
                '!services/configService.js'
            ],
            'main.css': [
                'index.js:deps'
            ],
            'apps.css': [
                '/apps/**.css'
            ]
        }),
        spriter: fis.plugin('csssprites')
    })
    .match('/(*.png)', {
        optimizer: fis.plugin('png-compressor'), // 图片压缩
        release: '/static/image/csssprites/$1'
    })
    .match('*.css', { // 给匹配到的css文件分配属性 `useSprite`
        optimizer: fis.plugin('clean-css'),
        useSprite: true
    })
    .match('*.{js,ts}', {
        optimizer: fis.plugin('uglify-js'),
        // parser: fis.plugin('jdists', {
        //     remove: "debug"
        // })
    })
    .match('/**/map/**.{js,ts}', {
        optimizer: null
    })
    .match('{demo-*,common-demo-*}.{js,css,html}', { //排除demo文件打包
        release: false
    })
    .match('*.min.js', {
        optimizer: null
    })
    .match('main.js', { //需要在package之后方才有效
        release: '/static/$0'
    })
    .match('vendor.js', {
        release: '/static/$0'
    })
    .match('main.css', {
        release: '/static/$0'
    })
    .match('/services/configService.js', { // 指定配置文件不压缩不合并
        optimizer: null,
        release: '/static/configService.js'
    })
    .match('/mock/(**)', {
        release: false
        // release: '/api/$1'
    });