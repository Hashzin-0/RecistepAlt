import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/sqllike-db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') || '50';
    const sort = searchParams.get('sort') || 'scraped_at';
    const order = searchParams.get('order') || 'DESC';

    let query = `SELECT * FROM videos`;
    const conditions: string[] = [];

    if (platform && platform !== 'all') {
      conditions.push(`platform = '${platform.toLowerCase()}'`);
    }

    if (search && search.trim()) {
      const cleanSearch = search.trim().replace(/['"]/g, '');
      conditions.push(`(title LIKE '%${cleanSearch}%' OR author_username LIKE '%${cleanSearch}%' OR caption LIKE '%${cleanSearch}%')`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY ${sort} ${order.toUpperCase()} LIMIT ${limit}`;

    const result = db.executeSQL(query);

    return NextResponse.json({
      success: true,
      videos: result.rows,
      totalCount: result.rowCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao carregar vídeos do banco.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do vídeo não especificado.' },
        { status: 400 }
      );
    }

    const deleted = db.deleteVideo(id);
    return NextResponse.json({
      success: deleted,
      message: deleted ? 'Vídeo removido com sucesso!' : 'Vídeo não encontrado.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao deletar vídeo.' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    db.resetSeed();
    return NextResponse.json({
      success: true,
      message: 'Banco SQLike restaurado com dados sementes com sucesso!',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao resetar banco.' },
      { status: 500 }
    );
  }
}
