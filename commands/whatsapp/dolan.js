let fetch = require('node-fetch');

exports.name = "dolan";
exports.description = "Dolan spik";

exports.run = async (client, msg, args) => {
    if (args.length == 0) {
        msg.reply("pls giv argument");
        return;
    }
    let toTranslate = args.join("%20");
    let response = await fetch(`https://api.funtranslations.com/translate/dolan.json?text=${toTranslate}`);
    let body = await response.json(); 
    msg.reply(body.contents.translated);
}