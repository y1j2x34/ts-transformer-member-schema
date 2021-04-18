import { MemberSchema } from '../runtime';
import { MemberSchemaBuilder } from './MemberSchemaBuilder';
import path from 'path';
import ts from 'typescript';

export default function transformer(program: ts.Program): ts.TransformerFactory<ts.Node> {
    return (context: ts.TransformationContext) => {
        return (file: ts.Node) => visitNodeAndChildren(file, program, context);
    };
}

function visitNodeAndChildren(node: ts.Node, program: ts.Program, context: ts.TransformationContext): ts.Node {
    return ts.visitEachChild(
        visitNode(node, program),
        (child) => visitNodeAndChildren(child, program, context),
        context
    );
}
const badMemberSchema = ts.factory.createRegularExpressionLiteral(
    JSON.stringify({
        type: null,
        properties: [],
        methods: [],
    } as MemberSchema)
);

function visitNode(node: ts.Node, program: ts.Program): ts.Node {
    const typeChecker = program.getTypeChecker();
    if (!isRuntimeTypeCallExpression(node, typeChecker)) {
        return node;
    }
    if (!node.typeArguments || node.typeArguments.length === 0) {
        return badMemberSchema;
    }
    const typeNode = node.typeArguments[0];
    const builder = new MemberSchemaBuilder(node, typeNode, typeChecker);
    return ts.factory.createRegularExpressionLiteral(JSON.stringify(builder.build()));
}

function isRuntimeTypeCallExpression(node: ts.Node, typeChecker: ts.TypeChecker): node is ts.CallExpression {
    if (!ts.isCallExpression(node)) {
        return false;
    }
    const signature = typeChecker.getResolvedSignature(node);
    if (signature === undefined) {
        return false;
    }
    const { declaration } = signature;
    if (!declaration || ts.isJSDocSignature(declaration)) {
        return false;
    }
    const fileName = declaration.getSourceFile().fileName;
    if (fileName.indexOf(__dirname) === 0) {
        const subpath = fileName.substr(__dirname.length);
        if (subpath.length > 0 && subpath.indexOf(path.sep) === -1) {
            return false;
        }
    } else {
        return false;
    }
    if (!declaration.name) {
        return false;
    }
    return declaration.name.getText() === 'memberSchema';
}
