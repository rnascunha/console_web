"use strict";(self.webpackChunkconsole_web=self.webpackChunkconsole_web||[]).push([[9822],{20260:(e,t,i)=>{i.r(t),i.d(t,{Adapter:()=>b,CodeActionAdaptor:()=>N,DefinitionAdapter:()=>v,DiagnosticsAdapter:()=>_,DocumentHighlightAdapter:()=>x,FormatAdapter:()=>P,FormatHelper:()=>L,FormatOnTypeAdapter:()=>O,InlayHintsAdapter:()=>K,Kind:()=>F,LibFiles:()=>f,OutlineAdapter:()=>D,QuickInfoAdapter:()=>k,ReferenceAdapter:()=>C,RenameAdapter:()=>M,SignatureHelpAdapter:()=>S,SuggestAdapter:()=>y,WorkerManager:()=>g,flattenDiagnosticMessageText:()=>m,getJavaScriptWorker:()=>H,getTypeScriptWorker:()=>V,setupJavaScript:()=>E,setupTypeScript:()=>R});var s=i(88734),r=i(85212),n=Object.defineProperty,a=Object.getOwnPropertyDescriptor,o=Object.getOwnPropertyNames,l=Object.prototype.hasOwnProperty,c=(e,t,i,s)=>{if(t&&"object"==typeof t||"function"==typeof t)for(let r of o(t))l.call(e,r)||r===i||n(e,r,{get:()=>t[r],enumerable:!(s=a(t,r))||s.enumerable});return e},d=(e,t,i)=>(((e,t,i)=>{t in e?n(e,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):e[t]=i})(e,"symbol"!=typeof t?t+"":t,i),i),u={};c(u,s,"default");var g=class{constructor(e,t){this._modeId=e,this._defaults=t,this._worker=null,this._client=null,this._configChangeListener=this._defaults.onDidChange((()=>this._stopWorker())),this._updateExtraLibsToken=0,this._extraLibsChangeListener=this._defaults.onDidExtraLibsChange((()=>this._updateExtraLibs()))}_configChangeListener;_updateExtraLibsToken;_extraLibsChangeListener;_worker;_client;dispose(){this._configChangeListener.dispose(),this._extraLibsChangeListener.dispose(),this._stopWorker()}_stopWorker(){this._worker&&(this._worker.dispose(),this._worker=null),this._client=null}async _updateExtraLibs(){if(!this._worker)return;const e=++this._updateExtraLibsToken,t=await this._worker.getProxy();this._updateExtraLibsToken===e&&t.updateExtraLibs(this._defaults.getExtraLibs())}_getClient(){return this._client||(this._client=(async()=>(this._worker=u.editor.createWebWorker({moduleId:"vs/language/typescript/tsWorker",label:this._modeId,keepIdleModels:!0,createData:{compilerOptions:this._defaults.getCompilerOptions(),extraLibs:this._defaults.getExtraLibs(),customWorkerPath:this._defaults.workerOptions.customWorkerPath,inlayHintsOptions:this._defaults.inlayHintsOptions}}),this._defaults.getEagerModelSync()?await this._worker.withSyncedResources(u.editor.getModels().filter((e=>e.getLanguageId()===this._modeId)).map((e=>e.uri))):await this._worker.getProxy()))()),this._client}async getLanguageServiceWorker(...e){const t=await this._getClient();return this._worker&&await this._worker.withSyncedResources(e),t}},p={};function m(e,t,i=0){if("string"==typeof e)return e;if(void 0===e)return"";let s="";if(i){s+=t;for(let e=0;e<i;e++)s+="  "}if(s+=e.messageText,i++,e.next)for(const r of e.next)s+=m(r,t,i);return s}function h(e){return e?e.map((e=>e.text)).join(""):""}p["lib.d.ts"]=!0,p["lib.decorators.d.ts"]=!0,p["lib.decorators.legacy.d.ts"]=!0,p["lib.dom.d.ts"]=!0,p["lib.dom.iterable.d.ts"]=!0,p["lib.es2015.collection.d.ts"]=!0,p["lib.es2015.core.d.ts"]=!0,p["lib.es2015.d.ts"]=!0,p["lib.es2015.generator.d.ts"]=!0,p["lib.es2015.iterable.d.ts"]=!0,p["lib.es2015.promise.d.ts"]=!0,p["lib.es2015.proxy.d.ts"]=!0,p["lib.es2015.reflect.d.ts"]=!0,p["lib.es2015.symbol.d.ts"]=!0,p["lib.es2015.symbol.wellknown.d.ts"]=!0,p["lib.es2016.array.include.d.ts"]=!0,p["lib.es2016.d.ts"]=!0,p["lib.es2016.full.d.ts"]=!0,p["lib.es2017.d.ts"]=!0,p["lib.es2017.full.d.ts"]=!0,p["lib.es2017.intl.d.ts"]=!0,p["lib.es2017.object.d.ts"]=!0,p["lib.es2017.sharedmemory.d.ts"]=!0,p["lib.es2017.string.d.ts"]=!0,p["lib.es2017.typedarrays.d.ts"]=!0,p["lib.es2018.asyncgenerator.d.ts"]=!0,p["lib.es2018.asynciterable.d.ts"]=!0,p["lib.es2018.d.ts"]=!0,p["lib.es2018.full.d.ts"]=!0,p["lib.es2018.intl.d.ts"]=!0,p["lib.es2018.promise.d.ts"]=!0,p["lib.es2018.regexp.d.ts"]=!0,p["lib.es2019.array.d.ts"]=!0,p["lib.es2019.d.ts"]=!0,p["lib.es2019.full.d.ts"]=!0,p["lib.es2019.intl.d.ts"]=!0,p["lib.es2019.object.d.ts"]=!0,p["lib.es2019.string.d.ts"]=!0,p["lib.es2019.symbol.d.ts"]=!0,p["lib.es2020.bigint.d.ts"]=!0,p["lib.es2020.d.ts"]=!0,p["lib.es2020.date.d.ts"]=!0,p["lib.es2020.full.d.ts"]=!0,p["lib.es2020.intl.d.ts"]=!0,p["lib.es2020.number.d.ts"]=!0,p["lib.es2020.promise.d.ts"]=!0,p["lib.es2020.sharedmemory.d.ts"]=!0,p["lib.es2020.string.d.ts"]=!0,p["lib.es2020.symbol.wellknown.d.ts"]=!0,p["lib.es2021.d.ts"]=!0,p["lib.es2021.full.d.ts"]=!0,p["lib.es2021.intl.d.ts"]=!0,p["lib.es2021.promise.d.ts"]=!0,p["lib.es2021.string.d.ts"]=!0,p["lib.es2021.weakref.d.ts"]=!0,p["lib.es2022.array.d.ts"]=!0,p["lib.es2022.d.ts"]=!0,p["lib.es2022.error.d.ts"]=!0,p["lib.es2022.full.d.ts"]=!0,p["lib.es2022.intl.d.ts"]=!0,p["lib.es2022.object.d.ts"]=!0,p["lib.es2022.regexp.d.ts"]=!0,p["lib.es2022.sharedmemory.d.ts"]=!0,p["lib.es2022.string.d.ts"]=!0,p["lib.es2023.array.d.ts"]=!0,p["lib.es2023.d.ts"]=!0,p["lib.es2023.full.d.ts"]=!0,p["lib.es5.d.ts"]=!0,p["lib.es6.d.ts"]=!0,p["lib.esnext.d.ts"]=!0,p["lib.esnext.full.d.ts"]=!0,p["lib.esnext.intl.d.ts"]=!0,p["lib.scripthost.d.ts"]=!0,p["lib.webworker.d.ts"]=!0,p["lib.webworker.importscripts.d.ts"]=!0,p["lib.webworker.iterable.d.ts"]=!0;var b=class{constructor(e){this._worker=e}_textSpanToRange(e,t){let i=e.getPositionAt(t.start),s=e.getPositionAt(t.start+t.length),{lineNumber:r,column:n}=i,{lineNumber:a,column:o}=s;return{startLineNumber:r,startColumn:n,endLineNumber:a,endColumn:o}}},f=class{constructor(e){this._worker=e,this._libFiles={},this._hasFetchedLibFiles=!1,this._fetchLibFilesPromise=null}_libFiles;_hasFetchedLibFiles;_fetchLibFilesPromise;isLibFile(e){return!!e&&0===e.path.indexOf("/lib.")&&!!p[e.path.slice(1)]}getOrCreateModel(e){const t=u.Uri.parse(e),i=u.editor.getModel(t);if(i)return i;if(this.isLibFile(t)&&this._hasFetchedLibFiles)return u.editor.createModel(this._libFiles[t.path.slice(1)],"typescript",t);const s=r.TG.getExtraLibs()[e];return s?u.editor.createModel(s.content,"typescript",t):null}_containsLibFile(e){for(let t of e)if(this.isLibFile(t))return!0;return!1}async fetchLibFilesIfNecessary(e){this._containsLibFile(e)&&await this._fetchLibFiles()}_fetchLibFiles(){return this._fetchLibFilesPromise||(this._fetchLibFilesPromise=this._worker().then((e=>e.getLibFiles())).then((e=>{this._hasFetchedLibFiles=!0,this._libFiles=e}))),this._fetchLibFilesPromise}},_=class extends b{constructor(e,t,i,s){super(s),this._libFiles=e,this._defaults=t,this._selector=i;const r=e=>{if(e.getLanguageId()!==i)return;const t=()=>{const{onlyVisible:t}=this._defaults.getDiagnosticsOptions();t?e.isAttachedToEditor()&&this._doValidate(e):this._doValidate(e)};let s;const r=e.onDidChangeContent((()=>{clearTimeout(s),s=window.setTimeout(t,500)})),n=e.onDidChangeAttached((()=>{const{onlyVisible:i}=this._defaults.getDiagnosticsOptions();i&&(e.isAttachedToEditor()?t():u.editor.setModelMarkers(e,this._selector,[]))}));this._listener[e.uri.toString()]={dispose(){r.dispose(),n.dispose(),clearTimeout(s)}},t()},n=e=>{u.editor.setModelMarkers(e,this._selector,[]);const t=e.uri.toString();this._listener[t]&&(this._listener[t].dispose(),delete this._listener[t])};this._disposables.push(u.editor.onDidCreateModel((e=>r(e)))),this._disposables.push(u.editor.onWillDisposeModel(n)),this._disposables.push(u.editor.onDidChangeModelLanguage((e=>{n(e.model),r(e.model)}))),this._disposables.push({dispose(){for(const e of u.editor.getModels())n(e)}});const a=()=>{for(const e of u.editor.getModels())n(e),r(e)};this._disposables.push(this._defaults.onDidChange(a)),this._disposables.push(this._defaults.onDidExtraLibsChange(a)),u.editor.getModels().forEach((e=>r(e)))}_disposables=[];_listener=Object.create(null);dispose(){this._disposables.forEach((e=>e&&e.dispose())),this._disposables=[]}async _doValidate(e){const t=await this._worker(e.uri);if(e.isDisposed())return;const i=[],{noSyntaxValidation:s,noSemanticValidation:r,noSuggestionDiagnostics:n}=this._defaults.getDiagnosticsOptions();s||i.push(t.getSyntacticDiagnostics(e.uri.toString())),r||i.push(t.getSemanticDiagnostics(e.uri.toString())),n||i.push(t.getSuggestionDiagnostics(e.uri.toString()));const a=await Promise.all(i);if(!a||e.isDisposed())return;const o=a.reduce(((e,t)=>t.concat(e)),[]).filter((e=>-1===(this._defaults.getDiagnosticsOptions().diagnosticCodesToIgnore||[]).indexOf(e.code))),l=o.map((e=>e.relatedInformation||[])).reduce(((e,t)=>t.concat(e)),[]).map((e=>e.file?u.Uri.parse(e.file.fileName):null));await this._libFiles.fetchLibFilesIfNecessary(l),e.isDisposed()||u.editor.setModelMarkers(e,this._selector,o.map((t=>this._convertDiagnostics(e,t))))}_convertDiagnostics(e,t){const i=t.start||0,s=t.length||1,{lineNumber:r,column:n}=e.getPositionAt(i),{lineNumber:a,column:o}=e.getPositionAt(i+s),l=[];return t.reportsUnnecessary&&l.push(u.MarkerTag.Unnecessary),t.reportsDeprecated&&l.push(u.MarkerTag.Deprecated),{severity:this._tsDiagnosticCategoryToMarkerSeverity(t.category),startLineNumber:r,startColumn:n,endLineNumber:a,endColumn:o,message:m(t.messageText,"\n"),code:t.code.toString(),tags:l,relatedInformation:this._convertRelatedInformation(e,t.relatedInformation)}}_convertRelatedInformation(e,t){if(!t)return[];const i=[];return t.forEach((t=>{let s=e;if(t.file&&(s=this._libFiles.getOrCreateModel(t.file.fileName)),!s)return;const r=t.start||0,n=t.length||1,{lineNumber:a,column:o}=s.getPositionAt(r),{lineNumber:l,column:c}=s.getPositionAt(r+n);i.push({resource:s.uri,startLineNumber:a,startColumn:o,endLineNumber:l,endColumn:c,message:m(t.messageText,"\n")})})),i}_tsDiagnosticCategoryToMarkerSeverity(e){switch(e){case 1:return u.MarkerSeverity.Error;case 3:return u.MarkerSeverity.Info;case 0:return u.MarkerSeverity.Warning;case 2:return u.MarkerSeverity.Hint}return u.MarkerSeverity.Info}},y=class extends b{get triggerCharacters(){return["."]}async provideCompletionItems(e,t,i,s){const r=e.getWordUntilPosition(t),n=new u.Range(t.lineNumber,r.startColumn,t.lineNumber,r.endColumn),a=e.uri,o=e.getOffsetAt(t),l=await this._worker(a);if(e.isDisposed())return;const c=await l.getCompletionsAtPosition(a.toString(),o);return c&&!e.isDisposed()?{suggestions:c.entries.map((i=>{let s=n;if(i.replacementSpan){const t=e.getPositionAt(i.replacementSpan.start),r=e.getPositionAt(i.replacementSpan.start+i.replacementSpan.length);s=new u.Range(t.lineNumber,t.column,r.lineNumber,r.column)}const r=[];return void 0!==i.kindModifiers&&-1!==i.kindModifiers.indexOf("deprecated")&&r.push(u.languages.CompletionItemTag.Deprecated),{uri:a,position:t,offset:o,range:s,label:i.name,insertText:i.name,sortText:i.sortText,kind:y.convertKind(i.kind),tags:r}}))}:void 0}async resolveCompletionItem(e,t){const i=e,s=i.uri,r=i.position,n=i.offset,a=await this._worker(s),o=await a.getCompletionEntryDetails(s.toString(),n,i.label);return o?{uri:s,position:r,label:o.name,kind:y.convertKind(o.kind),detail:h(o.displayParts),documentation:{value:y.createDocumentationString(o)}}:i}static convertKind(e){switch(e){case F.primitiveType:case F.keyword:return u.languages.CompletionItemKind.Keyword;case F.variable:case F.localVariable:return u.languages.CompletionItemKind.Variable;case F.memberVariable:case F.memberGetAccessor:case F.memberSetAccessor:return u.languages.CompletionItemKind.Field;case F.function:case F.memberFunction:case F.constructSignature:case F.callSignature:case F.indexSignature:return u.languages.CompletionItemKind.Function;case F.enum:return u.languages.CompletionItemKind.Enum;case F.module:return u.languages.CompletionItemKind.Module;case F.class:return u.languages.CompletionItemKind.Class;case F.interface:return u.languages.CompletionItemKind.Interface;case F.warning:return u.languages.CompletionItemKind.File}return u.languages.CompletionItemKind.Property}static createDocumentationString(e){let t=h(e.documentation);if(e.tags)for(const i of e.tags)t+=`\n\n${w(i)}`;return t}};function w(e){let t=`*@${e.name}*`;if("param"===e.name&&e.text){const[i,...s]=e.text;t+=`\`${i.text}\``,s.length>0&&(t+=` — ${s.map((e=>e.text)).join(" ")}`)}else Array.isArray(e.text)?t+=` — ${e.text.map((e=>e.text)).join(" ")}`:e.text&&(t+=` — ${e.text}`);return t}var S=class extends b{signatureHelpTriggerCharacters=["(",","];static _toSignatureHelpTriggerReason(e){switch(e.triggerKind){case u.languages.SignatureHelpTriggerKind.TriggerCharacter:return e.triggerCharacter?e.isRetrigger?{kind:"retrigger",triggerCharacter:e.triggerCharacter}:{kind:"characterTyped",triggerCharacter:e.triggerCharacter}:{kind:"invoked"};case u.languages.SignatureHelpTriggerKind.ContentChange:return e.isRetrigger?{kind:"retrigger"}:{kind:"invoked"};case u.languages.SignatureHelpTriggerKind.Invoke:default:return{kind:"invoked"}}}async provideSignatureHelp(e,t,i,s){const r=e.uri,n=e.getOffsetAt(t),a=await this._worker(r);if(e.isDisposed())return;const o=await a.getSignatureHelpItems(r.toString(),n,{triggerReason:S._toSignatureHelpTriggerReason(s)});if(!o||e.isDisposed())return;const l={activeSignature:o.selectedItemIndex,activeParameter:o.argumentIndex,signatures:[]};return o.items.forEach((e=>{const t={label:"",parameters:[]};t.documentation={value:h(e.documentation)},t.label+=h(e.prefixDisplayParts),e.parameters.forEach(((i,s,r)=>{const n=h(i.displayParts),a={label:n,documentation:{value:h(i.documentation)}};t.label+=n,t.parameters.push(a),s<r.length-1&&(t.label+=h(e.separatorDisplayParts))})),t.label+=h(e.suffixDisplayParts),l.signatures.push(t)})),{value:l,dispose(){}}}},k=class extends b{async provideHover(e,t,i){const s=e.uri,r=e.getOffsetAt(t),n=await this._worker(s);if(e.isDisposed())return;const a=await n.getQuickInfoAtPosition(s.toString(),r);if(!a||e.isDisposed())return;const o=h(a.documentation),l=a.tags?a.tags.map((e=>w(e))).join("  \n\n"):"",c=h(a.displayParts);return{range:this._textSpanToRange(e,a.textSpan),contents:[{value:"```typescript\n"+c+"\n```\n"},{value:o+(l?"\n\n"+l:"")}]}}},x=class extends b{async provideDocumentHighlights(e,t,i){const s=e.uri,r=e.getOffsetAt(t),n=await this._worker(s);if(e.isDisposed())return;const a=await n.getDocumentHighlights(s.toString(),r,[s.toString()]);return a&&!e.isDisposed()?a.flatMap((t=>t.highlightSpans.map((t=>({range:this._textSpanToRange(e,t.textSpan),kind:"writtenReference"===t.kind?u.languages.DocumentHighlightKind.Write:u.languages.DocumentHighlightKind.Text}))))):void 0}},v=class extends b{constructor(e,t){super(t),this._libFiles=e}async provideDefinition(e,t,i){const s=e.uri,r=e.getOffsetAt(t),n=await this._worker(s);if(e.isDisposed())return;const a=await n.getDefinitionAtPosition(s.toString(),r);if(!a||e.isDisposed())return;if(await this._libFiles.fetchLibFilesIfNecessary(a.map((e=>u.Uri.parse(e.fileName)))),e.isDisposed())return;const o=[];for(let e of a){const t=this._libFiles.getOrCreateModel(e.fileName);t&&o.push({uri:t.uri,range:this._textSpanToRange(t,e.textSpan)})}return o}},C=class extends b{constructor(e,t){super(t),this._libFiles=e}async provideReferences(e,t,i,s){const r=e.uri,n=e.getOffsetAt(t),a=await this._worker(r);if(e.isDisposed())return;const o=await a.getReferencesAtPosition(r.toString(),n);if(!o||e.isDisposed())return;if(await this._libFiles.fetchLibFilesIfNecessary(o.map((e=>u.Uri.parse(e.fileName)))),e.isDisposed())return;const l=[];for(let e of o){const t=this._libFiles.getOrCreateModel(e.fileName);t&&l.push({uri:t.uri,range:this._textSpanToRange(t,e.textSpan)})}return l}},D=class extends b{async provideDocumentSymbols(e,t){const i=e.uri,s=await this._worker(i);if(e.isDisposed())return;const r=await s.getNavigationTree(i.toString());if(!r||e.isDisposed())return;const n=(t,i)=>({name:t.text,detail:"",kind:A[t.kind]||u.languages.SymbolKind.Variable,range:this._textSpanToRange(e,t.spans[0]),selectionRange:this._textSpanToRange(e,t.spans[0]),tags:[],children:t.childItems?.map((e=>n(e,t.text))),containerName:i});return r.childItems?r.childItems.map((e=>n(e))):[]}},F=class{};d(F,"unknown",""),d(F,"keyword","keyword"),d(F,"script","script"),d(F,"module","module"),d(F,"class","class"),d(F,"interface","interface"),d(F,"type","type"),d(F,"enum","enum"),d(F,"variable","var"),d(F,"localVariable","local var"),d(F,"function","function"),d(F,"localFunction","local function"),d(F,"memberFunction","method"),d(F,"memberGetAccessor","getter"),d(F,"memberSetAccessor","setter"),d(F,"memberVariable","property"),d(F,"constructorImplementation","constructor"),d(F,"callSignature","call"),d(F,"indexSignature","index"),d(F,"constructSignature","construct"),d(F,"parameter","parameter"),d(F,"typeParameter","type parameter"),d(F,"primitiveType","primitive type"),d(F,"label","label"),d(F,"alias","alias"),d(F,"const","const"),d(F,"let","let"),d(F,"warning","warning");var A=Object.create(null);A[F.module]=u.languages.SymbolKind.Module,A[F.class]=u.languages.SymbolKind.Class,A[F.enum]=u.languages.SymbolKind.Enum,A[F.interface]=u.languages.SymbolKind.Interface,A[F.memberFunction]=u.languages.SymbolKind.Method,A[F.memberVariable]=u.languages.SymbolKind.Property,A[F.memberGetAccessor]=u.languages.SymbolKind.Property,A[F.memberSetAccessor]=u.languages.SymbolKind.Property,A[F.variable]=u.languages.SymbolKind.Variable,A[F.const]=u.languages.SymbolKind.Variable,A[F.localVariable]=u.languages.SymbolKind.Variable,A[F.variable]=u.languages.SymbolKind.Variable,A[F.function]=u.languages.SymbolKind.Function,A[F.localFunction]=u.languages.SymbolKind.Function;var I,T,L=class extends b{static _convertOptions(e){return{ConvertTabsToSpaces:e.insertSpaces,TabSize:e.tabSize,IndentSize:e.tabSize,IndentStyle:2,NewLineCharacter:"\n",InsertSpaceAfterCommaDelimiter:!0,InsertSpaceAfterSemicolonInForStatements:!0,InsertSpaceBeforeAndAfterBinaryOperators:!0,InsertSpaceAfterKeywordsInControlFlowStatements:!0,InsertSpaceAfterFunctionKeywordForAnonymousFunctions:!0,InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis:!1,InsertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets:!1,InsertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces:!1,PlaceOpenBraceOnNewLineForControlBlocks:!1,PlaceOpenBraceOnNewLineForFunctions:!1}}_convertTextChanges(e,t){return{text:t.newText,range:this._textSpanToRange(e,t.span)}}},P=class extends L{canFormatMultipleRanges=!1;async provideDocumentRangeFormattingEdits(e,t,i,s){const r=e.uri,n=e.getOffsetAt({lineNumber:t.startLineNumber,column:t.startColumn}),a=e.getOffsetAt({lineNumber:t.endLineNumber,column:t.endColumn}),o=await this._worker(r);if(e.isDisposed())return;const l=await o.getFormattingEditsForRange(r.toString(),n,a,L._convertOptions(i));return l&&!e.isDisposed()?l.map((t=>this._convertTextChanges(e,t))):void 0}},O=class extends L{get autoFormatTriggerCharacters(){return[";","}","\n"]}async provideOnTypeFormattingEdits(e,t,i,s,r){const n=e.uri,a=e.getOffsetAt(t),o=await this._worker(n);if(e.isDisposed())return;const l=await o.getFormattingEditsAfterKeystroke(n.toString(),a,i,L._convertOptions(s));return l&&!e.isDisposed()?l.map((t=>this._convertTextChanges(e,t))):void 0}},N=class extends L{async provideCodeActions(e,t,i,s){const r=e.uri,n=e.getOffsetAt({lineNumber:t.startLineNumber,column:t.startColumn}),a=e.getOffsetAt({lineNumber:t.endLineNumber,column:t.endColumn}),o=L._convertOptions(e.getOptions()),l=i.markers.filter((e=>e.code)).map((e=>e.code)).map(Number),c=await this._worker(r);if(e.isDisposed())return;const d=await c.getCodeFixesAtPosition(r.toString(),n,a,l,o);return!d||e.isDisposed()?{actions:[],dispose:()=>{}}:{actions:d.filter((e=>0===e.changes.filter((e=>e.isNewFile)).length)).map((t=>this._tsCodeFixActionToMonacoCodeAction(e,i,t))),dispose:()=>{}}}_tsCodeFixActionToMonacoCodeAction(e,t,i){const s=[];for(const t of i.changes)for(const i of t.textChanges)s.push({resource:e.uri,versionId:void 0,textEdit:{range:this._textSpanToRange(e,i.span),text:i.newText}});return{title:i.description,edit:{edits:s},diagnostics:t.markers,kind:"quickfix"}}},M=class extends b{constructor(e,t){super(t),this._libFiles=e}async provideRenameEdits(e,t,i,s){const r=e.uri,n=r.toString(),a=e.getOffsetAt(t),o=await this._worker(r);if(e.isDisposed())return;const l=await o.getRenameInfo(n,a,{allowRenameOfImportPath:!1});if(!1===l.canRename)return{edits:[],rejectReason:l.localizedErrorMessage};if(void 0!==l.fileToRename)throw new Error("Renaming files is not supported.");const c=await o.findRenameLocations(n,a,!1,!1,!1);if(!c||e.isDisposed())return;const d=[];for(const e of c){const t=this._libFiles.getOrCreateModel(e.fileName);if(!t)throw new Error(`Unknown file ${e.fileName}.`);d.push({resource:t.uri,versionId:void 0,textEdit:{range:this._textSpanToRange(t,e.textSpan),text:i}})}return{edits:d}}},K=class extends b{async provideInlayHints(e,t,i){const s=e.uri,r=s.toString(),n=e.getOffsetAt({lineNumber:t.startLineNumber,column:t.startColumn}),a=e.getOffsetAt({lineNumber:t.endLineNumber,column:t.endColumn}),o=await this._worker(s);return e.isDisposed()?null:{hints:(await o.provideInlayHints(r,n,a)).map((t=>({...t,label:t.text,position:e.getPositionAt(t.position),kind:this._convertHintKind(t.kind)}))),dispose:()=>{}}}_convertHintKind(e){return"Parameter"===e?u.languages.InlayHintKind.Parameter:u.languages.InlayHintKind.Type}};function R(e){T=W(e,"typescript")}function E(e){I=W(e,"javascript")}function H(){return new Promise(((e,t)=>{if(!I)return t("JavaScript not registered!");e(I)}))}function V(){return new Promise(((e,t)=>{if(!T)return t("TypeScript not registered!");e(T)}))}function W(e,t){const i=[],s=[],r=new g(t,e);i.push(r);const n=(...e)=>r.getLanguageServiceWorker(...e),a=new f(n);return function(){const{modeConfiguration:i}=e;j(s),i.completionItems&&s.push(u.languages.registerCompletionItemProvider(t,new y(n))),i.signatureHelp&&s.push(u.languages.registerSignatureHelpProvider(t,new S(n))),i.hovers&&s.push(u.languages.registerHoverProvider(t,new k(n))),i.documentHighlights&&s.push(u.languages.registerDocumentHighlightProvider(t,new x(n))),i.definitions&&s.push(u.languages.registerDefinitionProvider(t,new v(a,n))),i.references&&s.push(u.languages.registerReferenceProvider(t,new C(a,n))),i.documentSymbols&&s.push(u.languages.registerDocumentSymbolProvider(t,new D(n))),i.rename&&s.push(u.languages.registerRenameProvider(t,new M(a,n))),i.documentRangeFormattingEdits&&s.push(u.languages.registerDocumentRangeFormattingEditProvider(t,new P(n))),i.onTypeFormattingEdits&&s.push(u.languages.registerOnTypeFormattingEditProvider(t,new O(n))),i.codeActions&&s.push(u.languages.registerCodeActionProvider(t,new N(n))),i.inlayHints&&s.push(u.languages.registerInlayHintsProvider(t,new K(n))),i.diagnostics&&s.push(new _(a,e,t,n))}(),i.push(function(e){return{dispose:()=>j(e)}}(s)),n}function j(e){for(;e.length;)e.pop().dispose()}}}]);