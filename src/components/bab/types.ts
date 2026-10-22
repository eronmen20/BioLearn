/* ───────── Quiz-v2 API types ───────── */
export interface QuizV2Question {
  id: number;
  bab_id: string;
  sub_bab_key: string | null;
  is_reflection: boolean;
  question_id: string;
  question_en: string;
  question_image_url: string;
  options_id: string[];
  options_en: string[];
  // jenis soal: 'single' (Pilihan Ganda, default) | 'true_false' (Benar/Salah).
  question_type?: string | null;
  sort_order?: number;
  // Note: correct_answer & explanations are ONLY populated after server check/verification
  correct_answer?: number;
  explanation_id?: string;
  explanation_en?: string;
}

export type QuizQuestionType = "single" | "true_false";

export function getQuestionType(q: QuizV2Question): QuizQuestionType {
  return q.question_type === "true_false" ? "true_false" : "single";
}

export function getQuestionTypeLabel(type: QuizQuestionType, lang: string): string {
  if (type === "true_false") return lang === "en" ? "True / False" : "Benar / Salah";
  return lang === "en" ? "Multiple Choice" : "Pilihan Ganda";
}

// Opsi yang ditampilkan: pakai yang tersimpan di DB; khusus Benar/Salah yang
// opsinya kosong/belum diisi → fallback ke Benar/Salah (True/False).
export function getDisplayOptions(q: QuizV2Question, lang: string): string[] {
  const stored = (lang === "en" ? q.options_en || q.options_id : q.options_id) || [];
  if (getQuestionType(q) === "true_false") {
    const filled = stored.filter((o) => o && o.trim());
    if (filled.length >= 2) return filled.slice(0, 2);
    return lang === "en" ? ["True", "False"] : ["Benar", "Salah"];
  }
  return stored;
}
