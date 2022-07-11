import * as yup from 'yup';

export default function guessSchema<T>() {
    // @ts-ignore
    const placeHolder : yup.SchemaOf<T> = "I am a place holder";
    return placeHolder;
}