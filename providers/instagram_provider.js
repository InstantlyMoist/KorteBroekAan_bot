const instagram = require("instagram-private-api");
const client = new instagram.IgApiClient();
const imageProvider = require("../providers/image_provider");


exports.getCommentsFromLastPost = async function (loggedInUser) {
    return new Promise(async function(resolve, reject) { 
        const userFeedItems = await client.feed.user(loggedInUser.pk).items();
        const mediaComments = client.feed.mediaComments(userFeedItems[0].id);
        let comments = [];
    
        do {
            comments = comments.concat(await mediaComments.items());
        } while (mediaComments.isMoreAvailable());
    
        let maxComment;
    
        comments.forEach((comment) => {
            if (maxComment != null) {
                if (maxComment.comment_like_count < comment.comment_like_count)  maxComment = comment;
            } else maxComment = comment;
    
        });


        resolve(maxComment == null ? null :{
            "username": maxComment.user.username,
            "location": maxComment.text,
            "likes": maxComment.comment_like_count
         });
    });
}

exports.postDaily = async function () {
    const loggedInUser = await exports.login();

    const topComment = await exports.getCommentsFromLastPost(loggedInUser);

    let locations = ["Noord Brabant", "Utrecht", "Groningen"];
    if (topComment != null) locations.push(topComment.location);
    const weatherBuffers = await imageProvider.createImageFromLocations(locations);
    

    let photos = [];
    for (let i = 0; i < weatherBuffers.length; i++) {
        photos.push({
            file: weatherBuffers[i].buffer,
        });
    }
    exports.getFormattedString(weatherBuffers);

    console.log("Uploading pictures...");
    const publishResult = await client.publish.album({
        items: photos,
        caption: exports.getFormattedString(weatherBuffers, topComment),
    });
    console.log(publishResult.status);
}

exports.login = async function () {
    return new Promise(async function (resolve, reject) {
        client.state.generateDevice(process.env.IG_USERNAME);
        console.log(`Logging in as ${process.env.IG_USERNAME}`);
        resolve(await client.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD));
    });

}

exports.getFormattedString = function (weatherBuffers, topComment) {
    let finalString = "Kan ik vandaag een korte broek aan?\n";
    for (const currentBuffer in weatherBuffers) {
        const buffer = weatherBuffers[currentBuffer];
        finalString += `In ${buffer.location} is er een regenkans van ${buffer.rainChance}% met een temperatuur van ${buffer.temperature}°C. Hier kan je vandaag ${buffer.shortPants ? "een" : "geen"} korte broek aan!\n\n`;
    }
    if (topComment == null) {
        finalString += `Gisteren heeft helaas niemand een reactie achtergelaten!`;
    } else {
        finalString += `Gisteren heeft @${topComment['username']} de suggestie '${topComment['location']} achtergelaten. Deze had maarliefst ${topComment['likes']} like(s)!'\n\n`;
    }
    finalString += `Wil jij hier morgen staan? Laat een comment achter, degene met de meeste likes wint!`;
    return finalString;
}