const request = require('request');

const key = process.env.WEATHER_API_KEY;


exports.getWeather= async function(location,) {
    return new Promise(function (resolve, reject) {
        const url = getApiUrl(location); // TODO: Make this load in dynamically
        request(url, {json: true}, (err, res, body) => {
            resolve(body);
        });
    });

}


function getApiUrl(location) {
    return `http://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&q=${location}&days=1&aqi=no&alerts=no`;
}