const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to timeout')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Timeout duration in minutes')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for timeout')
                .setRequired(false)),
    async execute(interaction) {
        if (!interaction.member.permissions.has('MODERATE_MEMBERS')) {
            return interaction.reply({ 
                content: 'You do not have permission to use this command.', 
                ephemeral: true 
            });
        }

        const user = interaction.options.getUser('user');
        const duration = interaction.options.getInteger('duration') || 5;
        const reason = interaction.options.getString('reason') || 'No reason provided';

        const member = interaction.guild.members.cache.get(user.id);
        if (member) {
            try {
                await member.timeout(duration * 60 * 1000, reason);
                await interaction.reply(`${user.tag} has been timed out for ${duration} minutes. Reason: ${reason}`);
            } catch (error) {
                await interaction.reply({ 
                    content: `Failed to timeout ${user.tag}: ${error}`, 
                    ephemeral: true 
                });
            }
        }
    },
};