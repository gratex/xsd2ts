"use strict";
/**
 * Created by eddyspreeuwers on 12/18/19.
 */
Object.defineProperty(exports, "__esModule", { value: true });
// AR: added duplicate to sequence for 'all'
var xml_utils_1 = require("./xml-utils");
var parsing_1 = require("./parsing");
function makeSchemaHandler(schemaName) {
    return function (n) { return new parsing_1.ASTNode("schema").named(schemaName).addAttribs(n); };
}
var fieldHandler = function (n) { return (xml_utils_1.attribs(n).type) ? parsing_1.astNode('Field').addField(n).prop('label4', 'fieldHandler') : null; };
//const topFieldHandler: AstNodeFactory = (n) => /xs:/.test(attribs(n).type) ? astClass().addName(n, 'For').addFields(n) : null;
var topFieldHandler = function (n) { return /xs:/.test(xml_utils_1.attribs(n).type) ? parsing_1.astNode('AliasType').addAttribs(n) : null; };
var attrHandler = function (n) { return parsing_1.astNode('Field').addAttrField(n); };
var arrayFldHandler = function (n) { return (xml_utils_1.attribs(n).type && xml_utils_1.attribs(n).maxOccurs === "unbounded") ? parsing_1.astNode('ArrField').addField(n).prop('label1', 'arrayFldHandler') : null; };
var cmpFldHandler = function (n) { return parsing_1.astField().prop('label2', 'cmpFldHandler').addField(n, xml_utils_1.capFirst(xml_utils_1.attribs(n).name)); };
var classHandler = function (n) { return (xml_utils_1.attribs(n).type) ? null : parsing_1.astClass(n).prop('label3', 'classHandler'); };
var enumElmHandler = function (n) { return (xml_utils_1.attribs(n).type) ? null : parsing_1.astEnum(n); };
var enumerationHandler = function (n) { return (xml_utils_1.attribs(n).value) ? parsing_1.astEnumValue(n) : null; };
var extensionHandler = function (n) { return parsing_1.astNode('Extension').addAttribs(n); };
var intRestrictionHandler = function (n) { return /integer/.test(xml_utils_1.attribs(n).base) ? parsing_1.astNode('AliasType').prop('value', 'number') : null; };
var strRestrictionHandler = function (n) { return /string/.test(xml_utils_1.attribs(n).base) ? parsing_1.astNode('EnumType').prop('value', 'string') : null; };
var namedGroupHandler = function (n) { return (xml_utils_1.attribs(n).name) ? parsing_1.astNode('Group').named(xml_utils_1.attribs(n).name) : null; };
var refGroupHandler = function (n) { return (xml_utils_1.attribs(n).ref) ? parsing_1.astNode('Fields').prop('ref', xml_utils_1.attribs(n).ref) : null; };
var refElementHandler = function (n) { return (xml_utils_1.attribs(n).ref) ? parsing_1.astNode('Reference').addAttribs(n) : null; };
var childsMerger = function (r1, r2) { r1.children = r2.children; return r1; };
var enumMerger = function (r1, r2) { r1.nodeType = 'Enumeration'; r1.attr.values = r2.children; return r1; };
var typeMerger = function (r1, r2) { r1.nodeType = 'AliasType'; r1.attr.type = r2.attr.value; return r1; };
var nestedClassMerger = function (r1, r2) { r1.nodeType = 'Field'; r1.attr.nestedClass = { name: r1.attr.fieldType, children: r2.children }; return r1; };
var arrayFieldMerger = function (r1, r2) { r2.nodeType = 'Field'; r2.attr.fieldName = r1.attr.fieldName; return r2; };
var XsdGrammar = /** @class */ (function () {
    function XsdGrammar(name) {
        this.schemaName = name;
    }
    XsdGrammar.prototype.parse = function (node) {
        //Terminals
        var FIELDPROXY = new parsing_1.Proxy('Field Proxy');
        var fieldElement = new parsing_1.Terminal("element:fld", fieldHandler);
        var cmpFldElement = new parsing_1.Terminal("element:comp", cmpFldHandler);
        var arrFldElement = new parsing_1.Terminal("element:array", arrayFldHandler);
        var classElement = new parsing_1.Terminal("element:class", classHandler);
        var topFldElement = new parsing_1.Terminal("element:topFld", topFieldHandler);
        var enumElement = new parsing_1.Terminal("element:enumElm", enumElmHandler);
        var enumType = new parsing_1.Terminal("simpleType:enumType", enumElmHandler);
        var attributeGroup = new parsing_1.Terminal("attributeGroup:attrGrp", namedGroupHandler);
        var schema = new parsing_1.Terminal("schema:Schema", makeSchemaHandler(this.schemaName));
        var namedGroup = new parsing_1.Terminal("group:named", namedGroupHandler);
        var refGroup = new parsing_1.Terminal("group:refGrp", refGroupHandler);
        var refElement = new parsing_1.Terminal("element:refElm", refElementHandler);
        var complexType = new parsing_1.Terminal("complexType");
        var simpleType = new parsing_1.Terminal("simpleType");
        var complexContent = new parsing_1.Terminal("complexContent");
        var extension = new parsing_1.Terminal("extension", extensionHandler);
        var enumeration = new parsing_1.Terminal("enumeration:enum", enumerationHandler);
        var strRestriction = new parsing_1.Terminal("restriction:strRestr", strRestrictionHandler);
        var intRestriciton = new parsing_1.Terminal("restriction:intRestr", intRestrictionHandler);
        var classType = new parsing_1.Terminal("complexType:ctype", classHandler);
        var attribute = new parsing_1.Terminal("attribute:attr", attrHandler);
        var sequence = new parsing_1.Terminal("sequence:seq");
        var all = new parsing_1.Terminal("all");
        var choice = new parsing_1.Terminal("choice:Choice");
        // NonTerminals
        var REFGROUP = parsing_1.match(refGroup).labeled('REF_GROUP');
        var REF_ELM = parsing_1.match(refElement).labeled('REF_ELEMENT');
        var ATTRIBUTE = parsing_1.match(attribute).labeled('ATTRIBUTE');
        var FLD_ELM = parsing_1.match(fieldElement).labeled('FIELD_ELM');
        var CHOICE = parsing_1.match(choice).children(REF_ELM, FIELDPROXY);
        var ARRFIELD = parsing_1.match(cmpFldElement, arrayFieldMerger).child(complexType).child(sequence).child(arrFldElement).labeled('ARRFIELD');
        var ARRFIELD2 = parsing_1.match(cmpFldElement, arrayFieldMerger).child(complexType).child(all).child(arrFldElement).labeled('ARRFIELD2');
        var CMPFIELD = parsing_1.match(cmpFldElement, nestedClassMerger).child(complexType).child(sequence).children(FIELDPROXY).labeled('CMPFIELD');
        var CMPFIELD2 = parsing_1.match(cmpFldElement, nestedClassMerger).child(complexType).child(all).children(FIELDPROXY).labeled('CMPFIELD2');
        var FIELD = parsing_1.oneOf(ARRFIELD, ARRFIELD2, CMPFIELD, CMPFIELD2, FLD_ELM, REFGROUP, REF_ELM).labeled('FIELD');
        FIELDPROXY.parslet = FIELD;
        var A_CLASS = parsing_1.match(classElement, childsMerger).child(complexType).children(ATTRIBUTE, CHOICE).labeled('A_CLASS');
        // element class
        var E_CLASS = parsing_1.match(classElement).child(complexType).child(sequence, childsMerger).children(FIELD).labeled('E_CLASS');
        var E_CLASS2 = parsing_1.match(classElement).child(complexType).child(all, childsMerger).children(FIELD).labeled('E_CLASS2');
        // group class
        var G_CLASS = parsing_1.match(attributeGroup).children(parsing_1.match(attribute)).labeled('G_CLASS');
        // coplex type class
        var SEQUENCE = parsing_1.match(sequence, childsMerger).children(FIELD).labeled('SEQUENCE');
        var ALL = parsing_1.match(all, childsMerger).children(FIELD).labeled('ALL');
        var CCONTENT = parsing_1.match(complexContent).child(extension).child(sequence, childsMerger).children(FIELD).labeled('CCONTENT');
        var CCONTENT2 = parsing_1.match(complexContent).child(extension).child(all, childsMerger).children(FIELD).labeled('CCONTENT2');
        var R_CLASS = parsing_1.match(classType, childsMerger).children(REFGROUP, ATTRIBUTE).labeled('R_CLASS');
        // const C_CLASS  = match(classType).childIsOneOf(SEQUENCE, ALL, CCONTENT, CCONTENT2).labeled('C_CLASS');
        // AR: attributes with seq ! TODO: now we allow to maix anyof them, but we should maybe allow only attribute with one other
        var C_CLASS = parsing_1.match(classType, customMerger).children(SEQUENCE, ALL, CCONTENT, CCONTENT2, ATTRIBUTE).labeled('C_CLASS');
        //extended class
        var X_CLASS = parsing_1.match(classType).child(complexContent).child(extension).child(sequence, childsMerger).children(FIELD).labeled('X_CLASS');
        var X_CLASS2 = parsing_1.match(classType).child(complexContent).child(extension).child(all, childsMerger).children(FIELD).labeled('X_CLASS2');
        //const R_CLASS  = match(classType).child(refGroup);
        var S_CLASS = parsing_1.match(classType).empty().labeled('EMPTY_CLASS'); //simple empty class
        var F_CLASS = parsing_1.match(topFldElement).labeled('F_CLASS');
        var N_GROUP = parsing_1.match(namedGroup).child(sequence, childsMerger).children(FIELD).labeled('N_GROUP');
        var N_GROUP2 = parsing_1.match(namedGroup).child(all, childsMerger).children(FIELD).labeled('N_GROUP2');
        var ENUMELM = parsing_1.match(enumElement, enumMerger).child(simpleType).child(strRestriction).children(parsing_1.match(enumeration)).labeled('ENUMTYPE');
        var ENUMTYPE = parsing_1.match(enumType, enumMerger).child(strRestriction).children(parsing_1.match(enumeration)).labeled('ENUMTYPE');
        var ALIASTYPE = parsing_1.match(enumElement, typeMerger).child(simpleType).child(intRestriciton).labeled('ALIAS');
        var TYPES = parsing_1.oneOf(ALIASTYPE, S_CLASS, ENUMELM, ENUMTYPE, E_CLASS, E_CLASS2, C_CLASS, X_CLASS, X_CLASS2, N_GROUP, N_GROUP2, F_CLASS, G_CLASS, A_CLASS, R_CLASS);
        var SCHEMA = parsing_1.match(schema, childsMerger).children(TYPES);
        var result = SCHEMA.parse(node, '');
        return result;
    };
    return XsdGrammar;
}());
exports.XsdGrammar = XsdGrammar;
// AR: ur change of gramer does not merge corrcetly attributes with all/sequence
function customMerger(r1, r2) {
    r1.children = r2.children.reduce(function (arr, child) {
        if (child.nodeType === "all" || child.nodeType === "sequence") {
            arr = arr.concat(child.children);
        }
        else {
            arr.push(child);
        }
        return arr;
    }, []);
    return r1;
}
