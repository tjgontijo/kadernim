import { v2 as cloudinary } from 'cloudinary';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env vars from .env.local if it exists, otherwise .env
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envLocalPath)) {
  config({ path: envLocalPath });
} else {
  config({ path: envPath });
}

// Configure Cloudinary with environment variables
const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (!cloudinaryUrl) {
  throw new Error('CLOUDINARY_URL environment variable is not set');
}

// Parse CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
const urlParts = cloudinaryUrl.replace('cloudinary://', '').split('@');
const cloudName = urlParts[1];
const credentials = urlParts[0].split(':');
const apiKey = credentials[0];
const apiSecret = credentials[1];

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});

async function clearCloudinary() {
  console.log('🧹 Iniciando limpeza do Cloudinary...');
  
  try {
    // Apaga todas as imagens e vídeos (pode não apagar diretórios vazios imediatamente, mas limpa o conteúdo)
    console.log('Apagando imagens...');
    await cloudinary.api.delete_all_resources({ type: 'upload', resource_type: 'image' });
    
    console.log('Apagando vídeos/arquivos brute...');
    await cloudinary.api.delete_all_resources({ type: 'upload', resource_type: 'video' });
    await cloudinary.api.delete_all_resources({ type: 'upload', resource_type: 'raw' });

    console.log('✅ Arquivos do Cloudinary apagados com sucesso!');
  } catch (error) {
    console.error('❌ Falha ao limpar o Cloudinary:', error);
    process.exit(1);
  }
}

clearCloudinary();
