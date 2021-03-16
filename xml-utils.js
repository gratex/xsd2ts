"use strict";
/**
 * Created by eddyspreeuwers on 12/26/19.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var VERBOSE = false;
function useVerboseLogModus() {
    VERBOSE = true;
}
exports.useVerboseLogModus = useVerboseLogModus;
function useNormalLogModus() {
    VERBOSE = false;
}
exports.useNormalLogModus = useNormalLogModus;
function log() {
    var parms = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        parms[_i] = arguments[_i];
    }
    if (VERBOSE) {
        console.log.apply(console, parms);
    }
}
exports.log = log;
function findFirstChild(node) {
    var _a;
    node = (_a = node) === null || _a === void 0 ? void 0 : _a.firstChild;
    if (node && node.nodeType === node.TEXT_NODE) {
        node = findNextSibbling(node);
    }
    return node;
}
exports.findFirstChild = findFirstChild;
function findNextSibbling(node) {
    var _a;
    var result = (_a = node) === null || _a === void 0 ? void 0 : _a.nextSibling;
    if (result && result.nodeType == node.TEXT_NODE) {
        result = findNextSibbling(result);
    }
    //console.log('found', result?.nodeName);
    return result;
}
exports.findNextSibbling = findNextSibbling;
function findChildren(node) {
    var result = [];
    var child = findFirstChild(node);
    while (child) {
        result.push(child);
        child = findNextSibbling(child);
    }
    return result;
}
exports.findChildren = findChildren;
function xml(n) {
    return n;
}
exports.xml = xml;
function capFirst(s) {
    if (s && s[0]) {
        return s[0].toUpperCase() + s.substr(1);
    }
    return s;
}
exports.capFirst = capFirst;
function attribs(node) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    var attr = (_a = node) === null || _a === void 0 ? void 0 : _a.attributes;
    //console.log('getNamedItem', attr);
    var result = {
        name: (_b = attr.getNamedItem('name')) === null || _b === void 0 ? void 0 : _b.value,
        type: (_c = attr.getNamedItem('type')) === null || _c === void 0 ? void 0 : _c.value,
        base: (_d = attr.getNamedItem('base')) === null || _d === void 0 ? void 0 : _d.value,
        value: (_e = attr.getNamedItem('value')) === null || _e === void 0 ? void 0 : _e.value,
        ref: (_f = attr.getNamedItem('ref')) === null || _f === void 0 ? void 0 : _f.value,
        minOccurs: (_g = attr.getNamedItem('minOccurs')) === null || _g === void 0 ? void 0 : _g.value,
        maxOccurs: (_h = attr.getNamedItem('maxOccurs')) === null || _h === void 0 ? void 0 : _h.value,
        use: (_j = attr.getNamedItem('use')) === null || _j === void 0 ? void 0 : _j.value,
    };
    return result;
}
exports.attribs = attribs;
