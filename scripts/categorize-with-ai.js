/**
 * Script para categorizar productos automáticamente usando IA
 * Analiza cada producto y sugiere la categoría más apropiada
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');

/**
 * Construir jerarquía de categorías para contexto
 */
function buildCategoryHierarchy(categories) {
  const categoryMap = new Map();
  const rootCategories = [];

  // Crear mapa de categorías
  categories.forEach(cat => {
    categoryMap.set(cat._id, {
      ...cat,
      children: []
    });
  });

  // Construir árbol
  categories.forEach(cat => {
    const category = categoryMap.get(cat._id);
    if (cat.parent && categoryMap.has(cat.parent)) {
      categoryMap.get(cat.parent).children.push(category);
    } else {
      rootCategories.push(category);
    }
  });

  return { categoryMap, rootCategories };
}

/**
 * Generar descripción de categorías para el prompt
 */
function generateCategoryDescription(categories) {
  const categoryList = categories.map(cat => {
    const indent = '  '.repeat(cat.level || 0);
    const parentInfo = cat.parent ? ` (hijo de ${cat.parent})` : '';
    return `${indent}- ${cat.name} (ID: ${cat._id}, Nivel: ${cat.level}, Slug: ${cat.slug})${parentInfo}`;
  }).join('\n');

  return categoryList;
}

/**
 * Categorizar un producto usando IA (OpenAI API)
 */
async function categorizeProduct(product, categories, categoryMap) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY no configurada en .env');
    }

    // Construir información del producto
    const productInfo = {
      nombre: product.name,
      sku: product.sku,
      marca: product.brand || 'No especificada',
      descripción: product.description || 'Sin descripción',
      atributos: product.attributes || [],
      especificaciones: product.specifications || {},
      categoría_actual: product.currentCategory ? 
        categoryMap.get(product.currentCategory)?.name : 'Sin categoría'
    };

    // Generar lista de categorías
    const categoryList = generateCategoryDescription(categories);

    // Prompt para la IA
    const prompt = `Eres un experto en categorización de productos. Analiza el siguiente producto y determina cuál es la categoría más apropiada de la lista proporcionada.

INFORMACIÓN DEL PRODUCTO:
${JSON.stringify(productInfo, null, 2)}

CATEGORÍAS DISPONIBLES:
${categoryList}

INSTRUCCIONES:
1. Analiza el nombre, descripción, marca y atributos del producto
2. Identifica la categoría MÁS ESPECÍFICA y APROPIADA de la lista
3. Si el producto encaja mejor en una subcategoría, elige esa en lugar de la categoría padre
4. Responde SOLO con el ID de la categoría elegida, sin texto adicional

RESPUESTA (solo el ID de la categoría):`;

    // Llamar a la API de OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente especializado en categorización de productos. Responde siempre con solo el ID de la categoría, sin explicaciones adicionales.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 50
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const suggestedCategoryId = data.choices[0].message.content.trim();
    
    // Validar que el ID existe
    if (categoryMap.has(suggestedCategoryId)) {
      return suggestedCategoryId;
    }

    // Si no encuentra el ID exacto, intentar buscar por nombre
    const categoryName = suggestedCategoryId.toLowerCase();
    const foundCategory = categories.find(cat => 
      cat._id.toLowerCase() === categoryName || 
      cat.name.toLowerCase().includes(categoryName) ||
      cat.slug.toLowerCase().includes(categoryName)
    );

    return foundCategory ? foundCategory._id : null;

  } catch (error) {
    console.error(`❌ Error categorizando producto ${product.sku}:`, error.message);
    return null;
  }
}

/**
 * Procesar todos los productos en lotes
 */
async function categorizeAllProducts(products, categories, options = {}) {
  const { batchSize = 10, delayMs = 1000 } = options;
  const categoryMap = new Map(categories.map(cat => [cat._id, cat]));
  const results = [];
  const errors = [];

  console.log(`\n🤖 Iniciando categorización de ${products.length} productos...`);
  console.log(`   📦 Tamaño de lote: ${batchSize}`);
  console.log(`   ⏱️  Delay entre lotes: ${delayMs}ms\n`);

  // Procesar en lotes para evitar rate limits
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(products.length / batchSize);

    console.log(`📦 Procesando lote ${batchNum}/${totalBatches} (${batch.length} productos)...`);

    const batchPromises = batch.map(async (product) => {
      const suggestedCategory = await categorizeProduct(product, categories, categoryMap);
      
      if (suggestedCategory) {
        const currentCategoryName = product.currentCategory ? 
          categoryMap.get(product.currentCategory)?.name : 'Sin categoría';
        const suggestedCategoryName = categoryMap.get(suggestedCategory)?.name;

        return {
          productId: product._id,
          productName: product.name,
          sku: product.sku,
          currentCategory: product.currentCategory,
          currentCategoryName,
          suggestedCategory,
          suggestedCategoryName,
          changed: product.currentCategory !== suggestedCategory
        };
      } else {
        errors.push({
          productId: product._id,
          productName: product.name,
          sku: product.sku,
          error: 'No se pudo determinar categoría'
        });
        return null;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults.filter(r => r !== null));

    // Delay entre lotes para evitar rate limits
    if (i + batchSize < products.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return { results, errors };
}

/**
 * Función principal
 */
async function categorizeProducts() {
  try {
    // Encontrar archivos JSON más recientes
    const exportDir = path.join(__dirname, 'exports');
    const files = await fs.readdir(exportDir);
    
    const productFiles = files.filter(f => f.startsWith('products-') && f.endsWith('.json'));
    const categoryFiles = files.filter(f => f.startsWith('categories-') && f.endsWith('.json'));

    if (productFiles.length === 0 || categoryFiles.length === 0) {
      console.error('❌ No se encontraron archivos de exportación.');
      console.error('💡 Ejecuta primero: node scripts/export-for-categorization.js');
      process.exit(1);
    }

    // Obtener archivos más recientes
    const latestProductFile = productFiles.sort().reverse()[0];
    const latestCategoryFile = categoryFiles.sort().reverse()[0];

    console.log('📂 Cargando archivos de exportación...');
    console.log(`   📦 Productos: ${latestProductFile}`);
    console.log(`   📂 Categorías: ${latestCategoryFile}`);

    const productsData = await fs.readFile(
      path.join(exportDir, latestProductFile),
      'utf8'
    );
    const categoriesData = await fs.readFile(
      path.join(exportDir, latestCategoryFile),
      'utf8'
    );

    const products = JSON.parse(productsData);
    const categories = JSON.parse(categoriesData);

    console.log(`\n✅ Cargados ${products.length} productos y ${categories.length} categorías`);

    // Verificar API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ No se encontró OPENAI_API_KEY en .env');
      console.error('💡 Agrega OPENAI_API_KEY=tu_api_key a tu archivo .env');
      process.exit(1);
    }

    // Categorizar productos
    const { results, errors } = await categorizeAllProducts(
      products,
      categories,
      {
        batchSize: parseInt(process.env.AI_BATCH_SIZE) || 10,
        delayMs: parseInt(process.env.AI_DELAY_MS) || 1000
      }
    );

    // Generar reporte
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const mappingFile = path.join(exportDir, `category-mapping-${timestamp}.json`);

    const mapping = {
      generatedAt: new Date().toISOString(),
      totalProducts: products.length,
      categorized: results.length,
      errors: errors.length,
      changes: results.filter(r => r.changed).length,
      noChange: results.filter(r => !r.changed).length,
      updates: results.map(r => ({
        productId: r.productId,
        productName: r.productName,
        sku: r.sku,
        currentCategory: r.currentCategory,
        suggestedCategory: r.suggestedCategory,
        changed: r.changed
      }))
    };

    await fs.writeFile(
      mappingFile,
      JSON.stringify(mapping, null, 2),
      'utf8'
    );

    // Mostrar resumen
    console.log('\n📊 RESUMEN DE CATEGORIZACIÓN:');
    console.log(`   ✅ Categorizados: ${results.length}`);
    console.log(`   🔄 Con cambios: ${mapping.changes}`);
    console.log(`   ✓ Sin cambios: ${mapping.noChange}`);
    console.log(`   ❌ Errores: ${errors.length}`);
    console.log(`\n💾 Mapeo guardado en: ${mappingFile}`);

    if (errors.length > 0) {
      const errorsFile = path.join(exportDir, `errors-${timestamp}.json`);
      await fs.writeFile(
        errorsFile,
        JSON.stringify(errors, null, 2),
        'utf8'
      );
      console.log(`   ⚠️  Errores guardados en: ${errorsFile}`);
    }

    console.log(`\n💡 Próximo paso: Revisa el mapeo y luego ejecuta:`);
    console.log(`   node scripts/apply-category-updates.js ${path.basename(mappingFile)}`);

  } catch (error) {
    console.error('❌ Error durante la categorización:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  categorizeProducts()
    .then(() => {
      console.log('\n✅ Proceso completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error en el proceso:', error);
      process.exit(1);
    });
}

module.exports = { categorizeProducts };

