const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, GuildMember } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('post')
        .setDescription('Post een dagelijkse post'),
    async execute(interaction, instagramProvider) {
        const member = interaction.member;

        if (!member.permissions.has("ADMINISTRATOR")) {
            interaction.reply("Geen toestemming!");
            return;
        }
        const filter = m => m.author.id == interaction.user.id;
        await interaction.reply("Ontvangen, we maken een post...")
        const message = await interaction.channel.send({
            embeds: [
                new MessageEmbed()
                    .setTitle("We halen de topcomment op!")
                    .setDescription("Een klein momentje..")
            ]
        })
        let maxComment = await instagramProvider.getCommentsFromLastPost();
        await message.edit({
            embeds: [
                new MessageEmbed().setTitle("Topcomment")
                    .setDescription(`Gebruiker: ${maxComment.username}
                Locatie: ${maxComment.location}
                Likes: ${maxComment.likes}\n
                
                Klopt dit? Typ dan 'ja', wil je deze skippen typ dan 'skip' en om te corrigeren typ een verbeterde naam.`)
            ]
        });

        const collected = await interaction.channel.awaitMessages({
            filter,
            max: 1,
            time: 50000,
        }).catch(() => {
            interaction.channel.send('Timeout');
        });
        const answer = collected.first();
        console.log(answer);
        if (answer == null) {
            await message.edit({ embeds: [new MessageEmbed().setTitle("We hebben geen antwoord ontvangen!")] })
            return;
         }
        await answer.delete();
        switch (answer.content.toLowerCase()) {
            case "ja":
                break;
            case "skip":
                maxComment = null;
                break;
            default:
                maxComment.location = answer;
                break;
        }
        await message.edit({ embeds: [new MessageEmbed().setTitle("Aan het uploaden...")] })
        await instagramProvider.postDaily(maxComment);
        await message.edit({ embeds: [new MessageEmbed().setTitle("Uploaden ok...")] })
    },
};