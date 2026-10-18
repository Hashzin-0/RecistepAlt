import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/sqllike-db';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Query SQL não fornecida.' },
        { status: 400 }
      );
    }

    const result = db.executeSQL(query);
    return NextResponse.json({
      success: !result.error,
      result,
      error: result.error,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao executar query SQL.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const tables = db.getTables();
    const tableDetails = tables.map((t) => {
      const schema = db.getTableSchema(t);
      const rows = db.executeSQL(`SELECT COUNT(*) FROM ${t}`);
      return {
        name: t,
        schema,
        rowCount: rows.rows[0] ? rows.rows[0]['COUNT(*)'] : 0,
      };
    });

    return NextResponse.json({
      success: true,
      tables: tableDetails,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao listar tabelas do banco SQLike.' },
      { status: 500 }
    );
  }
}

export async function PUT() {
  try {
    const sqlDump = db.generateSQLDump();
    return new NextResponse(sqlDump, {
      headers: {
        'Content-Type': 'application/sql',
        'Content-Disposition': 'attachment; filename="social_scraper_database.sql"',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao gerar dump SQL.' },
      { status: 500 }
    );
  }
}
