/**
 * Created by eddyspreeuwers on 12/18/19.
 */
import { ASTNode } from './parsing';
export declare type NsHandler = (ns: string) => void;
export declare class XsdGrammar {
    private schemaName;
    constructor(name: string);
    parse(node: Node): ASTNode;
}
