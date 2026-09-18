/* escalade-card — artefact de build, ne pas éditer directement. Sources : frontend/src/ */
var Fe=Object.defineProperty;var Ke=Object.getOwnPropertyDescriptor;var T=(r,e,t,s)=>{for(var n=s>1?void 0:s?Ke(e,t):e,i=r.length-1,o;i>=0;i--)(o=r[i])&&(n=(s?o(e,t,n):o(n))||n);return s&&n&&Fe(e,t,n),n};var W=globalThis,F=W.ShadowRoot&&(W.ShadyCSS===void 0||W.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,se=Symbol(),fe=new WeakMap,P=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==se)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(F&&e===void 0){let s=t!==void 0&&t.length===1;s&&(e=fe.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&fe.set(t,e))}return e}toString(){return this.cssText}},me=r=>new P(typeof r=="string"?r:r+"",void 0,se),re=(r,...e)=>{let t=r.length===1?r[0]:e.reduce((s,n,i)=>s+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+r[i+1],r[0]);return new P(t,r,se)},ge=(r,e)=>{if(F)r.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let s=document.createElement("style"),n=W.litNonce;n!==void 0&&s.setAttribute("nonce",n),s.textContent=t.cssText,r.appendChild(s)}},ne=F?r=>r:r=>r instanceof CSSStyleSheet?(e=>{let t="";for(let s of e.cssRules)t+=s.cssText;return me(t)})(r):r;var{is:Ye,defineProperty:Ge,getOwnPropertyDescriptor:Je,getOwnPropertyNames:Xe,getOwnPropertySymbols:Ze,getPrototypeOf:Qe}=Object,b=globalThis,ye=b.trustedTypes,et=ye?ye.emptyScript:"",tt=b.reactiveElementPolyfillSupport,O=(r,e)=>r,U={toAttribute(r,e){switch(e){case Boolean:r=r?et:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,e){let t=r;switch(e){case Boolean:t=r!==null;break;case Number:t=r===null?null:Number(r);break;case Object:case Array:try{t=JSON.parse(r)}catch{t=null}}return t}},K=(r,e)=>!Ye(r,e),_e={attribute:!0,type:String,converter:U,reflect:!1,useDefault:!1,hasChanged:K};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),b.litPropertyMetadata??(b.litPropertyMetadata=new WeakMap);var _=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=_e){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let s=Symbol(),n=this.getPropertyDescriptor(e,s,t);n!==void 0&&Ge(this.prototype,e,n)}}static getPropertyDescriptor(e,t,s){let{get:n,set:i}=Je(this.prototype,e)??{get(){return this[t]},set(o){this[t]=o}};return{get:n,set(o){let l=n?.call(this);i?.call(this,o),this.requestUpdate(e,l,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??_e}static _$Ei(){if(this.hasOwnProperty(O("elementProperties")))return;let e=Qe(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(O("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(O("properties"))){let t=this.properties,s=[...Xe(t),...Ze(t)];for(let n of s)this.createProperty(n,t[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[s,n]of t)this.elementProperties.set(s,n)}this._$Eh=new Map;for(let[t,s]of this.elementProperties){let n=this._$Eu(t,s);n!==void 0&&this._$Eh.set(n,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let s=new Set(e.flat(1/0).reverse());for(let n of s)t.unshift(ne(n))}else e!==void 0&&t.push(ne(e));return t}static _$Eu(e,t){let s=t.attribute;return s===!1?void 0:typeof s=="string"?s:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ge(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){let s=this.constructor.elementProperties.get(e),n=this.constructor._$Eu(e,s);if(n!==void 0&&s.reflect===!0){let i=(s.converter?.toAttribute!==void 0?s.converter:U).toAttribute(t,s.type);this._$Em=e,i==null?this.removeAttribute(n):this.setAttribute(n,i),this._$Em=null}}_$AK(e,t){let s=this.constructor,n=s._$Eh.get(e);if(n!==void 0&&this._$Em!==n){let i=s.getPropertyOptions(n),o=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:U;this._$Em=n;let l=o.fromAttribute(t,i.type);this[n]=l??this._$Ej?.get(n)??l,this._$Em=null}}requestUpdate(e,t,s,n=!1,i){if(e!==void 0){let o=this.constructor;if(n===!1&&(i=this[e]),s??(s=o.getPropertyOptions(e)),!((s.hasChanged??K)(i,t)||s.useDefault&&s.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(o._$Eu(e,s))))return;this.C(e,t,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:n,wrapped:i},o){s&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,o??t??this[e]),i!==!0||o!==void 0)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),n===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[n,i]of this._$Ep)this[n]=i;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[n,i]of s){let{wrapped:o}=i,l=this[n];o!==!0||this._$AL.has(n)||l===void 0||this.C(n,void 0,i,l)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(t=>this._$ET(t,this[t]))),this._$EM()}updated(e){}firstUpdated(e){}};_.elementStyles=[],_.shadowRootOptions={mode:"open"},_[O("elementProperties")]=new Map,_[O("finalized")]=new Map,tt?.({ReactiveElement:_}),(b.reactiveElementVersions??(b.reactiveElementVersions=[])).push("2.1.2");var N=globalThis,ve=r=>r,Y=N.trustedTypes,$e=Y?Y.createPolicy("lit-html",{createHTML:r=>r}):void 0,we="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,Ce="?"+S,st=`<${Ce}>`,E=document,M=()=>E.createComment(""),D=r=>r===null||typeof r!="object"&&typeof r!="function",ue=Array.isArray,rt=r=>ue(r)||typeof r?.[Symbol.iterator]=="function",ie=`[ 	
\f\r]`,H=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,be=/-->/g,Se=/>/g,A=RegExp(`>|${ie}(?:([^\\s"'>=/]+)(${ie}*=${ie}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Ae=/'/g,xe=/"/g,Te=/^(?:script|style|textarea|title)$/i,he=r=>(e,...t)=>({_$litType$:r,strings:e,values:t}),f=he(1),wt=he(2),Ct=he(3),v=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),Ee=new WeakMap,x=E.createTreeWalker(E,129);function Re(r,e){if(!ue(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return $e!==void 0?$e.createHTML(e):e}var nt=(r,e)=>{let t=r.length-1,s=[],n,i=e===2?"<svg>":e===3?"<math>":"",o=H;for(let l=0;l<t;l++){let a=r[l],h,p,d=-1,y=0;for(;y<a.length&&(o.lastIndex=y,p=o.exec(a),p!==null);)y=o.lastIndex,o===H?p[1]==="!--"?o=be:p[1]!==void 0?o=Se:p[2]!==void 0?(Te.test(p[2])&&(n=RegExp("</"+p[2],"g")),o=A):p[3]!==void 0&&(o=A):o===A?p[0]===">"?(o=n??H,d=-1):p[1]===void 0?d=-2:(d=o.lastIndex-p[2].length,h=p[1],o=p[3]===void 0?A:p[3]==='"'?xe:Ae):o===xe||o===Ae?o=A:o===be||o===Se?o=H:(o=A,n=void 0);let $=o===A&&r[l+1].startsWith("/>")?" ":"";i+=o===H?a+st:d>=0?(s.push(h),a.slice(0,d)+we+a.slice(d)+S+$):a+S+(d===-2?l:$)}return[Re(r,i+(r[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),s]},j=class r{constructor({strings:e,_$litType$:t},s){let n;this.parts=[];let i=0,o=0,l=e.length-1,a=this.parts,[h,p]=nt(e,t);if(this.el=r.createElement(h,s),x.currentNode=this.el.content,t===2||t===3){let d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(n=x.nextNode())!==null&&a.length<l;){if(n.nodeType===1){if(n.hasAttributes())for(let d of n.getAttributeNames())if(d.endsWith(we)){let y=p[o++],$=n.getAttribute(d).split(S),V=/([.?@])?(.*)/.exec(y);a.push({type:1,index:i,name:V[2],strings:$,ctor:V[1]==="."?ae:V[1]==="?"?le:V[1]==="@"?ce:k}),n.removeAttribute(d)}else d.startsWith(S)&&(a.push({type:6,index:i}),n.removeAttribute(d));if(Te.test(n.tagName)){let d=n.textContent.split(S),y=d.length-1;if(y>0){n.textContent=Y?Y.emptyScript:"";for(let $=0;$<y;$++)n.append(d[$],M()),x.nextNode(),a.push({type:2,index:++i});n.append(d[y],M())}}}else if(n.nodeType===8)if(n.data===Ce)a.push({type:2,index:i});else{let d=-1;for(;(d=n.data.indexOf(S,d+1))!==-1;)a.push({type:7,index:i}),d+=S.length-1}i++}}static createElement(e,t){let s=E.createElement("template");return s.innerHTML=e,s}};function R(r,e,t=r,s){if(e===v)return e;let n=s!==void 0?t._$Co?.[s]:t._$Cl,i=D(e)?void 0:e._$litDirective$;return n?.constructor!==i&&(n?._$AO?.(!1),i===void 0?n=void 0:(n=new i(r),n._$AT(r,t,s)),s!==void 0?(t._$Co??(t._$Co=[]))[s]=n:t._$Cl=n),n!==void 0&&(e=R(r,n._$AS(r,e.values),n,s)),e}var oe=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:s}=this._$AD,n=(e?.creationScope??E).importNode(t,!0);x.currentNode=n;let i=x.nextNode(),o=0,l=0,a=s[0];for(;a!==void 0;){if(o===a.index){let h;a.type===2?h=new z(i,i.nextSibling,this,e):a.type===1?h=new a.ctor(i,a.name,a.strings,this,e):a.type===6&&(h=new de(i,this,e)),this._$AV.push(h),a=s[++l]}o!==a?.index&&(i=x.nextNode(),o++)}return x.currentNode=E,n}p(e){let t=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}},z=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,n){this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=R(this,e,t),D(e)?e===u||e==null||e===""?(this._$AH!==u&&this._$AR(),this._$AH=u):e!==this._$AH&&e!==v&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):rt(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==u&&D(this._$AH)?this._$AA.nextSibling.data=e:this.T(E.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:s}=e,n=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=j.createElement(Re(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===n)this._$AH.p(t);else{let i=new oe(n,this),o=i.u(this.options);i.p(t),this.T(o),this._$AH=i}}_$AC(e){let t=Ee.get(e.strings);return t===void 0&&Ee.set(e.strings,t=new j(e)),t}k(e){ue(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,s,n=0;for(let i of e)n===t.length?t.push(s=new r(this.O(M()),this.O(M()),this,this.options)):s=t[n],s._$AI(i),n++;n<t.length&&(this._$AR(s&&s._$AB.nextSibling,n),t.length=n)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let s=ve(e).nextSibling;ve(e).remove(),e=s}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},k=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,n,i){this.type=1,this._$AH=u,this._$AN=void 0,this.element=e,this.name=t,this._$AM=n,this.options=i,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=u}_$AI(e,t=this,s,n){let i=this.strings,o=!1;if(i===void 0)e=R(this,e,t,0),o=!D(e)||e!==this._$AH&&e!==v,o&&(this._$AH=e);else{let l=e,a,h;for(e=i[0],a=0;a<i.length-1;a++)h=R(this,l[s+a],t,a),h===v&&(h=this._$AH[a]),o||(o=!D(h)||h!==this._$AH[a]),h===u?e=u:e!==u&&(e+=(h??"")+i[a+1]),this._$AH[a]=h}o&&!n&&this.j(e)}j(e){e===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},ae=class extends k{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===u?void 0:e}},le=class extends k{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==u)}},ce=class extends k{constructor(e,t,s,n,i){super(e,t,s,n,i),this.type=5}_$AI(e,t=this){if((e=R(this,e,t,0)??u)===v)return;let s=this._$AH,n=e===u&&s!==u||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,i=e!==u&&(s===u||n);n&&this.element.removeEventListener(this.name,this,s),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},de=class{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){R(this,e)}};var it=N.litHtmlPolyfillSupport;it?.(j,z),(N.litHtmlVersions??(N.litHtmlVersions=[])).push("3.3.3");var ke=(r,e,t)=>{let s=t?.renderBefore??e,n=s._$litPart$;if(n===void 0){let i=t?.renderBefore??null;s._$litPart$=n=new z(e.insertBefore(M(),i),i,void 0,t??{})}return n._$AI(r),n};var I=globalThis,g=class extends _{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t;let e=super.createRenderRoot();return(t=this.renderOptions).renderBefore??(t.renderBefore=e.firstChild),e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=ke(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return v}};g._$litElement$=!0,g.finalized=!0,I.litElementHydrateSupport?.({LitElement:g});var ot=I.litElementPolyfillSupport;ot?.({LitElement:g});(I.litElementVersions??(I.litElementVersions=[])).push("4.2.2");var at={attribute:!0,type:String,converter:U,reflect:!1,hasChanged:K},lt=(r=at,e,t)=>{let{kind:s,metadata:n}=t,i=globalThis.litPropertyMetadata.get(n);if(i===void 0&&globalThis.litPropertyMetadata.set(n,i=new Map),s==="setter"&&((r=Object.create(r)).wrapped=!0),i.set(t.name,r),s==="accessor"){let{name:o}=t;return{set(l){let a=e.get.call(this);e.set.call(this,l),this.requestUpdate(o,a,r,!0,l)},init(l){return l!==void 0&&this.C(o,void 0,r,l),l}}}if(s==="setter"){let{name:o}=t;return function(l){let a=this[o];e.call(this,l),this.requestUpdate(o,a,r,!0,l)}}throw Error("Unsupported decorator location: "+s)};function L(r){return(e,t)=>typeof t=="object"?lt(r,e,t):((s,n,i)=>{let o=n.hasOwnProperty(i);return n.constructor.createProperty(i,s),o?Object.getOwnPropertyDescriptor(n,i):void 0})(r,e,t)}function G(r){return L({...r,state:!0,attribute:!1})}var q=["open","closed","unknown"],Le={ouvert:"open",ferme:"closed",ferm\u00E9:"closed",inconnu:"unknown"},X=[0,1,2,3,4,5,6],Pe=["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];function Z(r){return r.open===!0?"open":r.open===!1?"closed":"unknown"}function Oe(r){return r==="open"?{color:"#1b5e20",bg:"#c8e6c9"}:r==="closed"?{color:"#b71c1c",bg:"#ffcdd2"}:{color:"#37474f",bg:"#cfd8dc"}}function Ue(r){return r==="open"?"Ouvert":r==="closed"?"Ferm\xE9":"Statut inconnu"}function He(r){return typeof r!="number"||!Number.isFinite(r)?{type:"unknown",text:"date inconnue"}:r<0?{type:"unknown",text:"cr\xE9neau pass\xE9"}:r===0?{type:"today",text:"aujourd'hui"}:r===1?{type:"tomorrow",text:"demain"}:r<=7?{type:"soon",text:`dans ${r} jours`}:{type:"later",text:`dans ${r} jours`}}var ct="1.0.0";function Ne(){console.info(`%c ESCALADE-CARD %c ${ct} IS INSTALLED `,"color: white; background: #1565c0; font-weight: bold;","color: #1565c0; background: #bbdefb; font-weight: bold;")}function c(r,e,t,...s){let n=`%c ESCALADE-CARD %c [${e}]`,i=["color: white; background: #1565c0; font-weight: bold;","color: #1565c0; font-weight: bold;"];console[r](n+" "+t,...i,...s)}var Me=10,dt=2e3,ut=15e3,Q=class{constructor(e,t){this.cardName=e;this.fire=t;this.timer=null;this.count=0}schedule(){if(this.timer||(this.count++,this.count>Me))return;let e=Math.min(dt*this.count,ut);c("info",this.cardName,"Retry %d dans %dms\u2026",this.count,e),this.timer=setTimeout(()=>{this.timer=null,this.fire()},e)}get exhausted(){return this.count>Me}reset(){this.count=0,this.cancel()}cancel(){this.timer&&(clearTimeout(this.timer),this.timer=null)}};function m({title:r,message:e="Chargement\u2026"}){return f`
    <ha-card>
      <div class="escalade-header">
        <span class="escalade-title">${r}</span>
      </div>
      <div class="escalade-loader-box">
        <div class="escalade-loader"></div>
        <div class="escalade-loader-text">${e}</div>
      </div>
    </ha-card>
  `}var ht=720*60*1e3;function De(r){if(r.fetch_ok!==!1)return u;let e=r.last_success?new Date(r.last_success):null,t=e?.getTime();if(t!==void 0&&!Number.isNaN(t)&&Date.now()-t<ht)return u;let s=t===void 0||Number.isNaN(t)?"date inconnue":e.toLocaleString("fr-FR",{dateStyle:"short",timeStyle:"short"});return f`
    <div class="escalade-stale" role="status">
      <span>⚠</span>
      <span>Calendrier du club injoignable — créneaux relevés le ${s}</span>
    </div>
  `}function je({title:r,badgeText:e,highlight:t,onRefresh:s}){return f`
    <div class="escalade-header">
      <span class="escalade-title">${r}</span>
      <span class="escalade-header-right">
        <span class="escalade-count ${t?"highlight":""}">${e}</span>
        ${s?f`<button
              class="escalade-refresh"
              title="Relire le calendrier du club"
              @click=${s}
            >
              ⟳
            </button>`:u}
      </span>
    </div>
  `}var ze={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Ie=r=>(...e)=>({_$litDirective$:r,values:e}),ee=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,s){this._$Ct=e,this._$AM=t,this._$Ci=s}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};var qe="important",pt=" !"+qe,pe=Ie(class extends ee{constructor(r){if(super(r),r.type!==ze.ATTRIBUTE||r.name!=="style"||r.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(r){return Object.keys(r).reduce((e,t)=>{let s=r[t];return s==null?e:e+`${t=t.includes("-")?t:t.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`},"")}update(r,[e]){let{style:t}=r.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(e)),this.render(e);for(let s of this.ft)e[s]==null&&(this.ft.delete(s),s.includes("-")?t.removeProperty(s):t[s]=null);for(let s in e){let n=e[s];if(n!=null){this.ft.add(s);let i=typeof n=="string"&&n.endsWith(pt);s.includes("-")||i?t.setProperty(s,i?n.slice(0,-11):n,i?qe:""):t[s]=n}}return v}});function Be({slot:r}){let e=Z(r),t=Oe(e),s=He(r.days_left);return f`
    <div class="escalade-row escalade-row-${e}">
      <span
        class="escalade-dot"
        style=${pe({background:t.color})}
        aria-hidden="true"
      ></span>
      <div class="escalade-row-main">
        <div class="escalade-row-day">
          <span class="escalade-day">${r.jour}</span>
          <span class="escalade-date">${r.date_display}</span>
        </div>
        ${r.horaire?f`<div class="escalade-hours">${r.horaire}</div>`:u}
      </div>
      <div class="escalade-row-right">
        <span
          class="escalade-status"
          style=${pe({color:t.color,background:t.bg})}
          >${Ue(e)}</span
        >
        <span class="escalade-delay escalade-delay-${s.type}">${s.text}</span>
      </div>
    </div>
  `}var Ve=re`
  :host {
    display: block;
  }
  .escalade-header {
    padding: 16px 16px 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .escalade-title {
    font-size: 1.1em;
    font-weight: 500;
    color: var(--primary-text-color);
  }
  .escalade-header-right {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }
  .escalade-count {
    border-radius: 12px;
    padding: 2px 10px;
    font-size: 0.85em;
    font-weight: 600;
    color: var(--text-primary-color, #fff);
    background: var(--primary-color);
    white-space: nowrap;
  }
  .escalade-count.highlight {
    background: #2e7d32;
    color: #fff;
  }
  .escalade-refresh {
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    background: var(--secondary-background-color, #f0f0f0);
    color: var(--secondary-text-color);
    border-radius: 50%;
    width: 28px;
    height: 28px;
    padding: 0;
    font-size: 1em;
    line-height: 1;
    cursor: pointer;
  }
  .escalade-stale {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 16px 8px;
    padding: 8px 10px;
    border-radius: 8px;
    background: #fff3e0;
    color: #e65100;
    font-size: 0.82em;
  }
  .escalade-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
  }
  .escalade-row:last-child {
    border-bottom: none;
  }
  .escalade-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .escalade-row-main {
    flex: 1;
    min-width: 0;
  }
  .escalade-row-day {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  .escalade-day {
    font-size: 0.95em;
    font-weight: 500;
    color: var(--primary-text-color);
  }
  .escalade-date {
    font-size: 0.82em;
    color: var(--secondary-text-color);
  }
  .escalade-hours {
    font-size: 0.78em;
    color: var(--secondary-text-color);
    margin-top: 2px;
  }
  .escalade-row-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 3px;
    flex-shrink: 0;
  }
  .escalade-status {
    border-radius: 10px;
    padding: 2px 8px;
    font-size: 0.75em;
    font-weight: 600;
    white-space: nowrap;
  }
  .escalade-delay {
    font-size: 0.72em;
    color: var(--secondary-text-color);
    white-space: nowrap;
  }
  /* Seuls « aujourd'hui » et « demain » sont mis en avant : tout souligner ne
     hiérarchise plus rien. */
  .escalade-delay-today {
    color: #d84315;
    font-weight: 700;
  }
  .escalade-delay-tomorrow {
    color: #ef6c00;
    font-weight: 600;
  }
  .escalade-empty {
    padding: 24px 16px;
    text-align: center;
    color: var(--secondary-text-color);
    font-size: 0.9em;
  }
  .escalade-loader-box {
    padding: 32px 16px;
    text-align: center;
  }
  .escalade-loader-text {
    margin-top: 12px;
    color: var(--secondary-text-color);
    font-size: 0.9em;
  }
  .escalade-loader {
    width: 28px;
    height: 28px;
    margin: 0 auto;
    border: 3px solid var(--divider-color, #e0e0e0);
    border-top-color: var(--primary-color, #1565c0);
    border-radius: 50%;
    animation: escalade-spin 0.9s linear infinite;
  }
  @keyframes escalade-spin {
    to {
      transform: rotate(360deg);
    }
  }
  /* Respecte le réglage système : une animation perpétuelle dans une carte de
     tableau de bord est exactement ce que ce réglage vise. */
  @media (prefers-reduced-motion: reduce) {
    .escalade-loader {
      animation: none;
    }
  }
`;var ft={open:"Cr\xE9neaux ouverts",closed:"Cr\xE9neaux ferm\xE9s",unknown:"Statut non reconnu"},mt={entity:"Entit\xE9 (sensor)",title:"Titre personnalis\xE9",days:"Jours affich\xE9s",statuses:"Statuts affich\xE9s",max:"Nombre maximal de cr\xE9neaux"},gt=[{name:"entity",required:!0,selector:{entity:{domain:"sensor",integration:"escalade_veauche"}}},{name:"title",selector:{text:{}}},{name:"days",selector:{select:{multiple:!0,mode:"list",options:X.map(r=>({value:String(r),label:Pe[r]??String(r)}))}}},{name:"statuses",selector:{select:{multiple:!0,options:q.map(r=>({value:r,label:ft[r]??r}))}}},{name:"max",selector:{number:{min:1,max:60,mode:"box"}}}],yt=r=>mt[r.name]??r.name,B=class extends g{constructor(){super(...arguments);this._config={entity:""}}setConfig(t){this._config=t??{entity:""}}createRenderRoot(){return this}render(){if(!this.hass)return f``;let t={...this._config,days:this._config.days?.map(String)};return f`
      <ha-form
        .hass=${this.hass}
        .data=${t}
        .schema=${gt}
        .computeLabel=${yt}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `}_valueChanged(t){let s={...t.detail.value};for(let n of Object.keys(s)){if(n==="entity"){typeof s[n]!="string"&&(s[n]="");continue}n==="days"&&Array.isArray(s[n])&&(s[n]=s[n].map(Number).filter(o=>Number.isInteger(o)));let i=s[n];(i===""||i===void 0||i===null)&&delete s[n],Array.isArray(i)&&i.length===0&&delete s[n]}this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:s},bubbles:!0,composed:!0}))}};T([L({attribute:!1})],B.prototype,"hass",2),T([G()],B.prototype,"_config",2);customElements.get("escalade-card-editor")||customElements.define("escalade-card-editor",B);var w=class w extends g{constructor(){super(...arguments);this._id=++w._instances;this._retry=new Q("card",()=>this.requestUpdate());this._hasRendered=!1;this._firstUpdateLogged=!1;this._refresh=()=>{this._hass&&this._hass.callService("escalade_veauche","refresh",{}).catch(t=>{c("warn","card","le rafra\xEEchissement a \xE9chou\xE9 : %o",t)})}}set hass(t){this._hass=t,this._syncEntityState()}get hass(){return this._hass}setConfig(t){if(!t||typeof t!="object")throw c("error","card","setConfig rejet\xE9, config non-objet : %o",t),new Error("Configuration manquante ou invalide");let s="";typeof t.entity=="string"?s=t.entity:t.entity!==void 0&&t.entity!==null&&c("error","card","'entity' doit \xEAtre une cha\xEEne, re\xE7u %o \u2014 carte en attente de configuration",t.entity);let n=this._normalizeStatuses(t.statuses),i=this._normalizeDays(t.days),o;if(t.max!==void 0){let a=Number(t.max);!Number.isInteger(a)||a<1?c("warn","card","'max' doit \xEAtre un entier positif, ignor\xE9 (re\xE7u : %o)",t.max):o=a}c("info","card","#%d setConfig accept\xE9 (entity=%s, jours=%s, statuts=%s) \xE0 t=%dms",this._id,s||"(vide)",i?i.join(","):"tous",n?n.join(","):"tous",Math.round(performance.now()));let l=this._config;this._config={...t,entity:s,days:i,statuses:n,max:o},l?.entity!==this._config.entity&&(this._hasRendered=!1,this._lastTemplate=void 0,this._renderedEntityState=void 0,this._retry.reset()),this._syncEntityState()}_normalizeStatuses(t){if(t===void 0)return;if(!Array.isArray(t)){c("warn","card","'statuses' doit \xEAtre une liste, ignor\xE9 (re\xE7u : %o)",t);return}let s=[],n=[];for(let i of t){let o=Le[String(i)]??i;q.includes(o)?s.includes(o)||s.push(o):n.push(i)}if(n.length&&c("warn","card","Statuts inconnus ignor\xE9s : %s. Valides : %s",n.join(", "),q.join(", ")),s.length===0){c("warn","card","Filtre de statuts vide, filtre ignor\xE9");return}return s}_normalizeDays(t){if(t===void 0)return;if(!Array.isArray(t)){c("warn","card","'days' doit \xEAtre une liste, ignor\xE9 (re\xE7u : %o)",t);return}let s=[],n=[];for(let i of t){let o=Number(i);Number.isInteger(o)&&X.includes(o)?s.includes(o)||s.push(o):n.push(i)}if(n.length&&c("warn","card","Jours inconnus ignor\xE9s : %s. Attendu : 0 (lundi) \xE0 6 (dimanche)",n.join(", ")),s.length===0){c("warn","card","Filtre de jours vide, filtre ignor\xE9");return}return s.sort((i,o)=>i-o),s}_syncEntityState(){let t=this._hass?.states;if(!t||!this._config?.entity){this._entityState=void 0;return}this._entityState=t[this._config.entity]}static getStubConfig(t,s,n){let i=t?.states??{},o=[...s??[],...n??[],...Object.keys(i)].filter(a=>a.startsWith("sensor."));return{entity:o.find(a=>i[a]?.attributes?.creneaux)??o.find(a=>a.includes("escalade"))??""}}static getConfigElement(){return document.createElement("escalade-card-editor")}getCardSize(){return 4}getGridOptions(){return{columns:12,min_columns:6,rows:4,min_rows:2}}connectedCallback(){super.connectedCallback(),this._retry.reset(),customElements.get("ha-card")||customElements.whenDefined("ha-card").then(()=>{c("info","card","ha-card d\xE9fini apr\xE8s le premier rendu, re-rendu"),this.requestUpdate()})}disconnectedCallback(){super.disconnectedCallback(),this._retry.cancel()}updated(){this._firstUpdateLogged||(this._firstUpdateLogged=!0,c("info","card","#%d premier rendu effectu\xE9 \xE0 t=%dms (donn\xE9es=%s)",this._id,Math.round(performance.now()),this._hasRendered?"oui":"non, loader")),this._renderedEntityState=this._entityState,this._hasRendered&&this.dispatchEvent(new CustomEvent("escalade-card-update",{bubbles:!0,composed:!0}))}shouldUpdate(t){return t.has("_config")||!this._hasRendered?!0:t.has("hass")?this._entityState!==this._renderedEntityState:!0}render(){try{return this._render()}catch(t){return c("error","card","render() a lev\xE9, repli sur le loader : %o",t),this._retry.schedule(),m({title:"Escalade Veauche",message:"Erreur \u2014 voir console"})}}_render(){let t=this._config?.title??"Cr\xE9neaux escalade";if(!this._config)return m({title:t,message:"En attente de configuration\u2026"});if(!this._hass)return m({title:t,message:"Connexion \xE0 Home Assistant\u2026"});let s=this._config.entity;if(!s)return m({title:t,message:"S\xE9lectionnez une entit\xE9"});let n=this._hass.states;if(!n)return c("warn","card","hass.states absent, rendu du loader"),this._retry.schedule(),this._retry.exhausted?m({title:t,message:"Donn\xE9es Home Assistant indisponibles"}):this._lastTemplate??m({title:t,message:"En attente de Home Assistant\u2026"});let i=n[s];if(!i||i.state==="unavailable"||i.state==="unknown"){let a=i?`state=${i.state}`:"entit\xE9 introuvable";return c("warn","card","%s \u2014 %s %s",s,a,this._hasRendered?"(dernier rendu conserv\xE9)":"(loader)"),this._retry.schedule(),this._hasRendered&&!this._retry.exhausted?this._lastTemplate??m({title:t}):this._hasRendered?m({title:t,message:`${s} indisponible`}):(this._lastTemplate=m({title:t,message:this._retry.exhausted?`Donn\xE9es indisponibles pour ${s}`:"En attente des donn\xE9es\u2026"}),this._lastTemplate)}if(!("creneaux"in(i.attributes??{})))return c("error","card","%s ne porte pas \xAB creneaux \xBB : ce n'est pas un capteur de cette int\xE9gration",s),m({title:t,message:`${s} n'est pas un capteur Escalade`});this._retry.reset();let l=this._renderCalendar(i,t);return this._lastTemplate=l,this._hasRendered=!0,l}_visibleSlots(t){let s=this._config?.days,n=this._config?.statuses,i=t;s&&(i=i.filter(l=>s.includes(l.weekday))),n&&(i=i.filter(l=>n.includes(Z(l))));let o=this._config?.max;return o!==void 0?i.slice(0,o):i}_renderCalendar(t,s){let n=t.attributes??{},i=Array.isArray(n.creneaux)?n.creneaux:[],o=this._visibleSlots(i),l=!!this._config?.days||!!this._config?.statuses,a=`${o.length}`;return f`
      <ha-card>
        ${je({title:s,badgeText:a,highlight:l&&o.length>0,onRefresh:this._refresh})}
        ${De(n)}
        ${o.length===0?f`<div class="escalade-empty">
              ${i.length===0?"Aucun cr\xE9neau annonc\xE9 par le club":"Aucun cr\xE9neau ne correspond au filtre de cette carte"}
            </div>`:o.map(h=>Be({slot:h}))}
      </ha-card>
    `}};w.styles=[Ve],w._instances=0,T([L({attribute:!1})],w.prototype,"hass",1),T([G()],w.prototype,"_config",2);var te=w;Ne();window.loadCardHelpers?.().catch(r=>{c("warn","card","loadCardHelpers() a \xE9chou\xE9 : %o",r)});var C="escalade-card",_t=5,We=0;function vt(){if(customElements.get(C)||We>=_t)return!1;We++;try{return customElements.define(C,class extends te{}),c("warn","card","r\xE9-enregistr\xE9 \xE0 t=%dms : le registre d'\xE9l\xE9ments personnalis\xE9s avait \xE9t\xE9 remplac\xE9 depuis le premier enregistrement",Math.round(performance.now())),!0}catch(r){return c("error","card","r\xE9-enregistrement impossible : %o",r),!1}}customElements.get(C)?c("info","card","module d\xE9j\xE0 enregistr\xE9, ce chargement est ignor\xE9"):(customElements.define(C,te),c("info","card","\xE9l\xE9ment enregistr\xE9 \xE0 t=%dms apr\xE8s le d\xE9but du chargement de la page",Math.round(performance.now())));function $t(){let r=0,e=t=>{if(t.localName==="hui-error-card"){let s=t;((s._config??s.config)?.message??"").includes(C)&&(t.dispatchEvent(new CustomEvent("ll-rebuild",{bubbles:!0,composed:!0})),r++);return}for(let s of[...t.shadowRoot?.children??[],...t.children])e(s)};return document.body&&e(document.body),r}for(let r of[0,50,150,400,1e3,2e3,4e3])window.setTimeout(()=>{try{vt();let e=$t();e>0&&c("warn","card","%d carte(s) d'erreur reconstruite(s) apr\xE8s %dms \u2014 la vue a \xE9t\xE9 b\xE2tie avant l'enregistrement de l'\xE9l\xE9ment",e,r)}catch(e){c("error","card","r\xE9paration des cartes d'erreur impossible : %o",e)}},r);window.customCards=window.customCards??[];window.customCards.some(r=>r.type===C)||window.customCards.push({type:C,name:"Escalade Veauche",description:"Affiche les cr\xE9neaux d'ouverture des Cimes Veauchoises"});export{te as EscaladeCard};
