// src/events/interactionCreate.js
const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

// --- Carregador Dinâmico para Componentes (Botões, Menus, Modais) ---
const components = new Map();
const componentsPath = path.join(__dirname, '../components');

// Função recursiva para encontrar todos os ficheiros de componentes
function loadComponents(directory) {
    const files = fs.readdirSync(directory, { withFileTypes: true });
    for (const file of files) {
        const fullPath = path.join(directory, file.name);
        if (file.isDirectory()) {
            loadComponents(fullPath); // Se for um diretório, entra nele
        } else if (file.name.endsWith('.js')) {
            try {
                const component = require(fullPath);
                if (component.customId) {
                    components.set(component.customId, component);
                }
            } catch (error) {
                console.error(`[AVISO] Falha ao carregar o componente em ${fullPath}:`, error.message);
            }
        }
    }
}

loadComponents(componentsPath);
// --- Fim do Carregador de Componentes ---


module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        // Guarda a hora de início para medir a latência
        const startTime = Date.now();

        // Determina o tipo de interação e o handler correspondente
        let handler;
        let handlerName = 'Desconhecido';
        let handlerType = 'Desconhecido';

        if (interaction.isChatInputCommand()) {
            handler = client.commands.get(interaction.commandName);
            handlerName = interaction.commandName;
            handlerType = 'Comando';
        } else if (interaction.isButton() || interaction.isAnySelectMenu() || interaction.isModalSubmit()) {
            handler = components.get(interaction.customId);
            handlerName = interaction.customId;

            // --- LÓGICA CORRIGIDA PARA IDs DINÂMICOS ---
            if (!handler) {
                // Itera sobre todas as chaves de componentes registrados
                for (const key of components.keys()) {
                    // Se o ID da interação começar com uma chave registrada, encontramos nosso handler base.
                    if (interaction.customId.startsWith(key)) {
                        handler = components.get(key);
                        handlerName = `${key} (dinâmico)`;
                        break; // Para o loop assim que encontrar
                    }
                }
            }
            // --- FIM DA CORREÇÃO ---
            
            handlerType = interaction.isButton() ? 'Botão' : (interaction.isAnySelectMenu() ? 'Menu' : 'Modal');
        }

        if (!handler) {
            console.error(`[ERRO] Nenhum handler encontrado para a interação: ${handlerName} | Tipo: ${handlerType} | Custom ID: ${interaction.customId || 'N/A'}`);
            if (interaction.deferred || interaction.replied) return;
            try {
                await interaction.reply({ content: 'Este comando ou componente não foi encontrado. Pode ter sido atualizado ou removido.', ephemeral: true });
            } catch (e) {
                // Ignora erros se a interação já não for válida
            }
            return;
        }

        // --- BLOCO DE EXECUÇÃO E CAPTURA DE ERRO ROBUSTO ---
        try {
            // Executa o handler correspondente
            await handler.execute(interaction, client);

            // Log de sucesso (opcional, mas bom para debug)
            const latency = Date.now() - startTime;
            console.log(`[SUCESSO] Interação '${handlerName}' (Tipo: ${handlerType}) executada por ${interaction.user.tag} em ${latency}ms.`);

        } catch (error) {
            // --- ESTA É A PARTE MAIS IMPORTANTE ---
            // Loga o erro COMPLETO no console, incluindo o 'stack trace'
            console.error(`\n\n--- [ERRO GRAVE] Falha na execução da interação '${handlerName}' ---`);
            console.error(`Tipo de Interação: ${handlerType}`);
            console.error(`Usuário: ${interaction.user.tag} (${interaction.user.id})`);
            console.error(`ID Customizado: ${interaction.customId || 'N/A'}`);
            console.error('Objeto do Erro Completo:');
            console.error(error); // Imprime o objeto de erro inteiro com todos os detalhes
            console.error('--- Fim do Relatório de Erro ---\n\n');


            // Envia a resposta de erro genérica para o usuário no Discord
            const errorMessage = {
                content: '🔴 | Ocorreu um erro interno ao processar a sua solicitação. A equipa de desenvolvimento já foi notificada.',
                ephemeral: true
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage).catch(console.error);
            } else {
                await interaction.reply(errorMessage).catch(console.error);
            }
        }
    },
};