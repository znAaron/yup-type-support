import * as yup from 'yup'

export interface simpleAccount {
    id: number;
    name: string;
    password: string;
    notes?: string;
}

export const simpleAccountSchema: yup.SchemaOf<simpleAccount> = yup.object(/* guess schema */);