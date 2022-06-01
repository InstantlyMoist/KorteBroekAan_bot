const imageProvider = require(__dirname + "/../../providers/image_provider");
const fs = require("fs");

exports.name = "kortebroekaan";
exports.description = "Wil jij weten of je een korte broek aan kunt";

exports.run = async (client, msg, args) =>  {
    MessageMedia = client.messagemedia;
    if (args.length == 0) {
        msg.reply("Voeg een plaats toe om te kijken of je een korte broek aan kunt");
        return;
    }

    const imagePath = await imageProvider.createImageFromLocation(args.join(" "), 98);

    console.log(imagePath);

    var imageAsBase64 = await fs.readFileSync(__dirname + "/../../output_98.jpeg", 'base64');
    var mm = new MessageMedia("image/jpg", imageAsBase64);
    let caption = imagePath.shortPants ? "Je kan een korte broek aan" : "Je kan geen korte broek aan";
    if (imagePath.location.includes("(")) caption += "\nGelieve volgende keer geen haakjes toe te voegen!";
    client.sendMessage(msg.from, mm, { caption: caption });
}