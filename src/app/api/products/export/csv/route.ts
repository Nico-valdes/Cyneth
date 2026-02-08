import { connectToDatabase } from '@/libs/mongoConnect';
import ProductService from '@/services/ProductService';

const MAX_EXPORT = 50000;

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function row(values: unknown[]): string {
  return values.map(escapeCsv).join(',');
}

export async function GET() {
  try {
    const client = await connectToDatabase();
    const db = client.db('cyneth');
    const productService = new ProductService(db);

    const filters = { showAll: true };
    const options = {
      limit: MAX_EXPORT,
      skip: 0,
      sort: { createdAt: -1 } as Record<string, 1 | -1>,
    };

    const products = await productService.findWithCategories(filters, options);

    const headers = [
      '_id',
      'name',
      'sku',
      'slug',
      'brand',
      'brandSlug',
      'description',
      'category',
      'categoryBreadcrumb',
      'active',
      'featured',
      'defaultImage',
      'colorVariantsCount',
      'measurementsEnabled',
      'measurementsVariants',
      'createdAt',
      'updatedAt',
    ];

    const lines: string[] = [row(headers)];

    for (const p of products) {
      const categoryId = p.category?.toString?.() ?? p.category ?? '';
      const colorCount = Array.isArray(p.colorVariants) ? p.colorVariants.length : 0;
      const measEnabled = p.measurements?.enabled === true;
      const measVariants = Array.isArray(p.measurements?.variants)
        ? JSON.stringify(p.measurements.variants)
        : '';
      const createdAt =
        p.createdAt instanceof Date
          ? p.createdAt.toISOString()
          : typeof p.createdAt === 'string'
            ? p.createdAt
            : '';
      const updatedAt =
        p.updatedAt instanceof Date
          ? p.updatedAt.toISOString()
          : typeof p.updatedAt === 'string'
            ? p.updatedAt
            : '';

      lines.push(
        row([
          p._id?.toString?.() ?? p._id ?? '',
          p.name ?? '',
          p.sku ?? '',
          p.slug ?? '',
          p.brand ?? '',
          p.brandSlug ?? '',
          p.description ?? '',
          categoryId,
          (p as { categoryBreadcrumb?: string }).categoryBreadcrumb ?? '',
          p.active === true ? '1' : '0',
          p.featured === true ? '1' : '0',
          p.defaultImage ?? '',
          colorCount,
          measEnabled ? '1' : '0',
          measVariants,
          createdAt,
          updatedAt,
        ])
      );
    }

    const csv = '\uFEFF' + lines.join('\r\n'); // BOM para Excel en UTF-8
    const filename = `productos_${new Date().toISOString().slice(0, 10)}.csv`;

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exportando CSV:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error al exportar productos' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
