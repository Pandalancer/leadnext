export const MIN_INITIAL_LEAD_QUESTIONS = 1;
export const MAX_INITIAL_LEAD_QUESTIONS = 6;

export type QuestionType = 'TEXT' | 'MULTIPLE_CHOICE' | 'DROPDOWN' | 'CHECKBOX' | 'RANGE';

export type InitialLeadQuestion = {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  min?: number;
  max?: number;
};

export function parseInitialLeadQuestions(value: unknown): InitialLeadQuestion[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const id = "id" in item && typeof item.id === "string" ? item.id.trim() : "";
      const question = "question" in item && typeof item.question === "string" ? item.question.trim() : "";
      if (!id || !question) return null;

      let type: QuestionType = 'TEXT';
      if ("type" in item && typeof item.type === "string" && ['TEXT', 'MULTIPLE_CHOICE', 'DROPDOWN', 'CHECKBOX', 'RANGE'].includes(item.type)) {
        type = item.type as QuestionType;
      }

      const parsedQuestion: InitialLeadQuestion = { id, question, type };

      if (['MULTIPLE_CHOICE', 'DROPDOWN', 'CHECKBOX'].includes(type)) {
        let options: string[] = [];
        if ("options" in item && Array.isArray(item.options)) {
          options = item.options
            .filter((opt: unknown): opt is string => typeof opt === "string" && opt.trim() !== "")
            .map((opt: string) => opt.trim());
        }
        parsedQuestion.options = options;
      } else if (type === 'RANGE') {
        let min = 0;
        let max = 100;
        if ("min" in item && typeof item.min === "number") {
          min = item.min;
        } else if ("min" in item && typeof item.min === "string" && !isNaN(Number(item.min))) {
          min = Number(item.min);
        }
        if ("max" in item && typeof item.max === "number") {
          max = item.max;
        } else if ("max" in item && typeof item.max === "string" && !isNaN(Number(item.max))) {
          max = Number(item.max);
        }
        parsedQuestion.min = min;
        parsedQuestion.max = max;
      }

      return parsedQuestion;
    })
    .filter((item): item is InitialLeadQuestion => Boolean(item));
}

export function hasValidInitialLeadQuestionCount(questions: InitialLeadQuestion[]) {
  return (
    questions.length === 0 ||
    (questions.length >= MIN_INITIAL_LEAD_QUESTIONS &&
      questions.length <= MAX_INITIAL_LEAD_QUESTIONS)
  );
}
