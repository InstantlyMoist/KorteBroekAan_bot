const imageProvider = require(__dirname + "/../../providers/image_provider");
const fs = require("fs");

exports.name = "topcomment";
exports.description = "Verkrijg de laatste topcomment";

exports.run = async (client, msg, args) =>  {
    client.sendMessage(msg.from, "We halen de topcomment op... even geduld aub");
    let maxComment = await instagramProvider.getCommentsFromLastPost();
    client.sendMessage(msg.from, "Topcomment:\nGebruiker: " + maxComment.username + "\nLocatie: " + maxComment.location + "\nLikes: " + maxComment.likes);
}