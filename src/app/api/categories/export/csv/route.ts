import { connectToDatabase } from '@/libs/mongoConnect';

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
    const categoryService = new CategoryService(db);

    // Todas las categorías (activas e inactivas), ordenadas
    const categories = await db
      .collection('categories')
      .find({})
      .sort({ level: 1, order: 1, name: 1 })
      .toArray();

    const headers = [
      '_id',
      'name',
      'slug',
      'description',
      'parent',
      'level',
      'type',
      'productCount',
      'totalProductCount',
      'order',
      'active',
      'createdAt',
      'updatedAt',
    ];

    const lines: string[] = [row(headers)];

    for (const c of categories) {
      const parent =
        c.parent?.toString?.() ?? (typeof c.parent === 'string' ? c.parent : '') ?? '';
      const createdAt =
        c.createdAt instanceof Date
          ? c.createdAt.toISOString()
          : typeof c.createdAt === 'string'
            ? c.createdAt
            : '';
      const updatedAt =
        c.updatedAt instanceof Date
          ? c.updatedAt.toISOString()
          : typeof c.updatedAt === 'string'
            ? c.updatedAt
            : '';

      lines.push(
        row([
          c._id?.toString?.() ?? c._id ?? '',
          c.name ?? '',
          c.slug ?? '',
          c.description ?? '',
          parent,
          c.level ?? '',
          c.type ?? '',
          c.productCount ?? '',
          c.totalProductCount ?? '',
          c.order ?? '',
          c.active === true ? '1' : '0',
          createdAt,
          updatedAt,
        ])
      );
    }

    const csv = '\uFEFF' + lines.join('\r\n');
    const filename = `categorias_${new Date().toISOString().slice(0, 10)}.csv`;

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exportando categorías CSV:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error al exportar categorías' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
