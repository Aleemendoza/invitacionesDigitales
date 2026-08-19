type FoodPreferenceRow = { food_preference?: unknown };

/** Supports Supabase's object and array relationship response shapes. */
export function memberFoodPreference(relation: unknown): string | null {
  const row = (Array.isArray(relation) ? relation[0] : relation) as FoodPreferenceRow | null;
  return typeof row?.food_preference === "string" ? row.food_preference : null;
}
