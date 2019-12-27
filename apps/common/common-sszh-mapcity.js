/*
 * 实时指挥地图城市列表
 * */
import * as cityobj from 'common-sszhmap-cityaddress';
import ajax from '../../services/ajaxService';
import {
    notification
} from 'ane';
import {
    defalutCity,
    languageSelect
} from '/services/configService';
const storage = require('../../services/storageService.js').ret;
require('./common-sszh-mapcity.css');
let vmd = avalon.component('common-sszh-mapcity', {
    template: __inline('./common-sszh-mapcity.html'),
    defaults: {
        mapCity: languageSelect == "en" ? true : false,
        toggle: true,
        showcontent: false,
        nowcity: '广州',
        defaultcity: '广州',
        lon: '',
        lat: '',
        showdefaultcity: false,
        showlistsf() {
            this.toggle = true;
        },
        showlistcs() {
            this.toggle = false;
        },
        searchvalue: '',
        searchcity() {
            if (cityobj[this.searchvalue]) {
                vmd.defaults.nowcity = this.searchvalue;
                citycontroller.nowcity = this.searchvalue;
                let lon = cityobj[this.searchvalue].lon;
                let lat = cityobj[this.searchvalue].lat;
                vmd.lon = lon;
                vmd.lat = lat;
                avalon.components['sszhxt-sszh'].defaults.setcity();
                // avalon.components['sszhxt-sszh'].defaults.lon = cityobj[name].lon;
                // avalon.components['sszhxt-sszh'].defaults.lat = cityobj[name].lat;
                //var sszhmapobj = avalon.components['sszhxt-sszh'].defaults.sszhmapobj;
                //let point = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(parseFloat(lon), parseFloat(lat)));
                //sszhmapobj.map.centerAndZoom(point,10);
                $('#mapIframe')[0].contentWindow.esriMap.setMapCenter(lon, lat, 10);
            }
        },
        quicksearchcity(e) {
            if (e.keyCode == 13) {
                this.searchcity();
            }
        },
        hidecontent() {
            $('.mapcity_popup_main').hide(200);
        },
        lon: '',
        lat: '',
        onInit(e) {

        },
        onReady() {
            citycontroller.nowcity = avalon.vmodels['sszhxt_vm'].$cityDetailobj.nowClickcity;
            citycontroller.defaultcity = avalon.vmodels['sszhxt_vm'].$cityDetailobj.defaultcity;
            citycontroller.showdefaultcity = true;
            $('#sheng').on('click', 'a', function (event) {
                var target = $(event.target);
                var name = target.text();
                var list = $('.sel-city-td-letter div');
                if (name == '其它') {
                    list[list.length - 1].scrollIntoView(); //直接跳到z
                }
                for (var i = 0; i < list.length; i++) {
                    if (list[i].innerHTML == name) {
                        list[i].scrollIntoView();
                        break;
                    }
                }

            });
            $('#chengshi').on('click', 'a', function (event) {
                var target = $(event.target);
                var name = target.text();
                var list = $('.sel-city-td-letter div');
                for (var i = 0; i < list.length; i++) {
                    if (list[i].innerHTML == name) {
                        list[i].scrollIntoView();
                        break;
                    }
                }
            });
            $('#selCityPlaceListId').on('click', 'a', function (event) {
                var target = $(event.target);
                var name = target.text().replace(':', '');
                vmd.defaults.nowcity = name;
                citycontroller.nowcity = name;
                let lon = cityobj[name].lon;
                let lat = cityobj[name].lat;
                vmd.lon = lon;
                vmd.lat = lat;
                // avalon.components['sszhxt-sszh'].defaults.lon = cityobj[name].lon;
                // avalon.components['sszhxt-sszh'].defaults.lat = cityobj[name].lat;
                // var sszhmapobj = avalon.components['sszhxt-sszh'].defaults.sszhmapobj;
                avalon.components['sszhxt-sszh'].defaults.setcity();
                // let point = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(parseFloat(lon), parseFloat(lat)));
                // sszhmapobj.map.centerAndZoom(point,10);
                $('#mapIframe')[0].contentWindow.esriMap.setMapCenter(lon, lat, 10);
            });
            $('#selCityHotCityId').on('click', 'a', function (event) {
                var target = $(event.target);
                var name = target.text().replace(':', '');
                if (name == '全国') return;
                vmd.defaults.nowcity = name;
                citycontroller.nowcity = name;
                let lon = cityobj[name].lon;
                let lat = cityobj[name].lat;
                vmd.lon = lon;
                vmd.lat = lat;
                avalon.components['sszhxt-sszh'].defaults.setcity();
                // avalon.components['sszhxt-sszh'].defaults.lon = cityobj[name].lon;
                // avalon.components['sszhxt-sszh'].defaults.lat = cityobj[name].lat;
                // var sszhmapobj = avalon.components['sszhxt-sszh'].defaults.sszhmapobj;
                // let point = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(parseFloat(lon), parseFloat(lat)));
                // sszhmapobj.map.centerAndZoom(point,10);
                $('#mapIframe')[0].contentWindow.esriMap.setMapCenter(lon, lat, 10);
            })
        }
    },

})
var citycontroller = avalon.define({
    $id: 'citycontroller',
    nowcity: '',
    defaultcity: '',
    showdefaultcity: false,
    setdefaultcity() {
        //后台获取当前用户设置的地图默认城市
        let data = {};
        data.city = this.nowcity;
        ajax({
            url: '/gmvcs/uap/user/city/save-update',
            method: 'POST',
            data: data
        }).then(result => {
            if (result.code == 0) {
                citycontroller.defaultcity = citycontroller.nowcity;
                citycontroller.showdefaultcity = true;
                avalon.vmodels['sszhxt_vm'].$cityDetailobj.defaultcity = citycontroller.defaultcity;
                notification.success({
                    message: '默认城市设置成功',
                    title: '通知'
                });
            } else {
                notification.error({
                    message: '默认城市设置失败',
                    title: '通知'
                });
            }
        })
    },
    deletedefaultcity() {
        ajax({
            url: '/gmvcs/uap/user/city/delete',
            method: 'get',
            data: null
        }).then(result => {
            if (result.code == 0) {
                citycontroller.showdefaultcity = false;
                let city = defalutCity.city;
                avalon.vmodels['sszhxt_vm'].$cityDetailobj.defaultcity = city; //删掉默认城市，还原成配置的默认城市
                notification.success({
                    message: '默认城市删除成功',
                    title: '通知'
                });
            } else {
                notification.error({
                    message: '默认城市删除失败',
                    title: '通知'
                });
            }
        })
    },
    citylocate(event) {
        let city = event.target.innerText;
        let lon = cityobj[city].lon;
        let lat = cityobj[city].lat;
        $('#mapIframe')[0].contentWindow.esriMap.setMapCenter(lon, lat, 10);
        vmd.defaults.nowcity = city;
        citycontroller.nowcity = city;
        avalon.components['sszhxt-sszh'].defaults.setcity();
    }
})