/**
 * Script para categorizar productos usando análisis de Cursor AI
 * Prepara productos para que sean analizados directamente por la IA de Cursor
 * Puede procesar lotes o productos individuales
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

/**
 * Análisis inteligente de productos usando conocimiento semántico
 * Este análisis se puede hacer directamente aquí en Cursor
 */
function analyzeProductSemantic(product, categories, categoryMap) {
  const productName = product.name.toLowerCase();
  const description = (product.description || '').toLowerCase();
  const fullText = `${productName} ${description}`.toLowerCase();
  
  // Normalizar "bidé"
  const normalizedText = fullText.replace(/bidé/g, 'bidet');
  const normalizedName = productName.replace(/bidé/g, 'bidet');

  // === REGLAS SEMÁNTICAS MEJORADAS ===
  
  // 1. DETECCIÓN DE COCINA VS BAÑO
  const cocinaKeywords = ['cocina', 'mesada', 'mesada de cocina', 'pileta', 'fregadero', 'lavaplatos'];
  const banoKeywords = ['baño', 'bano', 'bidet', 'lavatorio', 'ducha', 'bañera', 'inodoro', 'sanitario'];
  
  const isCocina = cocinaKeywords.some(kw => normalizedText.includes(kw));
  const isBano = banoKeywords.some(kw => normalizedText.includes(kw));

  // 2. DETECCIÓN DE TIPO (Bicomando vs Monocomando)
  // En cocina, generalmente solo hay monocomando
  // En baño puede haber ambos
  const hasDosLlaves = normalizedText.includes('dos llaves') || 
                       normalizedText.includes('bi comando') ||
                       normalizedText.includes('bicomando');
  const hasMonocomando = normalizedText.includes('monocomando');

  // 3. DETECCIÓN DE USO ESPECÍFICO
  const isLavatorio = normalizedText.includes('lavatorio');
  const isBidet = normalizedText.includes('bidet');
  const isDucha = normalizedText.includes('ducha') || normalizedText.includes('bañera y ducha');
  const isBanera = normalizedText.includes('bañera') && !normalizedText.includes('ducha');

  // === LÓGICA DE DEDUCCIÓN ===
  
  // Regla 1: Si dice "bidet" o "bidé", DEBE estar en baño, no en cocina
  if (isBidet && isCocina) {
    // Corregir: está mal categorizado, debería ser baño
    return findCategoryByPath(categories, categoryMap, ['Grifería', 'Grifería para baño', 'Bi comando', 'Bidet']);
  }

  // Regla 2: Si dice "mesada de cocina", DEBE estar en cocina, no en baño
  if (normalizedText.includes('mesada de cocina') || normalizedText.includes('para mesada')) {
    if (hasMonocomando) {
      return findCategoryByPath(categories, categoryMap, ['Grifería', 'Grifería para cocina', 'Monocomando']);
    }
    // Si no especifica, asumir monocomando (lo más común en cocina)
    return findCategoryByPath(categories, categoryMap, ['Grifería', 'Grifería para cocina', 'Monocomando']);
  }

  // Regla 3: Si dice "cocina" explícitamente
  if (isCocina && !isBano) {
    // Cocina generalmente solo tiene monocomando
    return findCategoryByPath(categories, categoryMap, ['Grifería', 'Grifería para cocina', 'Monocomando']);
  }

  // Regla 4: Si dice "baño" o palabras de baño
  if (isBano && !isCocina) {
    if (isLavatorio) {
      if (hasMonocomando) {
        return findCategoryByPath(categories, categoryMap, ['Grifería', 'Grifería para baño', 'Monocomando', 'Lavatorio']);
      } else if (hasDosLlaves) {
        return findCategoryByPath(categories, categoryMap, ['Grifería', 'Grifería para baño', 'Bi comando', 'Lavatorio']);
      }
    }
    
    if (isBidet) {
      if (hasDosLlaves) {
        return findCategoryByPath(categories, categoryMap, ['Grifería', 'Grifería para baño', 'Bi comando', 'Bidet']);
      } else if (hasMonocomando) {
        return findCategoryByPath(categories, categoryMap, ['Grifería', 'Grifería para baño', 'Monocomando', 'Bidet']);
      }
    }
    
    if (isDucha) {
      if (hasDosLlaves) {
        return findCategoryByPath(categories, categoryMap, ['Grifería', 'Grifería para baño', 'Bi comando', 'Ducha']);
      } else if (hasMonocomando) {
        return findCategoryByPath(categories, categoryMap, ['Grifería', 'Grifería para baño', 'Monocomando', 'Ducha']);
      }
    }
  }

  // Regla 5: Si no se puede determinar, mantener categoría actual
  return null;
}

/**
 * Buscar categoría por path (jerarquía)
 */
function findCategoryByPath(categories, categoryMap, pathNames) {
  // Construir mapa de nombres
  const nameMap = new Map();
  categories.forEach(cat => {
    nameMap.set(cat.name.toLowerCase(), cat);
  });

  // Buscar la categoría más específica del path
  let currentLevel = -1;
  let foundCategory = null;

  for (let i = pathNames.length - 1; i >= 0; i--) {
    const categoryName = pathNames[i].toLowerCase();
    const category = nameMap.get(categoryName);
    
    if (category && category.level > currentLevel) {
      // Verificar que pertenece al path correcto
      let isValid = true;
      if (i < pathNames.length - 1) {
        // Verificar parent
        const parentName = pathNames[i - 1]?.toLowerCase();
        if (parentName && category.parent) {
          const parent = categoryMap.get(category.parent);
          if (parent && parent.name.toLowerCase() !== parentName) {
            isValid = false;
          }
        }
      }
      
      if (isValid) {
        foundCategory = category;
        currentLevel = category.level;
      }
    }
  }

  return foundCategory;
}

/**
 * Análisis mejorado que combina reglas semánticas con scoring
 */
function analyzeProductEnhanced(product, categories, categoryMap) {
  // Primero intentar análisis semántico
  const semanticResult = analyzeProductSemantic(product, categories, categoryMap);
  
  if (semanticResult) {
    return {
      category: semanticResult,
      score: 50, // Alta confianza en análisis semántico
      reason: 'Análisis semántico basado en contexto del producto'
    };
  }

  // Si no hay resultado semántico, usar scoring tradicional mejorado
  return null; // Devolver null para que use el método tradicional
}

/**
 * Preparar productos para análisis interactivo
 */
async function prepareForInteractiveAnalysis() {
  try {
    const exportDir = path.join(__dirname, 'exports');
    const files = await fs.readdir(exportDir);
    
    const productFiles = files.filter(f => f.startsWith('products-') && f.endsWith('.json'));
    const categoryFiles = files.filter(f => f.startsWith('categories-') && f.endsWith('.json'));

    if (productFiles.length === 0 || categoryFiles.length === 0) {
      console.error('❌ No se encontraron archivos de exportación.');
      process.exit(1);
    }

    const latestProductFile = productFiles.sort().reverse()[0];
    const latestCategoryFile = categoryFiles.sort().reverse()[0];

    console.log('📂 Cargando archivos...');
    const productsData = await fs.readFile(path.join(exportDir, latestProductFile), 'utf8');
    const categoriesData = await fs.readFile(path.join(exportDir, latestCategoryFile), 'utf8');

    const products = JSON.parse(productsData);
    const categories = JSON.parse(categoriesData);

    console.log(`\n✅ Cargados ${products.length} productos y ${categories.length} categorías`);

    // Construir mapa de categorías
    const categoryMap = new Map();
    categories.forEach(cat => {
      categoryMap.set(cat._id, cat);
    });

    // Construir paths completos
    function getCategoryPath(categoryId) {
      const category = categoryMap.get(categoryId);
      if (!category) return 'Sin categoría';
      
      const path = [category.name];
      let current = category;
      
      while (current.parent && categoryMap.has(current.parent)) {
        current = categoryMap.get(current.parent);
        path.unshift(current.name);
      }
      
      return path.join(' > ');
    }

    // Procesar productos con análisis mejorado
    console.log(`\n🤖 Analizando productos con deducción semántica...`);
    const results = [];
    let processed = 0;

    for (const product of products) {
      processed++;
      if (processed % 100 === 0) {
        console.log(`   Procesados ${processed}/${products.length}...`);
      }

      const currentCategory = categoryMap.get(product.currentCategory);
      const currentCategoryName = currentCategory ? getCategoryPath(product.currentCategory) : 'Sin categoría';

      // Intentar análisis semántico primero
      const semanticAnalysis = analyzeProductEnhanced(product, categories, categoryMap);
      
      let suggestedCategory = null;
      let score = 0;
      let reason = '';

      if (semanticAnalysis) {
        suggestedCategory = semanticAnalysis.category;
        score = semanticAnalysis.score;
        reason = semanticAnalysis.reason;
      } else {
        // Si no hay resultado semántico, usar el método tradicional
        // (importar función del otro script o implementar aquí)
        reason = 'Análisis por scoring tradicional';
        // Por ahora, mantener la categoría actual si no hay análisis semántico
        suggestedCategory = currentCategory;
        score = 0;
      }

      const suggestedCategoryName = suggestedCategory ? getCategoryPath(suggestedCategory._id) : 'Sin categoría';
      const changed = product.currentCategory !== (suggestedCategory?._id || product.currentCategory);

      results.push({
        productId: product._id,
        productName: product.name,
        sku: product.sku,
        description: product.description || '',
        currentCategory: product.currentCategory,
        currentCategoryName,
        suggestedCategory: suggestedCategory?._id || product.currentCategory,
        suggestedCategoryName,
        score,
        reason,
        changed
      });
    }

    // Generar reporte
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const mappingFile = path.join(exportDir, `category-mapping-semantic-${timestamp}.json`);

    const changes = results.filter(r => r.changed);
    const semanticChanges = results.filter(r => r.changed && r.reason.includes('semántico'));

    const mapping = {
      generatedAt: new Date().toISOString(),
      method: 'semantic-analysis-enhanced',
      totalProducts: products.length,
      categorized: results.length,
      changes: changes.length,
      semanticChanges: semanticChanges.length,
      noChange: results.filter(r => !r.changed).length,
      updates: results
    };

    await fs.writeFile(mappingFile, JSON.stringify(mapping, null, 2), 'utf8');

    console.log('\n📊 RESUMEN DE ANÁLISIS SEMÁNTICO:');
    console.log(`   ✅ Analizados: ${results.length}`);
    console.log(`   🔄 Con cambios sugeridos: ${changes.length}`);
    console.log(`   🧠 Cambios por análisis semántico: ${semanticChanges.length}`);
    console.log(`   ✓ Sin cambios: ${results.length - changes.length}`);
    console.log(`\n💾 Mapeo guardado en: ${mappingFile}`);

    // Mostrar ejemplos de cambios semánticos
    if (semanticChanges.length > 0) {
      console.log('\n📋 Ejemplos de cambios por análisis semántico:');
      semanticChanges.slice(0, 5).forEach((r, idx) => {
        console.log(`\n   ${idx + 1}. ${r.productName} (${r.sku})`);
        console.log(`      Actual: ${r.currentCategoryName}`);
        console.log(`      Sugerido: ${r.suggestedCategoryName}`);
        console.log(`      Razón: ${r.reason}`);
      });
    }

    console.log(`\n💡 Próximo paso: Revisa el mapeo y luego ejecuta:`);
    console.log(`   node scripts/apply-category-updates.js ${path.basename(mappingFile)}`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

if (require.main === module) {
  prepareForInteractiveAnalysis()
    .then(() => {
      console.log('\n✅ Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { analyzeProductSemantic, prepareForInteractiveAnalysis };


