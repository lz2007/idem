/*
 * @Description: 28181 公用方法
 * @Author: liangzhu
 * @Date: 2019-05-10 10:24:08
 * @LastEditTime: 2019-05-16 11:07:13
 * @LastEditors: Please set LastEditors
 */


/**
 *  节流函数
 * @param fn {Function}   实际要执行的函数
 * @param delay {Number}  延迟时间，也就是阈值，单位是毫秒（ms）
 *
 * @return {Function}     返回一个“去弹跳”了的函数
 */
export function debounce(fn, delay) {
    // 定时器，用来 setTimeout
    var timer;

    // 返回一个函数，这个函数会在一个时间区间结束后的 delay 毫秒时执行 fn 函数
    return function () {
        // 保存函数调用时的上下文和参数，传递给 fn
        var context = this;
        var args = arguments;

        // 每次这个返回的函数被调用，就清除定时器，以保证不执行 fn
        clearTimeout(timer);

        // 当返回的函数被最后一次调用后（也就是用户停止了某个连续的操作），
        // 再过 delay 毫秒就执行 fn
        timer = setTimeout(function () {
            fn.apply(context, args);
        }, delay);
    };
}

/**
 * 分时函数
 *
 * @export
 * @param {*} ary
 * @param {*} fn
 * @param {*} count
 * @param {number} [times=200]
 * @returns
 */
export function timeChunk(ary, fn, count, times = 200) {
    var t;

    var start = function () {
        for (var i = 0; i < Math.min(count || 1, ary.length); i++) {
            var obj = ary.shift();
            fn(obj);
        }
    };

    return function () {
        t = setInterval(function () {
            if (ary.length === 0) {
                return clearInterval(t);
            }
            start();
        }, times); // 分批执行的时间间隔
    };
}

/**
 * 数组去重
 * 
 * @export
 * @param {*} arr Array
 * @returns
 */
export function distinct(arr) {
    let result = [],
        i,
        j,
        len = arr.length;
    for (i = 0; i < len; i++) {
        for (j = i + 1; j < len; j++) {
            if (arr[i] === arr[j]) {
                j = ++i;
            }
        }
        result.push(arr[i]);
    }
    return result;
}

/**
 *js比较两个对象数组,取出不同的值
 *
 * @param {*} array1
 * @param {*} array2
 * @returns
 */
export function difArray(array1, array2) {
    var result = [];
    for (var i = 0; i < array2.length; i++) {
        var obj = array2[i];
        var num = obj.rid;
        var isExist = false;
        for (var j = 0; j < array1.length; j++) {
            var aj = array1[j];
            var n = aj.rid;
            if (n == num) {
                isExist = true;
                break;
            }
        }
        if (!isExist) {
            result.push(obj);
        }
    }
    return result;
}

/*
 * JSON数组去重
 * @param: [array] json Array
 * @param: [string] 唯一的key名，根据此键名进行去重
 */
export function uniqueArray(array, key) {
    var result = [array[0]];
    for (var i = 1; i < array.length; i++) {
        var item = array[i];
        var repeat = false;
        for (var j = 0; j < result.length; j++) {
            if (item[key] == result[j][key]) {
                repeat = true;
                break;
            }
        }
        if (!repeat) {
            result.push(item);
        }
    }
    return result;
}

/**
 *分割数组
 *
 * @param {*} arr
 * @param {*} len
 * @returns
 */
export function split_array(arr, len) {
    var a_len = arr.length;
    var result = [];
    for (var i = 0; i < a_len; i += len) {
        result.push(arr.slice(i, i + len));
    }
    return result;
}

/**
 * 超出长度显示...
 *
 * @param {*} str
 * @param {number} [len=12]
 * @returns
 */
export function subStrEllipsis(str, len = 12) {
    if (str && String(str).length > len) {
        return str.substr(0, len) + '...';
    } else {
        return str;
    }
}
