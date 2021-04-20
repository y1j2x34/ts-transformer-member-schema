import {
    ArgumentSchema,
    ArrayTypeSchema,
    LiteralTypeSchema,
    LiterialType,
    MemberSchema,
    MethodSchema,
    Modifier,
    PrimaryTypeName,
    PrimaryTypeSchema,
    PropertySchema,
    ReferenceTypeSchema,
    TypeName,
    TypeSchema,
    UnionTypeSchema,
    VoidTypeSchema,
} from '../runtime';
import ts from 'typescript';

export class MemberSchemaDescriber {
    private readonly type: ts.Type;
    constructor(private readonly typeNode: ts.TypeNode, private readonly typeChecker: ts.TypeChecker) {
        this.type = this.typeChecker.getTypeFromTypeNode(this.typeNode);
    }
    describe(): MemberSchema {
        const members = this.typeChecker.getPropertiesOfType(this.type);
        const properties = this.getAllProperties(members);
        const methods = this.getAllMethods(members);
        return {
            methods: this.describeMethods(methods),
            properties: this.describeProperties(properties),
            type: null,
        };
    }
    private describeProperties(properties: ts.Symbol[]): PropertySchema[] {
        return properties.map((it) => {
            console.info('property declaration', it.valueDeclaration);
            const declaration = it.valueDeclaration as ts.PropertyDeclaration | ts.PropertySignature;
            return {
                modifiers: this.convertModifiers(declaration.modifiers),
                optional: this.checkOptional(it),
                name: it.getName(),
                type: declaration.type ? this.describeTypeNode(declaration.type) : null,
            };
        });
    }
    private describeMethods(methods: ts.Symbol[]): MethodSchema[] {
        return methods.map((it) => {
            const declaration = it.valueDeclaration as ts.SignatureDeclarationBase;
            console.info('method declaration', declaration);
            // declaration.typeParameters?.map((it: ts.TypeParameterDeclaration) => {
            //     this.typeChecker.getA
            //     return {
            //         constraint: it.constraint ? this.describeTypeNode(it.constraint) : null,

            //     };
            // });
            return {
                modifiers: this.convertModifiers(declaration.modifiers),
                name: it.getName(),
                arguments: this.describeArguments(declaration.parameters),
                returnType: declaration.type ? this.describeTypeNode(declaration.type) : null,
            };
        });
    }
    private describeTypeNode(type: ts.TypeNode): TypeSchema {
        const SyntaxKind = ts.SyntaxKind;
        switch (type.kind) {
            case SyntaxKind.ArrayType:
                return this.describeArrayType(type as ts.ArrayTypeNode);
            case SyntaxKind.TypeReference:
                return this.describeReferenceType(type as ts.TypeReferenceNode);
            case SyntaxKind.UnionType:
                return this.describeUnionType(type as ts.UnionTypeNode);
            case SyntaxKind.LiteralType:
                return this.describeLiteralType(type as ts.LiteralTypeNode);
            case SyntaxKind.VoidKeyword:
                return this.describeVoidType();
            case SyntaxKind.StringLiteral:
            case SyntaxKind.NullKeyword:
            case SyntaxKind.UndefinedKeyword:
            case SyntaxKind.NumericLiteral:
            case SyntaxKind.TrueKeyword:
            case SyntaxKind.FalseKeyword:
            case SyntaxKind.TemplateLiteralType:
                return this.describeLiteralType(type as ts.LiteralTypeNode);
            case SyntaxKind.NumberKeyword:
                return this.describePrimaryType(PrimaryTypeName.number);
            case SyntaxKind.StringKeyword:
                return this.describePrimaryType(PrimaryTypeName.string);
            case SyntaxKind.BooleanKeyword:
                return this.describePrimaryType(PrimaryTypeName.boolean);
        }
        return null as never;
    }
    private describePrimaryType(name: PrimaryTypeName): PrimaryTypeSchema {
        return {
            type: TypeName.primary,
            name,
        };
    }
    private describeVoidType(): VoidTypeSchema {
        return {
            type: TypeName.void,
        };
    }
    private describeLiteralType(type: ts.LiteralTypeNode): LiteralTypeSchema {
        return {
            type: TypeName.literal,
            literial: this.describeLiterial(type.literal),
        };
    }
    private describeLiterial(literial: ts.LiteralTypeNode['literal']): LiteralTypeSchema['literial'] {
        const SyntaxKind = ts.SyntaxKind;
        switch (literial.kind) {
            case SyntaxKind.StringLiteral:
                return {
                    value: literial.text,
                    type: LiterialType.string,
                };
            case SyntaxKind.NullKeyword:
                return {
                    value: null,
                    type: LiterialType.null,
                };
            case SyntaxKind.UndefinedKeyword:
                return {
                    value: undefined,
                    type: LiterialType.undefined,
                };
            case SyntaxKind.NumericLiteral:
                return {
                    value: Number(literial.text),
                    type: LiterialType.numeric,
                };
            case SyntaxKind.TrueKeyword:
                return {
                    value: true,
                    type: LiterialType.boolean,
                };
            case SyntaxKind.FalseKeyword:
                return {
                    value: false,
                    type: LiterialType.boolean,
                };
            case SyntaxKind.TemplateLiteralType:
                return {
                    // eslint-disable-next-line quotes
                    value: literial.getText().replace(/`/g, "'").replace(/\}$/, "'").replace(/\}/g, "'+"),
                    type: LiterialType.string,
                };
        }
        return null as never;
    }
    private describeArrayType(type: ts.ArrayTypeNode): ArrayTypeSchema {
        return {
            type: TypeName.array,
            elementType: this.describeTypeNode(type.elementType),
        };
    }
    private describeReferenceType(type: ts.TypeReferenceNode): ReferenceTypeSchema {
        return {
            type: TypeName.reference,
            name: type.typeName.getText(),
            arguments: type.typeArguments ? type.typeArguments.map((it) => this.describeTypeNode(it)) : [],
        };
    }
    private describeUnionType(type: ts.UnionTypeNode): UnionTypeSchema {
        return {
            type: TypeName.union,
            union: type.types.map((it) => this.describeTypeNode(it)),
        };
    }
    private getAllMethods(members: ts.Symbol[]) {
        return members.filter((it) => {
            return ts.isMethodDeclaration(it.valueDeclaration) || ts.isMethodSignature(it.valueDeclaration);
        });
    }
    private getAllProperties(members: ts.Symbol[]) {
        return members.filter((it) => {
            return ts.isPropertyDeclaration(it.valueDeclaration) || ts.isPropertySignature(it.valueDeclaration);
        });
    }
    private checkOptional(symbol: ts.Symbol): boolean {
        return !symbol.declarations.some((it) => (it as ts.PropertySignature).questionToken === undefined);
    }
    private describeArguments(parameters: ts.NodeArray<ts.ParameterDeclaration>): ArgumentSchema[] {
        return parameters.map((it, index) => {
            return {
                index,
                name: it.name.getText(),
                optional: !!it.questionToken,
                type: it.type ? this.describeTypeNode(it.type) : null,
            };
        });
    }
    private convertModifiers(modifiers?: ts.ModifiersArray): Modifier[] {
        if (!modifiers) {
            return [];
        }
        const SyntaxKind = ts.SyntaxKind;
        return modifiers
            .map((it) => {
                switch (it.kind) {
                    case SyntaxKind.PrivateKeyword:
                        return Modifier.privateMemberModifier;
                    case SyntaxKind.PublicKeyword:
                        return Modifier.publicMemberModifier;
                    case SyntaxKind.AbstractKeyword:
                        return Modifier.abstractModifier;
                    case SyntaxKind.ExportKeyword:
                        return Modifier.exportedModifier;
                    case SyntaxKind.ProtectedKeyword:
                        return Modifier.protectedMemberModifier;
                    case SyntaxKind.StaticKeyword:
                        return Modifier.staticModifier;
                    default:
                        return Modifier.none;
                }
            })
            .filter((it) => it != Modifier.none);
    }
}
