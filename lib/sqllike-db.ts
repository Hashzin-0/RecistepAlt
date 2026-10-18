import fs from 'node:fs';
import path from 'node:path';
import type { SQLQueryResult, SQLTableColumn, VideoMetadata, ScrapeLog, ExtractedRecipe } from './types.ts';

export interface SQLTableSchema {
  name: string;
  columns: SQLTableColumn[];
}

export interface SQLDatabaseState {
  tables: Record<string, {
    schema: SQLTableSchema;
    rows: Record<string, any>[];
  }>;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'sqllike_store.json');

// Initial seed videos so the user has immediate rich data to query and explore
const INITIAL_SEED_VIDEOS: Partial<Record<string, any>>[] = [
  {
    id: 'vid_ig_01',
    platform: 'instagram',
    url: 'https://www.instagram.com/reel/C218aZ_N_4e/',
    canonical_url: 'https://www.instagram.com/reel/C218aZ_N_4e/',
    title: 'Top 5 segredos de Python para automação e Web Scraping 🚀',
    caption: 'Dicas essenciais de Python para contornar bloqueios e extrair dados estruturados em escala! #python #webscraping #dados #programacao #automacao',
    author_username: 'dev_python_br',
    author_name: 'Dev Python Brasil',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    author_verified: 1,
    views: 452800,
    likes: 38400,
    comments: 1420,
    shares: 8900,
    saves: 14200,
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    duration_seconds: 48.5,
    width: 1080,
    height: 1920,
    aspect_ratio: '9:16',
    music_title: 'Synthwave Coding Beats - Cyberpunk',
    music_author: 'FutureSound Lab',
    hashtags: JSON.stringify(['#python', '#webscraping', '#dados', '#programacao', '#automacao']),
    mentions: JSON.stringify(['@pythonhub', '@coderbr']),
    upload_date: '2026-03-12T14:30:00Z',
    scraped_at: '2026-10-18T10:15:22Z',
    extraction_strategy: 'Instagram GraphQL + oEmbed Hybrid Engine',
    latency_ms: 380,
  },
  {
    id: 'vid_tt_01',
    platform: 'tiktok',
    url: 'https://www.tiktok.com/@techpulse_br/video/7342918829104829',
    canonical_url: 'https://www.tiktok.com/@techpulse_br/video/7342918829104829',
    title: 'Como extrair dados de vídeos do TikTok sem tomar ban de IP ⚡️',
    caption: 'Tutorial passo a passo ensinando rotação de User-Agent, cabeçalhos Sec-Ch-Ua e proxies residenciais! #tiktok #scraping #tecnologia #dicasdev #programador',
    author_username: 'techpulse_br',
    author_name: 'TechPulse Brasil',
    author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    author_verified: 1,
    views: 1240500,
    likes: 182300,
    comments: 4890,
    shares: 41200,
    saves: 68400,
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80',
    duration_seconds: 59.2,
    width: 1080,
    height: 1920,
    aspect_ratio: '9:16',
    music_title: 'Original Sound - TechPulse Tech',
    music_author: 'TechPulse Brasil',
    hashtags: JSON.stringify(['#tiktok', '#scraping', '#tecnologia', '#dicasdev', '#programador']),
    mentions: JSON.stringify([]),
    upload_date: '2026-03-20T18:00:00Z',
    scraped_at: '2026-10-18T11:42:10Z',
    extraction_strategy: 'TikTok Web ItemDetail + TikWM Resilient API',
    latency_ms: 295,
  },
  {
    id: 'vid_ig_02',
    platform: 'instagram',
    url: 'https://www.instagram.com/reel/C45m_88L00p/',
    canonical_url: 'https://www.instagram.com/reel/C45m_88L00p/',
    title: 'Guia definitivo de Arquitetura de Software em 2026 🏛️',
    caption: 'Microserviços vs Monólitos vs Serverless. Qual escolher para o seu próximo grande produto? #softwareengineering #arquitetura #backend #systemdesign',
    author_username: 'sofia_codes',
    author_name: 'Sofia Rocha',
    author_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    author_verified: 0,
    views: 312000,
    likes: 27900,
    comments: 890,
    shares: 5400,
    saves: 9800,
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    duration_seconds: 35.0,
    width: 1080,
    height: 1920,
    aspect_ratio: '9:16',
    music_title: 'Chill Lo-Fi Coding Session',
    music_author: 'LoFi Beats Studio',
    hashtags: JSON.stringify(['#softwareengineering', '#arquitetura', '#backend', '#systemdesign']),
    mentions: JSON.stringify(['@devcommunity']),
    upload_date: '2026-04-01T12:00:00Z',
    scraped_at: '2026-10-18T12:10:05Z',
    extraction_strategy: 'Instagram Embed JSON + OpenGraph Extractor',
    latency_ms: 412,
  },
  {
    id: 'vid_tt_02',
    platform: 'tiktok',
    url: 'https://www.tiktok.com/@creative_growth/video/7349102839210012',
    canonical_url: 'https://www.tiktok.com/@creative_growth/video/7349102839210012',
    title: 'Como o algoritmo do TikTok analisa a retenção dos primeiros 3 segundos 📈',
    caption: 'Análise de métricas de engajamento: completion rate, watch time e compartilhamentos. #marketingdigital #tiktokgrowth #metricas #growthhacking',
    author_username: 'creative_growth',
    author_name: 'Creative Growth Lab',
    author_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    author_verified: 1,
    views: 890000,
    likes: 94000,
    comments: 2150,
    shares: 18700,
    saves: 34100,
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    duration_seconds: 42.0,
    width: 1080,
    height: 1920,
    aspect_ratio: '9:16',
    music_title: 'Corporate Inspiring Ambience',
    music_author: 'AudioLibrary',
    hashtags: JSON.stringify(['#marketingdigital', '#tiktokgrowth', '#metricas', '#growthhacking']),
    mentions: JSON.stringify([]),
    upload_date: '2026-04-05T09:15:00Z',
    scraped_at: '2026-10-18T13:05:44Z',
    extraction_strategy: 'TikTok oEmbed API + Anti-bot Fallback',
    latency_ms: 220,
  },
  {
    id: 'vid_ig_pudim',
    platform: 'instagram',
    url: 'https://www.instagram.com/reel/C7pudim99/',
    canonical_url: 'https://www.instagram.com/reel/C7pudim99/',
    title: 'O Pudim de Leite Condensado Perfeito e Super Lisinho 🍮',
    caption: 'Receita infalível do pudim tradicional sem furinhos com calda de caramelo dourada brilhante. Bata sem pressa e asse em banho-maria! #pudim #receitas #confeitaria #sobremesa #culinaria',
    author_username: 'chef_helena',
    author_name: 'Chef Helena Gastronomia',
    author_avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80',
    author_verified: 1,
    views: 1850000,
    likes: 245000,
    comments: 6700,
    shares: 89000,
    saves: 134000,
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    duration_seconds: 52.0,
    width: 1080,
    height: 1920,
    aspect_ratio: '9:16',
    music_title: 'Acoustic Folk Cooking Music',
    music_author: 'Kitchen Beats',
    hashtags: JSON.stringify(['#pudim', '#receitas', '#confeitaria', '#sobremesa', '#culinaria']),
    mentions: JSON.stringify(['@gastronomia_brasil']),
    upload_date: '2026-05-10T16:00:00Z',
    scraped_at: '2026-10-18T14:10:00Z',
    extraction_strategy: 'Instagram Captioned Embed + Audio Track Parser',
    latency_ms: 310,
  },
  {
    id: 'vid_tt_empada',
    platform: 'tiktok',
    url: 'https://www.tiktok.com/@cozinha_do_marcos/video/739988221100',
    canonical_url: 'https://www.tiktok.com/@cozinha_do_marcos/video/739988221100',
    title: 'Empadinha de Frango com Massa Podre que Derrete na Boca 🥧',
    caption: 'Segredo da massa que desmancha: farinha de trigo com manteiga gelada e banha! Recheio de frango cremoso desfiado com requeijão cremoso e cheiro-verde. #empada #salgados #receitafacil #lanche',
    author_username: 'cozinha_do_marcos',
    author_name: 'Marcos na Cozinha',
    author_avatar: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150&auto=format&fit=crop&q=80',
    author_verified: 1,
    views: 1420000,
    likes: 195000,
    comments: 3890,
    shares: 42000,
    saves: 88500,
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80',
    duration_seconds: 48.0,
    width: 1080,
    height: 1920,
    aspect_ratio: '9:16',
    music_title: 'Bossa Nova Kitchen Groove',
    music_author: 'Chef Soundtrack',
    hashtags: JSON.stringify(['#empada', '#salgados', '#receitafacil', '#lanche']),
    mentions: JSON.stringify([]),
    upload_date: '2026-05-15T11:20:00Z',
    scraped_at: '2026-10-18T14:35:00Z',
    extraction_strategy: 'TikTok Web ItemDetail + TikWM Resilient API',
    latency_ms: 245,
  },
];

export class SQLikeDatabase {
  private state: SQLDatabaseState = { tables: {} };
  private initialized = false;

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (this.initialized) return;

    // Check if store file exists
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.state = JSON.parse(fileContent);
        // Ensure all default tables (e.g. recipes) are migrated if missing
        const defaultState = this.getDefaultTablesState();
        let changed = false;
        for (const [tName, tData] of Object.entries(defaultState.tables)) {
          if (!this.state.tables[tName]) {
            this.state.tables[tName] = tData;
            changed = true;
          }
        }
        if (changed) {
          this.saveToDisk();
        }
        this.initialized = true;
        return;
      }
    } catch (err) {
      console.warn('Could not read existing SQLike database file, bootstrapping new schema...', err);
    }

    // Bootstrap tables
    this.initDefaultTables();
    this.saveToDisk();
    this.initialized = true;
  }

  private initDefaultTables() {
    this.state = this.getDefaultTablesState();
  }

  private getDefaultTablesState(): SQLDatabaseState {
    return {
      tables: {
        videos: {
          schema: {
            name: 'videos',
            columns: [
              { name: 'id', type: 'TEXT', primaryKey: true, notNull: true },
              { name: 'platform', type: 'TEXT', notNull: true },
              { name: 'url', type: 'TEXT', notNull: true },
              { name: 'canonical_url', type: 'TEXT' },
              { name: 'title', type: 'TEXT' },
              { name: 'caption', type: 'TEXT' },
              { name: 'author_username', type: 'TEXT' },
              { name: 'author_name', type: 'TEXT' },
              { name: 'author_avatar', type: 'TEXT' },
              { name: 'author_verified', type: 'INTEGER' },
              { name: 'views', type: 'INTEGER' },
              { name: 'likes', type: 'INTEGER' },
              { name: 'comments', type: 'INTEGER' },
              { name: 'shares', type: 'INTEGER' },
              { name: 'saves', type: 'INTEGER' },
              { name: 'video_url', type: 'TEXT' },
              { name: 'thumbnail_url', type: 'TEXT' },
              { name: 'duration_seconds', type: 'REAL' },
              { name: 'width', type: 'INTEGER' },
              { name: 'height', type: 'INTEGER' },
              { name: 'aspect_ratio', type: 'TEXT' },
              { name: 'music_title', type: 'TEXT' },
              { name: 'music_author', type: 'TEXT' },
              { name: 'hashtags', type: 'TEXT' },
              { name: 'mentions', type: 'TEXT' },
              { name: 'upload_date', type: 'TEXT' },
              { name: 'scraped_at', type: 'TEXT', notNull: true },
              { name: 'extraction_strategy', type: 'TEXT' },
              { name: 'latency_ms', type: 'INTEGER' },
            ],
          },
          rows: [...INITIAL_SEED_VIDEOS],
        },
        authors: {
          schema: {
            name: 'authors',
            columns: [
              { name: 'username', type: 'TEXT', primaryKey: true, notNull: true },
              { name: 'platform', type: 'TEXT', notNull: true },
              { name: 'name', type: 'TEXT' },
              { name: 'avatar_url', type: 'TEXT' },
              { name: 'verified', type: 'INTEGER' },
              { name: 'total_scraped_videos', type: 'INTEGER' },
              { name: 'total_likes', type: 'INTEGER' },
              { name: 'total_views', type: 'INTEGER' },
              { name: 'last_scraped_at', type: 'TEXT' },
            ],
          },
          rows: [
            {
              username: 'dev_python_br',
              platform: 'instagram',
              name: 'Dev Python Brasil',
              avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              verified: 1,
              total_scraped_videos: 1,
              total_likes: 38400,
              total_views: 452800,
              last_scraped_at: '2026-10-18T10:15:22Z',
            },
            {
              username: 'techpulse_br',
              platform: 'tiktok',
              name: 'TechPulse Brasil',
              avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
              verified: 1,
              total_scraped_videos: 1,
              total_likes: 182300,
              total_views: 1240500,
              last_scraped_at: '2026-10-18T11:42:10Z',
            },
          ],
        },
        scrape_logs: {
          schema: {
            name: 'scrape_logs',
            columns: [
              { name: 'id', type: 'TEXT', primaryKey: true, notNull: true },
              { name: 'timestamp', type: 'TEXT', notNull: true },
              { name: 'platform', type: 'TEXT', notNull: true },
              { name: 'target_url', type: 'TEXT', notNull: true },
              { name: 'status', type: 'TEXT', notNull: true },
              { name: 'strategy', type: 'TEXT' },
              { name: 'latency_ms', type: 'INTEGER' },
              { name: 'extracted_title', type: 'TEXT' },
              { name: 'error_message', type: 'TEXT' },
            ],
          },
          rows: [
            {
              id: 'log_seed_01',
              timestamp: '2026-10-18T10:15:22Z',
              platform: 'instagram',
              target_url: 'https://www.instagram.com/reel/C218aZ_N_4e/',
              status: 'success',
              strategy: 'Instagram GraphQL + oEmbed Hybrid Engine',
              latency_ms: 380,
              extracted_title: 'Top 5 segredos de Python para automação e Web Scraping 🚀',
              error_message: null,
            },
            {
              id: 'log_seed_02',
              timestamp: '2026-10-18T11:42:10Z',
              platform: 'tiktok',
              target_url: 'https://www.tiktok.com/@techpulse_br/video/7342918829104829',
              status: 'success',
              strategy: 'TikTok Web ItemDetail + TikWM Resilient API',
              latency_ms: 295,
              extracted_title: 'Como extrair dados de vídeos do TikTok sem tomar ban de IP ⚡️',
              error_message: null,
            },
          ],
        },
        recipes: {
          schema: {
            name: 'recipes',
            columns: [
              { name: 'id', type: 'TEXT', primaryKey: true, notNull: true },
              { name: 'video_id', type: 'TEXT', notNull: true },
              { name: 'recipe_title', type: 'TEXT', notNull: true },
              { name: 'recipe_description', type: 'TEXT' },
              { name: 'category', type: 'TEXT' },
              { name: 'prep_time', type: 'TEXT' },
              { name: 'cook_time', type: 'TEXT' },
              { name: 'servings', type: 'TEXT' },
              { name: 'difficulty', type: 'TEXT' },
              { name: 'sections_json', type: 'TEXT', notNull: true },
              { name: 'utensils_json', type: 'TEXT', notNull: true },
              { name: 'steps_json', type: 'TEXT', notNull: true },
              { name: 'chef_tips', type: 'TEXT' },
              { name: 'analyzed_at', type: 'TEXT', notNull: true },
            ],
          },
          rows: [
            {
              id: 'rec_pudim_01',
              video_id: 'vid_ig_pudim',
              recipe_title: 'Pudim Tradicional de Leite Condensado com Calda de Caramelo',
              recipe_description: 'Receita infalível para um pudim cremoso e sem furinhos, com calda de caramelo âmbar brilhante.',
              category: 'Sobremesa',
              prep_time: '20 min',
              cook_time: '60 min',
              servings: '8 porções',
              difficulty: 'Fácil',
              sections_json: JSON.stringify([
                {
                  sectionName: 'Calda de Caramelo',
                  items: [
                    { name: 'Açúcar refinado ou cristal', quantity: '1 xícara (chá) / 200g', notes: 'Para derreter em fogo brando', icon: 'candy' },
                    { name: 'Água morna', quantity: '1/2 xícara / 120ml', notes: 'Adicionar com cautela para dissolver o caramelo', icon: 'droplet' },
                  ],
                },
                {
                  sectionName: 'Massa do Pudim',
                  items: [
                    { name: 'Leite condensado', quantity: '1 lata (395g)', notes: 'Integral de boa qualidade', icon: 'milk' },
                    { name: 'Leite integral', quantity: '1 medida da lata (395ml)', notes: 'Temperatura ambiente', icon: 'milk' },
                    { name: 'Ovos inteiros', quantity: '3 unidades grandes', notes: 'Peneirados para tirar a película da gema', icon: 'egg' },
                    { name: 'Extrato de baunilha', quantity: '1 colher (café)', notes: 'Opcional para aromatizar', icon: 'sparkles' },
                  ],
                },
              ]),
              utensils_json: JSON.stringify([
                { name: 'Forma de furo central (20cm)', purpose: 'Formato clássico com cozimento uniforme no centro', icon: 'pan' },
                { name: 'Liquidificador ou Fouet', purpose: 'Misturar os ingredientes líquidos da massa', icon: 'blender' },
                { name: 'Assadeira retangular para banho-maria', purpose: 'Fornecer vapor suave no forno para não ferver a massa', icon: 'pan' },
                { name: 'Peneira fina', purpose: 'Filtrar os ovos e retirar bolhas de ar superficiais', icon: 'sieve' },
                { name: 'Espátula de silicone (pão-duro)', purpose: 'Espalhar a calda de caramelo e raspar as laterais', icon: 'spatula' },
                { name: 'Papel alumínio', purpose: 'Vedar a forma nos primeiros 45 minutos de forno', icon: 'sparkles' },
              ]),
              steps_json: JSON.stringify([
                {
                  stepNumber: 1,
                  title: 'Preparo da Calda Dourada',
                  instruction: 'Em uma panela de fundo grosso, derreta o açúcar em fogo médio até atingir cor de caramelo âmbar. Junte a água morna aos poucos com cuidado e mexa até os torrões se dissolverem por completo.',
                  tip: 'Não deixe escurecer demais para a calda não amargar.',
                  timeEstimate: '8 min',
                },
                {
                  stepNumber: 2,
                  title: 'Caramelização da Forma',
                  instruction: 'Despeje a calda ainda quente na forma de furo central e gire com cuidado para untar todo o fundo e a haste central. Reserve para esfriar e endurecer.',
                  tip: 'Deixar o caramelo esfriar na forma evita que se misture com a massa crua.',
                  timeEstimate: '4 min',
                },
                {
                  stepNumber: 3,
                  title: 'Preparo da Massa do Pudim',
                  instruction: 'Bata o leite condensado, o leite integral, os ovos peneirados e o extrato de baunilha no liquidificador por cerca de 2 minutos até homogenizar.',
                  tip: 'Peneirar os ovos tira o odor característico sem alterar a consistência.',
                  timeEstimate: '3 min',
                },
                {
                  stepNumber: 4,
                  title: 'Descanso Anti-Bolhas (Mise en Place)',
                  instruction: 'Deixe o líquido descansar por 5 a 10 minutos na jarra. Com uma colher, retire a camada de espuma branca que subir à superfície. Passe pela peneira ao despejar na forma caramelizada.',
                  tip: 'Esse é o verdadeiro segredo para o pudim ficar 100% lisinho sem furinhos!',
                  timeEstimate: '10 min',
                },
                {
                  stepNumber: 5,
                  title: 'Cozimento em Banho-Maria',
                  instruction: 'Cubra a forma com papel alumínio (lado brilhante voltado para dentro). Coloque a forma dentro de uma assadeira com 2 dedos de água quente e umas gotinhas de vinagre. Leve ao forno pré-aquecido a 180°C por 50 a 60 minutos.',
                  tip: 'O vinagre na assadeira impede que a forma de alumínio fique manchada de escuro.',
                  timeEstimate: '55 min',
                },
                {
                  stepNumber: 6,
                  title: 'Resfriamento e Desenforme Perfeito',
                  instruction: 'Retire do forno, espere esfriar em temperatura ambiente e refrigere por no mínimo 4 horas (idealmente de um dia para o outro). Para desenformar, passe rapidamente o fundo da forma na chama do fogão por 15 segundos para soltar o caramelo e vire sobre um prato com borda.',
                  tip: 'Nunca tente desenformar o pudim morno, pois a massa ainda estará mole e pode quebrar.',
                  timeEstimate: '4h geladeira',
                },
              ]),
              chef_tips: JSON.stringify([
                'Pudim com furinhos é pudim cozido em alta temperatura (fervura); pudim liso assa em baixa temperatura e sem espuma.',
                'Utilize sempre leite na mesma medida do leite condensado para o equilíbrio ideal de doçura e consistência de corte.',
              ]),
              analyzed_at: '2026-10-18T14:15:00Z',
            },
          ],
        },
      },
    };
  }

  public saveToDisk(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist SQLike database to disk:', err);
    }
  }

  public getTables(): string[] {
    this.ensureInitialized();
    return Object.keys(this.state.tables);
  }

  public getTableSchema(tableName: string): SQLTableSchema | undefined {
    this.ensureInitialized();
    return this.state.tables[tableName]?.schema;
  }

  public saveVideo(video: VideoMetadata): void {
    this.ensureInitialized();
    const videosTable = this.state.tables['videos'];
    if (!videosTable) return;

    const row = {
      id: video.id,
      platform: video.platform,
      url: video.url,
      canonical_url: video.canonicalUrl,
      title: video.title,
      caption: video.caption,
      author_username: video.author.username,
      author_name: video.author.name,
      author_avatar: video.author.avatarUrl,
      author_verified: video.author.verified ? 1 : 0,
      views: video.metrics.views,
      likes: video.metrics.likes,
      comments: video.metrics.comments,
      shares: video.metrics.shares,
      saves: video.metrics.saves || 0,
      video_url: video.videoUrl || '',
      thumbnail_url: video.thumbnailUrl,
      duration_seconds: video.durationSeconds || null,
      width: video.width || null,
      height: video.height || null,
      aspect_ratio: video.aspectRatio || null,
      music_title: video.musicTitle || '',
      music_author: video.musicAuthor || '',
      hashtags: JSON.stringify(video.hashtags || []),
      mentions: JSON.stringify(video.mentions || []),
      upload_date: video.uploadDate,
      scraped_at: video.scrapedAt,
      extraction_strategy: video.extractionStrategy,
      latency_ms: video.antiBlockStatus.responseTimeMs,
    };

    // Upsert video row
    const existingIdx = videosTable.rows.findIndex(
      (r) => r.id === row.id || (r.canonical_url && r.canonical_url === row.canonical_url)
    );
    if (existingIdx >= 0) {
      videosTable.rows[existingIdx] = { ...videosTable.rows[existingIdx], ...row };
    } else {
      videosTable.rows.unshift(row);
    }

    // Update Author record
    const authorsTable = this.state.tables['authors'];
    if (authorsTable && video.author.username) {
      const existingAuthorIdx = authorsTable.rows.findIndex(
        (a) => a.username === video.author.username && a.platform === video.platform
      );
      if (existingAuthorIdx >= 0) {
        const cur = authorsTable.rows[existingAuthorIdx];
        authorsTable.rows[existingAuthorIdx] = {
          ...cur,
          name: video.author.name || cur.name,
          avatar_url: video.author.avatarUrl || cur.avatar_url,
          verified: video.author.verified ? 1 : cur.verified,
          total_scraped_videos: (cur.total_scraped_videos || 1) + 1,
          total_likes: (cur.total_likes || 0) + (video.metrics.likes || 0),
          total_views: (cur.total_views || 0) + (video.metrics.views || 0),
          last_scraped_at: video.scrapedAt,
        };
      } else {
        authorsTable.rows.push({
          username: video.author.username,
          platform: video.platform,
          name: video.author.name || video.author.username,
          avatar_url: video.author.avatarUrl || '',
          verified: video.author.verified ? 1 : 0,
          total_scraped_videos: 1,
          total_likes: video.metrics.likes || 0,
          total_views: video.metrics.views || 0,
          last_scraped_at: video.scrapedAt,
        });
      }
    }

    this.saveToDisk();
  }

  public logScrape(log: ScrapeLog): void {
    this.ensureInitialized();
    const table = this.state.tables['scrape_logs'];
    if (table) {
      table.rows.unshift({
        id: log.id,
        timestamp: log.timestamp,
        platform: log.platform,
        target_url: log.targetUrl,
        status: log.status,
        strategy: log.strategy,
        latency_ms: log.latencyMs,
        extracted_title: log.extractedTitle || null,
        error_message: log.errorMessage || null,
      });
      // Cap log rows at 500
      if (table.rows.length > 500) {
        table.rows.pop();
      }
      this.saveToDisk();
    }
  }

  public deleteVideo(id: string): boolean {
    this.ensureInitialized();
    const table = this.state.tables['videos'];
    if (!table) return false;
    const initialLen = table.rows.length;
    table.rows = table.rows.filter((r) => r.id !== id);
    if (table.rows.length !== initialLen) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  public getAllVideos(): Record<string, any>[] {
    this.ensureInitialized();
    return this.state.tables['videos']?.rows || [];
  }

  public resetSeed(): void {
    this.initDefaultTables();
    this.saveToDisk();
  }

  public saveRecipe(recipe: ExtractedRecipe): void {
    this.ensureInitialized();
    const table = this.state.tables['recipes'];
    if (!table) return;

    const row = {
      id: recipe.id,
      video_id: recipe.videoId,
      recipe_title: recipe.recipeTitle,
      recipe_description: recipe.recipeDescription,
      category: recipe.category,
      prep_time: recipe.prepTime,
      cook_time: recipe.cookTime,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      sections_json: JSON.stringify(recipe.ingredientSections),
      utensils_json: JSON.stringify(recipe.utensils),
      steps_json: JSON.stringify(recipe.preparationSteps),
      chef_tips: JSON.stringify(recipe.chefTips),
      analyzed_at: recipe.analyzedAt,
    };

    const existingIdx = table.rows.findIndex(
      (r) => r.id === recipe.id || r.video_id === recipe.videoId
    );
    if (existingIdx >= 0) {
      table.rows[existingIdx] = { ...table.rows[existingIdx], ...row };
    } else {
      table.rows.unshift(row);
    }

    this.saveToDisk();
  }

  public getRecipeByVideoId(videoId: string): ExtractedRecipe | null {
    this.ensureInitialized();
    const table = this.state.tables['recipes'];
    if (!table) return null;
    const row = table.rows.find((r) => r.video_id === videoId || r.id === videoId);
    if (!row) return null;

    try {
      return {
        id: row.id,
        videoId: row.video_id,
        recipeTitle: row.recipe_title,
        recipeDescription: row.recipe_description || '',
        category: row.category || 'Geral',
        prepTime: row.prep_time || '20 min',
        cookTime: row.cook_time || '30 min',
        servings: row.servings || '4 porções',
        difficulty: row.difficulty || 'Fácil',
        ingredientSections: JSON.parse(row.sections_json || '[]'),
        utensils: JSON.parse(row.utensils_json || '[]'),
        preparationSteps: JSON.parse(row.steps_json || '[]'),
        chefTips: JSON.parse(row.chef_tips || '[]'),
        analyzedAt: row.analyzed_at || new Date().toISOString(),
        sourceVideo: {
          id: row.video_id,
          platform: 'instagram',
          title: row.recipe_title,
          authorUsername: 'chef',
        },
      };
    } catch (e) {
      console.error('Failed to parse recipe row:', e);
      return null;
    }
  }

  public getAllRecipes(): ExtractedRecipe[] {
    this.ensureInitialized();
    const table = this.state.tables['recipes'];
    if (!table) return [];
    return table.rows.map((row) => {
      let sections = [];
      let utensils = [];
      let steps = [];
      let tips = [];
      try {
        sections = JSON.parse(row.sections_json || '[]');
        utensils = JSON.parse(row.utensils_json || '[]');
        steps = JSON.parse(row.steps_json || '[]');
        tips = JSON.parse(row.chef_tips || '[]');
      } catch {}
      return {
        id: row.id,
        videoId: row.video_id,
        recipeTitle: row.recipe_title,
        recipeDescription: row.recipe_description || '',
        category: row.category || 'Geral',
        prepTime: row.prep_time || '20 min',
        cookTime: row.cook_time || '30 min',
        servings: row.servings || '4 porções',
        difficulty: row.difficulty || 'Fácil',
        ingredientSections: sections,
        utensils,
        preparationSteps: steps,
        chefTips: tips,
        analyzedAt: row.analyzed_at || new Date().toISOString(),
        sourceVideo: {
          id: row.video_id,
          platform: 'instagram',
          title: row.recipe_title,
          authorUsername: 'chef',
        },
      };
    });
  }

  /**
   * Executes standard SQL queries:
   * - SELECT col1, col2, COUNT(*)... FROM table WHERE ... ORDER BY ... LIMIT ...
   * - INSERT INTO table (...) VALUES (...)
   * - UPDATE table SET ... WHERE ...
   * - DELETE FROM table WHERE ...
   * - SHOW TABLES
   * - PRAGMA table_info(tableName)
   */
  public executeSQL(rawQuery: string): SQLQueryResult {
    this.ensureInitialized();
    const startTime = performance.now();
    const query = rawQuery.trim();

    if (!query) {
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: 0,
        query,
        error: 'Instrução SQL vazia fornecida.',
      };
    }

    try {
      // 1. SHOW TABLES / PRAGMA table_info
      if (/^SHOW\s+TABLES/i.test(query)) {
        const tableNames = Object.keys(this.state.tables);
        return {
          columns: ['table_name', 'column_count', 'row_count'],
          rows: tableNames.map((t) => ({
            table_name: t,
            column_count: this.state.tables[t].schema.columns.length,
            row_count: this.state.tables[t].rows.length,
          })),
          rowCount: tableNames.length,
          executionTimeMs: Math.round(performance.now() - startTime),
          query,
        };
      }

      const pragmaMatch = query.match(/^PRAGMA\s+table_info\((['"]?)([^)'"]+)\1\)/i);
      if (pragmaMatch) {
        const tName = pragmaMatch[2].toLowerCase();
        const tbl = this.state.tables[tName];
        if (!tbl) {
          throw new Error(`Tabela '${tName}' não existe.`);
        }
        return {
          columns: ['cid', 'name', 'type', 'notnull', 'dflt_value', 'pk'],
          rows: tbl.schema.columns.map((c, i) => ({
            cid: i,
            name: c.name,
            type: c.type,
            notnull: c.notNull ? 1 : 0,
            dflt_value: null,
            pk: c.primaryKey ? 1 : 0,
          })),
          rowCount: tbl.schema.columns.length,
          executionTimeMs: Math.round(performance.now() - startTime),
          query,
        };
      }

      // 2. SELECT queries
      if (/^SELECT\b/i.test(query)) {
        return this.executeSelect(query, startTime);
      }

      // 3. INSERT INTO
      if (/^INSERT\s+INTO\b/i.test(query)) {
        return this.executeInsert(query, startTime);
      }

      // 4. UPDATE
      if (/^UPDATE\b/i.test(query)) {
        return this.executeUpdate(query, startTime);
      }

      // 5. DELETE FROM
      if (/^DELETE\s+FROM\b/i.test(query)) {
        return this.executeDelete(query, startTime);
      }

      throw new Error(`Comando SQL não suportado. Suporta SELECT, INSERT, UPDATE, DELETE, SHOW TABLES, PRAGMA.`);
    } catch (err: any) {
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: Math.round(performance.now() - startTime),
        query,
        error: err.message || 'Erro de execução SQL.',
      };
    }
  }

  private executeSelect(query: string, startTime: number): SQLQueryResult {
    // Regex extract parts: SELECT <fields> FROM <table|join> [WHERE <cond>] [ORDER BY <col> [ASC|DESC]] [LIMIT <n>] [OFFSET <m>]
    const fromMatch = query.match(/FROM\s+([a-zA-Z0-9_]+)/i);
    if (!fromMatch) {
      throw new Error('Cláusula FROM obrigatória não encontrada na query SELECT.');
    }

    const tableName = fromMatch[1].toLowerCase();
    const table = this.state.tables[tableName];
    if (!table) {
      throw new Error(`Tabela '${tableName}' não encontrada no banco SQLike.`);
    }

    // Extract columns to select
    const selectMatch = query.match(/^SELECT\s+(.+?)\s+FROM/i);
    const rawSelectCols = selectMatch ? selectMatch[1].trim() : '*';

    // Extract WHERE clause
    const whereMatch = query.match(/\bWHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+GROUP\s+BY|\s+LIMIT|\s*$)/i);
    const whereClause = whereMatch ? whereMatch[1].trim() : null;

    // Extract ORDER BY
    const orderMatch = query.match(/\bORDER\s+BY\s+([a-zA-Z0-9_]+)(?:\s+(ASC|DESC))?/i);
    const orderCol = orderMatch ? orderMatch[1] : null;
    const orderDir = orderMatch && orderMatch[2] ? orderMatch[2].toUpperCase() : 'ASC';

    // Extract LIMIT & OFFSET
    const limitMatch = query.match(/\bLIMIT\s+(\d+)(?:\s+OFFSET\s+(\d+))?/i);
    const limit = limitMatch ? parseInt(limitMatch[1], 10) : undefined;
    const offset = limitMatch && limitMatch[2] ? parseInt(limitMatch[2], 10) : 0;

    // Filter rows with WHERE
    let filtered = [...table.rows];
    if (whereClause) {
      filtered = filtered.filter((row) => this.evalWhere(row, whereClause));
    }

    // Aggregates check: e.g. COUNT(*), AVG(views), SUM(likes), MAX(views), MIN(views)
    if (/COUNT\s*\(/i.test(rawSelectCols) || /SUM\s*\(/i.test(rawSelectCols) || /AVG\s*\(/i.test(rawSelectCols)) {
      return this.evalAggregates(filtered, rawSelectCols, query, startTime);
    }

    // Sort rows
    if (orderCol) {
      filtered.sort((a, b) => {
        const valA = a[orderCol];
        const valB = b[orderCol];
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return orderDir === 'ASC' ? valA - valB : valB - valA;
        }
        return orderDir === 'ASC'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    // Offset and Limit
    if (offset > 0) {
      filtered = filtered.slice(offset);
    }
    if (limit !== undefined) {
      filtered = filtered.slice(0, limit);
    }

    // Project columns
    let resultRows: Record<string, any>[] = [];
    let finalCols: string[] = [];

    if (rawSelectCols === '*') {
      finalCols = table.schema.columns.map((c) => c.name);
      resultRows = filtered.map((r) => {
        const out: Record<string, any> = {};
        for (const col of finalCols) {
          out[col] = r[col] !== undefined ? r[col] : null;
        }
        return out;
      });
    } else {
      const requestedCols = rawSelectCols.split(',').map((c) => c.trim().replace(/^[`'"]|[`'"]$/g, ''));
      finalCols = requestedCols;
      resultRows = filtered.map((r) => {
        const out: Record<string, any> = {};
        for (const col of requestedCols) {
          out[col] = r[col] !== undefined ? r[col] : null;
        }
        return out;
      });
    }

    return {
      columns: finalCols,
      rows: resultRows,
      rowCount: resultRows.length,
      executionTimeMs: Math.round(performance.now() - startTime),
      query,
    };
  }

  private evalAggregates(
    rows: Record<string, any>[],
    rawSelectCols: string,
    query: string,
    startTime: number
  ): SQLQueryResult {
    const colExpressions = rawSelectCols.split(',').map((c) => c.trim());
    const resultObj: Record<string, any> = {};
    const columns: string[] = [];

    for (const expr of colExpressions) {
      const countMatch = expr.match(/COUNT\s*\((.*?)\)/i);
      const sumMatch = expr.match(/SUM\s*\((.*?)\)/i);
      const avgMatch = expr.match(/AVG\s*\((.*?)\)/i);
      const maxMatch = expr.match(/MAX\s*\((.*?)\)/i);
      const minMatch = expr.match(/MIN\s*\((.*?)\)/i);

      if (countMatch) {
        const alias = expr;
        columns.push(alias);
        resultObj[alias] = rows.length;
      } else if (sumMatch) {
        const field = sumMatch[1].trim();
        const sum = rows.reduce((acc, r) => acc + (Number(r[field]) || 0), 0);
        columns.push(expr);
        resultObj[expr] = sum;
      } else if (avgMatch) {
        const field = avgMatch[1].trim();
        const sum = rows.reduce((acc, r) => acc + (Number(r[field]) || 0), 0);
        const avg = rows.length ? Math.round((sum / rows.length) * 100) / 100 : 0;
        columns.push(expr);
        resultObj[expr] = avg;
      } else if (maxMatch) {
        const field = maxMatch[1].trim();
        const max = rows.reduce((acc, r) => Math.max(acc, Number(r[field]) || 0), -Infinity);
        columns.push(expr);
        resultObj[expr] = rows.length ? max : null;
      } else if (minMatch) {
        const field = minMatch[1].trim();
        const min = rows.reduce((acc, r) => Math.min(acc, Number(r[field]) || 0), Infinity);
        columns.push(expr);
        resultObj[expr] = rows.length ? min : null;
      } else {
        // Plain column in aggregate query
        columns.push(expr);
        resultObj[expr] = rows[0] ? rows[0][expr] : null;
      }
    }

    return {
      columns,
      rows: [resultObj],
      rowCount: 1,
      executionTimeMs: Math.round(performance.now() - startTime),
      query,
    };
  }

  private evalWhere(row: Record<string, any>, whereClause: string): boolean {
    // Handle 'OR' and 'AND' expressions
    // Simple recursive evaluator for basic boolean combinations
    if (/\s+OR\s+/i.test(whereClause)) {
      const parts = whereClause.split(/\s+OR\s+/i);
      return parts.some((p) => this.evalWhere(row, p.trim()));
    }

    if (/\s+AND\s+/i.test(whereClause)) {
      const parts = whereClause.split(/\s+AND\s+/i);
      return parts.every((p) => this.evalWhere(row, p.trim()));
    }

    // Comparison operators: =, !=, <>, >, <, >=, <=, LIKE, IN
    const likeMatch = whereClause.match(/^([a-zA-Z0-9_]+)\s+LIKE\s+(?:'|")([^'"]+)(?:'|")$/i);
    if (likeMatch) {
      const field = likeMatch[1];
      const pattern = likeMatch[2];
      const val = String(row[field] || '').toLowerCase();
      const regex = new RegExp('^' + pattern.toLowerCase().replace(/%/g, '.*').replace(/_/g, '.') + '$');
      return regex.test(val);
    }

    const inMatch = whereClause.match(/^([a-zA-Z0-9_]+)\s+IN\s*\((.+?)\)$/i);
    if (inMatch) {
      const field = inMatch[1];
      const options = inMatch[2]
        .split(',')
        .map((o) => o.trim().replace(/^['"]|['"]$/g, '').toLowerCase());
      const val = String(row[field] || '').toLowerCase();
      return options.includes(val);
    }

    const opMatch = whereClause.match(/^([a-zA-Z0-9_]+)\s*(=|!=|<>|>=|<=|>|<)\s*(.+)$/i);
    if (opMatch) {
      const field = opMatch[1];
      const op = opMatch[2];
      const rawVal = opMatch[3].trim().replace(/^['"]|['"]$/g, '');

      const rowVal = row[field];
      if (typeof rowVal === 'number' || (!isNaN(Number(rawVal)) && rawVal !== '')) {
        const numA = Number(rowVal);
        const numB = Number(rawVal);
        if (op === '=') return numA === numB;
        if (op === '!=' || op === '<>') return numA !== numB;
        if (op === '>') return numA > numB;
        if (op === '<') return numA < numB;
        if (op === '>=') return numA >= numB;
        if (op === '<=') return numA <= numB;
      } else {
        const strA = String(rowVal || '').toLowerCase();
        const strB = String(rawVal).toLowerCase();
        if (op === '=') return strA === strB;
        if (op === '!=' || op === '<>') return strA !== strB;
        if (op === '>') return strA > strB;
        if (op === '<') return strA < strB;
      }
    }

    return true;
  }

  private executeInsert(query: string, startTime: number): SQLQueryResult {
    const match = query.match(/INSERT\s+INTO\s+([a-zA-Z0-9_]+)\s*\((.+?)\)\s*VALUES\s*\((.+?)\)/i);
    if (!match) {
      throw new Error("Sintaxe inválida para INSERT INTO. Exemplo: INSERT INTO videos (id, platform) VALUES ('v1', 'instagram')");
    }

    const tableName = match[1].toLowerCase();
    const table = this.state.tables[tableName];
    if (!table) {
      throw new Error(`Tabela '${tableName}' não encontrada.`);
    }

    const cols = match[2].split(',').map((c) => c.trim().replace(/^[`'"]|[`'"]$/g, ''));
    const vals = match[3].split(',').map((v) => {
      const clean = v.trim();
      if ((clean.startsWith("'") && clean.endsWith("'")) || (clean.startsWith('"') && clean.endsWith('"'))) {
        return clean.slice(1, -1);
      }
      if (!isNaN(Number(clean))) return Number(clean);
      if (clean.toLowerCase() === 'null') return null;
      if (clean.toLowerCase() === 'true') return 1;
      if (clean.toLowerCase() === 'false') return 0;
      return clean;
    });

    const newRow: Record<string, any> = {};
    for (let i = 0; i < cols.length; i++) {
      newRow[cols[i]] = vals[i] !== undefined ? vals[i] : null;
    }

    table.rows.push(newRow);
    this.saveToDisk();

    return {
      columns: ['status', 'inserted_id'],
      rows: [{ status: 'Row inserted successfully', inserted_id: newRow.id || null }],
      rowCount: 1,
      executionTimeMs: Math.round(performance.now() - startTime),
      query,
    };
  }

  private executeUpdate(query: string, startTime: number): SQLQueryResult {
    const match = query.match(/^UPDATE\s+([a-zA-Z0-9_]+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
    if (!match) {
      throw new Error("Sintaxe inválida para UPDATE. Exemplo: UPDATE videos SET views = 500 WHERE id = 'vid_1'");
    }

    const tableName = match[1].toLowerCase();
    const table = this.state.tables[tableName];
    if (!table) {
      throw new Error(`Tabela '${tableName}' não encontrada.`);
    }

    const setExprs = match[2].split(',').map((e) => e.trim());
    const whereClause = match[3] ? match[3].trim() : null;

    let updatedCount = 0;
    for (const row of table.rows) {
      if (!whereClause || this.evalWhere(row, whereClause)) {
        for (const expr of setExprs) {
          const [col, rawVal] = expr.split('=').map((x) => x.trim());
          const cleanCol = col.replace(/^[`'"]|[`'"]$/g, '');
          let val: any = rawVal.replace(/^['"]|['"]$/g, '');
          if (!isNaN(Number(val)) && !rawVal.startsWith("'")) {
            val = Number(val);
          }
          row[cleanCol] = val;
        }
        updatedCount++;
      }
    }

    this.saveToDisk();

    return {
      columns: ['status', 'updated_rows'],
      rows: [{ status: 'Success', updated_rows: updatedCount }],
      rowCount: updatedCount,
      executionTimeMs: Math.round(performance.now() - startTime),
      query,
    };
  }

  private executeDelete(query: string, startTime: number): SQLQueryResult {
    const match = query.match(/^DELETE\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.+))?$/i);
    if (!match) {
      throw new Error("Sintaxe inválida para DELETE FROM. Exemplo: DELETE FROM videos WHERE id = 'vid_1'");
    }

    const tableName = match[1].toLowerCase();
    const table = this.state.tables[tableName];
    if (!table) {
      throw new Error(`Tabela '${tableName}' não encontrada.`);
    }

    const whereClause = match[2] ? match[2].trim() : null;
    const initialLen = table.rows.length;

    if (!whereClause) {
      table.rows = [];
    } else {
      table.rows = table.rows.filter((row) => !this.evalWhere(row, whereClause));
    }

    const deleted = initialLen - table.rows.length;
    this.saveToDisk();

    return {
      columns: ['status', 'deleted_rows'],
      rows: [{ status: 'Success', deleted_rows: deleted }],
      rowCount: deleted,
      executionTimeMs: Math.round(performance.now() - startTime),
      query,
    };
  }

  /**
   * Generates a complete .sql dump string containing CREATE TABLE and INSERT statements
   */
  public generateSQLDump(): string {
    this.ensureInitialized();
    const lines: string[] = [];
    lines.push('-- ====================================================');
    lines.push('-- SocialScraper Pro - SQLike Database Dump');
    lines.push(`-- Generated At: ${new Date().toISOString()}`);
    lines.push('-- Tables: ' + Object.keys(this.state.tables).join(', '));
    lines.push('-- ====================================================\n');

    for (const [tName, tableData] of Object.entries(this.state.tables)) {
      lines.push(`-- Table: ${tName}`);
      lines.push(`DROP TABLE IF EXISTS "${tName}";`);

      const colDefs = tableData.schema.columns.map((c) => {
        let def = `  "${c.name}" ${c.type}`;
        if (c.primaryKey) def += ' PRIMARY KEY';
        if (c.notNull) def += ' NOT NULL';
        return def;
      });

      lines.push(`CREATE TABLE "${tName}" (\n${colDefs.join(',\n')}\n);\n`);

      if (tableData.rows.length > 0) {
        lines.push(`-- Records for ${tName} (${tableData.rows.length} rows)`);
        for (const row of tableData.rows) {
          const cols = Object.keys(row).map((k) => `"${k}"`).join(', ');
          const vals = Object.values(row)
            .map((v) => {
              if (v === null || v === undefined) return 'NULL';
              if (typeof v === 'number') return v;
              const escaped = String(v).replace(/'/g, "''");
              return `'${escaped}'`;
            })
            .join(', ');
          lines.push(`INSERT INTO "${tName}" (${cols}) VALUES (${vals});`);
        }
        lines.push('');
      }
    }

    return lines.join('\n');
  }
}

// Singleton database instance
export const db = new SQLikeDatabase();
