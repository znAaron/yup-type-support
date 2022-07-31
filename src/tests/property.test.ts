import * as yup from 'yup';

test('optional schema', () => {
  interface optionalInterface {
    required: string,
    optional?: string
  }
  const optionalSchema: yup.SchemaOf<optionalInterface> = yup.object(/* guess schema */);

  const mockValidOptionalObject = {
    required: "required"
  };
  const mockValidOptionalObjectWOption = {
    required: "required",
    optional: "optional"
  };
  const mockInvalidStringObject = {
    optional: "optional"
  };

  expect(() => {
    optionalSchema.validateSync(mockValidOptionalObject);
  }).not.toThrow();
  expect(() => {
    optionalSchema.validateSync(mockValidOptionalObjectWOption);
  }).not.toThrow();
  expect(() => {
    optionalSchema.validateSync(mockInvalidStringObject);
  }).toThrow();
});

//Todo: add test for nullable interface