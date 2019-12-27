var languageSelect = require('../services/configService').languageSelect;
var languageRequire;

switch (languageSelect) {
    case "en":
        languageRequire = require('../vendor/i18n/en').en;
        break;
    default:
        languageRequire = require('../vendor/i18n/zhcn').zhcn;
        break;
}

module.exports.language = languageRequire;