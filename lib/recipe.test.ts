import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from './sqllike-db.ts';
import { analyzeVideoWithGemini } from './gemini-recipe.ts';
import type { VideoMetadata } from './types.ts';

test('Gemini Recipe Engine extracts categorized ingredients, utensils and preparation steps', async () => {
  const samplePudimVideo: VideoMetadata = {
    id: 'test_pudim_123',
    platform: 'instagram',
    url: 'https://instagram.com/reel/CpudimTest/',
    canonicalUrl: 'https://instagram.com/reel/CpudimTest/',
    title: 'Pudim lisinho sem furinhos com calda de caramelo',
    caption: 'Aprenda o segredo do pudim perfeito com calda de caramelo dourada e massa sem furinhos! #pudim #sobremesa #receita',
    author: {
      username: 'chef_confeiteiro',
      name: 'Chef Confeiteiro',
      avatarUrl: '',
      profileUrl: 'https://instagram.com/chef_confeiteiro',
      verified: true,
    },
    metrics: { views: 50000, likes: 4500, comments: 230, shares: 120 },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517427294546-5aa121f68e8a?w=600',
    durationSeconds: 45,
    hashtags: ['#pudim', '#sobremesa', '#receita'],
    mentions: [],
    uploadDate: '2025-01-15T12:00:00Z',
    scrapedAt: '2025-01-15T12:05:00Z',
    extractionStrategy: 'Test Engine',
    antiBlockStatus: {
      stealthMode: true,
      userAgent: 'Chrome Test',
      responseTimeMs: 120,
    },
  };

  const recipe = await analyzeVideoWithGemini(samplePudimVideo);

  // Validate recipe fields
  assert.ok(recipe.recipeTitle, 'Recipe should have a title');
  assert.ok(recipe.recipeTitle.toLowerCase().includes('pudim'), 'Title should mention pudim');

  // Validate separated ingredient sections (e.g., Calda and Massa)
  assert.ok(recipe.ingredientSections.length >= 2, 'Recipe must separate ingredients into distinct sections (e.g. Calda and Massa)');
  
  const hasCalda = recipe.ingredientSections.some(s => s.sectionName.toLowerCase().includes('calda') || s.sectionName.toLowerCase().includes('caramelo'));
  const hasMassa = recipe.ingredientSections.some(s => s.sectionName.toLowerCase().includes('massa'));
  assert.ok(hasCalda, 'Should have a separate section for Calda');
  assert.ok(hasMassa, 'Should have a separate section for Massa');

  // Validate ingredient icons
  const allIngredients = recipe.ingredientSections.flatMap(s => s.items);
  for (const item of allIngredients) {
    assert.ok(item.name, 'Ingredient must have a name');
    assert.ok(item.quantity, 'Ingredient must have a quantity');
    assert.ok(item.icon, `Ingredient ${item.name} must have a designated icon`);
  }

  // Validate utensils (mise en place)
  assert.ok(recipe.utensils.length >= 3, 'Must identify utensils and mise en place');
  for (const utensil of recipe.utensils) {
    assert.ok(utensil.name, 'Utensil must have a name');
    assert.ok(utensil.purpose, 'Utensil must specify purpose');
    assert.ok(utensil.icon, 'Utensil must have an icon');
  }

  // Validate preparation steps
  assert.ok(recipe.preparationSteps.length >= 3, 'Must have detailed preparation steps');
  assert.equal(recipe.preparationSteps[0].stepNumber, 1, 'First step should start at 1');
  assert.ok(recipe.preparationSteps[0].title, 'Steps must have titles');
  assert.ok(recipe.preparationSteps[0].instruction, 'Steps must have instructions');

  // Validate SQLike database persistence of recipes
  db.saveRecipe(recipe);
  const fetchedRecipe = db.getRecipeByVideoId(samplePudimVideo.id);
  assert.ok(fetchedRecipe, 'Recipe must be stored and retrieved from SQLike database');
  assert.equal(fetchedRecipe?.recipeTitle, recipe.recipeTitle, 'Retrieved recipe title matches');

  // Query SQLike recipes table
  const sqlResult = db.executeSQL('SELECT COUNT(*) FROM recipes');
  assert.ok(Number(sqlResult.rows[0]['COUNT(*)']) >= 1, 'SQL query on recipes table succeeds');
});

test('Gemini Recipe Engine extracts savory recipe with crust and filling sections', async () => {
  const sampleEmpadaVideo: VideoMetadata = {
    id: 'test_empada_456',
    platform: 'tiktok',
    url: 'https://tiktok.com/@chef/video/12345678',
    canonicalUrl: 'https://tiktok.com/@chef/video/12345678',
    title: 'Empadinha de frango com massa podre que desmancha',
    caption: 'O melhor recheio cremoso e massa amanteigada para sua empadinha! #empada #frango #salgado',
    author: {
      username: 'cozinha_marcos',
      name: 'Marcos Chef',
      avatarUrl: '',
      profileUrl: 'https://tiktok.com/@cozinha_marcos',
      verified: false,
    },
    metrics: { views: 80000, likes: 9500, comments: 400, shares: 320 },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600',
    durationSeconds: 50,
    hashtags: ['#empada', '#frango', '#salgado'],
    mentions: [],
    uploadDate: '2025-01-15T12:00:00Z',
    scrapedAt: '2025-01-15T12:05:00Z',
    extractionStrategy: 'Test Engine',
    antiBlockStatus: {
      stealthMode: true,
      userAgent: 'Chrome Test',
      responseTimeMs: 140,
    },
  };

  const recipe = await analyzeVideoWithGemini(sampleEmpadaVideo);
  assert.ok(recipe.recipeTitle.toLowerCase().includes('empad'), 'Title matches savory dish');
  
  const hasMassa = recipe.ingredientSections.some(s => s.sectionName.toLowerCase().includes('massa'));
  const hasRecheio = recipe.ingredientSections.some(s => s.sectionName.toLowerCase().includes('recheio'));
  assert.ok(hasMassa, 'Empada must have a Massa section');
  assert.ok(hasRecheio, 'Empada must have a Recheio section');
});
