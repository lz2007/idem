import avalon from "avalon2";
import "ane";
import { message, notification, Loading } from "ane";
import ajax from "/services/ajaxService";

export const name = "zfsypsjglpt-yspk-baqcjsp";

require("/apps/zfsypsjglpt/zfsypsjglpt-yspk-baqcjsp.css");

let baqcjsp_vm = avalon.component(name, {
    template: __inline("./zfsypsjglpt-yspk-baqcjsp.html"),
    defaults: {
        baqcjsp_toggle: true,
        onInit() {}
    }
});

let case_vm = avalon.define({
    $id: 'case',
    curCase: "",
    case_options: [{
            value: "0",
            label: "xxx抢劫案"
        },
        {
            value: "1",
            label: "xxx盗窃案"
        }
    ],
    case_val: ["0"],
    onChangeC(e) {
        let _this = this;
        _this.curCase = e.target.value;
    }
});

let suspect_vm = avalon.define({
    $id: 'suspect',
    curSus: "",
    suspect_options: [{
            value: "0",
            label: "张三"
        },
        {
            value: "1",
            label: "李四"
        }
    ],
    suspect_val: ["0"],
    onChangeS(e) {
        let _this = this;
        _this.curSus = e.target.value;
    }
});

let room_vm = avalon.define({
    $id: 'room',
    curRoom: "",
    room_options: [{
            value: "0",
            label: "审讯室001"
        },
        {
            value: "1",
            label: "审讯室002"
        }
    ],
    room_val: ["0"],
    onChangeR(e) {
        let _this = this;
        _this.curRoom = e.target.value;
    }
});

let select_cam_vm = avalon.define({
    $id: 'select_cam',
    curCam: "",
    select_cam_options: [{
            value: "0",
            label: "审讯室摄像头001"
        },
        {
            value: "1",
            label: "审讯室摄像头002"
        }
    ],
    select_val: ["0"],
    onChangeS(e) {
        let _this = this;
        _this.curCam = e.target.value;
    }
});

let time_range_vm = avalon.define({
    $id: 'change_type',
    curType: "",
    select_time: false,
    change_type_options: [{
            value: "0",
            label: "实时视频"
        },
        {
            value: "1",
            label: "录像视频"
        }
    ],
    select_type: ["0"],
    onChangeTR(e) {
        let _this = this;
        _this.curType = e.target.value;
        //      if(_this.curType == 2)
        //          _this.select_time = true;
        //      else
        //          _this.select_time = false;
    }
});