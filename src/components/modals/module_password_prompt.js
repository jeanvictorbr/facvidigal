// src/components/modals/module_password_prompt.js
const prisma = require('../../prisma/client');

module.exports = {
    customId: 'module_password_prompt',
    async execute(interaction, client) {
        // Pega o customId original e a senha
        const originalCustomId = interaction.customId.replace('module_password_prompt_', '');
        const submittedPassword = interaction.fields.getTextInputValue('module_password_input');

        // Mapa de Módulos (Mantenha igual ao do interactionCreate.js)
        const moduleMap = {
            'justica_open_panel': 'Conduta e Punições',
            'giveaway_open_panel': 'Criador de Sorteios',
            'view_module_financas': 'Módulo Financeiro',
            'view_module_registro': 'Registro Automatizado',
            'view_module_hierarquia': 'Sincronização de Hierarquia',
            'view_module_roletags': 'Padronização de Tags',
            'view_module_prune': 'Depuração de Inativos',
            'view_module_operations': 'Operações Táticas',
            'view_module_partnerships': 'Gerenciamento de Parcerias',
            'view_module_sentinel': 'Sentinela (Relatórios)',
            'rpainel_action_create_embed': 'Criador de Embeds',
            'changelog_view_main': 'Changelog'
        };
        const moduleName = moduleMap[originalCustomId];

        if (!moduleName) {
            return interaction.reply({ content: '❌ Erro: Módulo de destino não reconhecido.', ephemeral: true });
        }

        const moduleStatus = await prisma.moduleStatus.findFirst({
            where: { name: moduleName, guildId: interaction.guild.id }
        });
        
        // Compara as senhas
        if (moduleStatus && moduleStatus.password === submittedPassword) {
            // SENHA CORRETA!
            // Encontra o handler da ação que o usuário queria originalmente.
            const handler = client.componentHandlers.get(originalCustomId);

            if (handler) {
                // ===================================================================
                // CORREÇÃO: Ele não responde mais. Ele apenas chama o próximo
                // handler, passando a interação adiante. O handler original
                // será o responsável por dar a resposta (deferUpdate, reply, etc.).
                // ===================================================================
                return handler.execute(interaction, client);
            } else {
                 return interaction.reply({ content: `❌ Erro crítico: A ação para '${originalCustomId}' não foi encontrada.`, ephemeral: true });
            }

        } else {
            // SENHA INCORRETA
            await interaction.reply({ content: '❌ Senha incorreta. Acesso negado.', ephemeral: true });
        }
    }
};