require("dotenv").config(); // Initialized .env in process.env for global use
const fs = require("fs");
const imageProvider = require("./providers/image_provider");
const instagramProvider = require("./providers/instagram_provider");
const schedule = require("node-schedule");
const { Client, Intents, Collection } = require("discord.js");
const whatsappProvider = require("./providers/whatsapp_provider");


const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});
client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

console.log("The instagram application is running");

async function init() {
    whatsappProvider.login();
    require("./deploy-commands");

    for (const file of commandFiles) {
        console.log(`Loading in ${file}`);
        const command = require(`./commands/discord/${file}`);
        client.commands.set(command.data.name, command);
    }
    

    client.on("interactionCreate", async interaction => {
        if (!interaction.isCommand()) return;
    
        const command = client.commands.get(interaction.commandName);
    
        if (!command) return;
    
        try {
            await command.execute(interaction, instagramProvider);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
        }
    });

    client.login(process.env.DISCORD_TOKEN);

    await instagramProvider.login();
    console.log("logged in");

    schedule.scheduleJob("0 5 * * *", function () {
        instagramProvider.postDaily();
    });
}

init();