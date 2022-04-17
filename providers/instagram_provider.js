const instagram = require("instagram-private-api");
const client = new instagram.IgApiClient();
const imageProvider = require("../providers/image_provider");
const fileProvider = require("../providers/file_provider");

let loggedInUser;

exports.commentBot = false;

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

function getRandomDelay(base, max) {
    return base + getRandomInt(max - base);
}

function getRandomComment() {
    const comments = [
        "Je kan vandaag trouwens geen korte broek aan 😞",
        "Wist je trouwens dat je vandaag geen korte broek aan kunt doen 👖😥",
        "Je kunt geen korte broek aan vandaag + ratio 😓",
        "Je kunt geen korte broek aan vandaag 😓",
        "Ik heb treurig nieuws; je kunt vandaag geen korte broek aan...",
        "Lange broek wordt aangeraden! 🤗"
    ];
    return comments[Math.floor(Math.random() * comments.length)]
}

exports.postComment = async function () {
    console.log("Comment bot on..");
    const feed = await client.feed.timeline();

    let posts = await feed.items();
    for (const postIndex in posts) {
        const post = posts[postIndex];
        if (!fileProvider.isCommented(post.id)) {
            if (Math.random() < 0.5) { //Random chance of liking the post...
                console.log("Liking posts...");
                client.media.like({
                    mediaId: post.id,
                    moduleInfo: {
                      module_name: 'profile',
                      user_id: loggedInUser.pk,
                      username: loggedInUser.username,
                    },
                    d: 1,
                  })
                await sleep(getRandomDelay(6000, 10000));
            }
            console.log(`Placing comment on the account of ${post.user.username}`);
            client.media.comment({ "mediaId": post.id, "text": getRandomComment() });
            fileProvider.comment(post.id);
            const delay = getRandomDelay(7000, 15000);
            console.log(`Done... Waiting ${delay} ms`);
            await sleep(delay); 
        }
    }
    const retryDelay = getRandomDelay(30000, 60000);
    console.log(`Complete feed of ${posts.length} posts has been commented on... Waiting ${retryDelay}ms`);
    await sleep(retryDelay);
    console.log(`CommentBot state: ${exports.commentBot}`);
    if (exports.commentBot) exports.postComment();
}

exports.getCommentsFromLastPost = async function () {
    return new Promise(async function (resolve, reject) {
        const userFeedItems = await client.feed.user(loggedInUser.pk).items();
        const mediaComments = client.feed.mediaComments(userFeedItems[0].id);
        let comments = [];

        console.log("Getting comments from old post");
        do {
            comments = comments.concat(await mediaComments.items());
        } while (mediaComments.isMoreAvailable());

        let maxComment;

        console.log("Sort");
        comments.forEach((comment) => {
            if (maxComment != null) {
                if (maxComment.comment_like_count < comment.comment_like_count) maxComment = comment;
            } else maxComment = comment;

        });

        console.log("Max comment found");

        resolve(maxComment == null ? null : {
            "username": maxComment.user.username,
            //"location": "Sneek",
            "location": maxComment.text.split(" ")[0].split(".")[0].split(",")[0],
            "likes": maxComment.comment_like_count
        });
    });
}

exports.postDaily = async function (topComment) {
    let locations = ["Noord Brabant", "Utrecht", "Groningen", "Arnhem", "Den Haag, Netherlands"];
    topComment = await exports.getCommentsFromLastPost();
    // topComment = {
    //     "username": "jessinofficial",
    //     "location": "Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch",
    //     "likes": 13
    // };
    
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
    client.state.generateDevice(process.env.IG_USERNAME);
    console.log(`Logging in as ${process.env.IG_USERNAME}`);
    loggedInUser = await client.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
}

exports.getFormattedString = function (weatherBuffers, topComment) {
    let finalString = "Kan ik vandaag een korte broek aan?\n";
    for (const currentBuffer in weatherBuffers) {
        const buffer = weatherBuffers[currentBuffer];
        if (buffer.rainChance == undefined || buffer.temperature == undefined) {
            finalString += `De locatie ${buffer.location} konden we helaas niet inladen vandaag...\n\n`;
        } else {
            finalString += `In ${buffer.location} is er een regenkans van ${buffer.rainChance}% met een temperatuur van ${buffer.temperature}°C. Hier kan je vandaag ${buffer.shortPants ? "een" : "geen"} korte broek aan!\n\n`;
        }
    }
    if (topComment == null) {
        finalString += `Gisteren heeft helaas niemand een reactie achtergelaten!`;
    } else {
        finalString += `Gisteren heeft @${topComment['username']} de suggestie '${topComment['location']}' achtergelaten. Deze had maarliefst ${topComment['likes']} like(s)!\n\n`;
    }
    finalString += `Wil jij hier morgen staan? Laat een comment achter, degene met de meeste likes wint!`;

    console.log(finalString);
    return finalString;
}