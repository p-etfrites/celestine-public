const { SlashCommandBuilder } = require('discord.js');

const userWarnings = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to warn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for warning')
                .setRequired(false)),
    async execute(interaction) {
        if (!interaction.member.permissions.has('KICK_MEMBERS')) {
            return interaction.reply({ 
                content: 'You do not have permission to use this command.', 
                ephemeral: true 
            });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!userWarnings.has(user.id)) {
            userWarnings.set(user.id, []);
        }

        userWarnings.get(user.id).push({
            reason,
            timestamp: Date.now(),
            moderator: interaction.user.id
        });

        await interaction.reply(`Warned ${user.tag} for: ${reason}`);

        if (userWarnings.get(user.id).length >= 3) {
            const member = interaction.guild.members.cache.get(user.id);
            if (member) {
                try {
                    await member.kick('Received 3 warnings');
                    await interaction.channel.send(`${user.tag} has been kicked for receiving 3 warnings.`);
                } catch (error) {
                    await interaction.channel.send(`Failed to kick ${user.tag}: ${error}`);
                }
            }
        }
    },
}