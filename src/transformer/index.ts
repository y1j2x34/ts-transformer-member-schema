import { hello } from './common';
import ts from 'typescript';

export default function transformer(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
    console.log(program);
    console.log(hello());
    return (context: ts.TransformationContext) => {
        console.log(context);
        return (file: ts.SourceFile) => file;
    };
}
