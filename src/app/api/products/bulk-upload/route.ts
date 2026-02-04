import { NextRequest, NextResponse } from 'next/server';
import { ProductBulkService } from '@/services/productBulkService';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Verificar que sea un archivo Excel
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      return NextResponse.json(
        { error: 'Solo se permiten archivos Excel (.xlsx, .xls)' },
        { status: 400 }
      );
    }

    // Leer el archivo Excel
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convertir a JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Obtener headers (primera fila)
    const headers = rawData[0] as string[];
    const dataRows = rawData.slice(1);

    // Validar headers requeridos
    const requiredHeaders = ['name', 'category'];
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));

    // Log de debug para headers
    console.log('📋 Headers detectados:', headers);
    console.log('📋 Headers requeridos:', requiredHeaders);
    console.log('📋 Headers faltantes:', missingHeaders);
    
    if (missingHeaders.length > 0) {
      return NextResponse.json(
        { 
          error: 'Headers faltantes en el Excel',
          missingHeaders,
          headersDetected: headers
        },
        { status: 400 }
      );
    }

    // Inicializar servicio
    const bulkService = new ProductBulkService();

    // Validar y transformar datos
    const validProducts: any[] = [];
    const validationErrors: any[] = [];
    const emptyRows: number[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      
      // Verificar si la fila está completamente vacía
      const isEmptyRow = !row || !Array.isArray(row) || row.every((cell: any) => 
        cell === null || cell === undefined || cell === '' || 
        (typeof cell === 'string' && cell.trim() === '')
      );
      
      if (isEmptyRow) {
        emptyRows.push(i + 2); // +2 porque Excel empieza en 1 y la primera fila son headers
        console.log(`📝 Fila ${i + 2}: VACÍA (ignorada)`);
        continue; // Saltar filas vacías
      }
      
      // Log de debug para filas con datos
      console.log(`📝 Fila ${i + 2}: Procesando...`);
      console.log(`   • Datos:`, row);
      console.log(`   • Headers:`, headers);
      console.log(`   • Mapeo:`, headers.map((header, idx) => `${header}: "${row[idx]}"`).join(', '));
      
      // Validar fila
      const validation = await bulkService.validateRow(row, headers);
      
      if (validation.isValid) {
        // Transformar fila a producto (resuelve categoría a ObjectId, slug único, etc.)
        const processed = await bulkService.transformRow(row, headers);
        if (processed.errors.length > 0) {
          validationErrors.push({
            row: i + 2,
            errors: processed.errors,
            warnings: processed.warnings,
            data: row
          });
          console.log(`   ❌ ERRORES (transformación): ${processed.errors.join(', ')}`);
        } else {
          validProducts.push(processed);
          console.log(`   ✅ VÁLIDA: ${processed.product.name}`);
        }
      } else {
        validationErrors.push({
          row: i + 2, // +2 porque Excel empieza en 1 y la primera fila son headers
          errors: validation.errors,
          warnings: validation.warnings,
          data: row
        });
        console.log(`   ❌ ERRORES: ${validation.errors.join(', ')}`);
        if (validation.warnings.length > 0) {
          console.log(`   ⚠️  ADVERTENCIAS: ${validation.warnings.join(', ')}`);
        }
      }
    }

    // Calcular estadísticas de filas
    const totalRows = dataRows.length;
    const emptyRowsCount = emptyRows.length;
    const validRowsCount = validProducts.length;
    const errorRowsCount = validationErrors.length;
    const processedRowsCount = validRowsCount + errorRowsCount;

    console.log(`📊 Estadísticas del archivo:`);
    console.log(`   • Total de filas: ${totalRows}`);
    console.log(`   • Filas vacías ignoradas: ${emptyRowsCount}`);
    console.log(`   • Filas válidas: ${validRowsCount}`);
    console.log(`   • Filas con errores: ${errorRowsCount}`);
    console.log(`   • Filas procesadas: ${processedRowsCount}`);

    // Solo rechazar si hay muchos errores en las filas procesadas (no en el total)
    if (processedRowsCount > 0 && errorRowsCount > processedRowsCount * 0.9) {
      return NextResponse.json({
        error: 'Demasiados errores de validación en las filas con datos. Por favor, revisa el formato del archivo.',
        details: {
          totalRows,
          emptyRows: emptyRowsCount,
          validRows: validRowsCount,
          errorRows: errorRowsCount,
          processedRows: processedRowsCount,
          errorPercentage: Math.round((errorRowsCount / processedRowsCount) * 100)
        },
        validationErrors: validationErrors.slice(0, 20) // Solo mostrar los primeros 20 errores
      }, { status: 400 });
    }

    // Procesar productos válidos en lotes
    const results = await bulkService.processBatch(validProducts, 100);

    // Combinar errores de validación con errores de procesamiento y duplicados
    const allErrors = [
      ...validationErrors.map(err => ({
        row: err.row,
        error: `Errores de validación: ${err.errors.join(', ')}`,
        data: err.data,
        type: 'validation'
      })),
      ...results.errors.map(err => ({
        row: 'N/A',
        error: err.error,
        data: { name: err.product },
        type: 'insertion'
      })),
      ...results.duplicateDetails.map(dup => ({
        row: 'N/A',
        error: `Duplicado: ${dup.reason}`,
        data: { name: dup.product, existingProduct: dup.existingProduct },
        type: 'duplicate'
      }))
    ];

    return NextResponse.json({
      message: 'Carga masiva completada',
      results: {
        total: totalRows,
        emptyRows: emptyRowsCount,
        validRows: validRowsCount,
        errorRows: errorRowsCount,
        processedRows: processedRowsCount,
        success: results.success,
        duplicates: results.duplicates,
        errors: allErrors,
        processed: results.processed,
        validationErrors: validationErrors.length,
        validProducts: validProducts.length,
        summary: {
          totalFilas: totalRows,
          filasVacias: emptyRowsCount,
          filasValidas: validRowsCount,
          filasConErrores: errorRowsCount,
          productosNuevos: results.success,
          duplicados: results.duplicates,
          errores: results.errors.length
        }
      }
    });

  } catch (error: any) {
    console.error('Error en carga masiva:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
