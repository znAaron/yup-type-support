# Yup Type Support

A typescript compiler plugin that infers [yup](https://github.com/jquense/yup) schema object from a typescript type or interface.

## Installation

Use the package manager [npm](https://www.npmjs.com/package/yup-type-support) to install Yup Type Support.

```bash
npm i yup-type-support -D
```

## Usage

Yup Type Support requires [ttypescript](https://github.com/cevek/ttypescript). You can install the ttypescript using:

```bash
npm i ttypescript -D
```

Next you need to edit the tsconfig file to add the plugin to the compiler options.

```json
{
  "compilerOptions": {
    "plugins": [{ "transform": "yup-type-support", "type": "program" }],
  }
}
```

To use the yup type support to generate yup schema object at the compile time automatically, you simply need to put a comment annotation in the yup.object() function call.

Example:
```typescript
import * as yup from 'yup'

export interface simpleAccount {
    id: number;
    name: string;
    checking: boolean;
    notes?: string;
}

/* this will generate the following schema at compile time
 * exports.simpleAccountSchema = yup.object({
 *    id: yup.number().required(),
 *    name: yup.string().required(),
 *    checking: yup.boolean().required(),
 *    note: yup.string().optional()
 * });
 */
export const simpleAccountSchema: yup.SchemaOf<simpleAccount> = yup.object(/* guess schema */);
```
Currently, the plugin only supports number and string type, as well as the optional mark. More features are still under development. You also need to follow the format in the example closely (mainly how you declare the schema that will get changed in compile time), more flexible format support is also under development.

Now you can compile your typescript file using (or you can add the command to your package.json file):

```bash
ttsc
```

## Supported functions

### 1. Types
Currently, the yup-type-support supports all three primitive types in typescript. Support for array, enum and other types are still under development.

#### 1.1. string
```typescript
interface myInterface {
    key: string
}

// The interface above generates the following schema
const myInterfaceSchema: yup.SchemaOf<myInterface> = yup.object({
    key: yup.string().required(),
});
```
#### 1.2. number
```typescript
interface myInterface {
    key: number
}

// The interface above generates the following schema
const myInterfaceSchema: yup.SchemaOf<myInterface> = yup.object({
    key: yup.number().required(),
});
```
#### 1.3. boolean
```typescript
interface myInterface {
    key: boolean
}

// The interface above generates the following schema
const myInterfaceSchema: yup.SchemaOf<myInterface> = yup.object({
    key: yup.boolean().required(),
});
```

### 2. Properties

Currently, the yup-type-support supports requried and optional property of yup. Support for nullable is still under development.

#### 2.1. optional
```typescript
interface myInterface {
    key?: string
}

// The interface above generates the following schema
const myInterfaceSchema: yup.SchemaOf<myInterface> = yup.object({
    key: yup.string().optional(),
});
```

### 3. Roadmap for more functions

The development for now will focus on supporting more types, including array, enum, etc. For properties, nullable will be supported soon. The next major goal is to support nested types and convert them to the nested schema for yup.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
