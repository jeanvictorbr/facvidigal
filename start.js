// start.js
const { exec } = require('child_process');
const path = require('path');

console.log('[SISTEMA] Iniciando verificação do banco de dados...');

// Encontra o executável do Prisma dentro de node_modules
const prismaPath = path.join(__dirname, 'node_modules', '.bin', 'prisma');

// O comando a ser executado. Usamos o caminho direto para o executável do Prisma
// para garantir que funcione em qualquer ambiente, sem depender do npx.
const command = `${prismaPath} migrate deploy`;

const migrationProcess = exec(command);

// Mostra o output do processo de migração em tempo real
migrationProcess.stdout.on('data', (data) => {
    // Filtramos as mensagens para não poluir o log com "No pending migrations to apply"
    if (!data.includes('No pending migrations to apply')) {
        console.log(`[PRISMA MIGRATE] ${data.toString().trim()}`);
    }
});

// Mostra erros do processo de migração
migrationProcess.stderr.on('data', (data) => {
    console.error(`[PRISMA MIGRATE ERROR] ${data.toString().trim()}`);
});

// Evento disparado quando o processo de migração termina
migrationProcess.on('close', (code) => {
    if (code === 0) {
        console.log('[SISTEMA] Banco de dados está sincronizado. Iniciando o bot...');
        // Se a migração foi bem-sucedida (código 0), inicia o bot.
        require('./src/index.js');
    } else {
        // Se houve algum erro, exibe uma mensagem clara e encerra o processo.
        console.error(`[SISTEMA] Falha crítica na migração do banco de dados (código: ${code}). O bot não será iniciado.`);
        process.exit(1); // Encerra a aplicação com um código de erro.
    }
});