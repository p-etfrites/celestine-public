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
        try {
            // Defer the reply immediately
            await interaction.deferReply({ ephemeral: true });

            // Check permissions
            if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
                return interaction.editReply({ 
                    content: 'You do not have permission to use this command.',
                    ephemeral: true 
                });
            }

            // Get and validate amount
            const amount = interaction.options.getInteger('amount') || 10;
            if (amount < 1 || amount > 100) {
                return interaction.editReply({ 
                    content: 'Please provide a number between 1 and 100.',
                    ephemeral: true 
                });
            }

            // Delete messages
            const deleted = await interaction.channel.bulkDelete(amount, true)
                .catch(error => {
                    console.error(error);
                    return interaction.editReply({ 
                        content: 'There was an error trying to delete messages!',
                        ephemeral: true 
                    });
                });

            // Send success message
            return interaction.editReply({ 
                content: `Successfully deleted ${deleted.size} messages.`,
                ephemeral: true 
            });

        } catch (error) {
            console.error(error);
            if (interaction.deferred) {
                return interaction.editReply({ 
                    content: 'There was an error executing this command!',
                    ephemeral: true 
                });
            }
            return interaction.reply({ 
                content: 'There was an error executing this command!',
                ephemeral: true 
            });
        }
    },
};