const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear messages')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to clear (1-100)')
                .setRequired(false)),
    async execute(interaction) {
        if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
            return interaction.reply({ 
                content: 'You do not have permission to use this command.', 
                ephemeral: true 
            });
        }

        const amount = interaction.options.getInteger('amount') || 10;

        if (amount < 1 || amount > 100) {
            return interaction.reply({ 
                content: 'Please provide a number between 1 and 100.', 
                ephemeral: true 
            });
        }

        try {
            const deleted = await interaction.channel.bulkDelete(amount);
            await interaction.reply({ 
                content: `Deleted ${deleted.size} messages.`, 
                ephemeral: true 
            });
        } catch (error) {
            await interaction.reply({ 
                content: 'There was an error trying to delete messages.', 
                ephemeral: true 
            });
        }
    },
};