exports.name = "coinflip";
exports.description = "Flipt een muntje";

exports.run = (client, msg, args) => {
    let side = Math.random() >= 0.5 ? "kop" : "munt";
    msg.reply(`De munt is geland op: ${side}`);
}