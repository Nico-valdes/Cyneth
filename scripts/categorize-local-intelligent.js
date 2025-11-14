/**
 * Script para categorizar productos usando análisis local inteligente
 * Sin necesidad de API externa - analiza productos basándose en palabras clave y reglas
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

/**
 * Construir mapa completo de categorías con jerarquía
 */
function buildCategoryMap(categories) {
  const categoryMap = new Map();
  const categoryHierarchy = new Map();

  // Crear mapa básico
  categories.forEach(cat => {
    categoryMap.set(cat._id, {
      ...cat,
      fullPath: [],
      fullPathNames: []
    });
  });

  // Construir paths completos
  function buildPath(categoryId, visited = new Set()) {
    if (visited.has(categoryId)) return []; // Evitar ciclos
    visited.add(categoryId);

    const category = categoryMap.get(categoryId);
    if (!category) return [];

    if (!category.parent) {
      return [categoryId];
    }

    const parentPath = buildPath(category.parent, visited);
    return [...parentPath, categoryId];
  }

  // Construir paths para todas las categorías
  categories.forEach(cat => {
    const path = buildPath(cat._id);
    const pathNames = path.map(id => {
      const foundCat = categoryMap.get(id);
      return foundCat ? foundCat.name : null;
    }).filter(Boolean);
    
    const fullName = pathNames.length > 0 ? pathNames.join(' > ') : cat.name;
    
    categoryMap.set(cat._id, {
      ...cat,
      fullPath: path,
      fullPathNames: pathNames,
      fullName: fullName
    });
  });

  return categoryMap;
}

/**
 * Extraer palabras clave del producto
 */
function extractKeywords(product) {
  const keywords = new Set();
  
  // Normalizar "bidé" a "bidet" en el nombre
  const normalizedName = product.name.toLowerCase().replace(/bidé/g, 'bidet');
  const nameWords = normalizedName
    .split(/[\s\-\–\—]+/)
    .filter(w => w.length > 2);
  nameWords.forEach(w => keywords.add(w));

  // Descripción
  if (product.description) {
    const normalizedDesc = product.description.toLowerCase().replace(/bidé/g, 'bidet');
    const descWords = normalizedDesc
      .split(/[\s\-\–\—,\.]+/)
      .filter(w => w.length > 2);
    descWords.forEach(w => keywords.add(w));
  }

  // Atributos
  if (product.attributes && Array.isArray(product.attributes)) {
    product.attributes.forEach(attr => {
      if (attr.value) {
        const normalizedAttr = attr.value.toLowerCase().replace(/bidé/g, 'bidet');
        const attrWords = normalizedAttr
          .split(/[\s\-\–\—,\.]+/)
          .filter(w => w.length > 2);
        attrWords.forEach(w => keywords.add(w));
      }
    });
  }

  return Array.from(keywords);
}

/**
 * Calcular similitud entre palabras clave y categoría
 */
function calculateCategoryScore(product, category, categoryMap) {
  const keywords = extractKeywords(product);
  let score = 0;

  const categoryName = (category.name || '').toLowerCase();
  const categoryFullName = (category.fullName || category.name || '').toLowerCase();
  const categorySlug = (category.slug || '').toLowerCase();

  // Normalizar "bidé" a "bidet" en todas las búsquedas
  const normalizedKeywords = keywords.map(k => k === 'bidé' ? 'bidet' : k);
  const productNameNormalized = product.name.toLowerCase().replace(/bidé/g, 'bidet');
  const descriptionNormalized = (product.description || '').toLowerCase().replace(/bidé/g, 'bidet');

  // Palabras clave importantes
  const importantKeywords = [
    'griferia', 'grifería', 'grifo', 'llave', 'monocomando', 'bicomando', 'bi comando',
    'caño', 'caños', 'tubo', 'conexion', 'conexión',
    'sanitario', 'inodoro', 'bidet', 'bidé', 'bañera', 'ducha', 'lavatorio',
    'termofusion', 'termofusión', 'polipropileno', 'epoxi',
    'desague', 'desagüe', 'gas', 'agua', 'ventilacion', 'ventilación',
    'cocina', 'mesada', 'baño', 'bano'
  ];

  // === DETECCIÓN ESPECÍFICA: COCINA VS BAÑO ===
  const isCocina = productNameNormalized.includes('cocina') || 
                   productNameNormalized.includes('mesada') ||
                   descriptionNormalized.includes('cocina') ||
                   descriptionNormalized.includes('mesada');
  
  const isBano = productNameNormalized.includes('baño') || 
                 productNameNormalized.includes('bano') ||
                 descriptionNormalized.includes('baño') ||
                 descriptionNormalized.includes('bano') ||
                 productNameNormalized.includes('bidet') ||
                 productNameNormalized.includes('bidé') ||
                 productNameNormalized.includes('lavatorio') ||
                 productNameNormalized.includes('ducha') ||
                 productNameNormalized.includes('bañera');

  // Bonus fuerte si coincide con cocina/baño
  if (isCocina && categoryFullName.includes('cocina')) {
    score += 10;
  } else if (isCocina && categoryFullName.includes('baño')) {
    score -= 15; // Penalizar fuerte si está mal categorizado
  }

  if (isBano && categoryFullName.includes('baño')) {
    score += 10;
  } else if (isBano && categoryFullName.includes('cocina')) {
    score -= 15; // Penalizar fuerte si está mal categorizado
  }

  // === DETECCIÓN ESPECÍFICA: BICOMANDO VS MONOCOMANDO ===
  const isMonocomando = productNameNormalized.includes('monocomando') ||
                        descriptionNormalized.includes('monocomando');
  
  const isBicomando = productNameNormalized.includes('bicomando') ||
                      productNameNormalized.includes('bi comando') ||
                      productNameNormalized.includes('dos llaves') ||
                      descriptionNormalized.includes('bicomando') ||
                      descriptionNormalized.includes('bi comando');

  if (isMonocomando && categoryName.includes('monocomando')) {
    score += 8;
  } else if (isMonocomando && (categoryName.includes('bi comando') || categoryName.includes('bicomando'))) {
    score -= 12; // Penalizar fuerte
  }

  if (isBicomando && (categoryName.includes('bi comando') || categoryName.includes('bicomando'))) {
    score += 8;
  } else if (isBicomando && categoryName.includes('monocomando')) {
    score -= 12; // Penalizar fuerte
  }

  // === DETECCIÓN ESPECÍFICA: LAVATORIO, BIDET, DUCHA ===
  const isLavatorio = productNameNormalized.includes('lavatorio') ||
                      descriptionNormalized.includes('lavatorio');
  
  const isBidet = productNameNormalized.includes('bidet') ||
                  productNameNormalized.includes('bidé') ||
                  descriptionNormalized.includes('bidet') ||
                  descriptionNormalized.includes('bidé');
  
  const isDucha = productNameNormalized.includes('ducha') ||
                  descriptionNormalized.includes('ducha') ||
                  productNameNormalized.includes('bañera y ducha');
  
  const isBanera = productNameNormalized.includes('bañera') ||
                   descriptionNormalized.includes('bañera');

  // Bonus fuerte para coincidencias específicas
  if (isLavatorio && categoryName.includes('lavatorio')) {
    score += 10;
  }
  if (isBidet && categoryName.includes('bidet')) {
    score += 10;
  }
  if (isDucha && categoryName.includes('ducha')) {
    score += 10;
  }
  if (isBanera && categoryName.includes('bañera')) {
    score += 8;
  }

  // Penalizar si está en categoría incorrecta
  if (isLavatorio && !categoryName.includes('lavatorio') && categoryFullName.includes('baño')) {
    score -= 8;
  }
  if (isBidet && !categoryName.includes('bidet') && categoryFullName.includes('baño')) {
    score -= 8;
  }
  if (isDucha && !categoryName.includes('ducha') && categoryFullName.includes('baño')) {
    score -= 8;
  }

  // Puntaje por coincidencias en nombre
  normalizedKeywords.forEach(keyword => {
    if (categoryFullName.includes(keyword)) {
      const weight = importantKeywords.includes(keyword) ? 3 : 1;
      score += weight;
    }
    if (categoryName.includes(keyword)) {
      score += 2;
    }
    if (categorySlug.includes(keyword)) {
      score += 1;
    }
  });

  // Puntaje por palabras clave específicas en atributos
  if (product.attributes && Array.isArray(product.attributes)) {
    product.attributes.forEach(attr => {
      const attrValue = (attr.value || '').toLowerCase().replace(/bidé/g, 'bidet');
      
      // Grifería - Tipo
      if (attrValue.includes('monocomando') && categoryName.includes('monocomando')) {
        score += 6;
      }
      if (attrValue.includes('bicomando') || attrValue.includes('bi comando')) {
        if (categoryName.includes('bi comando') || categoryName.includes('bicomando')) {
          score += 6;
        }
      }
      
      // Grifería - Uso
      if (attrValue.includes('ducha') && categoryName.includes('ducha')) {
        score += 5;
      }
      if (attrValue.includes('lavatorio') && categoryName.includes('lavatorio')) {
        score += 5;
      }
      if (attrValue.includes('bidet') && categoryName.includes('bidet')) {
        score += 5;
      }
      if (attrValue.includes('bañera') && categoryName.includes('bañera')) {
        score += 5;
      }
      if (attrValue.includes('cocina') && categoryFullName.includes('cocina')) {
        score += 5;
      }
      if (attrValue.includes('baño') && categoryFullName.includes('baño')) {
        score += 5;
      }
    });
  }

  // Puntaje por palabras en el nombre del producto (normalizado)
  if (productNameNormalized.includes('monocomando') && categoryName.includes('monocomando')) {
    score += 7;
  }
  if (productNameNormalized.includes('bicomando') || productNameNormalized.includes('bi comando')) {
    if (categoryName.includes('bi comando') || categoryName.includes('bicomando')) {
      score += 7;
    }
  }
  if (productNameNormalized.includes('ducha') && categoryName.includes('ducha')) {
    score += 6;
  }
  if (productNameNormalized.includes('lavatorio') && categoryName.includes('lavatorio')) {
    score += 6;
  }
  if ((productNameNormalized.includes('bidet') || productNameNormalized.includes('bidé')) && categoryName.includes('bidet')) {
    score += 6;
  }
  if (productNameNormalized.includes('bañera') && categoryName.includes('bañera')) {
    score += 5;
  }

  // Penalizar si es categoría muy genérica y el producto es específico
  if (category.level === 0 && score > 0) {
    score = score * 0.7; // Reducir puntaje de categorías principales
  }

  // Bonus por estar en la categoría más específica (nivel más bajo)
  if (category.level >= 3) {
    score += 2; // Preferir categorías más específicas
  }

  return score;
}

/**
 * Análisis semántico mejorado - deducción inteligente
 */
function semanticAnalysis(product, categories, categoryMap) {
  const productName = product.name.toLowerCase().replace(/bidé/g, 'bidet');
  const description = (product.description || '').toLowerCase().replace(/bidé/g, 'bidet');
  const fullText = `${productName} ${description}`;
  
  // === REGLAS DE DEDUCCIÓN SEMÁNTICA ===
  
  // 1. BIDET siempre va en BAÑO, nunca en cocina
  if (fullText.includes('bidet') || fullText.includes('bidé')) {
    // Buscar categoría de bidet en baño
    const bidetCategories = categories.filter(cat => 
      cat.name.toLowerCase().includes('bidet') && 
      categoryMap.get(cat._id)?.fullName?.toLowerCase().includes('baño')
    );
    
    if (bidetCategories.length > 0) {
      // Determinar si es bicomando o monocomando
      const hasDosLlaves = fullText.includes('dos llaves') || 
                           fullText.includes('bi comando') || 
                           fullText.includes('bicomando');
      const hasMonocomando = fullText.includes('monocomando');
      
      // Buscar la categoría más específica
      let targetCategory = null;
      
      if (hasDosLlaves) {
        targetCategory = bidetCategories.find(cat => 
          categoryMap.get(cat._id)?.fullName?.toLowerCase().includes('bi comando') ||
          categoryMap.get(cat._id)?.fullName?.toLowerCase().includes('bicomando')
        );
      } else if (hasMonocomando) {
        targetCategory = bidetCategories.find(cat => 
          categoryMap.get(cat._id)?.fullName?.toLowerCase().includes('monocomando')
        );
      }
      
      // Si no se especifica, preferir bicomando (más común en bidet)
      if (!targetCategory && bidetCategories.length > 0) {
        targetCategory = bidetCategories.find(cat => 
          categoryMap.get(cat._id)?.fullName?.toLowerCase().includes('bi comando') ||
          categoryMap.get(cat._id)?.fullName?.toLowerCase().includes('bicomando')
        ) || bidetCategories[0];
      }
      
      if (targetCategory) {
        return {
          category: targetCategory,
          score: 50,
          reason: 'Deducción semántica: bidet siempre va en baño'
        };
      }
    }
  }

  // 2. MESADA DE COCINA siempre va en COCINA > MONOCOMANDO (cocina no tiene bicomando típicamente)
  if (fullText.includes('mesada de cocina') || fullText.includes('para mesada')) {
    const cocinaMonocomando = categories.find(cat => 
      categoryMap.get(cat._id)?.fullName?.toLowerCase().includes('cocina') &&
      categoryMap.get(cat._id)?.fullName?.toLowerCase().includes('monocomando')
    );
    
    if (cocinaMonocomando) {
      return {
        category: cocinaMonocomando,
        score: 50,
        reason: 'Deducción semántica: mesada de cocina usa monocomando'
      };
    }
  }

  // 3. LAVATORIO en BAÑO
  if (fullText.includes('lavatorio') && !fullText.includes('cocina')) {
    const lavatorioCategories = categories.filter(cat => 
      cat.name.toLowerCase().includes('lavatorio') && 
      categoryMap.get(cat._id)?.fullName?.toLowerCase().includes('baño')
    );
    
    if (lavatorioCategories.length > 0) {
      const hasDosLlaves = fullText.includes('dos llaves') || 
                           fullText.includes('bi comando') || 
                           fullText.includes('bicomando');
      const hasMonocomando = fullText.includes('monocomando');
      
      let targetCategory = lavatorioCategories.find(cat => {
        const fullName = categoryMap.get(cat._id)?.fullName?.toLowerCase() || '';
        if (hasDosLlaves) return fullName.includes('bi comando') || fullName.includes('bicomando');
        if (hasMonocomando) return fullName.includes('monocomando');
        return true; // Si no especifica, tomar la primera
      });
      
      if (!targetCategory) targetCategory = lavatorioCategories[0];
      
      if (targetCategory) {
        return {
          category: targetCategory,
          score: 45,
          reason: 'Deducción semántica: lavatorio va en baño'
        };
      }
    }
  }

  // 4. DUCHA en BAÑO
  if (fullText.includes('ducha') && !fullText.includes('cocina')) {
    const duchaCategories = categories.filter(cat => 
      cat.name.toLowerCase().includes('ducha') && 
      categoryMap.get(cat._id)?.fullName?.toLowerCase().includes('baño')
    );
    
    if (duchaCategories.length > 0) {
      const hasDosLlaves = fullText.includes('dos llaves') || 
                           fullText.includes('bi comando') || 
                           fullText.includes('bicomando');
      const hasMonocomando = fullText.includes('monocomando');
      
      let targetCategory = duchaCategories.find(cat => {
        const fullName = categoryMap.get(cat._id)?.fullName?.toLowerCase() || '';
        if (hasDosLlaves) return fullName.includes('bi comando') || fullName.includes('bicomando');
        if (hasMonocomando) return fullName.includes('monocomando');
        return true;
      });
      
      if (!targetCategory) targetCategory = duchaCategories[0];
      
      if (targetCategory) {
        return {
          category: targetCategory,
          score: 45,
          reason: 'Deducción semántica: ducha va en baño'
        };
      }
    }
  }

  // 5. COCINA explícita - siempre monocomando (no bicomando en cocina)
  if (fullText.includes('cocina') && !fullText.includes('baño') && !fullText.includes('bidet')) {
    const cocinaMonocomando = categories.find(cat => 
      categoryMap.get(cat._id)?.fullName?.toLowerCase().includes('cocina') &&
      categoryMap.get(cat._id)?.fullName?.toLowerCase().includes('monocomando')
    );
    
    if (cocinaMonocomando) {
      return {
        category: cocinaMonocomando,
        score: 40,
        reason: 'Deducción semántica: cocina usa monocomando'
      };
    }
  }

  return null; // No hay deducción semántica, usar scoring tradicional
}

/**
 * Encontrar la mejor categoría para un producto
 */
function findBestCategory(product, categories, categoryMap) {
  // Primero intentar análisis semántico
  const semanticResult = semanticAnalysis(product, categories, categoryMap);
  if (semanticResult) {
    return semanticResult;
  }

  // Si no hay resultado semántico, usar scoring tradicional
  let bestCategory = null;
  let bestScore = 0;

  categories.forEach(category => {
    const score = calculateCategoryScore(product, category, categoryMap);
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  });

  // Si no hay buena coincidencia, mantener la categoría actual
  if (bestScore < 2) {
    const currentCategory = categoryMap.get(product.currentCategory);
    if (currentCategory) {
      return {
        category: currentCategory,
        score: 0,
        reason: 'Sin coincidencias claras, mantener categoría actual'
      };
    }
  }

  return {
    category: bestCategory,
    score: bestScore,
    reason: bestScore >= 5 ? 'Coincidencia fuerte' : 
            bestScore >= 2 ? 'Coincidencia moderada' : 
            'Coincidencia débil'
  };
}

/**
 * Procesar todos los productos
 */
async function categorizeProducts() {
  try {
    const exportDir = path.join(__dirname, 'exports');
    const files = await fs.readdir(exportDir);
    
    const productFiles = files.filter(f => f.startsWith('products-') && f.endsWith('.json'));
    const categoryFiles = files.filter(f => f.startsWith('categories-') && f.endsWith('.json'));

    if (productFiles.length === 0 || categoryFiles.length === 0) {
      console.error('❌ No se encontraron archivos de exportación.');
      console.error('💡 Ejecuta primero: node scripts/export-for-categorization.js');
      process.exit(1);
    }

    const latestProductFile = productFiles.sort().reverse()[0];
    const latestCategoryFile = categoryFiles.sort().reverse()[0];

    console.log('📂 Cargando archivos...');
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

    // Construir mapa de categorías
    console.log('\n🔨 Construyendo mapa de categorías...');
    const categoryMap = buildCategoryMap(categories);

    // Procesar productos
    console.log(`\n🤖 Analizando ${products.length} productos...`);
    const results = [];
    let processed = 0;

    for (const product of products) {
      processed++;
      if (processed % 100 === 0) {
        console.log(`   Procesados ${processed}/${products.length}...`);
      }

      const currentCategory = categoryMap.get(product.currentCategory);
      const currentCategoryName = currentCategory ? currentCategory.fullName : 'Sin categoría';

      const bestMatch = findBestCategory(product, categories, categoryMap);
      const suggestedCategory = bestMatch.category;
      
      // Si no hay categoría sugerida, mantener la actual
      const finalSuggestedCategory = suggestedCategory || currentCategory;
      const suggestedCategoryName = finalSuggestedCategory ? finalSuggestedCategory.fullName : 'Sin categoría';
      const suggestedCategoryId = finalSuggestedCategory ? finalSuggestedCategory._id : product.currentCategory;
      
      const changed = product.currentCategory !== suggestedCategoryId && suggestedCategory !== null;

      results.push({
        productId: product._id,
        productName: product.name,
        sku: product.sku,
        currentCategory: product.currentCategory,
        currentCategoryName,
        suggestedCategory: suggestedCategoryId,
        suggestedCategoryName,
        score: bestMatch.score,
        reason: bestMatch.reason,
        changed,
        keywords: extractKeywords(product).slice(0, 10) // Primeras 10 palabras clave
      });
    }

    // Generar reporte
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const mappingFile = path.join(exportDir, `category-mapping-local-${timestamp}.json`);

    const changes = results.filter(r => r.changed);
    const highConfidence = changes.filter(r => r.score >= 5);
    const mediumConfidence = changes.filter(r => r.score >= 2 && r.score < 5);
    const lowConfidence = changes.filter(r => r.score < 2);

    const mapping = {
      generatedAt: new Date().toISOString(),
      method: 'local-intelligent-analysis',
      totalProducts: products.length,
      categorized: results.length,
      changes: changes.length,
      noChange: results.filter(r => !r.changed).length,
      confidence: {
        high: highConfidence.length,
        medium: mediumConfidence.length,
        low: lowConfidence.length
      },
      updates: results.map(r => ({
        productId: r.productId,
        productName: r.productName,
        sku: r.sku,
        currentCategory: r.currentCategory,
        currentCategoryName: r.currentCategoryName,
        suggestedCategory: r.suggestedCategory,
        suggestedCategoryName: r.suggestedCategoryName,
        score: r.score,
        reason: r.reason,
        changed: r.changed,
        keywords: r.keywords
      }))
    };

    await fs.writeFile(
      mappingFile,
      JSON.stringify(mapping, null, 2),
      'utf8'
    );

    // Mostrar resumen
    console.log('\n📊 RESUMEN DE ANÁLISIS:');
    console.log(`   ✅ Analizados: ${results.length}`);
    console.log(`   🔄 Con cambios sugeridos: ${changes.length}`);
    console.log(`   ✓ Sin cambios: ${results.length - changes.length}`);
    console.log(`\n   📈 Confianza:`);
    console.log(`      🔴 Alta (score >= 5): ${highConfidence.length}`);
    console.log(`      🟡 Media (score 2-4): ${mediumConfidence.length}`);
    console.log(`      🟢 Baja (score < 2): ${lowConfidence.length}`);
    console.log(`\n💾 Mapeo guardado en: ${mappingFile}`);

    // Mostrar algunos ejemplos de alta confianza
    if (highConfidence.length > 0) {
      console.log('\n📋 Ejemplos de cambios sugeridos (alta confianza):');
      highConfidence.slice(0, 5).forEach((r, idx) => {
        console.log(`\n   ${idx + 1}. ${r.productName} (${r.sku})`);
        console.log(`      Actual: ${r.currentCategoryName}`);
        console.log(`      Sugerido: ${r.suggestedCategoryName}`);
        console.log(`      Score: ${r.score} - ${r.reason}`);
      });
    }

    console.log(`\n💡 Próximo paso: Revisa el mapeo y luego ejecuta:`);
    console.log(`   node scripts/apply-category-updates.js ${path.basename(mappingFile)}`);

  } catch (error) {
    console.error('❌ Error durante el análisis:', error);
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

