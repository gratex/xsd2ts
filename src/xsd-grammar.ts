/**
 * Created by eddyspreeuwers on 12/18/19.
 */

// AR: added duplicate to sequence for 'all'

import {attribs , capFirst} from './xml-utils';
import {
    ASTNode, Proxy, AstNodeFactory, Terminal, AstNodeMerger, astNode, match, oneOf, astClass, astField,
    astEnum, astEnumValue
} from './parsing';


function makeSchemaHandler(schemaName: string){
    return (n) => new ASTNode("schema").named(schemaName).addAttribs(n);
}

const fieldHandler: AstNodeFactory = (n) => (attribs(n).type) ? astNode('Field').addField(n).prop('label4', 'fieldHandler') : null;


//const topFieldHandler: AstNodeFactory = (n) => /xs:/.test(attribs(n).type) ? astClass().addName(n, 'For').addFields(n) : null;
const topFieldHandler: AstNodeFactory = (n) => /xs:/.test(attribs(n).type) ? astNode('AliasType').addAttribs(n): null;

const attrHandler: AstNodeFactory = (n) =>  astNode('Field').addAttrField(n);


const arrayFldHandler: AstNodeFactory = (n) => (attribs(n).type && attribs(n).maxOccurs === "unbounded") ? astNode('ArrField').addField(n).prop('label1','arrayFldHandler') : null;


const cmpFldHandler: AstNodeFactory = (n) => astField().prop('label2', 'cmpFldHandler').addField(n, capFirst(attribs(n).name));

const classHandler: AstNodeFactory = (n) => (attribs(n).type) ? null : astClass(n).prop('label3','classHandler');
const enumElmHandler: AstNodeFactory = (n) => (attribs(n).type) ? null : astEnum(n);
const enumerationHandler: AstNodeFactory = (n) => (attribs(n).value) ?  astEnumValue(n): null;
const extensionHandler: AstNodeFactory = (n) => astNode('Extension').addAttribs(n);

const intRestrictionHandler: AstNodeFactory = (n) => /integer/.test(attribs(n).base) ?  astNode('AliasType').prop('value', 'number'): null;
const strRestrictionHandler: AstNodeFactory = (n) => /string/.test(attribs(n).base) ?  astNode('EnumType').prop('value', 'string'): null;


const namedGroupHandler: AstNodeFactory = (n) => (attribs(n).name) ?  astNode('Group').named(attribs(n).name) : null;
const refGroupHandler: AstNodeFactory = (n) => (attribs(n).ref) ?  astNode('Fields').prop('ref', attribs(n).ref):null;
const refElementHandler: AstNodeFactory = (n) => (attribs(n).ref) ?  astNode('Reference').addAttribs(n) : null;



const childsMerger: AstNodeMerger  = (r1, r2) => {r1.children = r2.children; return r1; };
const enumMerger: AstNodeMerger = (r1, r2) => {r1.nodeType = 'Enumeration'; r1.attr.values = r2.children; return r1; };
const typeMerger: AstNodeMerger = (r1, r2) => {r1.nodeType = 'AliasType'; r1.attr.type = r2.attr.value; return r1; };

const nestedClassMerger: AstNodeMerger  = (r1, r2) => {r1.nodeType = 'Field'; r1.attr.nestedClass= {name: r1.attr.fieldType, children: r2.children}; return r1; };
const arrayFieldMerger: AstNodeMerger = (r1, r2) => {r2.nodeType = 'Field'; r2.attr.fieldName = r1.attr.fieldName; return r2;};

export type NsHandler = (ns: string) => void;

export class XsdGrammar {

    private schemaName: string;

    public constructor(name: string){
        this.schemaName = name;
    }


    public parse(node: Node): ASTNode {

        //Terminals
        const FIELDPROXY     = new Proxy('Field Proxy');
        const fieldElement   = new Terminal("element:fld", fieldHandler);
        const cmpFldElement  = new Terminal("element:comp", cmpFldHandler);
        const arrFldElement  = new Terminal("element:array", arrayFldHandler);
        const classElement   = new Terminal("element:class", classHandler);
        const topFldElement  = new Terminal("element:topFld", topFieldHandler);
        const enumElement    = new Terminal("element:enumElm", enumElmHandler);
        const enumType       = new Terminal("simpleType:enumType", enumElmHandler);

        const attributeGroup = new Terminal("attributeGroup:attrGrp", namedGroupHandler);
        const schema         = new Terminal("schema:Schema", makeSchemaHandler(this.schemaName));
        const namedGroup     = new Terminal("group:named", namedGroupHandler);
        const refGroup       = new Terminal("group:refGrp", refGroupHandler);
        const refElement     = new Terminal("element:refElm", refElementHandler);
        const complexType    = new Terminal("complexType");
        const simpleType     = new Terminal("simpleType");
        const complexContent = new Terminal("complexContent");
        const extension      = new Terminal("extension", extensionHandler);

        const enumeration    = new Terminal("enumeration:enum",enumerationHandler);

        const strRestriction = new Terminal("restriction:strRestr", strRestrictionHandler);
        const intRestriciton = new Terminal("restriction:intRestr", intRestrictionHandler);
        const classType      = new Terminal("complexType:ctype", classHandler);
        const attribute      = new Terminal("attribute:attr", attrHandler);
        const sequence       = new Terminal("sequence:seq");
        const all            = new Terminal("all");
        const choice         = new Terminal("choice:Choice");


        // NonTerminals

        const REFGROUP = match(refGroup).labeled('REF_GROUP');
        const REF_ELM  = match(refElement).labeled('REF_ELEMENT');
        const ATTRIBUTE= match(attribute).labeled('ATTRIBUTE');
        const FLD_ELM  = match(fieldElement).labeled('FIELD_ELM')
        const CHOICE   = match(choice).children(REF_ELM, FIELDPROXY);
        const ARRFIELD = match(cmpFldElement, arrayFieldMerger).child(complexType).child(sequence).child(arrFldElement).labeled('ARRFIELD');
        const ARRFIELD2 = match(cmpFldElement, arrayFieldMerger).child(complexType).child(all).child(arrFldElement).labeled('ARRFIELD2');

        const CMPFIELD = match(cmpFldElement, nestedClassMerger).child(complexType).child(sequence).children(FIELDPROXY).labeled('CMPFIELD');
        const CMPFIELD2 = match(cmpFldElement, nestedClassMerger).child(complexType).child(all).children(FIELDPROXY).labeled('CMPFIELD2');

        const FIELD    = oneOf(ARRFIELD, ARRFIELD2, CMPFIELD, CMPFIELD2, FLD_ELM, REFGROUP, REF_ELM ).labeled('FIELD'); FIELDPROXY.parslet = FIELD;

        const A_CLASS  = match(classElement, childsMerger).child(complexType).children(ATTRIBUTE, CHOICE).labeled('A_CLASS')
        // element class
        const E_CLASS  = match(classElement).child(complexType).child(sequence, childsMerger).children(FIELD).labeled('E_CLASS');
        const E_CLASS2  = match(classElement).child(complexType).child(all, childsMerger).children(FIELD).labeled('E_CLASS2');

        // group class
        const G_CLASS  = match(attributeGroup).children(match(attribute)).labeled('G_CLASS');

        // coplex type class
        const SEQUENCE = match(sequence, childsMerger).children(FIELD).labeled('SEQUENCE');
        const ALL = match(all, childsMerger).children(FIELD).labeled('ALL');
        const CCONTENT = match(complexContent).child(extension).child(sequence, childsMerger).children(FIELD).labeled('CCONTENT');
        const CCONTENT2 = match(complexContent).child(extension).child(all, childsMerger).children(FIELD).labeled('CCONTENT2');

        const R_CLASS  = match(classType, childsMerger).children(REFGROUP, ATTRIBUTE).labeled('R_CLASS');

        // const C_CLASS  = match(classType).childIsOneOf(SEQUENCE, ALL, CCONTENT, CCONTENT2).labeled('C_CLASS');
        // AR: attributes with seq ! TODO: now we allow to maix anyof them, but we should maybe allow only attribute with one other
        const C_CLASS  = match(classType, customMerger).children(SEQUENCE, ALL, CCONTENT, CCONTENT2, ATTRIBUTE).labeled('C_CLASS');

        //extended class
        const X_CLASS  = match(classType).child(complexContent).child(extension).child(sequence, childsMerger).children(FIELD).labeled('X_CLASS');
        const X_CLASS2  = match(classType).child(complexContent).child(extension).child(all, childsMerger).children(FIELD).labeled('X_CLASS2');

        //const R_CLASS  = match(classType).child(refGroup);
        const S_CLASS  = match(classType).empty().labeled('EMPTY_CLASS'); //simple empty class
        const F_CLASS  = match(topFldElement).labeled('F_CLASS');
        const N_GROUP  = match(namedGroup).child(sequence, childsMerger).children(FIELD).labeled('N_GROUP');
        const N_GROUP2  = match(namedGroup).child(all, childsMerger).children(FIELD).labeled('N_GROUP2');
        const ENUMELM  = match(enumElement, enumMerger).child(simpleType).child(strRestriction).children(match(enumeration)).labeled('ENUMTYPE');
        const ENUMTYPE = match(enumType, enumMerger).child(strRestriction).children(match(enumeration)).labeled('ENUMTYPE');

        const ALIASTYPE= match(enumElement, typeMerger).child(simpleType).child(intRestriciton).labeled('ALIAS');
        const TYPES    = oneOf(ALIASTYPE, S_CLASS, ENUMELM, ENUMTYPE, E_CLASS, E_CLASS2, C_CLASS, X_CLASS, X_CLASS2, N_GROUP, N_GROUP2, F_CLASS, G_CLASS, A_CLASS,  R_CLASS );

        const SCHEMA   = match(schema, childsMerger).children(TYPES);
        const result   = SCHEMA.parse(node, '');
        return result;

    }

}


// AR: ur change of gramer does not merge corrcetly attributes with all/sequence
function customMerger(r1, r2) {
  r1.children = r2.children.reduce((arr, child) => {
    if (child.nodeType === "all" || child.nodeType === "sequence") {
      arr = arr.concat(child.children);
    } else {
      arr.push(child);
    }
    return arr;
  }, []);
  return r1;
}
