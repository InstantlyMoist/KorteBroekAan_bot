const imageProvider = require(__dirname + "/../../providers/image_provider");
const fs = require("fs");

exports.name = "kortebroekaan";
exports.description = "Wil jij weten of je een korte broek aan kunt";

exports.run = async (client, msg, args) =>  {
    // Get current time in milliseconds
    let now = new Date().now();
    MessageMedia = client.messagemedia;
    if (args.length == 0) {
        msg.reply("Voeg een plaats toe om te kijken of je een korte broek aan kunt");
        return;
    }

    const imagePath = await imageProvider.createImageFromLocation(args.join(" "), 98);

    console.log(imagePath);

    var imageAsBase64 = await fs.readFileSync(__dirname + "/../../output_98.jpeg", 'base64');
    var mm = new MessageMedia("image/jpg", imageAsBase64);

    let finalString = "Kan ik vandaag een korte broek aan?\n";

    if (imagePath.rainChance == undefined || imagePath.temperature == undefined) {
        finalString += `De locatie ${imagePath.location} konden we helaas niet inladen vandaag...\n\n`;
    } else {
        finalString += `In ${imagePath.location} is er een regenkans van ${imagePath.rainChance}% met een temperatuur van ${imagePath.temperature}°C. Hier kan je vandaag ${imagePath.shortPants ? "een" : "geen"} korte broek aan!\n\n`;
    }

    let end = new Date().now() - now;

    finalString += "\nDeze informatie is opgehaald in " + end + "ms";

    finalString += "\nDeel dit bericht met je vrienden en join onze groepsapp: https://chat.whatsapp.com/EqTygiIr1iQ5sEzA1rh7nl"

    if (imagePath.location.includes("(")) caption += "\nGelieve volgende keer geen haakjes toe te voegen!";
    client.sendMessage(msg.from, mm, { caption: caption });
}