const shortPantsCalculator = require("../utils/short_pants_calculator");
const weatherProvider = require("../providers/weather_provider");
const color = require("../utils/color");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");

const iconHeight = 52;
const iconWidth = 52;
const heightDifference = 8;
const midOffset = 0;
const informationHeight = 880;

exports.createImage = async function (location, rainChance, temperature, index) {
    return new Promise(async function (resolve, reject) {
        const shortPants = shortPantsCalculator.canWearShortPants(rainChance, temperature);
        const canvas = createCanvas(1080, 1080);
        const context = canvas.getContext("2d");

        context.imageSmoothingEnabled = false;

        context.fillStyle = color.lightColor(shortPants);
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.font = "bold 64px Roboto";
        context.fillStyle = color.darkColor(shortPants);
        context.fillText("Kan ik vandaag een korte \nbroek aan?", 64, 128);

        const weatherImage = await loadImage(shortPants ? "./assets/yes-man.png" : "./assets/no-man.png");
        const widthAspect = weatherImage.width > weatherImage.height;
        const desiredWidth = widthAspect ? 500 : 500 * (500 / weatherImage.height);
        const desiredHeight = widthAspect ? 500 * (desiredWidth / weatherImage.width) : 500;
        context.drawImage(weatherImage, (canvas.width / 2) - (desiredWidth / 2), (canvas.height / 2) - (desiredHeight / 2) + midOffset, desiredWidth, desiredHeight);

        const locationIcon = await loadImage(`./assets/location_${shortPants ? "orange" : "blue"}.png`);
        context.drawImage(locationIcon, 64, informationHeight, iconWidth, iconHeight);

        context.font = "32px Roboto";
        context.fillText(location, 128, informationHeight + 36);

        const rainIcon = await loadImage(`./assets/drop_${shortPants ? "orange" : "blue"}.png`);
        context.drawImage(rainIcon, 64, informationHeight + (heightDifference + iconHeight), iconWidth, iconHeight);

        context.fillText(`${rainChance}% kans`, 128, informationHeight + (heightDifference + iconHeight) + 36);

        const temperatureIcon = await loadImage(`./assets/temperature_${shortPants ? "orange" : "blue"}.png`);
        context.drawImage(temperatureIcon, 64, informationHeight + (heightDifference + iconHeight) * 2, iconWidth, iconHeight);

        context.fillText(`${temperature}°C`, 128, informationHeight + (heightDifference + iconHeight) * 2 + 36);

        const buffer = canvas.toBuffer('image/jpeg');
        const path = `./output_${index}.jpeg`;
        fs.writeFileSync(path, buffer); // TODO: Make this dynammic

        // TODO get correct folder
        console.log("Picture has been created");
        resolve({
            buffer, rainChance, temperature, location, shortPants
        });
    });
}

exports.createImageFromLocation = async function (location, index) {
    return new Promise(async function (resolve, reject) {
        const weather = await weatherProvider.getWeather(location);
        const temperature = weather['forecast']['forecastday'][0]['day']['avgtemp_c'];
        const rainChance = weather['forecast']['forecastday'][0]['day']['daily_chance_of_rain'];
        resolve(await exports.createImage(location, rainChance, temperature, index));
    });
}

exports.createImageFromLocations = async function (locations) {
    return new Promise(async function (resolve, reject) {
        let imagePaths = [];
        for (let i = 0; i < locations.length; i++) {
            imagePaths[i] = await exports.createImageFromLocation(locations[i], i);
        }
        resolve(imagePaths);
    });
}