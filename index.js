require("dotenv").config(); // Initialized .env in process.env for global use
const imageProvider = require("./providers/image_provider");
const instagramProvider = require("./providers/instagram_provider");
const schedule = require('node-schedule');

console.log("The instagram application is running");

schedule.scheduleJob('0 7 * * *', function () {
    instagramProvider.postDaily();
});
instagramProvider.postDaily();

console.log(`The daily posting has been scheduled`);