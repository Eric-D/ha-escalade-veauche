/* escalade-card — artefact de build, ne pas éditer directement. Sources : frontend/src/ */
var at=Object.defineProperty;var lt=Object.getOwnPropertyDescriptor;var T=(n,t,e,s)=>{for(var r=s>1?void 0:s?lt(t,e):t,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(t,e,r):o(r))||r);return s&&r&&at(t,e,r),r};var W=globalThis,K=W.ShadowRoot&&(W.ShadyCSS===void 0||W.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,re=Symbol(),ve=new WeakMap,O=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==re)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(K&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=ve.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&ve.set(e,t))}return t}toString(){return this.cssText}},xe=n=>new O(typeof n=="string"?n:n+"",void 0,re),N=(n,...t)=>{let e=n.length===1?n[0]:t.reduce((s,r,i)=>s+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+n[i+1],n[0]);return new O(e,n,re)},$e=(n,t)=>{if(K)n.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),r=W.litNonce;r!==void 0&&s.setAttribute("nonce",r),s.textContent=e.cssText,n.appendChild(s)}},ie=K?n=>n:n=>n instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return xe(e)})(n):n;var{is:ct,defineProperty:dt,getOwnPropertyDescriptor:ut,getOwnPropertyNames:pt,getOwnPropertySymbols:ht,getPrototypeOf:mt}=Object,x=globalThis,Se=x.trustedTypes,ft=Se?Se.emptyScript:"",gt=x.reactiveElementPolyfillSupport,D=(n,t)=>n,U={toAttribute(n,t){switch(t){case Boolean:n=n?ft:null;break;case Object:case Array:n=n==null?n:JSON.stringify(n)}return n},fromAttribute(n,t){let e=n;switch(t){case Boolean:e=n!==null;break;case Number:e=n===null?null:Number(n);break;case Object:case Array:try{e=JSON.parse(n)}catch{e=null}}return e}},Y=(n,t)=>!ct(n,t),we={attribute:!0,type:String,converter:U,reflect:!1,useDefault:!1,hasChanged:Y};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),x.litPropertyMetadata??(x.litPropertyMetadata=new WeakMap);var b=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=we){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),r=this.getPropertyDescriptor(t,s,e);r!==void 0&&dt(this.prototype,t,r)}}static getPropertyDescriptor(t,e,s){let{get:r,set:i}=ut(this.prototype,t)??{get(){return this[e]},set(o){this[e]=o}};return{get:r,set(o){let a=r?.call(this);i?.call(this,o),this.requestUpdate(t,a,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??we}static _$Ei(){if(this.hasOwnProperty(D("elementProperties")))return;let t=mt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(D("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(D("properties"))){let e=this.properties,s=[...pt(e),...ht(e)];for(let r of s)this.createProperty(r,e[r])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,r]of e)this.elementProperties.set(s,r)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let r=this._$Eu(e,s);r!==void 0&&this._$Eh.set(r,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let r of s)e.unshift(ie(r))}else t!==void 0&&e.push(ie(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return $e(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),r=this.constructor._$Eu(t,s);if(r!==void 0&&s.reflect===!0){let i=(s.converter?.toAttribute!==void 0?s.converter:U).toAttribute(e,s.type);this._$Em=t,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(t,e){let s=this.constructor,r=s._$Eh.get(t);if(r!==void 0&&this._$Em!==r){let i=s.getPropertyOptions(r),o=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:U;this._$Em=r;let a=o.fromAttribute(e,i.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(t,e,s,r=!1,i){if(t!==void 0){let o=this.constructor;if(r===!1&&(i=this[t]),s??(s=o.getPropertyOptions(t)),!((s.hasChanged??Y)(i,e)||s.useDefault&&s.reflect&&i===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:r,wrapped:i},o){s&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,o??e??this[t]),i!==!0||o!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),r===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[r,i]of this._$Ep)this[r]=i;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[r,i]of s){let{wrapped:o}=i,a=this[r];o!==!0||this._$AL.has(r)||a===void 0||this.C(r,void 0,i,a)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(e=>this._$ET(e,this[e]))),this._$EM()}updated(t){}firstUpdated(t){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[D("elementProperties")]=new Map,b[D("finalized")]=new Map,gt?.({ReactiveElement:b}),(x.reactiveElementVersions??(x.reactiveElementVersions=[])).push("2.1.2");var P=globalThis,Ae=n=>n,G=P.trustedTypes,Ee=G?G.createPolicy("lit-html",{createHTML:n=>n}):void 0,Le="$lit$",$=`lit$${Math.random().toFixed(9).slice(2)}$`,Oe="?"+$,yt=`<${Oe}>`,A=document,j=()=>A.createComment(""),z=n=>n===null||typeof n!="object"&&typeof n!="function",pe=Array.isArray,_t=n=>pe(n)||typeof n?.[Symbol.iterator]=="function",oe=`[ 	
\f\r]`,H=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ce=/-->/g,Te=/>/g,S=RegExp(`>|${oe}(?:([^\\s"'>=/]+)(${oe}*=${oe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ke=/'/g,Re=/"/g,Ne=/^(?:script|style|textarea|title)$/i,he=n=>(t,...e)=>({_$litType$:n,strings:t,values:e}),h=he(1),Xt=he(2),Zt=he(3),g=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),Me=new WeakMap,w=A.createTreeWalker(A,129);function De(n,t){if(!pe(n)||!n.hasOwnProperty("raw"))throw Error("invalid template strings array");return Ee!==void 0?Ee.createHTML(t):t}var bt=(n,t)=>{let e=n.length-1,s=[],r,i=t===2?"<svg>":t===3?"<math>":"",o=H;for(let a=0;a<e;a++){let l=n[a],u,m,p=-1,f=0;for(;f<l.length&&(o.lastIndex=f,m=o.exec(l),m!==null);)f=o.lastIndex,o===H?m[1]==="!--"?o=Ce:m[1]!==void 0?o=Te:m[2]!==void 0?(Ne.test(m[2])&&(r=RegExp("</"+m[2],"g")),o=S):m[3]!==void 0&&(o=S):o===S?m[0]===">"?(o=r??H,p=-1):m[1]===void 0?p=-2:(p=o.lastIndex-m[2].length,u=m[1],o=m[3]===void 0?S:m[3]==='"'?Re:ke):o===Re||o===ke?o=S:o===Ce||o===Te?o=H:(o=S,r=void 0);let y=o===S&&n[a+1].startsWith("/>")?" ":"";i+=o===H?l+yt:p>=0?(s.push(u),l.slice(0,p)+Le+l.slice(p)+$+y):l+$+(p===-2?a:y)}return[De(n,i+(n[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},I=class n{constructor({strings:t,_$litType$:e},s){let r;this.parts=[];let i=0,o=0,a=t.length-1,l=this.parts,[u,m]=bt(t,e);if(this.el=n.createElement(u,s),w.currentNode=this.el.content,e===2||e===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(r=w.nextNode())!==null&&l.length<a;){if(r.nodeType===1){if(r.hasAttributes())for(let p of r.getAttributeNames())if(p.endsWith(Le)){let f=m[o++],y=r.getAttribute(p).split($),v=/([.?@])?(.*)/.exec(f);l.push({type:1,index:i,name:v[2],strings:y,ctor:v[1]==="."?le:v[1]==="?"?ce:v[1]==="@"?de:R}),r.removeAttribute(p)}else p.startsWith($)&&(l.push({type:6,index:i}),r.removeAttribute(p));if(Ne.test(r.tagName)){let p=r.textContent.split($),f=p.length-1;if(f>0){r.textContent=G?G.emptyScript:"";for(let y=0;y<f;y++)r.append(p[y],j()),w.nextNode(),l.push({type:2,index:++i});r.append(p[f],j())}}}else if(r.nodeType===8)if(r.data===Oe)l.push({type:2,index:i});else{let p=-1;for(;(p=r.data.indexOf($,p+1))!==-1;)l.push({type:7,index:i}),p+=$.length-1}i++}}static createElement(t,e){let s=A.createElement("template");return s.innerHTML=t,s}};function k(n,t,e=n,s){if(t===g)return t;let r=s!==void 0?e._$Co?.[s]:e._$Cl,i=z(t)?void 0:t._$litDirective$;return r?.constructor!==i&&(r?._$AO?.(!1),i===void 0?r=void 0:(r=new i(n),r._$AT(n,e,s)),s!==void 0?(e._$Co??(e._$Co=[]))[s]=r:e._$Cl=r),r!==void 0&&(t=k(n,r._$AS(n,t.values),r,s)),t}var ae=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,r=(t?.creationScope??A).importNode(e,!0);w.currentNode=r;let i=w.nextNode(),o=0,a=0,l=s[0];for(;l!==void 0;){if(o===l.index){let u;l.type===2?u=new q(i,i.nextSibling,this,t):l.type===1?u=new l.ctor(i,l.name,l.strings,this,t):l.type===6&&(u=new ue(i,this,t)),this._$AV.push(u),l=s[++a]}o!==l?.index&&(i=w.nextNode(),o++)}return w.currentNode=A,r}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},q=class n{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,r){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=k(this,t,e),z(t)?t===d||t==null||t===""?(this._$AH!==d&&this._$AR(),this._$AH=d):t!==this._$AH&&t!==g&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):_t(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==d&&z(this._$AH)?this._$AA.nextSibling.data=t:this.T(A.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,r=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=I.createElement(De(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===r)this._$AH.p(e);else{let i=new ae(r,this),o=i.u(this.options);i.p(e),this.T(o),this._$AH=i}}_$AC(t){let e=Me.get(t.strings);return e===void 0&&Me.set(t.strings,e=new I(t)),e}k(t){pe(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,r=0;for(let i of t)r===e.length?e.push(s=new n(this.O(j()),this.O(j()),this,this.options)):s=e[r],s._$AI(i),r++;r<e.length&&(this._$AR(s&&s._$AB.nextSibling,r),e.length=r)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=Ae(t).nextSibling;Ae(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},R=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,r,i){this.type=1,this._$AH=d,this._$AN=void 0,this.element=t,this.name=e,this._$AM=r,this.options=i,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=d}_$AI(t,e=this,s,r){let i=this.strings,o=!1;if(i===void 0)t=k(this,t,e,0),o=!z(t)||t!==this._$AH&&t!==g,o&&(this._$AH=t);else{let a=t,l,u;for(t=i[0],l=0;l<i.length-1;l++)u=k(this,a[s+l],e,l),u===g&&(u=this._$AH[l]),o||(o=!z(u)||u!==this._$AH[l]),u===d?t=d:t!==d&&(t+=(u??"")+i[l+1]),this._$AH[l]=u}o&&!r&&this.j(t)}j(t){t===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},le=class extends R{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===d?void 0:t}},ce=class extends R{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==d)}},de=class extends R{constructor(t,e,s,r,i){super(t,e,s,r,i),this.type=5}_$AI(t,e=this){if((t=k(this,t,e,0)??d)===g)return;let s=this._$AH,r=t===d&&s!==d||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,i=t!==d&&(s===d||r);r&&this.element.removeEventListener(this.name,this,s),i&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},ue=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){k(this,t)}};var vt=P.litHtmlPolyfillSupport;vt?.(I,q),(P.litHtmlVersions??(P.litHtmlVersions=[])).push("3.3.3");var Ue=(n,t,e)=>{let s=e?.renderBefore??t,r=s._$litPart$;if(r===void 0){let i=e?.renderBefore??null;s._$litPart$=r=new q(t.insertBefore(j(),i),i,void 0,e??{})}return r._$AI(n),r};var B=globalThis,_=class extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e;let t=super.createRenderRoot();return(e=this.renderOptions).renderBefore??(e.renderBefore=t.firstChild),t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Ue(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return g}};_._$litElement$=!0,_.finalized=!0,B.litElementHydrateSupport?.({LitElement:_});var xt=B.litElementPolyfillSupport;xt?.({LitElement:_});(B.litElementVersions??(B.litElementVersions=[])).push("4.2.2");var $t={attribute:!0,type:String,converter:U,reflect:!1,hasChanged:Y},St=(n=$t,t,e)=>{let{kind:s,metadata:r}=e,i=globalThis.litPropertyMetadata.get(r);if(i===void 0&&globalThis.litPropertyMetadata.set(r,i=new Map),s==="setter"&&((n=Object.create(n)).wrapped=!0),i.set(e.name,n),s==="accessor"){let{name:o}=e;return{set(a){let l=t.get.call(this);t.set.call(this,a),this.requestUpdate(o,l,n,!0,a)},init(a){return a!==void 0&&this.C(o,void 0,n,a),a}}}if(s==="setter"){let{name:o}=e;return function(a){let l=this[o];t.call(this,a),this.requestUpdate(o,l,n,!0,a)}}throw Error("Unsupported decorator location: "+s)};function M(n){return(t,e)=>typeof e=="object"?St(n,t,e):((s,r,i)=>{let o=r.hasOwnProperty(i);return r.constructor.createProperty(i,s),o?Object.getOwnPropertyDescriptor(r,i):void 0})(n,t,e)}function J(n){return M({...n,state:!0,attribute:!1})}var F=["open","closed","unknown"],He={ouvert:"open",ferme:"closed",ferm\u00E9:"closed",inconnu:"unknown"},Z=[0,1,2,3,4,5,6],Pe=["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"],me=["list","tiles"],je={liste:"list",tuiles:"tiles"};var wt={open:"var(--success-color)",closed:"var(--error-color)",unknown:"var(--primary-color)"};function ze(n){if(n==null||n==="")return;if(Array.isArray(n)){if(n.length!==3)return;let e=n.map(Number);return e.some(s=>!Number.isInteger(s)||s<0||s>255)?void 0:`rgb(${e[0]}, ${e[1]}, ${e[2]})`}if(typeof n!="string")return;let t=n.trim();if(!(t===""||t.length>120||/[;{}<>]/.test(t)))return t}function Ie(n,t){return(n==="open"?t.open:n==="closed"?t.closed:void 0)??wt[n]}function Q(n){return n.open===!0?"open":n.open===!1?"closed":"unknown"}function qe(n){return n==="open"?{color:"#1b5e20",bg:"#c8e6c9"}:n==="closed"?{color:"#b71c1c",bg:"#ffcdd2"}:{color:"#37474f",bg:"#cfd8dc"}}function Be(n){return n==="open"?"Ouvert":n==="closed"?"Ferm\xE9":"Statut inconnu"}function Fe(n){return typeof n!="number"||!Number.isFinite(n)?{type:"unknown",text:"date inconnue"}:n<0?{type:"unknown",text:"cr\xE9neau pass\xE9"}:n===0?{type:"today",text:"aujourd'hui"}:n===1?{type:"tomorrow",text:"demain"}:n<=7?{type:"soon",text:`dans ${n} jours`}:{type:"later",text:`dans ${n} jours`}}var At="0.3.0";function Ve(){console.info(`%c ESCALADE-CARD %c ${At} IS INSTALLED `,"color: white; background: #1565c0; font-weight: bold;","color: #1565c0; background: #bbdefb; font-weight: bold;")}function c(n,t,e,...s){let r=`%c ESCALADE-CARD %c [${t}]`,i=["color: white; background: #1565c0; font-weight: bold;","color: #1565c0; font-weight: bold;"];console[n](r+" "+e,...i,...s)}var We=10,Et=2e3,Ct=15e3,ee=class{constructor(t,e){this.cardName=t;this.fire=e;this.timer=null;this.count=0}schedule(){if(this.timer||(this.count++,this.count>We))return;let t=Math.min(Et*this.count,Ct);c("info",this.cardName,"Retry %d dans %dms\u2026",this.count,t),this.timer=setTimeout(()=>{this.timer=null,this.fire()},t)}get exhausted(){return this.count>We}reset(){this.count=0,this.cancel()}cancel(){this.timer&&(clearTimeout(this.timer),this.timer=null)}};var Ke=["lun.","mar.","mer.","jeu.","ven.","sam.","dim."],Tt=["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"],Ye=["janv.","f\xE9vr.","mars","avr.","mai","juin","juil.","ao\xFBt","sept.","oct.","nov.","d\xE9c."],kt=["janvier","f\xE9vrier","mars","avril","mai","juin","juillet","ao\xFBt","septembre","octobre","novembre","d\xE9cembre"],Rt=/(\d{1,2})\s*h\s*(\d{2})?\s*[-–—]\s*(\d{1,2})\s*h\s*(\d{2})?/;function Mt(n){if(typeof n!="string")return null;let t=Rt.exec(n);if(!t)return null;let e=Number(t[1]),s=Number(t[2]??"0"),r=Number(t[3]),i=Number(t[4]??"0");if(e>23||r>23||s>59||i>59)return null;let o=e*60+s,a=r*60+i;return a<=o?null:{start:o,end:a}}function ge(n){if(!n)return null;let t=e=>{let s=Math.floor(e/60),r=e%60;return r===0?`${s}h`:`${s}h${String(r).padStart(2,"0")}`};return`${t(n.start)} \u2013 ${t(n.end)}`}function fe(n,t=0){let e=/^(\d{4})-(\d{2})-(\d{2})$/.exec(n);if(!e)return null;let s=new Date(Number(e[1]),Number(e[2])-1,Number(e[3]),Math.floor(t/60),t%60,0,0);return Number.isNaN(s.getTime())?null:s}function Lt(n,t){let e=new Date(n.getFullYear(),n.getMonth(),n.getDate(),12),s=new Date(t.getFullYear(),t.getMonth(),t.getDate(),12);return Math.round((s.getTime()-e.getTime())/864e5)}function Ge(n){return n.isNow?"en cours":n.daysUntil===null?"":n.daysUntil===0?"aujourd'hui":n.daysUntil===1?"demain":`dans ${n.daysUntil} j`}function Ot(n,t){if(typeof n.date!="string")return null;let e=fe(n.date);if(!e)return null;let s=Mt(n.horaire),r=s?fe(n.date,s.start):e,i=s?fe(n.date,s.end):null;if(!r)return null;let o=Lt(t,e);return{date:n.date,weekday:n.weekday,dayOfMonth:e.getDate(),month:e.getMonth(),start:r,end:i,range:s,status:n.open===!0?"open":n.open===!1?"closed":"unknown",statut:n.statut,daysUntil:o,isToday:o===0,isNow:i!==null&&r<=t&&t<i}}function Je(n,t,e){let s=[];for(let r of n){let i=Ot(r,t);if(i){if(i.end!==null){if(i.end<=t)continue}else if(i.daysUntil!==null&&i.daysUntil<0)continue;s.push(i)}}return s.sort((r,i)=>r.start.getTime()-i.start.getTime()),s.slice(0,Math.max(0,e))}function Xe(n){let t=Tt[n.weekday]??"",e=kt[n.month]??"",s=`${t} ${n.dayOfMonth} ${e}`.trim(),r=ge(n.range);return r?`${s}, ${r}`:s}function ye({title:n,message:t="Chargement\u2026"}){return h`
    <ha-card>
      <div class="escalade-header">
        <span class="escalade-title">${n}</span>
      </div>
      <div class="escalade-loader-box">
        <div class="escalade-loader"></div>
        <div class="escalade-loader-text">${t}</div>
      </div>
    </ha-card>
  `}var Nt=720*60*1e3;function Ze(n){if(n.fetch_ok!==!1)return d;let t=n.last_success?new Date(n.last_success):null,e=t?.getTime();if(e!==void 0&&!Number.isNaN(e)&&Date.now()-e<Nt)return d;let s=e===void 0||Number.isNaN(e)?"date inconnue":t.toLocaleString("fr-FR",{dateStyle:"short",timeStyle:"short"});return h`
    <div class="escalade-stale" role="status">
      <span>⚠</span>
      <span>Calendrier du club injoignable — créneaux relevés le ${s}</span>
    </div>
  `}function Qe({title:n,badgeText:t,highlight:e,onRefresh:s}){return h`
    <div class="escalade-header">
      <span class="escalade-title">${n}</span>
      <span class="escalade-header-right">
        <span class="escalade-count ${e?"highlight":""}">${t}</span>
        ${s?h`<button
              class="escalade-refresh"
              title="Relire le calendrier du club"
              @click=${s}
            >
              ⟳
            </button>`:d}
      </span>
    </div>
  `}var te={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},se=n=>(...t)=>({_$litDirective$:n,values:t}),L=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,s){this._$Ct=t,this._$AM=e,this._$Ci=s}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};var et="important",Dt=" !"+et,_e=se(class extends L{constructor(n){if(super(n),n.type!==te.ATTRIBUTE||n.name!=="style"||n.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(n){return Object.keys(n).reduce((t,e)=>{let s=n[e];return s==null?t:t+`${e=e.includes("-")?e:e.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`},"")}update(n,[t]){let{style:e}=n.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(t)),this.render(t);for(let s of this.ft)t[s]==null&&(this.ft.delete(s),s.includes("-")?e.removeProperty(s):e[s]=null);for(let s in t){let r=t[s];if(r!=null){this.ft.add(s);let i=typeof r=="string"&&r.endsWith(Dt);s.includes("-")||i?e.setProperty(s,i?r.slice(0,-11):r,i?et:""):e[s]=r}}return g}});function tt({slot:n}){let t=Q(n),e=qe(t),s=Fe(n.days_left);return h`
    <div class="escalade-row escalade-row-${t}">
      <span
        class="escalade-dot"
        style=${_e({background:e.color})}
        aria-hidden="true"
      ></span>
      <div class="escalade-row-main">
        <div class="escalade-row-day">
          <span class="escalade-day">${n.jour}</span>
          <span class="escalade-date">${n.date_display}</span>
        </div>
        ${n.horaire?h`<div class="escalade-hours">${n.horaire}</div>`:d}
      </div>
      <div class="escalade-row-right">
        <span
          class="escalade-status"
          style=${_e({color:e.color,background:e.bg})}
          >${Be(t)}</span
        >
        <span class="escalade-delay escalade-delay-${s.type}">${s.text}</span>
      </div>
    </div>
  `}var st=se(class extends L{constructor(n){if(super(n),n.type!==te.ATTRIBUTE||n.name!=="class"||n.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(n){return" "+Object.keys(n).filter(t=>n[t]).join(" ")+" "}update(n,[t]){if(this.st===void 0){this.st=new Set,n.strings!==void 0&&(this.nt=new Set(n.strings.join(" ").split(/\s/).filter(s=>s!=="")));for(let s in t)t[s]&&!this.nt?.has(s)&&this.st.add(s);return this.render(t)}let e=n.element.classList;for(let s of this.st)s in t||(e.remove(s),this.st.delete(s));for(let s in t){let r=!!t[s];r===this.st.has(s)||this.nt?.has(s)||(r?(e.add(s),this.st.add(s)):(e.remove(s),this.st.delete(s)))}return g}});var Ut={open:"Ouvert",closed:"Ferm\xE9"};function Ht({session:n,showTime:t,showCountdown:e,showStatus:s,accents:r}){let i=ge(n.range),o=Ge(n),a=Ut[n.status],l=s&&a!==void 0,u=e&&o!=="",m=`--esc-accent:${Ie(n.status,r)}`;return h`
    <div
      class=${st({"esc-tile":!0,today:n.isToday,closed:n.status==="closed"})}
      style=${m}
    >
      <span class="esc-weekday">${Ke[n.weekday]??""}</span>
      <span class="esc-daynum">${n.dayOfMonth}</span>
      <span class="esc-month">${Ye[n.month]??""}</span>
      ${t&&i?h`<span class="esc-time">${i}</span>`:d}
      ${u||l?h`<div class="esc-bottom">
            <span class="esc-countdown">${u?o:""}</span>
            ${l?h`<span class="esc-status esc-status-${n.status}"
                  ><span class="esc-status-dot"></span>${a}</span
                >`:d}
          </div>`:d}
    </div>
  `}function nt({sessions:n,columns:t,showTime:e,showCountdown:s,showStatus:r,accents:i}){return h`
    <div class="esc-tiles" style="--esc-columns:${t}">
      ${n.map(o=>Ht({session:o,showTime:e,showCountdown:s,showStatus:r,accents:i}))}
    </div>
  `}function be(n){return h`<div class="esc-tiles-empty">${n}</div>`}var rt=N`
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
`;var it=N`
  .esc-tiles-card {
    position: relative;
    overflow: hidden;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
  }
  .esc-tiles-card.clickable {
    cursor: pointer;
  }
  /* Le voile est un calque séparé et non un dégradé sur l'image : sans photo,
     il n'est pas rendu du tout, et le fond de card du thème reste intact. */
  .esc-veil {
    position: absolute;
    inset: 0;
    background: rgba(17, 17, 17, var(--esc-overlay, 0.35));
    pointer-events: none;
  }
  .esc-tiles-body {
    position: relative;
    padding: 12px;
  }
  .esc-tiles {
    display: grid;
    grid-template-columns: repeat(var(--esc-columns, 3), minmax(0, 1fr));
    gap: 10px;
  }
  .esc-tile {
    display: flex;
    flex-direction: column;
    padding: 10px;
    border-radius: 10px;
    background: rgba(22, 22, 22, 0.62);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: var(--primary-text-color);
    /* min-width:0 sur une piste de grille : sans lui, un horaire un peu long
       force la colonne à s'élargir et la grille déborde de la card. */
    min-width: 0;
  }
  /* Une séance fermée reste lisible mais s'efface. L'opacité ne dépend pas de
     « show_status » : sans elle, un soir fermé serait indiscernable d'un soir
     ouvert dès que l'utilisateur masque les statuts — c'est-à-dire par
     défaut. */
  .esc-tile.closed {
    opacity: 0.7;
  }
  .esc-tile.today {
    background: rgba(21, 97, 158, 0.88);
    background: color-mix(
      in srgb,
      color-mix(in srgb, var(--esc-accent, #2196f3) 62%, black) 88%,
      transparent
    );
    color: #fff;
  }
  .esc-weekday {
    font-weight: 500;
    font-size: 11px;
    line-height: 14px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #b8b8b8;
  }
  .esc-daynum {
    font-weight: 700;
    font-size: 30px;
    line-height: 34px;
  }
  .esc-month {
    font-weight: 400;
    font-size: 11px;
    line-height: 14px;
    color: #b8b8b8;
  }
  .esc-tile.today .esc-weekday,
  .esc-tile.today .esc-month {
    color: rgba(255, 255, 255, 0.85);
  }
  .esc-time {
    margin-top: 6px;
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    white-space: nowrap;
  }
  .esc-bottom {
    margin-top: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 6px;
    font-weight: 400;
    font-size: 11px;
    line-height: 14px;
  }
  .esc-countdown {
    color: #b8b8b8;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .esc-tile.today .esc-countdown {
    color: #fff;
  }
  .esc-status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }
  .esc-status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }
  /* La pastille est une variante claire de l'accent : sur la tuile sombre,
     l'accent brut passe sous 4,5:1. Deux déclarations, la seconde ignorée
     sans color-mix — c'est tout l'intérêt de passer par une propriété
     personnalisée plutôt que de composer la couleur en TypeScript. */
  .esc-status-open {
    color: #81c784;
    color: color-mix(in srgb, var(--esc-accent, #4caf50) 65%, white);
  }
  .esc-status-closed {
    color: #ef9a9a;
    color: color-mix(in srgb, var(--esc-accent, #f44336) 65%, white);
  }
  /* Sur l'accent foncé, les variantes claires tombent sous 4,5:1 : le blanc
     est le seul choix qui tienne le contraste, et le libellé porte déjà
     l'information que la couleur dédouble. */
  .esc-tile.today .esc-status {
    color: #fff;
  }
  .esc-tiles-empty {
    position: relative;
    padding: 12px;
    font-size: 13px;
    line-height: 18px;
    color: var(--secondary-text-color);
  }
`;var Pt={open:"Cr\xE9neaux ouverts",closed:"Cr\xE9neaux ferm\xE9s",unknown:"Statut non reconnu"},jt={entity:"Entit\xE9 (sensor)",mode:"Pr\xE9sentation",title:"Titre personnalis\xE9 (mode liste)",days:"Jours affich\xE9s",statuses:"Statuts affich\xE9s",max:"Nombre maximal de cr\xE9neaux (mode liste)",count:"Nombre de tuiles (mode tuiles)",show_time:"Afficher l'horaire",show_countdown:"Afficher le d\xE9lai",show_status:"Afficher le statut",background:"Photo de fond (mode tuiles)",overlay:"Opacit\xE9 du voile",accent_open:"Couleur des cr\xE9neaux ouverts",accent_closed:"Couleur des cr\xE9neaux ferm\xE9s"},zt=[{name:"entity",required:!0,selector:{entity:{domain:"sensor",integration:"escalade_veauche"}}},{name:"mode",selector:{select:{mode:"dropdown",options:[{value:"list",label:"Liste (une ligne par cr\xE9neau)"},{value:"tiles",label:"Tuiles calendrier (compact)"}]}}},{name:"title",selector:{text:{}}},{name:"days",selector:{select:{multiple:!0,mode:"list",options:Z.map(n=>({value:String(n),label:Pe[n]??String(n)}))}}},{name:"statuses",selector:{select:{multiple:!0,options:F.map(n=>({value:n,label:Pt[n]??n}))}}},{name:"max",selector:{number:{min:1,max:60,mode:"box"}}},{name:"count",selector:{number:{min:1,max:4,mode:"box"}}},{name:"show_time",selector:{boolean:{}}},{name:"show_countdown",selector:{boolean:{}}},{name:"show_status",selector:{boolean:{}}},{name:"background",selector:{text:{}}},{name:"overlay",selector:{number:{min:0,max:1,step:.05,mode:"slider"}}},{name:"accent_open",selector:{color_rgb:{}}},{name:"accent_closed",selector:{color_rgb:{}}}],It=n=>jt[n.name]??n.name,V=class extends _{constructor(){super(...arguments);this._config={entity:""}}setConfig(e){this._config=e??{entity:""}}createRenderRoot(){return this}render(){if(!this.hass)return h``;let e={...this._config,days:this._config.days?.map(String)};return h`
      <ha-form
        .hass=${this.hass}
        .data=${e}
        .schema=${zt}
        .computeLabel=${It}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `}_valueChanged(e){let s={...e.detail.value};for(let r of Object.keys(s)){if(r==="entity"){typeof s[r]!="string"&&(s[r]="");continue}r==="days"&&Array.isArray(s[r])&&(s[r]=s[r].map(Number).filter(o=>Number.isInteger(o)));let i=s[r];(i===""||i===void 0||i===null)&&delete s[r],Array.isArray(i)&&i.length===0&&delete s[r]}this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:s},bubbles:!0,composed:!0}))}};T([M({attribute:!1})],V.prototype,"hass",2),T([J()],V.prototype,"_config",2);customElements.get("escalade-card-editor")||customElements.define("escalade-card-editor",V);var qt=6e4,E=class E extends _{constructor(){super(...arguments);this._id=++E._instances;this._retry=new ee("card",()=>this.requestUpdate());this._hasRendered=!1;this._firstUpdateLogged=!1;this._tick=null;this._handleKeydown=e=>{e.key!=="Enter"&&e.key!==" "||(e.preventDefault(),this._handleTap())};this._handleTap=()=>{let e=this._config,s=e?.tap_action?.action??"more-info";if(!(s==="none"||!e)){if(s==="url"){let r=e.tap_action?.url_path;r&&window.open(r,"_blank","noopener");return}if(s==="navigate"){let r=e.tap_action?.navigation_path;if(!r)return;history.pushState(null,"",r),window.dispatchEvent(new CustomEvent("location-changed",{bubbles:!0,composed:!0}));return}e.entity&&this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:e.entity},bubbles:!0,composed:!0}))}};this._refresh=()=>{this._hass&&this._hass.callService("escalade_veauche","refresh",{}).catch(e=>{c("warn","card","le rafra\xEEchissement a \xE9chou\xE9 : %o",e)})}}set hass(e){this._hass=e,this._syncEntityState()}get hass(){return this._hass}setConfig(e){if(!e||typeof e!="object")throw c("error","card","setConfig rejet\xE9, config non-objet : %o",e),new Error("Configuration manquante ou invalide");let s="";typeof e.entity=="string"?s=e.entity:e.entity!==void 0&&e.entity!==null&&c("error","card","'entity' doit \xEAtre une cha\xEEne, re\xE7u %o \u2014 carte en attente de configuration",e.entity);let r=this._normalizeStatuses(e.statuses),i=this._normalizeDays(e.days),o=this._normalizeMode(e.mode),a=this._normalizeCount(e.count),l=this._normalizeOverlay(e.overlay),u=this._normalizeBackground(e.background),m=this._normalizeAccent("accent_open",e.accent_open),p=this._normalizeAccent("accent_closed",e.accent_closed),f;if(e.max!==void 0){let v=Number(e.max);!Number.isInteger(v)||v<1?c("warn","card","'max' doit \xEAtre un entier positif, ignor\xE9 (re\xE7u : %o)",e.max):f=v}c("info","card","#%d setConfig accept\xE9 (entity=%s, mode=%s, jours=%s, statuts=%s) \xE0 t=%dms",this._id,s||"(vide)",o,i?i.join(","):"tous",r?r.join(","):"tous",Math.round(performance.now()));let y=this._config;this._config={...e,entity:s,days:i,statuses:r,max:f,mode:o,count:a,overlay:l,background:u,accent_open:m,accent_closed:p,show_time:e.show_time===!0,show_countdown:e.show_countdown===!0,show_status:e.show_status===!0},y?.entity!==this._config.entity&&(this._hasRendered=!1,this._lastTemplate=void 0,this._renderedEntityState=void 0,this._retry.reset()),this._syncEntityState()}_normalizeStatuses(e){if(e===void 0)return;if(!Array.isArray(e)){c("warn","card","'statuses' doit \xEAtre une liste, ignor\xE9 (re\xE7u : %o)",e);return}let s=[],r=[];for(let i of e){let o=He[String(i)]??i;F.includes(o)?s.includes(o)||s.push(o):r.push(i)}if(r.length&&c("warn","card","Statuts inconnus ignor\xE9s : %s. Valides : %s",r.join(", "),F.join(", ")),s.length===0){c("warn","card","Filtre de statuts vide, filtre ignor\xE9");return}return s}_normalizeDays(e){if(e===void 0)return;if(!Array.isArray(e)){c("warn","card","'days' doit \xEAtre une liste, ignor\xE9 (re\xE7u : %o)",e);return}let s=[],r=[];for(let i of e){let o=Number(i);Number.isInteger(o)&&Z.includes(o)?s.includes(o)||s.push(o):r.push(i)}if(r.length&&c("warn","card","Jours inconnus ignor\xE9s : %s. Attendu : 0 (lundi) \xE0 6 (dimanche)",r.join(", ")),s.length===0){c("warn","card","Filtre de jours vide, filtre ignor\xE9");return}return s.sort((i,o)=>i-o),s}_normalizeMode(e){if(e===void 0)return"list";let s=je[String(e)]??e;return me.includes(s)?s:(c("warn","card","Mode '%s' inconnu, repli sur 'list'. Modes valides : %s",e,me.join(", ")),"list")}_normalizeCount(e){if(e===void 0)return 3;let s=Number(e);return!Number.isInteger(s)||s<1||s>4?(c("warn","card","'count' doit \xEAtre un entier de 1 \xE0 4, repli sur 3 (re\xE7u : %o)",e),3):s}_normalizeOverlay(e){if(e===void 0)return .35;let s=Number(e);return!Number.isFinite(s)||s<0||s>1?(c("warn","card","'overlay' doit \xEAtre entre 0 et 1, repli sur 0.35 (re\xE7u : %o)",e),.35):s}_normalizeBackground(e){if(!(e===void 0||e==="none"||e==="")){if(typeof e!="string"||!/^[\w\-./:%?&=+@,~#]+$/.test(e)){c("warn","card","'background' ignor\xE9 : chemin inattendu (%o)",e);return}return e}}_normalizeAccent(e,s){if(s===void 0)return;let r=ze(s);return r===void 0&&c("warn","card","'%s' ignor\xE9 : valeur inattendue (%o)",e,s),r}_syncEntityState(){let e=this._hass?.states;if(!e||!this._config?.entity){this._entityState=void 0;return}this._entityState=e[this._config.entity]}static getStubConfig(e,s,r){let i=e?.states??{},o=[...s??[],...r??[],...Object.keys(i)].filter(l=>l.startsWith("sensor."));return{entity:o.find(l=>i[l]?.attributes?.creneaux)??o.find(l=>l.includes("escalade"))??""}}static getConfigElement(){return document.createElement("escalade-card-editor")}get _detailsShown(){let e=this._config;return!!(e?.show_time||e?.show_countdown||e?.show_status)}getCardSize(){return this._config?.mode!=="tiles"?4:this._detailsShown?3:2}getGridOptions(){return this._config?.mode!=="tiles"?{columns:12,min_columns:6,rows:4,min_rows:2}:{columns:12,min_columns:6,rows:"auto",min_rows:1}}connectedCallback(){super.connectedCallback(),this._retry.reset(),customElements.get("ha-card")||customElements.whenDefined("ha-card").then(()=>{c("info","card","ha-card d\xE9fini apr\xE8s le premier rendu, re-rendu"),this.requestUpdate()}),this._tick??(this._tick=setInterval(()=>{this._config?.mode==="tiles"&&this.requestUpdate()},qt))}disconnectedCallback(){super.disconnectedCallback(),this._retry.cancel(),this._tick!==null&&(clearInterval(this._tick),this._tick=null)}updated(){this._firstUpdateLogged||(this._firstUpdateLogged=!0,c("info","card","#%d premier rendu effectu\xE9 \xE0 t=%dms (donn\xE9es=%s)",this._id,Math.round(performance.now()),this._hasRendered?"oui":"non, loader")),this._renderedEntityState=this._entityState,this._hasRendered&&this.dispatchEvent(new CustomEvent("escalade-card-update",{bubbles:!0,composed:!0}))}shouldUpdate(e){return e.has("_config")||!this._hasRendered?!0:e.has("hass")?this._entityState!==this._renderedEntityState:!0}render(){try{return this._render()}catch(e){return c("error","card","render() a lev\xE9, repli sur le loader : %o",e),this._retry.schedule(),ye({title:"Escalade Veauche",message:"Erreur \u2014 voir console"})}}_message(e,s){return this._config?.mode!=="tiles"?ye({title:e,message:s}):this._tilesShell(be(s),null)}_render(){let e=this._config?.title??"Cr\xE9neaux escalade";if(!this._config)return this._message(e,"En attente de configuration\u2026");if(!this._hass)return this._message(e,"Connexion \xE0 Home Assistant\u2026");let s=this._config.entity;if(!s)return this._message(e,"S\xE9lectionnez une entit\xE9");let r=this._hass.states;if(!r)return c("warn","card","hass.states absent, rendu du loader"),this._retry.schedule(),this._retry.exhausted?this._message(e,"Donn\xE9es Home Assistant indisponibles"):this._lastTemplate??this._message(e,"En attente de Home Assistant\u2026");let i=r[s];if(!i||i.state==="unavailable"||i.state==="unknown"){let l=i?`state=${i.state}`:"entit\xE9 introuvable";return c("warn","card","%s \u2014 %s %s",s,l,this._hasRendered?"(dernier rendu conserv\xE9)":"(loader)"),this._retry.schedule(),this._hasRendered&&!this._retry.exhausted?this._lastTemplate??this._message(e,"Chargement\u2026"):this._hasRendered?this._message(e,this._config?.mode==="tiles"?"Cr\xE9neaux indisponibles":`${s} indisponible`):(this._lastTemplate=this._message(e,this._retry.exhausted?this._config?.mode==="tiles"?"Cr\xE9neaux indisponibles":`Donn\xE9es indisponibles pour ${s}`:"En attente des donn\xE9es\u2026"),this._lastTemplate)}if(!("creneaux"in(i.attributes??{})))return c("error","card","%s ne porte pas \xAB creneaux \xBB : ce n'est pas un capteur de cette int\xE9gration",s),this._message(e,`${s} n'est pas un capteur Escalade`);this._retry.reset();let a=this._config.mode==="tiles"?this._renderTilesMode(i):this._renderCalendar(i,e);return this._lastTemplate=a,this._hasRendered=!0,a}_visibleSlots(e){let s=this._config?.days,r=this._config?.statuses,i=e;s&&(i=i.filter(a=>s.includes(a.weekday))),r&&(i=i.filter(a=>r.includes(Q(a))));let o=this._config?.max;return o!==void 0?i.slice(0,o):i}_renderCalendar(e,s){let r=e.attributes??{},i=Array.isArray(r.creneaux)?r.creneaux:[],o=this._visibleSlots(i),a=!!this._config?.days||!!this._config?.statuses,l=`${o.length}`;return h`
      <ha-card>
        ${Qe({title:s,badgeText:l,highlight:a&&o.length>0,onRefresh:this._refresh})}
        ${Ze(r)}
        ${o.length===0?h`<div class="escalade-empty">
              ${i.length===0?"Aucun cr\xE9neau annonc\xE9 par le club":"Aucun cr\xE9neau ne correspond au filtre de cette carte"}
            </div>`:o.map(u=>tt({slot:u}))}
      </ha-card>
    `}_tilesShell(e,s){let r=this._config,i=r?.background,a=(r?.tap_action?.action??"more-info")!=="none",l=[i?`background-image:url("${i}")`:"",r?.overlay!==void 0?`--esc-overlay:${r.overlay}`:""].filter(Boolean).join(";"),u=s?`Escalade : prochaine s\xE9ance ${Xe(s)}`:"Escalade : cr\xE9neaux";return h`
      <ha-card
        class="esc-tiles-card ${a?"clickable":""}"
        style=${l}
        role=${a?"button":"presentation"}
        tabindex=${a?"0":"-1"}
        aria-label=${a?u:""}
        @click=${a?this._handleTap:void 0}
        @keydown=${a?this._handleKeydown:void 0}
      >
        ${i?h`<div class="esc-veil"></div>`:d}
        ${e}
      </ha-card>
    `}_renderTilesMode(e){let s=e.attributes??{},r=Array.isArray(s.creneaux)?s.creneaux:[],i=this._config?.count??3,o=Je(this._visibleSlots(r),new Date,i),a=o.length===0?be("Aucune s\xE9ance \xE0 venir"):nt({sessions:o,columns:i,showTime:this._config?.show_time===!0,showCountdown:this._config?.show_countdown===!0,showStatus:this._config?.show_status===!0,accents:{open:this._config?.accent_open,closed:this._config?.accent_closed}});return this._tilesShell(o.length===0?a:h`<div class="esc-tiles-body">${a}</div>`,o[0]??null)}};E.styles=[rt,it],E._instances=0,T([M({attribute:!1})],E.prototype,"hass",1),T([J()],E.prototype,"_config",2);var ne=E;Ve();window.loadCardHelpers?.().catch(n=>{c("warn","card","loadCardHelpers() a \xE9chou\xE9 : %o",n)});var C="escalade-card",Bt=5,ot=0;function Ft(){if(customElements.get(C)||ot>=Bt)return!1;ot++;try{return customElements.define(C,class extends ne{}),c("warn","card","r\xE9-enregistr\xE9 \xE0 t=%dms : le registre d'\xE9l\xE9ments personnalis\xE9s avait \xE9t\xE9 remplac\xE9 depuis le premier enregistrement",Math.round(performance.now())),!0}catch(n){return c("error","card","r\xE9-enregistrement impossible : %o",n),!1}}customElements.get(C)?c("info","card","module d\xE9j\xE0 enregistr\xE9, ce chargement est ignor\xE9"):(customElements.define(C,ne),c("info","card","\xE9l\xE9ment enregistr\xE9 \xE0 t=%dms apr\xE8s le d\xE9but du chargement de la page",Math.round(performance.now())));function Vt(){let n=0,t=e=>{if(e.localName==="hui-error-card"){let s=e;((s._config??s.config)?.message??"").includes(C)&&(e.dispatchEvent(new CustomEvent("ll-rebuild",{bubbles:!0,composed:!0})),n++);return}for(let s of[...e.shadowRoot?.children??[],...e.children])t(s)};return document.body&&t(document.body),n}for(let n of[0,50,150,400,1e3,2e3,4e3])window.setTimeout(()=>{try{Ft();let t=Vt();t>0&&c("warn","card","%d carte(s) d'erreur reconstruite(s) apr\xE8s %dms \u2014 la vue a \xE9t\xE9 b\xE2tie avant l'enregistrement de l'\xE9l\xE9ment",t,n)}catch(t){c("error","card","r\xE9paration des cartes d'erreur impossible : %o",t)}},n);window.customCards=window.customCards??[];window.customCards.some(n=>n.type===C)||window.customCards.push({type:C,name:"Escalade Veauche",description:"Affiche les cr\xE9neaux d'ouverture des Cimes Veauchoises"});export{ne as EscaladeCard};
