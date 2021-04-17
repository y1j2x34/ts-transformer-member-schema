export interface InterfaceSchema {
    methods: Array<MethodSchema>;
}
export interface MethodSchema {
    name: string;
    arguments: ArgumentSchema[];
    returnTypeName: string;
}

export interface ArgumentSchema {
    index: number;
    name: string;
    optional: boolean;
    typeName: string;
    typeConstructor?: Function;
    defaultValue?: unknown;
}
