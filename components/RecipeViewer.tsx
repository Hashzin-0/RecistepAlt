'use client';

import React, { useState } from 'react';
import { ExtractedRecipe, IngredientIconType, UtensilIconType } from '@/lib/types';
import {
  Utensils,
  Clock,
  Users,
  ChefHat,
  Sparkles,
  Flame,
  CheckCircle2,
  Copy,
  Check,
  CheckSquare,
  Square,
  Lightbulb,
  Share2,
  BookOpen,
  ArrowRight,
  Printer,
  Terminal,
  Milk,
  Egg,
  Wheat,
  Candy,
  Droplets,
  Apple,
  Carrot,
  Beef,
  Coffee,
  Fish,
  Cookie,
  Timer,
  Scale,
  RefreshCw,
} from 'lucide-react';

interface RecipeViewerProps {
  recipe: ExtractedRecipe;
  onSelectSQL?: (query: string) => void;
  onClose?: () => void;
  onReanalyze?: () => void;
  isReanalyzing?: boolean;
}

export function RecipeViewer({
  recipe,
  onSelectSQL,
  onClose,
  onReanalyze,
  isReanalyzing,
}: RecipeViewerProps) {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'utensils' | 'steps' | 'tips'>('ingredients');
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  const toggleIngredient = (id: string) => {
    setCheckedIngredients((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) => ({ ...prev, [stepNumber]: !prev[stepNumber] }));
  };

  const handleCopyRecipe = () => {
    let text = `🍳 ${recipe.recipeTitle.toUpperCase()}\n`;
    text += `${recipe.recipeDescription}\n\n`;
    text += `⏱️ Preparo: ${recipe.prepTime} | Cozimento: ${recipe.cookTime} | Rendimento: ${recipe.servings}\n\n`;

    text += `📋 INGREDIENTES:\n`;
    recipe.ingredientSections.forEach((sec) => {
      text += `\n[${sec.sectionName.toUpperCase()}]\n`;
      sec.items.forEach((item) => {
        text += `• ${item.quantity} de ${item.name}${item.notes ? ` (${item.notes})` : ''}\n`;
      });
    });

    text += `\n🔪 UTENSÍLIOS (MISE EN PLACE):\n`;
    recipe.utensils.forEach((u) => {
      text += `• ${u.name}: ${u.purpose}\n`;
    });

    text += `\n🔥 MODO DE PREPARO:\n`;
    recipe.preparationSteps.forEach((s) => {
      text += `\nPasso ${s.stepNumber}: ${s.title}\n${s.instruction}\n`;
      if (s.tip) text += `💡 Dica: ${s.tip}\n`;
    });

    if (recipe.chefTips && recipe.chefTips.length > 0) {
      text += `\n👨‍🍳 DICAS DO CHEF:\n`;
      recipe.chefTips.forEach((t) => {
        text += `• ${t}\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to render appropriate icon for ingredients
  const renderIngredientIcon = (icon: IngredientIconType) => {
    switch (icon) {
      case 'egg':
        return <Egg className="w-4 h-4 text-amber-400" />;
      case 'milk':
        return <Milk className="w-4 h-4 text-cyan-300" />;
      case 'wheat':
        return <Wheat className="w-4 h-4 text-amber-500" />;
      case 'flame':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'candy':
        return <Candy className="w-4 h-4 text-pink-400" />;
      case 'droplet':
        return <Droplets className="w-4 h-4 text-blue-400" />;
      case 'apple':
        return <Apple className="w-4 h-4 text-rose-500" />;
      case 'carrot':
        return <Carrot className="w-4 h-4 text-orange-400" />;
      case 'meat':
        return <Beef className="w-4 h-4 text-red-400" />;
      case 'fish':
        return <Fish className="w-4 h-4 text-cyan-400" />;
      case 'coffee':
        return <Coffee className="w-4 h-4 text-amber-600" />;
      case 'cookie':
        return <Cookie className="w-4 h-4 text-amber-400" />;
      case 'cheese':
        return <Sparkles className="w-4 h-4 text-yellow-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  // Helper to render utensil icons
  const renderUtensilIcon = (icon: UtensilIconType) => {
    switch (icon) {
      case 'blender':
        return <Utensils className="w-4 h-4 text-purple-400" />;
      case 'scale':
        return <Scale className="w-4 h-4 text-emerald-400" />;
      case 'timer':
        return <Timer className="w-4 h-4 text-cyan-400" />;
      case 'oven':
        return <Flame className="w-4 h-4 text-orange-400" />;
      default:
        return <Utensils className="w-4 h-4 text-amber-400" />;
    }
  };

  // Calculate total ingredients count
  const totalIngredientsCount = recipe.ingredientSections.reduce(
    (acc, sec) => acc + sec.items.length,
    0
  );
  const checkedCount = Object.values(checkedIngredients).filter(Boolean).length;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl space-y-6">
      {/* Top Culinary Hero Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 via-zinc-950 to-purple-950/60 p-5 sm:p-7 border-b border-zinc-800 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                <ChefHat className="w-3.5 h-3.5" />
                <span>Receita Extraída com Gemini AI</span>
              </span>

              <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
                {recipe.category}
              </span>

              <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-purple-950 text-purple-300 border border-purple-800/60">
                Dificuldade: {recipe.difficulty}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {recipe.recipeTitle}
            </h2>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              {recipe.recipeDescription}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
            {onReanalyze && (
              <button
                type="button"
                onClick={onReanalyze}
                disabled={isReanalyzing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-all"
                title="Reanalisar com Gemini"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isReanalyzing ? 'animate-spin' : ''}`} />
                <span>{isReanalyzing ? 'Analisando...' : 'Reanalisar'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyRecipe}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiada!' : 'Copiar'}</span>
            </button>

            {onSelectSQL && (
              <button
                type="button"
                onClick={() => onSelectSQL(`SELECT * FROM recipes WHERE id = '${recipe.id}';`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-cyan-300 font-mono text-xs border border-cyan-500/30 transition-all"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>SQL</span>
              </button>
            )}
          </div>
        </div>

        {/* Recipe Quick Stats */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-zinc-800/80">
          <div className="flex items-center gap-2.5 bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800">
            <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Preparo</span>
              <span className="text-xs font-bold text-white">{recipe.prepTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800">
            <Flame className="w-4 h-4 text-orange-400 shrink-0" />
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Cozimento</span>
              <span className="text-xs font-bold text-white">{recipe.cookTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800">
            <Users className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Rendimento</span>
              <span className="text-xs font-bold text-white">{recipe.servings}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Mise en place</span>
              <span className="text-xs font-bold text-emerald-400">
                {checkedCount}/{totalIngredientsCount} checados
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-5 sm:px-7">
        <div className="flex items-center gap-2 border-b border-zinc-800 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('ingredients')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'ingredients'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <ChefHat className="w-4 h-4 text-amber-400" />
            <span>Ingredientes por Seção</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-800 text-zinc-300">
              {totalIngredientsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('utensils')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'utensils'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Utensils className="w-4 h-4 text-purple-400" />
            <span>Utensílios (Mise en Place)</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-800 text-zinc-300">
              {recipe.utensils.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('steps')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'steps'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Etapas de Preparo</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-800 text-zinc-300">
              {recipe.preparationSteps.length}
            </span>
          </button>

          {recipe.chefTips && recipe.chefTips.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('tips')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'tips'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Lightbulb className="w-4 h-4 text-cyan-400" />
              <span>Dicas de Chef</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-800 text-zinc-300">
                {recipe.chefTips.length}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Content Body */}
      <div className="px-5 sm:px-7 pb-6">
        {/* TAB 1: INGREDIENTES COM SEPARAÇÃO E ÍCONES */}
        {activeTab === 'ingredients' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Clique em cada item para marcar no seu Mise en Place</span>
              </span>
              <button
                type="button"
                onClick={() => setCheckedIngredients({})}
                className="text-zinc-400 hover:text-white underline text-xs"
              >
                Limpar marcações
              </button>
            </div>

            <div className="space-y-5">
              {recipe.ingredientSections.map((sec, secIdx) => (
                <div
                  key={secIdx}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-lg"
                >
                  {/* Section Title (ex: "Calda de Caramelo", "Massa do Pudim") */}
                  <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-zinc-800/80">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <h3 className="font-bold text-white text-sm sm:text-base tracking-wide">
                      {sec.sectionName}
                    </h3>
                    <span className="text-xs text-zinc-500 font-mono">
                      ({sec.items.length} itens)
                    </span>
                  </div>

                  {/* List of Ingredients */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {sec.items.map((item, itemIdx) => {
                      const itemKey = `${secIdx}_${itemIdx}`;
                      const isChecked = Boolean(checkedIngredients[itemKey]);

                      return (
                        <div
                          key={itemIdx}
                          onClick={() => toggleIngredient(itemKey)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                            isChecked
                              ? 'bg-amber-950/20 border-amber-600/40 opacity-75'
                              : 'bg-zinc-900 border-zinc-800/90 hover:border-zinc-700'
                          }`}
                        >
                          {/* Custom Checkbox */}
                          <div className="mt-0.5 shrink-0 text-zinc-500">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-amber-400" />
                            ) : (
                              <Square className="w-4 h-4 text-zinc-600" />
                            )}
                          </div>

                          {/* Ingredient Icon Badge */}
                          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/80 flex items-center justify-center shrink-0">
                            {renderIngredientIcon(item.icon)}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2 flex-wrap">
                              <span
                                className={`text-xs sm:text-sm font-semibold truncate ${
                                  isChecked ? 'line-through text-zinc-500' : 'text-zinc-100'
                                }`}
                              >
                                {item.name}
                              </span>
                              <span className="text-xs font-mono font-bold text-amber-400 shrink-0">
                                {item.quantity}
                              </span>
                            </div>

                            {item.notes && (
                              <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1 italic">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: UTENSÍLIOS (MISE EN PLACE) */}
        {activeTab === 'utensils' && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-400 mb-2">
              Separe todos os utensílios e equipamentos na bancada antes de iniciar o preparo (Mise en Place).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {recipe.utensils.map((utensil, uIdx) => (
                <div
                  key={uIdx}
                  className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex items-start gap-3.5 hover:border-zinc-700 transition-all"
                >
                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
                    {renderUtensilIcon(utensil.icon)}
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-100 mb-1">
                      {utensil.name}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {utensil.purpose}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ETAPAS DE PREPARO */}
        {activeTab === 'steps' && (
          <div className="space-y-4">
            <div className="space-y-3.5">
              {recipe.preparationSteps.map((step, sIdx) => {
                const isStepDone = Boolean(completedSteps[step.stepNumber]);

                return (
                  <div
                    key={sIdx}
                    className={`bg-zinc-950 border rounded-2xl p-4 sm:p-5 transition-all ${
                      isStepDone
                        ? 'border-emerald-600/40 bg-emerald-950/10'
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                            isStepDone
                              ? 'bg-emerald-500 text-white'
                              : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                          }`}
                        >
                          {step.stepNumber}
                        </div>
                        <h4
                          className={`text-sm sm:text-base font-bold ${
                            isStepDone ? 'text-emerald-300' : 'text-zinc-100'
                          }`}
                        >
                          {step.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        {step.timeEstimate && (
                          <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                            {step.timeEstimate}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => toggleStep(step.stepNumber)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                            isStepDone
                              ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-zinc-800 text-zinc-400 hover:text-white border-zinc-700'
                          }`}
                        >
                          {isStepDone ? 'Concluído ✓' : 'Marcar'}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-300 mt-2.5 leading-relaxed pl-9">
                      {step.instruction}
                    </p>

                    {step.tip && (
                      <div className="mt-3 ml-9 p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 flex items-start gap-2.5 text-xs text-amber-200">
                        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-amber-300">Dica de Chef: </span>
                          <span>{step.tip}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: DICAS DE CHEF */}
        {activeTab === 'tips' && recipe.chefTips && (
          <div className="space-y-3">
            {recipe.chefTips.map((tip, tIdx) => (
              <div
                key={tIdx}
                className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
