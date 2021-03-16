/**
 * Created by eddyspreeuwers on 12/26/19.
 */
export declare function useVerboseLogModus(): void;
export declare function useNormalLogModus(): void;
export declare function log(...parms: any): void;
export declare function findFirstChild(node: Node): Node;
export declare function findNextSibbling(node: Node): Node;
export declare function findChildren(node: Node): Node[];
export declare function xml(n: Node): IXMLNode;
export interface IXMLNode extends Node {
    localName: string;
}
export declare function capFirst(s: string): string;
export interface IAttributes extends Node {
    name: string;
    type: string;
    base: string;
    value: string;
    ref: string;
    minOccurs: string;
    maxOccurs: string;
}
export declare function attribs(node: Node): IAttributes;
