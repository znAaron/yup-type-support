import * as yup from 'yup';
import guessSchema from '../../index'

export interface account {
    id: number;
    name: string;
    password: string;
    note?: string;
}

export const accountValidSchema : yup.SchemaOf<account> = guessSchema<account> ();