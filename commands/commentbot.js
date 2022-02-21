const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, GuildMember } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commentbot')
        .setDescription('Zet de commentbot aan of uit'),
    async execute(interaction, instagramProvider) {
        const member = interaction.member;

        if (!member.permissions.has("ADMINISTRATOR")) {
            interaction.reply("Geen toestemming!");
            return;
        }
        instagramProvider.commentBot = !instagramProvider.commentBot;
        if (instagramProvider.commentBot) instagramProvider.postComment();
        console.log(instagramProvider.commentBot);

        await interaction.reply({
            embeds: [
                new MessageEmbed().setTitle("Commentbot")
                    .setDescription(`De commentbot staat nu ${instagramProvider.commentBot ? "aan" : "uit"}
                `)
            ]
        });
    },
};