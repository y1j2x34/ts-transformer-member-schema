import { MemberSchema } from '../runtime';
import ts from 'typescript';

export class MemberSchemaBuilder {
    private readonly type: ts.Type;
    constructor(
        private readonly node: ts.CallExpression,
        private readonly typeNode: ts.TypeNode,
        private readonly typeChecker: ts.TypeChecker
    ) {
        this.type = this.typeChecker.getTypeFromTypeNode(this.typeNode);
    }
    build(): MemberSchema {
        return null as never;
    }
}
