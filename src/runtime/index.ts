import { MemberSchema } from './MemberSchema';

export * from './MemberSchema';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function memberSchema<T extends object>(): MemberSchema {
    throw new Error(
        'Oops! You have not added the \
        ts-transformer-member-schema to the custom transformer list, \
        please refer to: https://github.com/y1j2x34/ts-transformer-member-schema/blob/master/README.md'
    );
}
