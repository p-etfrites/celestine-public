const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member from the server')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for banning member')
                .setRequired(false))
        .addNumberOption(option =>
            option.setName('days')
                .setDescription('Number of days of messages to delete (0-7)')
                .setMinValue(0)
                .setMaxValue(7)
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';
        const deleteMessageDays = interaction.options.getNumber('days') ?? 0;

        // Check if the target is bannable
        if (!target.bannable) {
            return interaction.reply({
                content: 'I cannot ban this user! They may have a higher role than me.',
                ephemeral: true
            });
        }

        // Check if the user trying to ban has a higher role than the target
        if (interaction.member.roles.highest.position <= target.roles.highest.position) {
            return interaction.reply({
                content: 'You cannot ban this user! They have a higher or equal role than you.',
                ephemeral: true
            });
        }

        try {
            await target.ban({
                deleteMessageDays: deleteMessageDays,
                reason: reason
            });

            await interaction.reply(`Successfully banned ${target.user.tag}\nReason: ${reason}`);

            // Optional: Log the ban in a logging channel
            const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'mod-logs');
            if (logChannel) {
                await logChannel.send({
                    content: `**Member Banned**\nMember: ${target.user.tag}\nModerator: ${interaction.user.tag}\nReason: ${reason}\nMessage History Deleted: ${deleteMessageDays} days`
                });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'There was an error while banning the member!',
                ephemeral: true
            });
        }
    },
};