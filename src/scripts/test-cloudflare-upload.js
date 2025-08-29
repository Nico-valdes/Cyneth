/**
 * Script de prueba para verificar la funcionalidad de Cloudflare Images
 * Ejecutar con: node src/scripts/test-cloudflare-upload.js
 */

// Cargar variables de entorno desde .env
require('dotenv').config({ path: '.env' });

const testImageUrl = 'https://griferiapeirano.com/wp-content/uploads/2025/05/62-175DG_Pulse-lavatorio-de-pared-Dark-Gold.jpg';

async function testCloudflareUpload() {
  console.log('🧪 Probando subida de imagen a Cloudflare...\n');
  
  try {
    console.log(`📸 URL de imagen de prueba: ${testImageUrl}\n`);
    
    const response = await fetch('http://localhost:3000/api/images/upload-from-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl: testImageUrl })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ ¡Éxito! Imagen subida a Cloudflare');
      console.log(`🔗 URL original: ${data.originalUrl}`);
      console.log(`☁️  URL de Cloudflare: ${data.cloudflareUrl}`);
      console.log(`📝 Mensaje: ${data.message}\n`);
      
      // Verificar que la imagen se puede acceder
      console.log('🔍 Verificando acceso a la imagen...');
      const imageResponse = await fetch(data.cloudflareUrl);
      if (imageResponse.ok) {
        console.log('✅ Imagen accesible desde Cloudflare');
      } else {
        console.log('❌ Error accediendo a la imagen desde Cloudflare');
      }
      
    } else {
      console.log('❌ Error en la subida:');
      console.log(`   Estado: ${response.status}`);
      console.log(`   Error: ${data.error}\n`);
    }
    
  } catch (error) {
    console.log('❌ Error de conexión:');
    console.log(`   ${error.message}\n`);
  }
}

// Verificar variables de entorno
function checkEnvironmentVariables() {
  console.log('🔧 Verificando variables de entorno...\n');
  
  const requiredVars = [
    'NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID',
    'NEXT_PUBLIC_CLOUDFLARE_API_TOKEN'
  ];
  
  let allSet = true;
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Configurado`);
    } else {
      console.log(`❌ ${varName}: No configurado`);
      allSet = false;
    }
  });
  
  console.log('');
  return allSet;
}

// Función principal
async function main() {
  console.log('🚀 Iniciando pruebas de Cloudflare Images\n');
  
  // Verificar variables de entorno
  const envOk = checkEnvironmentVariables();
  
  if (!envOk) {
    console.log('⚠️  Por favor, configura las variables de entorno antes de continuar.');
    console.log('📖 Consulta CLOUDFLARE_SETUP.md para más información.\n');
    return;
  }
  
  // Verificar que el servidor esté corriendo
  try {
    const healthCheck = await fetch('http://localhost:3000/api/images/upload-from-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: 'test' })
    });
    
    if (healthCheck.status === 400) {
      console.log('✅ Servidor API funcionando (error 400 esperado para URL inválida)\n');
    } else {
      console.log('⚠️  Servidor API respondió con estado inesperado\n');
    }
    
  } catch (error) {
    console.log('❌ No se puede conectar al servidor API');
    console.log('   Asegúrate de que el servidor esté corriendo en http://localhost:3000\n');
    return;
  }
  
  // Ejecutar prueba de subida
  await testCloudflareUpload();
  
  console.log('🏁 Pruebas completadas');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testCloudflareUpload, checkEnvironmentVariables };
