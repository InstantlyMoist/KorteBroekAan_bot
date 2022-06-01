exports.name = "ppsize";
exports.description = "Stuurt de lengte van jouw geslachtsdeel";

exports.run = (client, msg, args) => {
    let ppLength = "=".repeat(getRandomInt(15)); 
    msg.reply(`*Piemel lengte machine*\nJouw penis:\n8${ppLength}D`);

};

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}