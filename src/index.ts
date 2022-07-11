import type * as yup from 'yup';
import transformer from './plugin'

export default transformer

export function guessSchema<T>() {
    // @ts-ignore
    const placeHolder : yup.SchemaOf<T> = "I am a place holder";
    return placeHolder;
}