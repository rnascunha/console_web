/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/css-loader/dist/cjs.js!./src/tools/input/input.css":
/*!*************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/tools/input/input.css ***!
  \*************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `html,
body {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

body {
  display: grid;
  grid-template:
    'header' min-content
    'dump' auto;
}

#header {
  display: flex;
  align-items: center;
}

#header h1 {
  flex-grow: 1;
  text-align: center;
  margin: 2px;
}

#link {
  font-size: x-large;
  cursor: pointer;
  border-radius: 20px;
  padding: 2px;
  position: relative;
}

#link:hover {
  background-color: black;
}

#input-dump {
  height: 100%;
  overflow: auto;
}
`, "",{"version":3,"sources":["webpack://./src/tools/input/input.css"],"names":[],"mappings":"AAAA;;EAEE,YAAY;EACZ,WAAW;EACX,SAAS;EACT,UAAU;EACV,gBAAgB;AAClB;;AAEA;EACE,aAAa;EACb;;eAEa;AACf;;AAEA;EACE,aAAa;EACb,mBAAmB;AACrB;;AAEA;EACE,YAAY;EACZ,kBAAkB;EAClB,WAAW;AACb;;AAEA;EACE,kBAAkB;EAClB,eAAe;EACf,mBAAmB;EACnB,YAAY;EACZ,kBAAkB;AACpB;;AAEA;EACE,uBAAuB;AACzB;;AAEA;EACE,YAAY;EACZ,cAAc;AAChB","sourcesContent":["html,\nbody {\n  height: 100%;\n  width: 100%;\n  margin: 0;\n  padding: 0;\n  overflow: hidden;\n}\n\nbody {\n  display: grid;\n  grid-template:\n    'header' min-content\n    'dump' auto;\n}\n\n#header {\n  display: flex;\n  align-items: center;\n}\n\n#header h1 {\n  flex-grow: 1;\n  text-align: center;\n  margin: 2px;\n}\n\n#link {\n  font-size: x-large;\n  cursor: pointer;\n  border-radius: 20px;\n  padding: 2px;\n  position: relative;\n}\n\n#link:hover {\n  background-color: black;\n}\n\n#input-dump {\n  height: 100%;\n  overflow: auto;\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {



/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {



module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];
  if (!cssMapping) {
    return content;
  }
  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    return [content].concat([sourceMapping]).join("\n");
  }
  return [content].join("\n");
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {



var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {



var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;
  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}
module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";
  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }
  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }
  var needLayer = typeof obj.layer !== "undefined";
  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }
  css += obj.css;
  if (needLayer) {
    css += "}";
  }
  if (obj.media) {
    css += "}";
  }
  if (obj.supports) {
    css += "}";
  }
  var sourceMap = obj.sourceMap;
  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}
function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }
  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") {
    return {
      update: function update() {},
      remove: function remove() {}
    };
  }
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}
module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
module.exports = styleTagTransform;

/***/ }),

/***/ "./src/tools/input/input.css":
/*!***********************************!*\
  !*** ./src/tools/input/input.css ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_input_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../../node_modules/css-loader/dist/cjs.js!./input.css */ "./node_modules/css-loader/dist/cjs.js!./src/tools/input/input.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_input_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_input_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_input_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_input_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/tools/input/db.ts":
/*!*******************************!*\
  !*** ./src/tools/input/db.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   open_db: () => (/* binding */ open_db),
/* harmony export */   read_db: () => (/* binding */ read_db),
/* harmony export */   write_db: () => (/* binding */ write_db)
/* harmony export */ });
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const dbName = 'input-binary';
const dbVersion = 1;
const objectStoreName = 'binary-data';
function open_db() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield new Promise(function (resolve, reject) {
            const openRequest = window.indexedDB.open(dbName, dbVersion);
            openRequest.onerror = ev => {
                reject(ev);
            };
            openRequest.onsuccess = ev => {
                resolve(ev.target.result);
            };
            openRequest.onupgradeneeded = ev => {
                const db = ev.target.result;
                const store = db.createObjectStore(objectStoreName);
                store.transaction.oncomplete = () => { };
            };
        });
    });
}
function read_db(db) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield new Promise(function (resolve, reject) {
            const request = db
                .transaction(objectStoreName, 'readonly')
                .objectStore(objectStoreName)
                .get('data');
            request.onsuccess = ev => {
                resolve(ev.target.result);
            };
            request.onerror = ev => {
                reject(ev);
            };
        });
    });
}
function write_db(db, data) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise(function (resolve, reject) {
            const request = db
                .transaction(objectStoreName, 'readwrite')
                .objectStore(objectStoreName)
                .put(data, 'data');
            request.onsuccess = () => {
                resolve();
            };
            request.onerror = ev => {
                reject(ev);
            };
        });
    });
}


/***/ }),

/***/ "./src/ts/helper/fade.ts":
/*!*******************************!*\
  !*** ./src/ts/helper/fade.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fade_out: () => (/* binding */ fade_out)
/* harmony export */ });
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function fade_out(el, pace = 0.005) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(el instanceof HTMLElement))
            throw new Error('Wrong type');
        return yield new Promise(function (resolve) {
            el.style.opacity = '1';
            (function fade() {
                const opacity = parseFloat(el.style.opacity) - pace;
                el.style.opacity = `${opacity}`;
                if (opacity <= 0) {
                    resolve(el);
                }
                else {
                    requestAnimationFrame(fade);
                }
            })();
        });
    });
}


/***/ }),

/***/ "./src/ts/libs/base64.ts":
/*!*******************************!*\
  !*** ./src/ts/libs/base64.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   base64_decode: () => (/* binding */ base64_decode),
/* harmony export */   base64_encode: () => (/* binding */ base64_encode),
/* harmony export */   base64_encode2: () => (/* binding */ base64_encode2),
/* harmony export */   base64_encode_string: () => (/* binding */ base64_encode_string)
/* harmony export */ });
/**
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Base64
 */
// Array of bytes to Base64 string decoding
function b64_to_uint6(nChr) {
    return nChr > 64 && nChr < 91
        ? nChr - 65
        : nChr > 96 && nChr < 123
            ? nChr - 71
            : nChr > 47 && nChr < 58
                ? nChr + 4
                : nChr === 43
                    ? 62
                    : nChr === 47
                        ? 63
                        : 0;
}
function base64_decode(sBase64, nBlocksSize = 0) {
    const sB64Enc = sBase64.replace(/[^A-Za-z0-9+/]/g, ''); // Remove any non-base64 characters, such as trailing "=", whitespace, and more.
    const nInLen = sB64Enc.length;
    const nOutLen = nBlocksSize !== 0
        ? Math.ceil(((nInLen * 3 + 1) >> 2) / nBlocksSize) * nBlocksSize
        : (nInLen * 3 + 1) >> 2;
    const taBytes = new Uint8Array(nOutLen);
    let nMod3;
    let nMod4;
    let nUint24 = 0;
    let nOutIdx = 0;
    for (let nInIdx = 0; nInIdx < nInLen; nInIdx++) {
        nMod4 = nInIdx & 3;
        nUint24 |= b64_to_uint6(sB64Enc.charCodeAt(nInIdx)) << (6 * (3 - nMod4));
        if (nMod4 === 3 || nInLen - nInIdx === 1) {
            nMod3 = 0;
            while (nMod3 < 3 && nOutIdx < nOutLen) {
                taBytes[nOutIdx] = (nUint24 >>> ((16 >>> nMod3) & 24)) & 255;
                nMod3++;
                nOutIdx++;
            }
            nUint24 = 0;
        }
    }
    return taBytes;
}
/* Base64 string to array encoding */
function uint6_to_b64(nUint6) {
    return nUint6 < 26
        ? nUint6 + 65
        : nUint6 < 52
            ? nUint6 + 71
            : nUint6 < 62
                ? nUint6 - 4
                : nUint6 === 62
                    ? 43
                    : nUint6 === 63
                        ? 47
                        : 65;
}
function base64_encode(aBytes, options) {
    let nMod3 = 2;
    let sB64Enc = '';
    const nLen = aBytes.length;
    let nUint24 = 0;
    for (let nIdx = 0; nIdx < nLen; nIdx++) {
        nMod3 = nIdx % 3;
        // To break your base64 into several 80-character lines:
        if ((options === null || options === void 0 ? void 0 : options.breakline) === true &&
            nIdx > 0 &&
            ((nIdx * 4) / 3) % 76 === 0) {
            sB64Enc += '\r\n';
        }
        nUint24 |= aBytes[nIdx] << ((16 >>> nMod3) & 24);
        if (nMod3 === 2 || aBytes.length - nIdx === 1) {
            sB64Enc += String.fromCodePoint(uint6_to_b64((nUint24 >>> 18) & 63), uint6_to_b64((nUint24 >>> 12) & 63), uint6_to_b64((nUint24 >>> 6) & 63), uint6_to_b64(nUint24 & 63));
            nUint24 = 0;
        }
    }
    return (sB64Enc.substring(0, sB64Enc.length - 2 + nMod3) +
        ((options === null || options === void 0 ? void 0 : options.pad) === false ? '' : nMod3 === 2 ? '' : nMod3 === 1 ? '=' : '=='));
}
function base64_encode_string(aBytes) {
    return base64_encode(Uint8Array.from(Array.from(aBytes).map(c => c.charCodeAt(0))));
}
function base64_encode2(aBytes) {
    if (aBytes instanceof Uint8Array)
        return base64_encode(aBytes);
    return base64_encode_string(aBytes);
}


/***/ }),

/***/ "./src/ts/libs/binary-dump.ts":
/*!************************************!*\
  !*** ./src/ts/libs/binary-dump.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   binary_to_ascii: () => (/* binding */ binary_to_ascii),
/* harmony export */   binary_to_ascii_array: () => (/* binding */ binary_to_ascii_array),
/* harmony export */   check_encoding: () => (/* binding */ check_encoding),
/* harmony export */   clear_string: () => (/* binding */ clear_string),
/* harmony export */   convert: () => (/* binding */ convert),
/* harmony export */   encoding: () => (/* binding */ encoding),
/* harmony export */   format: () => (/* binding */ format),
/* harmony export */   is_ascii_code_printable: () => (/* binding */ is_ascii_code_printable),
/* harmony export */   is_ascii_printable: () => (/* binding */ is_ascii_printable),
/* harmony export */   is_encode_char: () => (/* binding */ is_encode_char),
/* harmony export */   is_valid: () => (/* binding */ is_valid),
/* harmony export */   parse: () => (/* binding */ parse),
/* harmony export */   split: () => (/* binding */ split),
/* harmony export */   string_to_ascii: () => (/* binding */ string_to_ascii),
/* harmony export */   string_to_ascii_array: () => (/* binding */ string_to_ascii_array),
/* harmony export */   to_array_string: () => (/* binding */ to_array_string),
/* harmony export */   to_data: () => (/* binding */ to_data)
/* harmony export */ });
/* harmony import */ var _base64__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base64 */ "./src/ts/libs/base64.ts");

/**
 * Encoding
 */
const encoding = [
    'binary',
    'octal',
    'decimal',
    'hexa',
    'text',
    'base64',
];
function is_encoding(encode) {
    return encoding.includes(encode);
}
function check_encoding(encode) {
    if (!is_encoding(encode))
        throw new Error('Invalid Encoding');
}
/**
 * Check valid characters
 */
function is_binary(char) {
    const c = char.charAt(0);
    return c === '0' || c === '1';
}
function is_octal(char) {
    const c = char.charAt(0);
    return c >= '0' && c <= '7';
}
function is_hexa(char) {
    const c = char.charAt(0);
    return ((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F'));
}
function is_decimal(char) {
    const c = char.charAt(0);
    return c >= '0' && c <= '9';
}
function is_ascii(char) {
    return char.charCodeAt(0) <= 255;
}
function is_base64(char) {
    const c = char.charAt(0);
    return ((c >= '0' && c <= '9') || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z'));
}
function is_ascii_printable(char) {
    return is_ascii_code_printable(char.charCodeAt(0));
}
function is_ascii_code_printable(code) {
    return code >= 32 && code <= 126;
}
/**
 * Separate function
 * This functions assume that all characters are valid based on the encoding
 */
function split_binary(str) {
    var _a;
    return (_a = str.match(/[01]{1,8}/g)) !== null && _a !== void 0 ? _a : [];
}
function split_octal(str) {
    var _a;
    return (_a = str.match(/[0-3]?[0-7]{1,2}/g)) !== null && _a !== void 0 ? _a : [];
}
function split_decimal(str) {
    var _a;
    return (_a = str.match(/25[0-5]|2[0-4][0-9]|[01]?[0-9]{1,2}/g)) !== null && _a !== void 0 ? _a : [];
}
function split_hexa(str) {
    var _a;
    return (_a = str.match(/[0-9a-fA-F]{1,2}/g)) !== null && _a !== void 0 ? _a : [];
}
function split_text(str) {
    var _a;
    return (_a = str.match(/\\x[0-9a-fA-F]{1,2}|\\n|\\r|\\0|\\\\|[ -~]/g)) !== null && _a !== void 0 ? _a : [];
}
function split_base64(str) {
    return [str];
}
/**
 * Type definitions
 */
const dataType = {
    binary: {
        base: 2,
        char_byte_size: 8,
        check_char: is_binary,
        split: split_binary,
    },
    octal: {
        base: 8,
        char_byte_size: 3,
        check_char: is_octal,
        split: split_octal,
    },
    decimal: {
        base: 10,
        char_byte_size: 3,
        check_char: is_decimal,
        split: split_decimal,
    },
    hexa: {
        base: 16,
        char_byte_size: 2,
        check_char: is_hexa,
        split: split_hexa,
    },
    text: {
        base: 1,
        char_byte_size: 1,
        check_char: is_ascii,
        split: split_text,
    },
    base64: {
        base: 1,
        char_byte_size: 1,
        check_char: is_base64,
        split: split_base64,
    },
};
/**
 * Encoding functions
 */
function is_encode_char(char, enc) {
    check_encoding(enc);
    return dataType[enc].check_char(char);
}
function clear_string(str, enc) {
    check_encoding(enc);
    return Array.from(str)
        .filter(c => dataType[enc].check_char(c))
        .join('');
}
function format(str, encode, opt = {}) {
    check_encoding(encode);
    if (encode === 'text')
        return str.join('');
    const fmt = Object.assign({ separator: ' ', pad: '' }, opt);
    if (encode === 'base64') {
        return fmt.pad.length === 0 ? str[0].replace(/=/g, '') : str[0];
    }
    if (fmt.pad.length > 0)
        str = str.map(v => v.padStart(dataType[encode].char_byte_size, fmt.pad));
    return str.join(fmt.separator);
}
function split(str, encode) {
    check_encoding(encode);
    return dataType[encode].split(str);
}
function string_to_binary(str) {
    return string_array_to_binary(split_text(str));
}
function string_array_to_binary(str) {
    return Uint8Array.from(str.map(c => {
        switch (c) {
            case '\\n':
                return 10;
            case '\\r':
                return 13;
            case '\\0':
                return 0;
            case '\\\\':
                return 92;
            default:
                break;
        }
        const cc = c.match(/(?<=\x)[0-9a-fA-F]{1,2}/g);
        if (cc !== null && cc.length > 0) {
            return parseInt(cc[0], 16);
        }
        return c.charCodeAt(0);
    }));
}
function parse(str, encode) {
    check_encoding(encode);
    str = clear_string(str, encode);
    if (encode === 'text')
        return string_to_binary(str);
    if (encode === 'base64')
        return (0,_base64__WEBPACK_IMPORTED_MODULE_0__.base64_decode)(str);
    return Uint8Array.from(dataType[encode]
        .split(str)
        .map((s) => parseInt(s, dataType[encode].base)));
}
function to_data(str, encode) {
    check_encoding(encode);
    if (encode === 'text')
        return string_array_to_binary(str);
    if (encode === 'base64')
        return (0,_base64__WEBPACK_IMPORTED_MODULE_0__.base64_decode)(str[0]);
    return Uint8Array.from(str.map((s) => parseInt(s, dataType[encode].base)));
}
function to_array_string(data, encode, pad = '') {
    check_encoding(encode);
    if (encode === 'text')
        return binary_to_ascii_array(data);
    if (encode === 'base64')
        return [(0,_base64__WEBPACK_IMPORTED_MODULE_0__.base64_encode)(data, { pad: pad.length > 0 })];
    const { base, char_byte_size } = dataType[encode];
    if (pad.length > 0)
        return Array.from(data).map(n => n.toString(base).padStart(char_byte_size, pad));
    return Array.from(data).map(n => n.toString(base));
}
function convert(input, from, to) {
    if (from === to)
        return input;
    const d = to_data(input, from);
    return to_array_string(d, to);
}
function is_valid(str, encode) {
    return Array.from(str).every(c => is_encode_char(c, encode));
}
const specialChars = {
    '\0': '\\0',
    '\n': '\\n',
    '\r': '\\r',
    '\\': '\\\\',
};
function string_to_ascii_array(chunk, chars = specialChars) {
    const out = [];
    for (const c of chunk) {
        if (c in chars) {
            out.push(chars[c]);
            continue;
        }
        if (!is_ascii_printable(c)) {
            out.push('\\x' + c.charCodeAt(0).toString(16).padStart(2, '0'));
        }
        else
            out.push(c);
    }
    return out;
}
function string_to_ascii(chunk, chars = specialChars) {
    return string_to_ascii_array(chunk, chars).join('');
}
function binary_to_ascii_array(chunk, chars = specialChars) {
    const out = [];
    for (const code of chunk) {
        const c = String.fromCharCode(code);
        if (c in chars) {
            out.push(chars[c]);
            continue;
        }
        if (!is_ascii_code_printable(code)) {
            out.push('\\x' + code.toString(16).padStart(2, '0'));
        }
        else
            out.push(c);
    }
    return out;
}
function binary_to_ascii(chunk, chars = specialChars) {
    return binary_to_ascii_array(chunk, chars).join('');
}


/***/ }),

/***/ "./src/ts/web-components/alert-message/alert-message.ts":
/*!**************************************************************!*\
  !*** ./src/ts/web-components/alert-message/alert-message.ts ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AlertMessage: () => (/* binding */ AlertMessage)
/* harmony export */ });
/* harmony import */ var _helper_fade__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../helper/fade */ "./src/ts/helper/fade.ts");

const template = (function () {
    const template = document.createElement('template');
    template.innerHTML = `
  <style>
    :host {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
      background-color: lightgreen;
      padding: 5px;
      border-radius: 10px;
      font-size: medium;
      min-width: 200px;
      top: 5px;
      left: 50%;
      transform: translateX(-50%);
    }

    #message {
      text-align: center;
      width: 100%;
      display: inline-block;
    }

    #close {
      cursor: pointer;
      border-radius: 10px;
    }

    #close:hover {
      background-color: black;
      color: white;
    }
  </style>
  <slot id=message></slot>
  <span id=close>&#10006;</span>`;
    return template;
})();
class AlertMessage extends HTMLElement {
    constructor(message = '', action = arg => {
        arg.close();
    }) {
        var _a, _b, _c, _d;
        super();
        this.attachShadow({ mode: 'open' });
        (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.appendChild(template.content.cloneNode(true));
        if (message.length > 0)
            ((_b = this.shadowRoot) === null || _b === void 0 ? void 0 : _b.querySelector('#message')).textContent =
                message;
        (_d = (_c = this.shadowRoot) === null || _c === void 0 ? void 0 : _c.querySelector('#close')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => {
            action(this);
        });
    }
    text(message) {
        var _a;
        ((_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('#message')).textContent =
            message;
        return this;
    }
    hide() {
        this.style.visibility = 'hidden';
        return this;
    }
    show() {
        this.style.visibility = 'visible';
        return this;
    }
    close() {
        var _a;
        (_a = this.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(this);
    }
    bottom(pixels = 5) {
        this.style.top = 'unset';
        this.style.bottom = `${pixels}px`;
        return this;
    }
    append_element(el = document.body) {
        el.appendChild(this);
        return this;
    }
    face_out(pace, close = false) {
        (0,_helper_fade__WEBPACK_IMPORTED_MODULE_0__.fade_out)(this, pace)
            .then(() => {
            if (close)
                this.close();
        })
            .finally(() => { });
        return this;
    }
}
customElements.define('fade-message', AlertMessage);


/***/ }),

/***/ "./src/ts/web-components/binary-dump/binary-dump.ts":
/*!**********************************************************!*\
  !*** ./src/ts/web-components/binary-dump/binary-dump.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BinaryDump: () => (/* binding */ BinaryDump)
/* harmony export */ });
/* harmony import */ var _libs_base64__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../libs/base64 */ "./src/ts/libs/base64.ts");
/* harmony import */ var _libs_binary_dump__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../libs/binary-dump */ "./src/ts/libs/binary-dump.ts");


const template = (function () {
    const template = document.createElement('template');
    template.innerHTML = `
    <style>
      :host {
        width: fit-content;
        overflow: hidden;
        display: grid;
        grid-template: 
          "line binary octal decimal hexa text"
          "base64 base64 base64 base64 base64 base64 " / 
          auto auto auto auto auto auto
      }
      
      .field {
        padding: 4px;
        margin: 0px;
      }

      #line-count {
        background-color: white;
        grid-area: line;
      }

      #decimal {
        background-color: yellow;
        grid-area: decimal;
      }
      
      #hexa {
        background-color: blue;
        grid-area: hexa;
      }

      #text {
        background-color: red;
        grid-area: text;
      }

      #binary {
        background-color: grey;
        grid-area: binary;
      }

      #octal {
        background-color: green;
        grid-area: octal;
      }

      #base64-container {
        background-color: lightgray;
        grid-area: base64;
        display: flex;
        align-items: center;
      }

      #base64 {
        margin: 0;
        width: min-content;
        line-break: anywhere;
        white-space: break-spaces;
        flex-grow: 1;
      }

      .hovered {
        background-color: blueviolet;
        font-weight: bold;
        border-radius: 8px;
      }
      
      .selected {
        background-color: coral;
        font-weight: bold;
        border-radius: 8px;
      }
      
      #decimal span[data-value],
      #octal span[data-value],
      #hexa span[data-value],
      #binary span[data-value] {
        padding: 2px 4px;
      }
    </style>
    <pre id="line-count" class="field"></pre>
    <pre id="binary" class="field"></pre>
    <pre id="octal" class="field"></pre>
    <pre id="decimal" class="field"></pre>
    <pre id="hexa" class="field"></pre>
    <pre id="text" class="field"></pre>
    <div id=base64-container>
      <slot name=base64-label><b>Base 64: </b></slot>
      <pre id=base64></pre>
    </div>`;
    return template;
})();
class BinaryDump extends HTMLElement {
    constructor(bl = 16, data, option) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        super();
        this.attachShadow({ mode: 'open' });
        (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.appendChild(template.content.cloneNode(true));
        this._hide = new Set(option === null || option === void 0 ? void 0 : option.hide);
        this._binary = (_b = this.shadowRoot) === null || _b === void 0 ? void 0 : _b.querySelector('#binary');
        this._octal = (_c = this.shadowRoot) === null || _c === void 0 ? void 0 : _c.querySelector('#octal');
        this._decimal = (_d = this.shadowRoot) === null || _d === void 0 ? void 0 : _d.querySelector('#decimal');
        this._hexa = (_e = this.shadowRoot) === null || _e === void 0 ? void 0 : _e.querySelector('#hexa');
        this._text = (_f = this.shadowRoot) === null || _f === void 0 ? void 0 : _f.querySelector('#text');
        this._base64 = (_g = this.shadowRoot) === null || _g === void 0 ? void 0 : _g.querySelector('#base64');
        this._lc = (_h = this.shadowRoot) === null || _h === void 0 ? void 0 : _h.querySelector('#line-count');
        this._bl = bl;
        (_j = this.shadowRoot) === null || _j === void 0 ? void 0 : _j.addEventListener('mouseover', ev => {
            var _a, _b;
            const el = ev.target;
            if ('value' in el.dataset) {
                (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelectorAll(`[data-value='${el.dataset.value}']`).forEach(e => {
                    e.classList.add('hovered');
                });
                (_b = this.shadowRoot) === null || _b === void 0 ? void 0 : _b.querySelectorAll(`[data-idx='${el.dataset.idx}']`).forEach(e => {
                    e.classList.add('selected');
                });
            }
        });
        (_k = this.shadowRoot) === null || _k === void 0 ? void 0 : _k.addEventListener('mouseout', ev => {
            var _a, _b;
            const el = ev.target;
            if ('value' in el.dataset) {
                (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelectorAll(`[data-value='${el.dataset.value}']`).forEach(e => {
                    e.classList.remove('hovered');
                });
                (_b = this.shadowRoot) === null || _b === void 0 ? void 0 : _b.querySelectorAll(`[data-idx='${el.dataset.idx}']`).forEach(e => {
                    e.classList.remove('selected');
                });
            }
        });
        if (data !== undefined)
            this.update(data);
        this.set_hide();
    }
    connectedCallback() {
        var _a;
        if (this.hasAttribute('hide'))
            this.hide(...(_a = this.getAttribute('hide')) === null || _a === void 0 ? void 0 : _a.split(','));
    }
    attributeChangedCallback(attr, oldVal, newVal) {
        if (oldVal === newVal)
            return;
        this._hide.clear();
        this.hide(...newVal.split(','));
    }
    static get observedAttributes() {
        return ['hide'];
    }
    get hided() {
        return Array.from(this._hide.values());
    }
    hide(...args) {
        let changed = false;
        args.forEach((s) => {
            if (is_encoding(s) && !this._hide.has(s)) {
                changed = true;
                this._hide.add(s);
            }
        });
        if (changed)
            this.set_hide();
    }
    show(...args) {
        let changed = false;
        args.forEach((s) => {
            if (is_encoding(s) && this._hide.has(s)) {
                changed = true;
                this._hide.delete(s);
            }
        });
        if (changed)
            this.set_hide();
    }
    is_hidden(encode) {
        return this._hide.has(encode);
    }
    update(data, bl = this._bl) {
        this._bl = bl;
        [
            [this._binary, 'binary'],
            [this._decimal, 'decimal'],
            [this._octal, 'octal'],
            [this._hexa, 'hexa'],
        ].forEach(v => {
            this.append_elements(v[0], break_line_array(to_binary_array_element(data, (0,_libs_binary_dump__WEBPACK_IMPORTED_MODULE_1__.to_array_string)(data, v[1], '0')), this._bl));
        });
        this.append_elements(this._text, break_line_array(to_binary_array_element(data, binary_to_ascii(data)), this._bl));
        this._base64.textContent = (0,_libs_base64__WEBPACK_IMPORTED_MODULE_0__.base64_encode)(data, { breakline: false });
        create_break_line_field(this._lc, data.length, this._bl);
    }
    append_elements(container, elements) {
        container.innerHTML = '';
        elements.forEach(el => container.appendChild(el));
    }
    set_hide() {
        var _a;
        const new_value = [];
        [
            [this._binary, 'binary'],
            [this._decimal, 'decimal'],
            [this._hexa, 'hexa'],
            [this._octal, 'octal'],
            [this._text, 'text'],
        ].forEach(v => {
            if (this._hide.has(v[1])) {
                v[0].style.display = 'none';
                new_value.push(v[1]);
            }
            else
                v[0].style.display = '';
        });
        {
            // Base64
            const el = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('#base64-container');
            if (this._hide.has('base64')) {
                new_value.push('base64');
                el.style.display = 'none';
            }
            else
                el.style.display = '';
        }
        this.setAttribute('hide', new_value.join(','));
    }
}
function is_encoding(encode) {
    return _libs_binary_dump__WEBPACK_IMPORTED_MODULE_1__.encoding.includes(encode);
}
customElements.define('binary-dump', BinaryDump);
/**
 * Free functions
 */
function binary_to_ascii(data) {
    return data.reduce((acc, v) => {
        acc.push(!(0,_libs_binary_dump__WEBPACK_IMPORTED_MODULE_1__.is_ascii_code_printable)(v) ? '.' : String.fromCharCode(v));
        return acc;
    }, []);
}
function to_binary_array_element(data, value) {
    const out = [];
    data.forEach((v, i) => {
        const s = document.createElement('span');
        s.dataset.value = v.toString(10);
        s.dataset.idx = i.toString(10);
        s.textContent = value[i];
        out.push(s);
    });
    return out;
}
function break_line_array(els, br) {
    /**
     * TODO: Add a assert that BR must be positive integer
     */
    return els.reduce((acc, v, idx) => {
        if (idx !== 0 && idx % br === 0)
            acc.push(document.createElement('br'));
        acc.push(v);
        return acc;
    }, []);
}
function create_break_line_field(el, lines, br) {
    el.innerHTML = '';
    let i = 0;
    while (true) {
        const span = document.createElement('span');
        span.textContent = i.toString(16).padStart(4, '0');
        el.appendChild(span);
        i += br;
        if (i >= lines)
            break;
        el.appendChild(document.createElement('br'));
    }
}


/***/ }),

/***/ "./src/ts/web-components/binary-input/text-area-binary.ts":
/*!****************************************************************!*\
  !*** ./src/ts/web-components/binary-input/text-area-binary.ts ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BinaryAreaInput: () => (/* binding */ BinaryAreaInput)
/* harmony export */ });
/* harmony import */ var _libs_binary_dump__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../libs/binary-dump */ "./src/ts/libs/binary-dump.ts");

const template = (function () {
    const template = document.createElement('template');
    template.innerHTML = `
  <style>
    :host {
      display: inline-block;
    }

    textarea{
      width: 100%;
      box-sizing: border-box;
    }
  </style>
  <textarea></textarea>`;
    return template;
})();
class BinaryAreaInput extends HTMLElement {
    constructor() {
        var _a, _b;
        super();
        this._encode = 'hexa';
        this.attachShadow({ mode: 'open' });
        (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.appendChild(template.content.cloneNode(true));
        this._input = (_b = this.shadowRoot) === null || _b === void 0 ? void 0 : _b.querySelector('textarea');
        this._input.onkeydown = ev => {
            if (ev.ctrlKey)
                return;
            if (['Backspace', 'Delete', 'Tab', 'Home', 'End', 'Enter'].includes(ev.key))
                return;
            if (ev.key.startsWith('Arrow'))
                return;
            if (ev.key === 'Escape') {
                this.clear();
                return;
            }
            if (!(0,_libs_binary_dump__WEBPACK_IMPORTED_MODULE_0__.is_encode_char)(ev.key, this._encode))
                ev.preventDefault();
        };
        this._input.onkeyup = ev => {
            const position = this._input.selectionStart;
            this.format(this._input.value);
            if (['Delete'].includes(ev.key))
                this._input.selectionEnd = position;
        };
        this._input.onpaste = ev => {
            var _a, _b;
            ev.preventDefault();
            this.value = (_b = (_a = ev.clipboardData) === null || _a === void 0 ? void 0 : _a.getData('text')) !== null && _b !== void 0 ? _b : '';
        };
    }
    static get observedAttributes() {
        return ['placeholder', 'disabled', 'rows', 'cols'];
    }
    connectedCallback() {
        if (this.hasAttribute('placeholder')) {
            this._input.placeholder = this.getAttribute('placeholder');
        }
        this._input.disabled = this.hasAttribute('disabled');
    }
    set placeholder(name) {
        this._input.placeholder = name;
        this.setAttribute('placeholder', name);
    }
    get placeholder() {
        return this._input.placeholder;
    }
    get disabled() {
        return this._input.disabled;
    }
    set disabled(disable) {
        this._input.disabled = disable;
        if (disable)
            this.setAttribute('disabled', 'true');
        else
            this.removeAttribute('disabled');
    }
    set rows(r) {
        this._input.setAttribute('rows', r.toString());
    }
    get rows() {
        return this._input.rows;
    }
    set cols(c) {
        this._input.setAttribute('cols', c.toString());
    }
    get cols() {
        return this._input.cols;
    }
    focus() {
        this._input.focus();
    }
    attributeChangedCallback(attr, oldVal, newVal) {
        if (oldVal === newVal)
            return;
        switch (attr) {
            case 'placeholder':
                this.placeholder = newVal;
                break;
            case 'disabled':
                this.disabled = newVal !== null;
                break;
            case 'rows':
                this.rows = +newVal;
                break;
            case 'cols':
                this.cols = +newVal;
                break;
        }
    }
    set value(v) {
        this._input.value = v
            .split('\n')
            .map(s => {
            s = (0,_libs_binary_dump__WEBPACK_IMPORTED_MODULE_0__.clear_string)(s, this._encode);
            return (0,_libs_binary_dump__WEBPACK_IMPORTED_MODULE_0__.format)((0,_libs_binary_dump__WEBPACK_IMPORTED_MODULE_0__.split)(s, this._encode), this._encode, {
                separator: ' ',
                pad: '0',
            });
        })
            .join('\n');
    }
    get value() {
        return this._input.value;
    }
    set data(d) {
        this._input.value = (0,_libs_binary_dump__WEBPACK_IMPORTED_MODULE_0__.format)((0,_libs_binary_dump__WEBPACK_IMPORTED_MODULE_0__.to_array_string)(d, this._encode), this._encode, {
            separator: ' ',
            pad: '0',
        });
    }
    get data() {
        return (0,_libs_binary_dump__WEBPACK_IMPORTED_MODULE_0__.to_data)((0,_libs_binary_dump__WEBPACK_IMPORTED_MODULE_0__.split)(this.value, this._encode), this._encode);
    }
    get data_array() {
        return this._input.value
            .split('\n')
            .map(s => (0,_libs_binary_dump__WEBPACK_IMPORTED_MODULE_0__.to_data)((0,_libs_binary_dump__WEBPACK_IMPORTED_MODULE_0__.split)(s, this._encode), this._encode));
    }
    set encode(enc) {
        (0,_libs_binary_dump__WEBPACK_IMPORTED_MODULE_0__.check_encoding)(enc);
        if (enc === this._encode)
            return;
        this._input.value = this._input.value
            .split('\n')
            .map(s => (0,_libs_binary_dump__WEBPACK_IMPORTED_MODULE_0__.format)((0,_libs_binary_dump__WEBPACK_IMPORTED_MODULE_0__.convert)((0,_libs_binary_dump__WEBPACK_IMPORTED_MODULE_0__.split)(s, this._encode), this._encode, enc), enc, {
            separator: ' ',
            pad: '0',
        }))
            .join('\n');
        this._encode = enc;
    }
    get encode() {
        return this._encode;
    }
    clear() {
        this._input.value = '';
    }
    format(str) {
        this._input.value = str
            .split('\n')
            .map(s => {
            return (0,_libs_binary_dump__WEBPACK_IMPORTED_MODULE_0__.format)((0,_libs_binary_dump__WEBPACK_IMPORTED_MODULE_0__.split)(s, this._encode), this._encode);
        })
            .join('\n');
    }
}
customElements.define('text-area-binary', BinaryAreaInput);


/***/ }),

/***/ "./src/ts/web-components/binary-input/text-area-radio-binary.ts":
/*!**********************************************************************!*\
  !*** ./src/ts/web-components/binary-input/text-area-radio-binary.ts ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BinaryInputAreaRadio: () => (/* binding */ BinaryInputAreaRadio)
/* harmony export */ });
/* harmony import */ var _libs_binary_dump__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../libs/binary-dump */ "./src/ts/libs/binary-dump.ts");

const template = (function () {
    const template = document.createElement('template');
    template.innerHTML = `
  <style>
  :host {
    display: inline-flex;
  }

  #data {
    flex-grow: 1;
  }

  #encode-container {
    display: inline-flex;
    flex-direction: column;
    vertical-align: top;
  }
  </style>
  <text-area-binary id=data rows=6></text-area-binary>
  <div id=encode-container></div>`;
    return template;
})();
class BinaryInputAreaRadio extends HTMLElement {
    constructor(options = {}) {
        var _a, _b, _c, _d;
        super();
        this.attachShadow({ mode: 'open' });
        (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.appendChild(template.content.cloneNode(true));
        this._data = (_b = this.shadowRoot) === null || _b === void 0 ? void 0 : _b.querySelector('#data');
        const encode_container = (_c = this.shadowRoot) === null || _c === void 0 ? void 0 : _c.querySelector('#encode-container');
        _libs_binary_dump__WEBPACK_IMPORTED_MODULE_0__.encoding.forEach(enc => {
            const input = document.createElement('input');
            input.value = enc;
            input.textContent = enc;
            input.type = 'radio';
            input.onchange = () => {
                this.encode = input.value;
            };
            const label = document.createElement('label');
            label.appendChild(input);
            label.appendChild(document.createTextNode(enc));
            encode_container.appendChild(label);
        });
        this.encode = (_d = options === null || options === void 0 ? void 0 : options.selected) !== null && _d !== void 0 ? _d : 'text';
    }
    static get observedAttributes() {
        return ['selected', 'placeholder', 'disabled', 'rows', 'cols'];
    }
    connectedCallback() {
        if (this.hasAttribute('selected')) {
            this.encode = this.getAttribute('selected');
        }
        if (this.hasAttribute('placeholder')) {
            this._data.placeholder = this.getAttribute('placeholder');
        }
        this.disabled = this.hasAttribute('disabled');
    }
    attributeChangedCallback(attr, oldVal, newVal) {
        if (oldVal === newVal)
            return;
        switch (attr) {
            case 'selected':
                this.encode = newVal;
                break;
            case 'placeholder':
                this.placeholder = newVal;
                break;
            case 'disabled':
                this.disabled = newVal !== null;
                break;
            case 'rows':
                this.rows = +newVal;
                break;
            case 'cols':
                this.cols = +newVal;
                break;
        }
    }
    get rows() {
        return this._data.rows;
    }
    set rows(r) {
        this._data.rows = r;
    }
    get cols() {
        return this._data.rows;
    }
    set cols(c) {
        this._data.cols = c;
    }
    get value() {
        return this._data.value;
    }
    get data() {
        return this._data.data;
    }
    set data(d) {
        this._data.data = d;
    }
    get data_array() {
        return this._data.data_array;
    }
    set encode(enc) {
        var _a;
        if (!_libs_binary_dump__WEBPACK_IMPORTED_MODULE_0__.encoding.includes(enc))
            return;
        this._data.encode = enc;
        (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelectorAll('[type=radio]').forEach(e => {
            const ee = e;
            ee.checked = ee.value === enc;
        });
        this.setAttribute('selected', enc);
    }
    get encode() {
        return this._data.encode;
    }
    clear() {
        this._data.clear();
    }
    set placeholder(name) {
        this._data.placeholder = name;
        this.setAttribute('placeholder', name);
    }
    get placeholder() {
        return this._data.placeholder;
    }
    get disabled() {
        return this._data.disabled;
    }
    set disabled(disable) {
        var _a;
        this._data.disabled = disable;
        (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelectorAll('[type=radio]').forEach(e => {
            e.disabled = disable;
        });
        if (disable)
            this.setAttribute('disabled', 'true');
        else
            this.removeAttribute('disabled');
    }
    focus() {
        this._data.focus();
    }
}
customElements.define('text-area-radio-binary', BinaryInputAreaRadio);


/***/ }),

/***/ "./src/ts/web-components/input-dump/input-dump.ts":
/*!********************************************************!*\
  !*** ./src/ts/web-components/input-dump/input-dump.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   InputDump: () => (/* binding */ InputDump)
/* harmony export */ });
/* harmony import */ var _libs_base64__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../libs/base64 */ "./src/ts/libs/base64.ts");
/* harmony import */ var _libs_binary_dump__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../libs/binary-dump */ "./src/ts/libs/binary-dump.ts");
/* harmony import */ var _alert_message_alert_message__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../alert-message/alert-message */ "./src/ts/web-components/alert-message/alert-message.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



const template = (function () {
    const template = document.createElement('template');
    template.innerHTML = `
  <style>
    :host {
      background-color: darkgrey;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    #header {
      display: flex;
      gap: 2px;
      width: 100%;
    }

    #input {
      flex-grow: 1;
    }

    #hide {
      display: flex;
      flex-direction: column;
    }

    #options {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }

    #options * {
      text-align: center;
    }

    #dump-container {
      overflow: auto;
      height: 100%;
    }

    fieldset {
      padding: 2px;
      border-radius: 3px;
    }

    fieldset legend {
      font-size: small;
      font-weight: bold;
    }
  </style>
  <div id=header>
    <text-area-radio-binary id=input></text-area-radio-binary>
    <div id=hide>
      <label><input type=checkbox name=encode value=binary></label>
      <label><input type=checkbox name=encode value=octal></label>
      <label><input type=checkbox name=encode value=decimal></label>
      <label><input type=checkbox name=encode value=hexa></label>
      <label><input type=checkbox name=encode value=text></label>
      <label><input type=checkbox name=encode value=base64></label>
    </div>
    <div id=options>
      <input-file id=file>File</input-file>
      <fieldset>
        <legend>Bytes</legend>
        <span id=size-bytes>0</span>
      </fieldset>
      <fieldset>
        <legend>Breakline</legend>
        <input type=number min=1 max=16 id=breakline>
      </fieldset>
    </div>
  </div>
  <div id=dump-container>
    <binary-dump id=dump></binary-dump>
  </div>`;
    return template;
})();
class InputDump extends HTMLElement {
    constructor(options = {}) {
        var _a, _b, _c, _d, _e;
        super();
        this.attachShadow({ mode: 'open' });
        (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.appendChild(template.content.cloneNode(true));
        this._input = (_b = this.shadowRoot) === null || _b === void 0 ? void 0 : _b.querySelector('#input');
        this._dump = (_c = this.shadowRoot) === null || _c === void 0 ? void 0 : _c.querySelector('#dump');
        this._breakline = (_d = this.shadowRoot) === null || _d === void 0 ? void 0 : _d.querySelector('#breakline');
        this._size_bytes = (_e = this.shadowRoot) === null || _e === void 0 ? void 0 : _e.querySelector('#size-bytes');
        Promise.all([
            customElements.whenDefined('binary-dump'),
            customElements.whenDefined('text-area-radio-binary'),
        ])
            .then(() => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const d = (0,_libs_base64__WEBPACK_IMPORTED_MODULE_0__.base64_decode)((_a = options.data) !== null && _a !== void 0 ? _a : '');
            this._input.data = d;
            this._size_bytes.textContent = d.length.toString();
            this._input.encode = (_b = options.encode) !== null && _b !== void 0 ? _b : 'text';
            this._breakline.value = (_d = (_c = options.breakline) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : '8';
            const file_handler = (ev) => __awaiter(this, void 0, void 0, function* () {
                const d = yield file_event(ev);
                if (d === undefined)
                    return;
                this._input.data = d;
                update();
            });
            ((_e = this.shadowRoot) === null || _e === void 0 ? void 0 : _e.querySelector('#file')).on('change', file_handler);
            const update = () => {
                const d = this._input.data;
                this._dump.update(d, +this._breakline.value);
                this._size_bytes.textContent = d.length.toString();
                this.dispatchEvent(new CustomEvent('state', {
                    detail: {
                        data: (0,_libs_base64__WEBPACK_IMPORTED_MODULE_0__.base64_encode)(this._input.data),
                        encode: this._input.encode,
                        breakline: +this._breakline.value,
                        hide: this._dump.hided,
                    },
                }));
            };
            this._input.addEventListener('keyup', () => {
                update();
            });
            (_f = this._input.shadowRoot) === null || _f === void 0 ? void 0 : _f.addEventListener('change', () => {
                update();
            });
            this._breakline.addEventListener('change', () => {
                update();
            });
            this._dump.hide(...((_g = options.hide) !== null && _g !== void 0 ? _g : []));
            (_h = this.shadowRoot) === null || _h === void 0 ? void 0 : _h.querySelectorAll('input[name=encode]').forEach(v => {
                const i = v;
                i.onclick = () => {
                    if (i.checked)
                        this._dump.show(i.value);
                    else
                        this._dump.hide(i.value);
                    update();
                };
                if (!this._dump.is_hidden(i.value))
                    i.checked = true;
            });
            update();
        })
            .finally(() => { });
    }
    set state(s) {
        if (s.data !== undefined) {
            const d = (0,_libs_base64__WEBPACK_IMPORTED_MODULE_0__.base64_decode)(s.data);
            this._input.data = d;
            this._size_bytes.textContent = d.length.toString();
        }
        if (s.encode !== undefined)
            this._input.encode = s.encode;
        if (s.hide !== undefined) {
            this._dump.show(..._libs_binary_dump__WEBPACK_IMPORTED_MODULE_1__.encoding);
            this._dump.hide(...s.hide);
        }
        if (s.breakline !== undefined)
            this._breakline.value = s.breakline.toString();
    }
    get state() {
        return {
            data: (0,_libs_base64__WEBPACK_IMPORTED_MODULE_0__.base64_encode)(this._input.data),
            encode: this._input.encode,
            breakline: +this._breakline.value,
            hide: this._dump.hided,
        };
    }
}
customElements.define('input-dump', InputDump);
function file_event(ev) {
    return __awaiter(this, void 0, void 0, function* () {
        const target = ev.target;
        const file_list = target.files;
        if ((file_list === null || file_list === void 0 ? void 0 : file_list.length) === 0)
            return undefined;
        const file = file_list === null || file_list === void 0 ? void 0 : file_list[0];
        const buf = yield file.arrayBuffer();
        if (buf === undefined)
            return undefined;
        new _alert_message_alert_message__WEBPACK_IMPORTED_MODULE_2__.AlertMessage(`File ${file.name} loaded from 0 to ${Math.min(1024, file.size)}`)
            .bottom()
            .append_element()
            .face_out(0.003, true);
        target.value = '';
        return new Uint8Array(buf).slice(0, 1024);
    });
}


/***/ }),

/***/ "./src/ts/web-components/input-file/input-file.ts":
/*!********************************************************!*\
  !*** ./src/ts/web-components/input-file/input-file.ts ***!
  \********************************************************/
/***/ (() => {


const template = (function () {
    const template = document.createElement('template');
    template.innerHTML = `
  <style>
    :host {
      position: relative;
      border: 1px solid black;
      border-radius: 3px;
      box-sizing: border-box;
    }

    input {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      opacity: 0;
      box-sizing: border-box;
    }
  </style><slot></slot>
  <input type=file />`;
    return template;
})();
class InputFile extends HTMLElement {
    constructor() {
        var _a, _b;
        super();
        this.attachShadow({ mode: 'open' });
        (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.appendChild(template.content.cloneNode(true));
        this._input = (_b = this.shadowRoot) === null || _b === void 0 ? void 0 : _b.querySelector('input');
    }
    on(type, listener, options = {}) {
        this._input.addEventListener(type, listener, options);
    }
}
customElements.define('input-file', InputFile);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************************!*\
  !*** ./src/tools/input/input.ts ***!
  \**********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _input_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./input.css */ "./src/tools/input/input.css");
/* harmony import */ var _ts_web_components_binary_dump_binary_dump__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../ts/web-components/binary-dump/binary-dump */ "./src/ts/web-components/binary-dump/binary-dump.ts");
/* harmony import */ var _ts_web_components_binary_input_text_area_binary__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../ts/web-components/binary-input/text-area-binary */ "./src/ts/web-components/binary-input/text-area-binary.ts");
/* harmony import */ var _ts_web_components_binary_input_text_area_radio_binary__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../ts/web-components/binary-input/text-area-radio-binary */ "./src/ts/web-components/binary-input/text-area-radio-binary.ts");
/* harmony import */ var _ts_web_components_input_file_input_file__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../ts/web-components/input-file/input-file */ "./src/ts/web-components/input-file/input-file.ts");
/* harmony import */ var _ts_web_components_input_file_input_file__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_ts_web_components_input_file_input_file__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _ts_web_components_alert_message_alert_message__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../ts/web-components/alert-message/alert-message */ "./src/ts/web-components/alert-message/alert-message.ts");
/* harmony import */ var _ts_web_components_input_dump_input_dump__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../ts/web-components/input-dump/input-dump */ "./src/ts/web-components/input-dump/input-dump.ts");
/* harmony import */ var _db__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./db */ "./src/tools/input/db.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b;








const container = document.querySelector('#input-dump');
const input_dump = new _ts_web_components_input_dump_input_dump__WEBPACK_IMPORTED_MODULE_6__.InputDump(read_link());
let state = {};
let db;
read()
    .then((state) => {
    input_dump.state = state;
})
    .catch(e => {
    console.warn('Error opening database');
});
(_a = document.querySelector('#link')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => { });
container === null || container === void 0 ? void 0 : container.appendChild(input_dump);
const message = new _ts_web_components_alert_message_alert_message__WEBPACK_IMPORTED_MODULE_5__.AlertMessage('Link copied', arg => arg.hide())
    .append_element()
    .hide()
    .bottom();
(_b = document.querySelector('#link')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', ev => {
    navigator.clipboard.writeText(make_link(state, true)).finally(() => { });
    message.show();
});
input_dump.addEventListener('state', ev => {
    state = ev.detail;
    window.history.replaceState('state', '', make_link(state, false));
    write().finally(() => { });
});
function make_link(state, fulllink = true) {
    var _a;
    let link = `${fulllink ? window.location.origin : ''}${window.location.pathname}?encode=${state.encode}&bl=${state.breakline}`;
    if (state.hide !== undefined && state.hide.length > 0)
        link += `&hide=${state.hide.join(',')}`;
    if (state.data !== undefined && ((_a = state.data) === null || _a === void 0 ? void 0 : _a.length) > 0)
        link += `&data=${state.data}`;
    return link;
}
function read_link() {
    const url = new URL(window.location.href);
    const state = {
        breakline: 8,
        data: '',
        hide: [],
        encode: 'text',
    };
    url.searchParams.forEach((value, key) => {
        switch (key) {
            case 'bl':
                state.breakline = +value;
                break;
            case 'data':
                state.data = value;
                break;
            case 'hide':
                state.hide = value.split(',');
                break;
            case 'encode':
                state.encode = value;
                break;
        }
    });
    return state;
}
function read() {
    return __awaiter(this, void 0, void 0, function* () {
        db = yield (0,_db__WEBPACK_IMPORTED_MODULE_7__.open_db)();
        return yield (0,_db__WEBPACK_IMPORTED_MODULE_7__.read_db)(db);
    });
}
function write() {
    return __awaiter(this, void 0, void 0, function* () {
        if (db === undefined)
            return;
        yield (0,_db__WEBPACK_IMPORTED_MODULE_7__.write_db)(db, state);
    });
}

})();

/******/ })()
;
//# sourceMappingURL=input.bundle.js.map