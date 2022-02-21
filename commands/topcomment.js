const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, GuildMember } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('topcomment')
        .setDescription('Zie de laatste topcomment'),
    async execute(interaction, instagramProvider) {
        const member = interaction.member;

        if (!member.permissions.has("ADMINISTRATOR")) {
            interaction.reply("Geen toestemming!");
            return;
        }
        //await interaction.reply("Ontvangen... We halen de topcomment op!")
        let maxComment = await instagramProvider.getCommentsFromLastPost();
        await interaction.reply({
            embeds: [
                new MessageEmbed().setTitle("Topcomment")
                    .setDescription(`Gebruiker: ${maxComment.username}
                Locatie: ${maxComment.location}
                Likes: ${maxComment.likes}\n
                `)
            ]
        });
    },
};