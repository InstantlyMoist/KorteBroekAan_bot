const fs = require("fs");

exports.getAllCommented = function () {
    return JSON.parse(fs.readFileSync("./commented.json"));
}

exports.isCommented = function (id) {
    const comments = exports.getAllCommented();
    return comments.includes(id);
}

exports.comment = async function (id) {
    const comments = exports.getAllCommented();
    comments.push(id);
    fs.writeFileSync("./commented.json", JSON.stringify(comments, null, "  "));
}


