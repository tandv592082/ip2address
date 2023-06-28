const lookup = require('country-code-lookup');


const IP_REGEX = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;

const isValidIP = (ip) => IP_REGEX.test(ip);

const getAddressFromCountryCode = (countryCode) =>  lookup.byIso(countryCode).country;


module.exports = {
    isValidIP,
    getAddressFromCountryCode
}