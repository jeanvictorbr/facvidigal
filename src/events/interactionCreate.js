// src/events/interactionCreate.js
const { Events, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const prisma = require('../prisma/client');

// Carregador de componentes
const componentHandlers = new Map();
const componentDirs = ['buttons', 'modals', 'selects'];
componentDirs.forEach(dir => {
    const handlerPath = path.join(__dirname, '..', 'components', dir);
    if (!fs.existsSync(handlerPath)) return;
    const files = fs.readdirSync(handlerPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
        try {
            const handler = require(path.join(handlerPath, file));
            if (handler.customId) componentHandlers.set(handler.customId, handler);
        } catch (error) {
            console.error(`[FALHA NO CARREGAMENTO] Handler: ${file}`, error);
        }
    }
});

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        // Anexa os handlers ao client para que possam ser acessados de outros arquivos, se necessário
        client.componentHandlers = componentHandlers;

        try {
            // Lógica para comandos de barra (/)
            if (interaction.isChatInputCommand()) {
                const command = client.commands.get(interaction.commandName);
                if (command) await command.execute(interaction, client);
                return;
            }

            // Lógica para componentes (botões, menus, modais)
            let handler;
            if (componentHandlers.has(interaction.customId)) {
                handler = componentHandlers.get(interaction.customId);
            } else {
                let bestMatch = '';
                for (const key of componentHandlers.keys()) {
                    if (interaction.customId.startsWith(key) && key.length > bestMatch.length) {
                        bestMatch = key;
                    }
                }
                if (bestMatch) {
                    handler = componentHandlers.get(bestMatch);
                }
            }

            if (!handler) {
                return console.warn(`[AVISO] Nenhum handler encontrado para o customId: ${interaction.customId}`);
            }

            // ===================================================================
            // CAMADA DE SEGURANÇA FINAL (VERIFICAÇÃO DE SENHA)
            // ===================================================================
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
                // Este mapa agora está completo com os IDs dos botões que abrem cada módulo.
            };

            const moduleName = moduleMap[interaction.customId];
            
            // Se o botão clicado for um "portão de entrada" para um módulo...
            if (moduleName) {
                const moduleStatus = await prisma.moduleStatus.findFirst({ where: { name: moduleName, guildId: interaction.guild.id } });
                
                // ...e esse módulo tiver uma senha no banco de dados...
                if (moduleStatus?.password) {
                    // ...pede a senha e interrompe a execução normal.
                    const passwordModal = new ModalBuilder()
                        .setCustomId(`module_password_prompt_${interaction.customId}`)
                        .setTitle(`Acesso Restrito: ${moduleName}`);
                    const passwordInput = new TextInputBuilder().setCustomId('module_password_input').setLabel('Digite a senha de acesso').setStyle(TextInputStyle.Short).setRequired(true);
                    passwordModal.addComponents(new ActionRowBuilder().addComponents(passwordInput));
                    return interaction.showModal(passwordModal);
                }
            }
            // ===================================================================

            // Se passou pela verificação (ou não precisava de senha), executa a ação.
            await handler.execute(interaction, client);

        } catch (error) {
            console.error(`[ERRO CRÍTICO] Falha ao executar a interação ${interaction.customId || interaction.commandName}:`, error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: '❌ Ocorreu um erro ao processar esta ação.', ephemeral: true }).catch(() => {});
            } else {
                await interaction.reply({ content: '❌ Ocorreu um erro ao processar esta ação.', ephemeral: true }).catch(() => {});
            }
        }
    },
};