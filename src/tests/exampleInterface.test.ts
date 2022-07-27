import { simpleAccountSchema } from "./exampleInterface";

test('simple schema validation pass', () => {
  const mockSimpleAccount_valid = {
    id: 1234,
    name: "Bank",
    password: "123456"
  };
  expect(() => {
    simpleAccountSchema.validateSync(mockSimpleAccount_valid)
  }).not.toThrow()
});

test('simple schema validation fail', () => {
  const mockSimpleAccount_valid = {
    id: 1234,
    name: "Bank",
  };
  expect(() => {
    simpleAccountSchema.validateSync(mockSimpleAccount_valid)
  }).toThrow()
});

