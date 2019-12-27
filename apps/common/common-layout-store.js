import {
    createStore
} from 'redux';

let initStore = {
    siderMenuSelectedKey: ''
};

function count(state = initStore, action) {
    switch (action.type) {
        case 'storeSidermenu':
            state.siderMenuSelectedKey = action.siderMenuSelectedKey;
            return state;
        default:
            return state;
    }
}

let store = createStore(count);

export {
    store
};