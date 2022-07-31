import * as yup from 'yup';

test('string schema', () => {
  interface stringInterface {
    key: string
  }
  const stringSchema: yup.SchemaOf<stringInterface> = yup.object(/* guess schema */);

  const mockValidStringObject = {
    key: "true"
  };
  const mockInvalidStringObject = {
    key: [1,2,3]
  };

  expect(() => {
    stringSchema.validateSync(mockValidStringObject);
  }).not.toThrow();
  expect(() => {
    stringSchema.validateSync(mockInvalidStringObject);
  }).toThrow();
});

test('numebr schema', () => {
  interface numberInterface {
    key: number
  }
  const numberSchema: yup.SchemaOf<numberInterface> = yup.object(/* guess schema */);

  const mockValidNumberObject = {
    key: 1234
  };
  const mockInvalidNumberObject = {
    key: "false"
  };

  expect(() => {
    numberSchema.validateSync(mockValidNumberObject);
  }).not.toThrow();
  expect(() => {
    numberSchema.validateSync(mockInvalidNumberObject);
  }).toThrow();
});

test('boolean schema', () => {
  interface booleanInterface {
    key: boolean
  }
  const booleanSchema: yup.SchemaOf<booleanInterface> = yup.object(/* guess schema */);

  const mockValidBooleanObject = {
    key: true
  };
  const mockInvalidBooleanObject = {
    key: "string"
  };

  expect(() => {
    booleanSchema.validateSync(mockValidBooleanObject);
  }).not.toThrow();
  expect(() => {
    booleanSchema.validateSync(mockInvalidBooleanObject);
  }).toThrow();
});
