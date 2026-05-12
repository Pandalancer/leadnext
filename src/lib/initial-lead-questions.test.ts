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
        question: 'Q1',
        type: 'TEXT'
      });
      assert.strictEqual(hasValidInitialLeadQuestionCount(questions), true);
    });

    it('should return true for a count between MIN and MAX', () => {
      const middleCount = Math.floor((MIN_INITIAL_LEAD_QUESTIONS + MAX_INITIAL_LEAD_QUESTIONS) / 2);
      const testCount = middleCount > MIN_INITIAL_LEAD_QUESTIONS && middleCount < MAX_INITIAL_LEAD_QUESTIONS
        ? middleCount
        : MIN_INITIAL_LEAD_QUESTIONS + 1;

      const questions = Array(testCount).fill({
        id: '1',
        question: 'Q1',
        type: 'TEXT'
      });
      assert.strictEqual(hasValidInitialLeadQuestionCount(questions), true);
    });

    it('should return true for MAX_INITIAL_LEAD_QUESTIONS', () => {
      const questions = Array(MAX_INITIAL_LEAD_QUESTIONS).fill({
        id: '1',
        question: 'Q1',
        type: 'TEXT'
      });
      assert.strictEqual(hasValidInitialLeadQuestionCount(questions), true);
    });

    it('should return false for more than MAX_INITIAL_LEAD_QUESTIONS', () => {
      const questions = Array(MAX_INITIAL_LEAD_QUESTIONS + 1).fill({
        id: '1',
        question: 'Q1',
        type: 'TEXT'
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

    it('should parse valid questions and trim strings, defaulting to TEXT', () => {
      const input = [
        { id: ' 1 ', question: ' What is your name? ' },
        { id: '2', question: 'How did you hear about us?' }
      ];
      const expected = [
        { id: '1', question: 'What is your name?', type: 'TEXT' },
        { id: '2', question: 'How did you hear about us?', type: 'TEXT' }
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
        { id: '1', question: 'Q1', type: 'TEXT' }
      ];
      assert.deepStrictEqual(parseInitialLeadQuestions(input), expected);
    });

    it('should parse MULTIPLE_CHOICE, DROPDOWN, and CHECKBOX options', () => {
      const input = [
        { id: '1', question: 'Q1', type: 'MULTIPLE_CHOICE', options: [' A ', 'B', 123, null, 'C '] },
        { id: '2', question: 'Q2', type: 'DROPDOWN', options: ['1', '2'] },
        { id: '3', question: 'Q3', type: 'CHECKBOX', options: [] }
      ];
      const expected = [
        { id: '1', question: 'Q1', type: 'MULTIPLE_CHOICE', options: ['A', 'B', 'C'] },
        { id: '2', question: 'Q2', type: 'DROPDOWN', options: ['1', '2'] },
        { id: '3', question: 'Q3', type: 'CHECKBOX', options: [] }
      ];
      assert.deepStrictEqual(parseInitialLeadQuestions(input), expected);
    });

    it('should parse RANGE min and max', () => {
      const input = [
        { id: '1', question: 'Q1', type: 'RANGE', min: 10, max: 50 },
        { id: '2', question: 'Q2', type: 'RANGE', min: '5', max: '20' },
        { id: '3', question: 'Q3', type: 'RANGE' }
      ];
      const expected = [
        { id: '1', question: 'Q1', type: 'RANGE', min: 10, max: 50 },
        { id: '2', question: 'Q2', type: 'RANGE', min: 5, max: 20 },
        { id: '3', question: 'Q3', type: 'RANGE', min: 0, max: 100 }
      ];
      assert.deepStrictEqual(parseInitialLeadQuestions(input), expected);
    });

    it('should fallback to TEXT if type is invalid', () => {
      const input = [
        { id: '1', question: 'Q1', type: 'INVALID_TYPE' }
      ];
      const expected = [
        { id: '1', question: 'Q1', type: 'TEXT' }
      ];
      assert.deepStrictEqual(parseInitialLeadQuestions(input), expected);
    });
  });
});
