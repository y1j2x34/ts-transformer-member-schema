import { ArgumentSchema, MemberSchema, MethodSchema, Modifier, PropertySchema } from '../runtime';
import ts from 'typescript';

export class MemberSchemaBuilder {
    private readonly type: ts.Type;
    constructor(private readonly typeNode: ts.TypeNode, private readonly typeChecker: ts.TypeChecker) {
        this.type = this.typeChecker.getTypeFromTypeNode(this.typeNode);
    }
    build(): MemberSchema {
        const members = this.typeChecker.getPropertiesOfType(this.type);
        const properties = this.getAllProperties(members);
        const methods = this.getAllMethods(members);
        return {
            methods: this.buildMethods(methods),
            properties: this.buildProperties(properties),
            type: null,
        };
    }
    private buildProperties(properties: ts.Symbol[]): PropertySchema[] {
        return properties.map((it) => {
            return {
                modifiers: this.convertModifiers(it.valueDeclaration.modifiers),
                optional: this.isOptional(it),
                name: it.getName(),
                type: null,
            };
        });
    }
    private buildMethods(methods: ts.Symbol[]): MethodSchema[] {
        return methods.map((it) => {
            return {
                modifiers: this.convertModifiers(it.valueDeclaration.modifiers),
                name: it.getName(),
                arguments: this.convertArguments(),
                returnType: null,
            };
        });
    }
    private getAllMethods(members: ts.Symbol[]) {
        return members.filter((it) => {
            return ts.isMethodSignature(it.valueDeclaration);
        });
    }
    private getAllProperties(members: ts.Symbol[]) {
        return members.filter((it) => {
            return ts.isPropertySignature(it.valueDeclaration);
        });
    }
    private isOptional(symbol: ts.Symbol): boolean {
        return !symbol.declarations.some((it) => (it as ts.PropertySignature).questionToken === undefined);
    }
    private convertArguments(): ArgumentSchema[] {
        return [];
    }
    private convertModifiers(modifiers?: ts.ModifiersArray): Modifier[] {
        if (!modifiers) {
            return [];
        }
        const TSModifier = ts.SyntaxKind;
        return modifiers
            .map((it) => {
                switch (it.kind) {
                    case TSModifier.PrivateKeyword:
                        return Modifier.privateMemberModifier;
                    case TSModifier.PublicKeyword:
                        return Modifier.publicMemberModifier;
                    case TSModifier.AbstractKeyword:
                        return Modifier.abstractModifier;
                    case TSModifier.ExportKeyword:
                        return Modifier.exportedModifier;
                    case TSModifier.ProtectedKeyword:
                        return Modifier.protectedMemberModifier;
                    case TSModifier.StaticKeyword:
                        return Modifier.staticModifier;
                    default:
                        return Modifier.none;
                }
            })
            .filter((it) => it != Modifier.none);
    }
}
