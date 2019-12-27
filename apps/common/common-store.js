import {
    createStore
} from 'redux';

let initStore = {
    menu: []
};

function count(state = initStore, action) {
    switch (action.type) {
        case 'saveMenu':
            state.menu = action.menu;
            return state;
        default:
            return state;
    }
}

let store = createStore(count);
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
};

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
//     type: "saveMenu",
//     menu: menu
// });