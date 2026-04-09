import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
  hasValidInitialLeadQuestionCount,
  parseInitialLeadQuestions,
  MIN_INITIAL_LEAD_QUESTIONS,
  MAX_INITIAL_LEAD_QUESTIONS
} from './initial-lead-questions.ts';

describe('initial-lead-questions', () => {
  describe('hasValidInitialLeadQuestionCount', () => {
    it('should return true for 0 questions', () => {
      const questions = [];
      assert.strictEqual(hasValidInitialLeadQuestionCount(questions), true);
    });

    it('should return true for MIN_INITIAL_LEAD_QUESTIONS', () => {
      const questions = Array(MIN_INITIAL_LEAD_QUESTIONS).fill({
        id: '1',
        question: 'Q1'
      });
      assert.strictEqual(hasValidInitialLeadQuestionCount(questions), true);
    });

    it('should return true for a count between MIN and MAX', () => {
      const middleCount = Math.floor((MIN_INITIAL_LEAD_QUESTIONS + MAX_INITIAL_LEAD_QUESTIONS) / 2);
      // Ensure we are actually between (not equal to boundaries) if range allows
      const testCount = middleCount > MIN_INITIAL_LEAD_QUESTIONS && middleCount < MAX_INITIAL_LEAD_QUESTIONS
        ? middleCount
        : MIN_INITIAL_LEAD_QUESTIONS + 1;

      const questions = Array(testCount).fill({
        id: '1',
        question: 'Q1'
      });
      assert.strictEqual(hasValidInitialLeadQuestionCount(questions), true);
    });

    it('should return true for MAX_INITIAL_LEAD_QUESTIONS', () => {
      const questions = Array(MAX_INITIAL_LEAD_QUESTIONS).fill({
        id: '1',
        question: 'Q1'
      });
      assert.strictEqual(hasValidInitialLeadQuestionCount(questions), true);
    });

    it('should return false for more than MAX_INITIAL_LEAD_QUESTIONS', () => {
      const questions = Array(MAX_INITIAL_LEAD_QUESTIONS + 1).fill({
        id: '1',
        question: 'Q1'
      });
      assert.strictEqual(hasValidInitialLeadQuestionCount(questions), false);
    });
  });

  describe('parseInitialLeadQuestions', () => {
    it('should return an empty array if input is not an array', () => {
      assert.deepStrictEqual(parseInitialLeadQuestions(null), []);
      assert.deepStrictEqual(parseInitialLeadQuestions({}), []);
      assert.deepStrictEqual(parseInitialLeadQuestions('not an array'), []);
    });

    it('should parse valid questions and trim strings', () => {
      const input = [
        { id: ' 1 ', question: ' What is your name? ' },
        { id: '2', question: 'How did you hear about us?' }
      ];
      const expected = [
        { id: '1', question: 'What is your name?' },
        { id: '2', question: 'How did you hear about us?' }
      ];
      assert.deepStrictEqual(parseInitialLeadQuestions(input), expected);
    });

    it('should filter out invalid items', () => {
      const input = [
        { id: '1', question: 'Q1' },
        null,
        'not an object',
        { id: '', question: 'Q2' },
        { id: '2', question: '' },
        { question: 'No ID' },
        { id: '3' }
      ];
      const expected = [
        { id: '1', question: 'Q1' }
      ];
      assert.deepStrictEqual(parseInitialLeadQuestions(input), expected);
    });
  });
});
