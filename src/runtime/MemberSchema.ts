export enum Modifier {
    none = '',
    publicMemberModifier = 'public',
    privateMemberModifier = 'private',
    protectedMemberModifier = 'protected',
    exportedModifier = 'export',
    staticModifier = 'static',
    abstractModifier = 'abstract',
}

export type Type =
    | null
    | TypeSchema
    | ArrayTypeSchema
    | ReferenceTypeSchema
    | ParameterizedTypeSchema
    | GenericTypeSchema
    | LiteralTypeSchema
    | UnionTypeSchema;

export enum TypeName {
    reference = 'ref',
    array = 'array',
    parameterized = 'parameterized',
    generic = 'generic',
    union = 'union',
    literal = 'literal',
    tuple = 'tuple',
}
export enum LiterialType {
    numeric = 'numeric',
    string = 'string',
    boolean = 'boolean',
    null = 'null',
    undefined = 'undefined',
}

export interface LiterialSchema<V, T extends LiterialType> {
    value: V;
    type: T;
}

export type NumbericLiterial = LiterialSchema<number, LiterialType.numeric>;
export type StringLiterial = LiterialSchema<string, LiterialType.string>;
export type BooleanLiterial = LiterialSchema<boolean, LiterialType.boolean>;
export type NullLiterial = LiterialSchema<null, LiterialType.null>;
export type UndefinedLiterial = LiterialSchema<undefined, LiterialType.undefined>;

export interface TypeSchema {
    type: TypeName;
}
export interface ReferenceTypeSchema extends TypeSchema {
    type: TypeName.reference;
    name: string;
    arguments: Type[];
}

export interface ArrayTypeSchema extends TypeSchema {
    type: TypeName.array;
    elementType: Type;
}

export interface ParameterizedTypeSchema extends TypeSchema {
    type: TypeName.parameterized;
    selfType: string;
    argumentType: Type;
}

export interface GenericTypeSchema extends TypeSchema {
    type: TypeName.generic;
    parameterName: string;
    parameterType: Type;
}

export interface LiteralTypeSchema extends TypeSchema {
    type: TypeName.literal;
    literial: NumbericLiterial | StringLiterial | BooleanLiterial | NullLiterial | UndefinedLiterial;
}

export interface UnionTypeSchema extends TypeSchema {
    type: TypeName.union;
    union: Type[];
}

export interface PropertySchema {
    name: string;
    optional: boolean;
    type: Type;
    modifiers: Modifier[];
}

export interface MethodSchema {
    name: string;
    arguments: ArgumentSchema[];
    returnType: Type;
    modifiers: Modifier[];
}

export interface ArgumentSchema {
    index: number;
    name: string;
    optional: boolean;
    type: Type;
}

export interface MemberSchema {
    methods: MethodSchema[];
    properties: PropertySchema[];
    type: Type;
}
