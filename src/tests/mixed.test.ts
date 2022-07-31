import * as yup from 'yup';

test('simple account schema with primitive type and optional mark', () => {
  interface simpleAccount {
    id: number;
    name: string;
    checking: boolean;
    notes?: string;
  }
  const simpleAccountSchema: yup.SchemaOf<simpleAccount> = yup.object(/* guess schema */);

  const mockValidSimpleAccount = {
    id: 1,
    name: 'Mock Bank',
    checking: true
  };
  const mockValidSimpleAccount2 = {
    id: 2,
    name: 'Mock Bank',
    checking: false,
    notes: "saving account"
  };
  const mockInvalidSimpleAccount = {
    id: 3,
    name: 'Mock Bank',
    notes: "saving account"
  };
  const mockInvalidSimpleAccount2 = {
    id: 4,
    name: 'Mock Bank',
    checking: "Yes"
  };

  expect(() => {
    simpleAccountSchema.validateSync(mockValidSimpleAccount);
  }).not.toThrow();
  expect(() => {
    simpleAccountSchema.validateSync(mockValidSimpleAccount2);
  }).not.toThrow();
  expect(() => {
    simpleAccountSchema.validateSync(mockInvalidSimpleAccount);
  }).toThrow();
  expect(() => {
    simpleAccountSchema.validateSync(mockInvalidSimpleAccount2);
  }).toThrow();
});