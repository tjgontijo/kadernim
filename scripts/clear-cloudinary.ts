import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (!cloudinaryUrl) {
    console.error('❌ CLOUDINARY_URL não encontrada nas variáveis de ambiente.');
    process.exit(1);
}

// Configuração manual se necessário (caso o import do config do app falhe fora do contexto Next)
const urlParts = cloudinaryUrl.replace('cloudinary://', '').split('@');
const cloudName = urlParts[1];
const credentials = urlParts[0].split(':');
const apiKey = credentials[0];
const apiSecret = credentials[1];

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
});

async function clearCloudinary() {
    console.log('🧹 Iniciando limpeza completa do Cloudinary...');

    try {
        // 1. Deletar Imagens
        console.log('🖼️  Removendo imagens...');
        await cloudinary.api.delete_all_resources({ resource_type: 'image' });

        // 2. Deletar Vídeos
        console.log('🎥 Removendo vídeos...');
        await cloudinary.api.delete_all_resources({ resource_type: 'video' });

        // 3. Deletar Outros arquivos (raw)
        console.log('📄 Removendo arquivos raw...');
        await cloudinary.api.delete_all_resources({ resource_type: 'raw' });

        // 4. Deletar pastas (precisa ser feito uma a uma ou recursivamente)
        console.log('📁 Removendo pastas...');
        const { folders } = await cloudinary.api.root_folders();

        for (const folder of folders) {
            console.log(`   - Deletando pasta: ${folder.name}`);
            try {
                await cloudinary.api.delete_folder(folder.path);
            } catch (folderError: any) {
                console.warn(`   ⚠️  Não foi possível deletar a pasta ${folder.path}: ${folderError.message}`);
                // Geralmente falha se a pasta não estiver vazia ou tiver subpastas
                // O delete_all_resources acima deleta os arquivos, mas se houver subpastas 
                // precisaríamos de um loop mais complexo. Para este script básico, isso deve cobrir a maioria.
            }
        }

        console.log('✅ Limpeza do Cloudinary concluída com sucesso!');
    } catch (error: any) {
        console.error('❌ Erro durante a limpeza do Cloudinary:', error.message);
        process.exit(1);
    }
}

clearCloudinary();
