export const axisLabel = {
    interval: 0,
    formatter: function (params) {
        var newParamsName = "";
        var paramsNameNumber = params.length;
        var provideNumber = 4;
        var rowNumber = Math.ceil(paramsNameNumber / provideNumber);
        if (paramsNameNumber > provideNumber) {
            // for (var p = 0; p < rowNumber; p++) {
            if (rowNumber > 2) {
                rowNumber = 2;
            }
            for (var p = 0; p < rowNumber; p++) {
                var tempStr = "";
                var start = p * provideNumber;
                var end = start + provideNumber;
                if (p == rowNumber - 1) {
                    // tempStr = params.substring(start, paramsNameNumber);
                    tempStr = '...';
                } else {
                    tempStr = params.substring(start, end);
                }
                newParamsName += tempStr;
            }

        } else {
            newParamsName = params;
        }
        return newParamsName
    }
}

export const splitLine = {
    lineStyle: {
        show: true,
        color: ['#334d5f'],
        type: 'solid'
    }
}