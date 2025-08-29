require('dotenv').config({ path: '.env' });

const CLOUDFLARE_ACCOUNT_ID = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN;

if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
  console.error('❌ Variables de entorno no configuradas');
  console.error('NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID:', CLOUDFLARE_ACCOUNT_ID ? '✅' : '❌');
  console.error('NEXT_PUBLIC_CLOUDFLARE_API_TOKEN:', CLOUDFLARE_API_TOKEN ? '✅' : '❌');
  process.exit(1);
}

async function configureCORS() {
  try {
    console.log('🔧 Configurando CORS en Cloudflare Images...');
    
    // Obtener configuración actual
    const currentConfig = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1/config`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!currentConfig.ok) {
      throw new Error(`Error obteniendo configuración: ${currentConfig.status}`);
    }
    
    const configData = await currentConfig.json();
    console.log('📋 Configuración actual:', JSON.stringify(configData.result, null, 2));
    
    // Configurar CORS
    const corsConfig = {
      allowed_origins: [
        'http://localhost:3000',     // Desarrollo
        'https://localhost:3000',    // Desarrollo HTTPS
        'http://127.0.0.1:3000',    // Desarrollo alternativo
        'https://127.0.0.1:3000'    // Desarrollo HTTPS alternativo
      ],
      allowed_methods: ['GET', 'HEAD'],
      allowed_headers: ['*'],
      max_age: 86400 // 24 horas
    };
    
    console.log('🔄 Aplicando configuración CORS...');
    
    const updateResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1/config`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cors: corsConfig
      })
    });
    
    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(`Error actualizando CORS: ${updateResponse.status} - ${JSON.stringify(errorData)}`);
    }
    
    const result = await updateResponse.json();
    console.log('✅ CORS configurado exitosamente!');
    console.log('📋 Nueva configuración:', JSON.stringify(result.result, null, 2));
    
  } catch (error) {
    console.error('❌ Error configurando CORS:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  configureCORS();
}

module.exports = { configureCORS };
