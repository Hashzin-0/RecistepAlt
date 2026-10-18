import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/sqllike-db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get('videoId');

    if (videoId) {
      const recipe = db.getRecipeByVideoId(videoId);
      return NextResponse.json({
        success: Boolean(recipe),
        recipe,
      });
    }

    const recipes = db.getAllRecipes();
    return NextResponse.json({
      success: true,
      recipes,
      totalCount: recipes.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao carregar receitas do banco.' },
      { status: 500 }
    );
  }
}
