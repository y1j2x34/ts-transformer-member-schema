import ts from 'typescript';

export enum Modifier {
    none = '',
    publicMemberModifier = 'public',
    privateMemberModifier = 'private',
    protectedMemberModifier = 'protected',
    exportedModifier = 'export',
    ambientModifier = 'declare',
    staticModifier = 'static',
    abstractModifier = 'abstract',
    optionalModifier = 'optional',
    deprecatedModifier = 'deprecated',
}

export type Type =
    | null
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
}
export interface TypeSchema {
    type: TypeName;
}
export interface ReferenceTypeSchema extends TypeSchema {
    type: TypeName.reference;
    name: string;
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
    properties: PropertySchema[];
}

export interface UnionTypeSchema extends TypeSchema {
    type: TypeName.union;
    union: Type[];
}

export interface PropertySchema {
    name: string;
    optionsal: boolean;
    type: Type;
    modifiers: Modifier[];
}

export interface MethodSchema {
    name: string;
    arguments: ArgumentSchema[];
    returnType: Type;
    signature: ts.SignatureKind;
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
