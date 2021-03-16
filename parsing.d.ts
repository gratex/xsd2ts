export declare type FindNextNode = (n: Node) => Node;
export declare type AstNodeFactory = (n: Node) => ASTNode;
export declare type AstNodeMerger = (r1: ASTNode, r2: ASTNode) => ASTNode;
export declare function setNamespace(namespace: string): void;
export declare function astNode(s: string): ASTNode;
export declare function astClass(n?: Node): ASTNode;
export declare function astEnum(n: Node): ASTNode;
export declare function astEnumValue(n: Node): ASTNode;
export declare function astField(): ASTNode;
export declare function oneOf(...options: Parslet[]): OneOf;
export declare function match(t: Terminal, m?: AstNodeMerger): Matcher;
export interface IParsable {
    parse(node: Node, indent?: string): ASTNode;
}
export declare type Attribs = {
    [key: string]: string;
};
export declare function getFieldType(type: string, defNs: string): string;
export declare class ASTNode {
    nodeType: string;
    name: string;
    private _attr;
    children: ASTNode[];
    constructor(type: string);
    prop(key: string, value: any): this;
    named(name: string): ASTNode;
    addName(node: Node, prefix?: string): ASTNode;
    addField(node: Node, fldType?: string): this;
    get attr(): any;
    addAttribs(n: Node): this;
    merge(other: ASTNode): ASTNode;
}
export declare class ASTClass extends ASTNode {
    constructor(n: Node);
    get nodeType(): string;
}
export declare abstract class Parslet implements IParsable {
    name: string;
    label: string;
    fnNextNode: FindNextNode;
    nextParslet: Parslet;
    constructor(name: string);
    abstract parse(node: Node, indent?: string): ASTNode;
    addNext(p: Parslet, fnn: FindNextNode): this;
    children(...options: Parslet[]): this;
    child(t: Terminal, m?: AstNodeMerger): this;
    match(t: Terminal, m?: AstNodeMerger): this;
    childIsOneOf(...options: Parslet[]): this;
    empty(): this;
    labeled(s: string): this;
}
export declare class Empty extends Parslet {
    parse(node: Node, indent?: string): ASTNode;
}
export declare class Terminal implements IParsable {
    name: string;
    tagName: string;
    private astNodeFactory;
    constructor(name: string, handler?: AstNodeFactory);
    parse(node: Node, indent?: string): ASTNode;
}
export declare class Proxy extends Parslet {
    parsable: Parslet;
    constructor(name: string);
    set parslet(p: Parslet);
    parse(node: Node, indent?: string): ASTNode;
}
export declare class Matcher extends Parslet {
    private terminal;
    private merger;
    constructor(name: string, t: Terminal, m?: AstNodeMerger);
    parse(node: Node, indent?: string): ASTNode;
}
export declare class OneOf extends Parslet {
    options: Parslet[];
    constructor(name: string, options: Parslet[]);
    parse(node: Node, indent?: string): ASTNode;
}
export declare class Sibblings extends Parslet {
    options: Parslet[];
    constructor(name: string, options: Parslet[]);
    parse(node: Node, indent?: string): ASTNode;
}
