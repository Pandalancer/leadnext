export const MIN_INITIAL_LEAD_QUESTIONS = 5;
export const MAX_INITIAL_LEAD_QUESTIONS = 6;

export type InitialLeadQuestion = {
  id: string;
  question: string;
};

export function parseInitialLeadQuestions(value: unknown): InitialLeadQuestion[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const id = "id" in item && typeof item.id === "string" ? item.id.trim() : "";
      const question = "question" in item && typeof item.question === "string" ? item.question.trim() : "";
      if (!id || !question) return null;
      return { id, question };
    })
    .filter((item): item is InitialLeadQuestion => Boolean(item))
    .slice(0, MAX_INITIAL_LEAD_QUESTIONS);
}

export function hasValidInitialLeadQuestionCount(questions: InitialLeadQuestion[]) {
  return (
    questions.length === 0 ||
    (questions.length >= MIN_INITIAL_LEAD_QUESTIONS &&
      questions.length <= MAX_INITIAL_LEAD_QUESTIONS)
  );
}
