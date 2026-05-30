'use client';
// components/MealPlanner.jsx
// 'use client' direktifi zorunlu — useState, event handler kullanıldığı için.
// Geri kalan kod App.jsx ile birebir aynıdır.

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

// ── Sabitler ───────────────────────────────────────────────────────────────

const BUDGET_FALLBACK = {
  ekonomik: ['ekonomik', 'orta'],
  orta:     ['orta', 'ekonomik', 'premium'],
  premium:  ['premium', 'orta'],
};

const MEAL_CALORIE_RATIO = {
  kahvalti:  0.25,
  ogle:      0.35,
  ara_ogun:  0.10,
  aksam:     0.30,
};

// ── Yardımcı fonksiyonlar ──────────────────────────────────────────────────

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function distributeRecipesForWeek(recipes, days) {
  if (!recipes || recipes.length === 0) return Array(days).fill(null);
  let pool = shuffleArray(recipes);
  const result = [];
  for (let i = 0; i < days; i++) {
    if (pool.length === 0) {
      pool = shuffleArray(recipes);
      if (result.length > 0 && pool[0]?.id === result[result.length - 1]?.id) {
        pool.push(pool.shift());
      }
    }
    result.push(pool.shift());
  }
  return result;
}

function parseSupabaseError(error) {
  if (!error) return null;
  const msg = error.message || error.toString();
  if (msg.includes('JWT') || msg.includes('auth') || msg.includes('401'))
    return 'Veritabanı bağlantı yetkisi reddedildi. Supabase API anahtarını kontrol edin.';
  if (msg.includes('relation') || msg.includes('does not exist') || msg.includes('404'))
    return 'Veritabanı tablosu bulunamadı. Tablo adlarını kontrol edin.';
  if (msg.includes('column') || msg.includes('field'))
    return `Sütun adı hatası: ${msg}`;
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('Failed'))
    return 'Ağ bağlantısı kurulamadı. İnternet bağlantınızı kontrol edin.';
  if (msg.includes('policy') || msg.includes('RLS') || msg.includes('403'))
    return 'Supabase RLS politikası erişimi engelliyor. Tablo politikalarını kontrol edin.';
  return `Beklenmeyen hata: ${msg}`;
}

// ── Bileşen ────────────────────────────────────────────────────────────────

export default function MealPlanner() {
  const [personCount, setPersonCount]             = useState(2);
  const [category, setCategory]                   = useState('sporcu');
  const [budget, setBudget]                       = useState('ekonomik');
  const [selectedMeals, setSelectedMeals]         = useState(['kahvalti', 'aksam']);
  const [fridgeIngredients, setFridgeIngredients] = useState([]);
  const [calorieGoal, setCalorieGoal]             = useState(2000);
  const [weeklyPlan, setWeeklyPlan]               = useState(null);
  const [shoppingList, setShoppingList]           = useState([]);
  const [loading, setLoading]                     = useState(false);
  const [usedFallback, setUsedFallback]           = useState(false);
  const [errorDetail, setErrorDetail]             = useState(null);

  const popularIngredients = [
    { id: 1,  name: '🍗 Tavuk Göğsü' },
    { id: 4,  name: '🥩 Kıyma' },
    { id: 19, name: '🥩 Kuşbaşı Et' },
    { id: 11, name: '🐟 Somon Fileto' },
    { id: 6,  name: '🥚 Yumurta' },
    { id: 5,  name: '🥛 Yoğurt' },
    { id: 7,  name: '🧀 Beyaz Peynir' },
    { id: 8,  name: '🍅 Domates' },
    { id: 20, name: '🫑 Yeşil Biber' },
    { id: 3,  name: '🥒 Kabak' },
    { id: 2,  name: '🍄 Mantar' },
    { id: 9,  name: '🥣 Yulaf Ezmesi' },
    { id: 14, name: '🥑 Avokado' },
    { id: 10, name: '🍌 Muz' },
  ];

  const mealOptions = [
    { id: 'kahvalti', label: '🍳 Kahvaltı' },
    { id: 'ogle',     label: '☀️ Öğle Yemeği' },
    { id: 'ara_ogun', label: '🍒 Ara Öğün' },
    { id: 'aksam',    label: '🌙 Akşam Yemeği' },
  ];

  const mealLabel = (type) =>
    type === 'kahvalti'   ? 'Kahvaltı'
    : type === 'ogle'     ? 'Öğle Yemeği'
    : type === 'ara_ogun' ? 'Ara Öğün'
    : 'Akşam Yemeği';

  const toggleMeal = (mealId) => {
    if (selectedMeals.includes(mealId)) {
      if (selectedMeals.length === 1) return;
      setSelectedMeals(selectedMeals.filter(m => m !== mealId));
    } else {
      setSelectedMeals([...selectedMeals, mealId]);
    }
  };

  const toggleIngredient = (id) => {
    if (fridgeIngredients.includes(id)) {
      setFridgeIngredients(fridgeIngredients.filter(item => item !== id));
    } else {
      setFridgeIngredients([...fridgeIngredients, id]);
    }
  };

  const normalizedRatio = (mealType) => {
    const totalRatio = selectedMeals.reduce((sum, m) => sum + (MEAL_CALORIE_RATIO[m] || 0), 0);
    return totalRatio > 0 ? (MEAL_CALORIE_RATIO[mealType] || 0) / totalRatio : 0;
  };

  const targetCalorieForMeal = (mealType) =>
    Math.round(calorieGoal * normalizedRatio(mealType));

  const generatePlan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUsedFallback(false);
    setErrorDetail(null);

    try {
      const fallbackChain = BUDGET_FALLBACK[budget] || [budget];
      let allRecipes = [];
      let didFallback = false;

      for (const budgetTier of fallbackChain) {
        const { data, error } = await supabase
          .from('recipes')
          .select('id, title, description, base_calorie, meal_type, category, budget_segment')
          .eq('category', category)
          .eq('budget_segment', budgetTier);

        if (error) throw { ...error, _tier: budgetTier };

        const tierRecipes = (data || []).map(r => ({
          ...r,
          _fromFallback: budgetTier !== budget,
        }));

        if (tierRecipes.some(r => r._fromFallback)) didFallback = true;
        allRecipes = [...allRecipes, ...tierRecipes];

        const hasEnough = selectedMeals.every(
          mealType => allRecipes.filter(r => r.meal_type === mealType).length >= 3
        );
        if (hasEnough) break;
      }

      setUsedFallback(didFallback);

      const filteredRecipes = allRecipes.filter(r => selectedMeals.includes(r.meal_type));

      if (!filteredRecipes || filteredRecipes.length === 0) {
        setErrorDetail('Seçtiğiniz kriterlere uygun hiç tarif bulunamadı. Kategori veya bütçeyi değiştirip tekrar deneyin.');
        setLoading(false);
        return;
      }

      const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

      const mealTypeQueues = {};
      selectedMeals.forEach(mealType => {
        const pool = filteredRecipes.filter(r => r.meal_type === mealType);
        mealTypeQueues[mealType] = distributeRecipesForWeek(pool, days.length);
      });

      const plan = days.map((day, dayIndex) => {
        const dayMeals = selectedMeals.map(mealType => {
          const chosen = mealTypeQueues[mealType]?.[dayIndex];
          const targetCal = targetCalorieForMeal(mealType);
          return chosen
            ? { mealType, targetCal, ...chosen }
            : { mealType, targetCal, title: 'Alternatif Dengeli Menü', description: 'Kriterlerinize uygun serbest ve sağlıklı öğün seçimi.', base_calorie: targetCal };
        });
        return { day, meals: dayMeals };
      });

      setWeeklyPlan(plan);

      const recipeIds = filteredRecipes.map(r => r.id).filter(Boolean);

      if (recipeIds.length > 0) {
        const { data: riData, error: riError } = await supabase
          .from('recipe_ingredients')
          .select('recipe_id, ingredient_id, amount, unit')
          .in('recipe_id', recipeIds);

        if (riError) {
          console.warn('recipe_ingredients sorgusu başarısız:', riError.message);
          setShoppingList([]);
        } else {
          const ingredientIds = [...new Set((riData || []).map(r => r.ingredient_id).filter(Boolean))];
          let ingredientMap = {};

          if (ingredientIds.length > 0) {
            const { data: ingData, error: ingError } = await supabase
              .from('ingredients')
              .select('id, name, shop_category')
              .in('id', ingredientIds);
            if (!ingError) {
              (ingData || []).forEach(ing => { ingredientMap[ing.id] = ing; });
            }
          }

          const compiledList = {};
          (riData || []).forEach(item => {
            const ing = ingredientMap[item.ingredient_id];
            if (!ing) return;
            if (!compiledList[ing.id]) {
              compiledList[ing.id] = {
                name: ing.name,
                category: ing.shop_category,
                amount: 0,
                unit: item.unit,
                inFridge: fridgeIngredients.includes(Number(ing.id)),
              };
            }
            compiledList[ing.id].amount += Number(item.amount || 0) * personCount * 1.5;
          });
          setShoppingList(Object.values(compiledList));
        }
      } else {
        setShoppingList([]);
      }

    } catch (error) {
      console.error('generatePlan hatası:', error);
      setErrorDetail(parseSupabaseError(error));
    } finally {
      setLoading(false);
    }
  };

  const dailyTotalCalorie = weeklyPlan
    ? weeklyPlan[0].meals.reduce((sum, m) => sum + (Number(m.base_calorie) || 0), 0)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="p-4 md:p-8">

        {/* HEADER */}
        <header className="max-w-4xl mx-auto text-center my-6">
          <a href="https://menuqo.com.tr" aria-label="Menuqo Ana Sayfa">
            <p className="text-4xl font-extrabold text-emerald-600" aria-label="Menuqo">
              menuqo<span className="text-gray-400 text-xl font-normal">.com.tr</span>
            </p>
          </a>
          <p className="mt-2 text-gray-600 font-medium">Haftalık planın, akıllı alışverişin.</p>
          <h1 className="sr-only">Haftalık Yemek Menüsü Planlayıcı & Akıllı Alışveriş Listesi</h1>
        </header>

        {!weeklyPlan ? (
          <main id="main-content" className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">

            {errorDetail && (
              <div role="alert" className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm font-bold text-red-700 mb-1">⚠️ Hata</p>
                <p className="text-sm text-red-600">{errorDetail}</p>
                <p className="text-xs text-red-400 mt-2">
                  Supabase Dashboard → Table Editor → RLS politikalarını kontrol edin.
                </p>
              </div>
            )}

            <form onSubmit={generatePlan} className="space-y-6" aria-label="Haftalık yemek menüsü oluşturma formu">

              {/* Kişi Sayısı */}
              <fieldset>
                <legend className="block text-xs font-bold text-gray-500 uppercase mb-2">👤 Kaç Kişilik?</legend>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button key={num} type="button" onClick={() => setPersonCount(num)}
                      aria-pressed={personCount === num}
                      className={personCount === num
                        ? "py-3 rounded-xl font-bold border border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "py-3 rounded-xl border border-gray-200 bg-white"}>
                      {num} Kişilik
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Günlük Kalori Hedefi */}
              <fieldset>
                <legend className="block text-xs font-bold text-gray-500 uppercase mb-2">🔥 Günlük Kalori Hedefi</legend>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">
                      {calorieGoal < 1500 ? '⚖️ Diyet'
                        : calorieGoal < 2200 ? '🏃 Dengeli'
                        : calorieGoal < 2800 ? '💪 Aktif'
                        : '🏋️ Yoğun Sporcu'}
                    </span>
                    <output className="text-2xl font-extrabold text-emerald-600" aria-live="polite">
                      {calorieGoal.toLocaleString()} kcal
                    </output>
                  </div>
                  <input type="range" min="1200" max="4000" step="50"
                    value={calorieGoal}
                    onChange={(e) => setCalorieGoal(Number(e.target.value))}
                    aria-label="Günlük kalori hedefi"
                    className="w-full accent-emerald-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1" aria-hidden="true">
                    <span>1.200</span><span>2.000</span><span>3.000</span><span>4.000</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-1.5">
                    {selectedMeals.map(mealType => (
                      <div key={mealType} className="flex justify-between bg-white rounded-lg px-3 py-1.5 border border-gray-100 text-xs">
                        <span className="text-gray-500">{mealLabel(mealType)}</span>
                        <span className="font-bold text-emerald-700">~{targetCalorieForMeal(mealType)} kcal</span>
                      </div>
                    ))}
                  </div>
                </div>
              </fieldset>

              {/* Öğün Seçimi */}
              <fieldset>
                <legend className="block text-xs font-bold text-gray-500 uppercase mb-2">🍽️ Hangi Öğünleri İstiyorsunuz?</legend>
                <div className="grid grid-cols-2 gap-2">
                  {mealOptions.map((meal) => {
                    const isSelected = selectedMeals.includes(meal.id);
                    return (
                      <button key={meal.id} type="button" onClick={() => toggleMeal(meal.id)}
                        aria-pressed={isSelected}
                        className={isSelected
                          ? "p-3 text-left rounded-xl border border-emerald-500 bg-emerald-50 font-bold text-emerald-700 flex justify-between items-center"
                          : "p-3 text-left rounded-xl border border-gray-200 bg-white flex justify-between items-center"}>
                        <span>{meal.label}</span>
                        {isSelected && <span aria-hidden="true" className="text-emerald-600 text-sm">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Bütçe */}
              <fieldset>
                <legend className="block text-xs font-bold text-gray-500 uppercase mb-2">💳 Bütçe Segmenti</legend>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ekonomik', title: '🌱 Ekonomik' },
                    { id: 'orta',     title: '💥 Standart / Orta' },
                    { id: 'premium',  title: '💎 Premium' },
                  ].map((bgt) => (
                    <button key={bgt.id} type="button" onClick={() => setBudget(bgt.id)}
                      aria-pressed={budget === bgt.id}
                      className={budget === bgt.id
                        ? "p-3 text-center rounded-xl border border-emerald-500 bg-emerald-50 font-bold text-emerald-700 text-xs"
                        : "p-3 text-center rounded-xl border border-gray-200 bg-white text-xs"}>
                      {bgt.title}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Beslenme Tarzı */}
              <fieldset>
                <legend className="block text-xs font-bold text-gray-500 uppercase mb-2">🥗 Beslenme Tarzı</legend>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'klasik',     title: '🌾 Klasik Menü' },
                    { id: 'sporcu',     title: '💪 Sporcu Menüsü' },
                    { id: 'saglikli',   title: '🥑 Sağlıklı Beslenme' },
                    { id: 'vejetaryen', title: '🥦 Vejetaryen Menü' },
                  ].map((cat) => (
                    <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                      aria-pressed={category === cat.id}
                      className={category === cat.id
                        ? "p-3 text-left rounded-xl border border-emerald-500 bg-emerald-50 font-bold text-emerald-700"
                        : "p-3 text-left rounded-xl border border-gray-200 bg-white"}>
                      {cat.title}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Dolap */}
              <fieldset>
                <legend className="block text-xs font-bold text-gray-500 uppercase mb-1">🍏 Dolabımda Ne Var?</legend>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {popularIngredients.map((ing) => (
                    <button key={ing.id} type="button" onClick={() => toggleIngredient(ing.id)}
                      aria-pressed={fridgeIngredients.includes(ing.id)}
                      className={fridgeIngredients.includes(ing.id)
                        ? "px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-600 text-white"
                        : "px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200"}>
                      {ing.name}
                    </button>
                  ))}
                </div>
              </fieldset>

              <button type="submit" disabled={loading} aria-busy={loading}
                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 shadow-md">
                {loading ? "Plan Sihirbazı Çalışıyor... ⏳" : "🪄 Haftalık Planımı Oluştur"}
              </button>
            </form>

            {/* SEO içerik footer */}
            <footer className="mt-10 pt-6 border-t border-gray-100">
              <section className="text-center">
                <h2 className="text-base font-bold text-gray-700 mb-2">Haftalık Yemek Menüsü Nasıl Oluşturulur?</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Menuqo ile birkaç tıkla kişiselleştirilmiş <strong>haftalık yemek planı</strong> oluşturun.
                  Klasik, sporcu, sağlıklı ve vejetaryen beslenme tarzlarından seçim yapın;
                  ekonomik, standart veya premium bütçeye göre filtreleyin.
                  7 günlük menünüz hazırlandığında <strong>otomatik alışveriş listesi</strong> de oluşturulur.
                </p>
              </section>
              <section className="mt-6 grid grid-cols-2 gap-3 text-center text-xs text-gray-400">
                {[
                  { icon: '📅', text: '7 Günlük Plan' },
                  { icon: '🛒', text: 'Otomatik Alışveriş Listesi' },
                  { icon: '🔥', text: 'Kalori Takibi' },
                  { icon: '💰', text: 'Bütçeye Göre Menü' },
                ].map((f, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xl mb-1" aria-hidden="true">{f.icon}</div>
                    <div className="font-medium text-gray-500">{f.text}</div>
                  </div>
                ))}
              </section>
              <section className="mt-6 space-y-3">
                <h2 className="text-sm font-bold text-gray-600">Sık Sorulan Sorular</h2>
                {[
                  { q: 'Menuqo ücretsiz mi?',              a: 'Evet, tamamen ücretsizdir. Kayıt gerektirmeden kullanabilirsiniz.' },
                  { q: 'Vejetaryen menü var mı?',           a: 'Evet. Vejetaryen beslenme tarzını seçerek et içermeyen 7 günlük menü oluşturabilirsiniz.' },
                  { q: 'Kalori takibi yapıyor mu?',         a: 'Evet. Günlük kalori hedefinizi belirleyin; her öğüne düşen kalori otomatik hesaplanır.' },
                  { q: 'Alışveriş listesi nasıl çalışır?',  a: '7 günlük plan oluşturulduğunda tüm tariflerin malzemeleri kişi sayısına göre hesaplanır.' },
                ].map((item, i) => (
                  <details key={i} className="bg-gray-50 rounded-xl px-4 py-3 text-sm">
                    <summary className="font-semibold text-gray-700 cursor-pointer">{item.q}</summary>
                    <p className="mt-2 text-gray-500">{item.a}</p>
                  </details>
                ))}
              </section>
            </footer>
          </main>

        ) : (
          /* DASHBOARD */
          <main id="main-content" className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div className="md:col-span-2 space-y-4">

              <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-100">
                <div className="text-sm font-bold text-gray-700">
                  📅 {category.toUpperCase()} · {budget.toUpperCase()}
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-gray-500">Hedef:</span>
                  <span className="text-sm font-extrabold text-emerald-600">{calorieGoal.toLocaleString()} kcal/gün</span>
                  {dailyTotalCalorie > 0 && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      Math.abs(dailyTotalCalorie - calorieGoal) < 200
                        ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      Gerçek: ~{dailyTotalCalorie} kcal
                    </span>
                  )}
                </div>
              </div>

              {usedFallback && (
                <div role="status" className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
                  ℹ️ Seçtiğiniz bütçede yeterli tarif bulunamadı, komşu bütçe segmentinden de tarifler eklendi.
                </div>
              )}

              {weeklyPlan.map((dayObj, idx) => (
                <article key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-sm font-extrabold text-emerald-600 uppercase tracking-wider mb-3 border-b pb-1">
                    {dayObj.day}
                  </h2>
                  <div className="space-y-3">
                    {dayObj.meals.map((meal, mIdx) => {
                      const diff = (meal.base_calorie || 0) - meal.targetCal;
                      const withinRange = Math.abs(diff) <= 150;
                      return (
                        <div key={mIdx} className="bg-gray-50 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex-1">
                            <span className="text-xs font-bold text-emerald-600 uppercase mr-2 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 inline-block">
                              {mealLabel(meal.mealType)}
                            </span>
                            <strong className="text-gray-800">{meal.title}</strong>
                            <p className="text-xs text-gray-500 italic mt-0.5">"{meal.description}"</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-xs font-bold text-emerald-600">🔥 {meal.base_calorie} kcal</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              withinRange ? 'bg-emerald-50 text-emerald-600'
                              : diff > 0  ? 'bg-red-50 text-red-500'
                              :              'bg-blue-50 text-blue-500'
                            }`}>
                              {withinRange ? '✓ Hedefe uygun' : diff > 0 ? `+${diff} kcal` : `${diff} kcal`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>
              ))}

              <button onClick={() => setWeeklyPlan(null)}
                className="text-sm text-emerald-600 font-bold underline pt-2">
                ← Seçimleri Değiştir
              </button>
            </div>

            <aside aria-label="Alışveriş listesi" className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 h-fit">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-3">🛒 Alışveriş Listesi</h2>
              <p className="text-xs text-gray-400 my-2">({personCount} Kişilik hesaplama)</p>
              <ul className="space-y-3 mt-4">
                {shoppingList.length > 0 ? shoppingList.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between text-sm py-2 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked={item.inFridge}
                        className="rounded text-emerald-600 w-4 h-4" />
                      <span className={item.inFridge ? "line-through text-gray-300 italic" : "text-gray-700 font-medium"}>
                        {item.name} {item.inFridge && "(Dolapta Var)"}
                      </span>
                    </div>
                    <span className={item.inFridge
                      ? "text-xs text-gray-300"
                      : "text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded"}>
                      {Math.round(item.amount)} {item.unit}
                    </span>
                  </li>
                )) : (
                  <li className="text-xs text-gray-400 italic">Bu menü için malzeme listesi hesaplanamadı.</li>
                )}
              </ul>
            </aside>
          </main>
        )}

        <footer className="max-w-5xl mx-auto mt-12 pb-6 text-center text-xs text-gray-400 border-t border-gray-100 pt-6">
          <p>© {new Date().getFullYear()} <a href="https://menuqo.com.tr" className="text-emerald-600 font-medium">menuqo.com.tr</a> — Haftalık yemek menüsü planlayıcı</p>
          <p className="mt-1">Klasik · Sporcu · Sağlıklı · Vejetaryen beslenme planları</p>
        </footer>
      </div>
    </div>
  );
}
