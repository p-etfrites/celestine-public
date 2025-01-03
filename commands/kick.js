const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The member to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for kicking member')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';

        // Check if the target is kickable
        if (!target.kickable) {
            return interaction.reply({
                content: 'I cannot kick this user! They may have a higher role than me.',
                ephemeral: true
            });
        }

        // Check if the user trying to kick has a higher role than the target
        if (interaction.member.roles.highest.position <= target.roles.highest.position) {
            return interaction.reply({
                content: 'You cannot kick this user! They have a higher or equal role than you.',
                ephemeral: true
            });
        }

        try {
            await target.kick(reason);
            await interaction.reply(`Successfully kicked ${target.user.tag}\nReason: ${reason}`);

            // Optional: Log the kick in a logging channel
            const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'mod-logs');
            if (logChannel) {
                await logChannel.send({
                    content: `**Member Kicked**\nMember: ${target.user.tag}\nModerator: ${interaction.user.tag}\nReason: ${reason}`
                });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'There was an error while kicking the member!',
                ephemeral: true
            });
        }
    },
};