const { SlashCommandBuilder } = require('@discordjs/builders');
const weatherProvider = require("../providers/weather_provider");
const imageProvider = require("../providers/image_provider");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kortebroekaan')
        .setDescription('Replies with Pong!')
        .addStringOption(option => option
            .setName("locatie")
            .setDescription("Waar moeten we het weer ophalen?")
            .setRequired(true)),
    async execute(interaction, instagramProvider) {
        const location = interaction.options.get("locatie").value;
        const imagePath = await imageProvider.createImageFromLocation(location, 99);

        console.log(imagePath);
        await interaction.reply({
            files: [{
                attachment: './output_99.jpeg',
                name: 'output_99.jpeg'
            }]
        });
    },
};