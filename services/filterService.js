import avalon from 'avalon2';

avalon.filters.showPrices = function (priceList) {
    let prices = '';
    if (!priceList) {
        return prices;
    }
    for (let i = 0; i < priceList.length; i++) {
        if (i !== 0) {
            prices += '，';
        }
        prices += priceList[i].discount_price + '/' + priceList[i].count_unit;
    }
    return prices;
}

avalon.filters.decodeHTML = function (str) {
    return decodeURIComponent(str);
}

avalon.filters.showPercent = function (str) {
    return '-' === $.trim(str) ? str : (Number(str) * 100).toFixed(2) + '%';
}

avalon.filters.numberShowPercent = function (str) {
    return '-' === $.trim(str) ? str : Number(str).toFixed(2) + '%';
}

avalon.filters.isNull = function (str) {
    if (str === 0)
        return 0;
    if (str)
        return str;
    else
        return '-';

};