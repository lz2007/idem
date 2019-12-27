import {
    createStore
} from 'redux'

let initStore = {
    searchData: [], // 查询数据
    isCheck: false, //查看页面状态
    list: {} //需要传入查看页面数据
}

function count(state = initStore, action) {
    switch (action.type) {
        case 'opencheck':
            state.isCheck = true
            return state
        case 'closecheck':
            state.isCheck = false
            return state
        case 'saveList':
            state.list = action.list
            return state
        case 'saveType':
            state.saveType = action.saveType
            return state
        case 'saveSearch':
            state.searchData = action.searchData
            return state
        default:
            return state
    }
}

let store = createStore(count)
// let currentValue = store.getState()
// avalon.log('当前的值:', currentValue)
// //定义一个监听的方法
// let listener = () => {
//     const previosValue = currentValue
//     currentValue = store.getState()
//     avalon.log('上一个值:', previosValue, '当前值:', currentValue)
// }
// // //创建一个监听
// store.subscribe(listener)
export {
    store
}

// //分发任务
// store.dispatch({
//     type: "ADD"
// });
// store.dispatch({
//     type: "ADD"
// });
// store.dispatch({
//     type: "ADD"
// });
// store.dispatch({
//     type: "REDUCER"
// });