/* escalade-card — artefact de build, ne pas éditer directement. Sources : frontend/src/ */
var ut=Object.defineProperty;var pt=Object.getOwnPropertyDescriptor;var C=(n,t,e,s)=>{for(var r=s>1?void 0:s?pt(t,e):t,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(t,e,r):o(r))||r);return s&&r&&ut(t,e,r),r};var W=globalThis,K=W.ShadowRoot&&(W.ShadyCSS===void 0||W.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,oe=Symbol(),Se=new WeakMap,N=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==oe)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(K&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=Se.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&Se.set(e,t))}return t}toString(){return this.cssText}},$e=n=>new N(typeof n=="string"?n:n+"",void 0,oe),O=(n,...t)=>{let e=n.length===1?n[0]:t.reduce((s,r,i)=>s+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+n[i+1],n[0]);return new N(e,n,oe)},Ae=(n,t)=>{if(K)n.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),r=W.litNonce;r!==void 0&&s.setAttribute("nonce",r),s.textContent=e.cssText,n.appendChild(s)}},ae=K?n=>n:n=>n instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return $e(e)})(n):n;var{is:ht,defineProperty:mt,getOwnPropertyDescriptor:ft,getOwnPropertyNames:gt,getOwnPropertySymbols:yt,getPrototypeOf:_t}=Object,v=globalThis,we=v.trustedTypes,bt=we?we.emptyScript:"",vt=v.reactiveElementPolyfillSupport,D=(n,t)=>n,U={toAttribute(n,t){switch(t){case Boolean:n=n?bt:null;break;case Object:case Array:n=n==null?n:JSON.stringify(n)}return n},fromAttribute(n,t){let e=n;switch(t){case Boolean:e=n!==null;break;case Number:e=n===null?null:Number(n);break;case Object:case Array:try{e=JSON.parse(n)}catch{e=null}}return e}},Y=(n,t)=>!ht(n,t),Ee={attribute:!0,type:String,converter:U,reflect:!1,useDefault:!1,hasChanged:Y};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),v.litPropertyMetadata??(v.litPropertyMetadata=new WeakMap);var b=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=Ee){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),r=this.getPropertyDescriptor(t,s,e);r!==void 0&&mt(this.prototype,t,r)}}static getPropertyDescriptor(t,e,s){let{get:r,set:i}=ft(this.prototype,t)??{get(){return this[e]},set(o){this[e]=o}};return{get:r,set(o){let a=r?.call(this);i?.call(this,o),this.requestUpdate(t,a,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??Ee}static _$Ei(){if(this.hasOwnProperty(D("elementProperties")))return;let t=_t(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(D("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(D("properties"))){let e=this.properties,s=[...gt(e),...yt(e)];for(let r of s)this.createProperty(r,e[r])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,r]of e)this.elementProperties.set(s,r)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let r=this._$Eu(e,s);r!==void 0&&this._$Eh.set(r,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let r of s)e.unshift(ae(r))}else t!==void 0&&e.push(ae(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Ae(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),r=this.constructor._$Eu(t,s);if(r!==void 0&&s.reflect===!0){let i=(s.converter?.toAttribute!==void 0?s.converter:U).toAttribute(e,s.type);this._$Em=t,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(t,e){let s=this.constructor,r=s._$Eh.get(t);if(r!==void 0&&this._$Em!==r){let i=s.getPropertyOptions(r),o=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:U;this._$Em=r;let a=o.fromAttribute(e,i.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(t,e,s,r=!1,i){if(t!==void 0){let o=this.constructor;if(r===!1&&(i=this[t]),s??(s=o.getPropertyOptions(t)),!((s.hasChanged??Y)(i,e)||s.useDefault&&s.reflect&&i===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:r,wrapped:i},o){s&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,o??e??this[t]),i!==!0||o!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),r===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[r,i]of this._$Ep)this[r]=i;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[r,i]of s){let{wrapped:o}=i,a=this[r];o!==!0||this._$AL.has(r)||a===void 0||this.C(r,void 0,i,a)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(e=>this._$ET(e,this[e]))),this._$EM()}updated(t){}firstUpdated(t){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[D("elementProperties")]=new Map,b[D("finalized")]=new Map,vt?.({ReactiveElement:b}),(v.reactiveElementVersions??(v.reactiveElementVersions=[])).push("2.1.2");var H=globalThis,Te=n=>n,G=H.trustedTypes,Ce=G?G.createPolicy("lit-html",{createHTML:n=>n}):void 0,Oe="$lit$",x=`lit$${Math.random().toFixed(9).slice(2)}$`,De="?"+x,xt=`<${De}>`,A=document,j=()=>A.createComment(""),z=n=>n===null||typeof n!="object"&&typeof n!="function",me=Array.isArray,St=n=>me(n)||typeof n?.[Symbol.iterator]=="function",le=`[ 	
\f\r]`,P=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ke=/-->/g,Re=/>/g,S=RegExp(`>|${le}(?:([^\\s"'>=/]+)(${le}*=${le}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Le=/'/g,Me=/"/g,Ue=/^(?:script|style|textarea|title)$/i,fe=n=>(t,...e)=>({_$litType$:n,strings:t,values:e}),h=fe(1),ts=fe(2),ss=fe(3),y=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),Ne=new WeakMap,$=A.createTreeWalker(A,129);function Pe(n,t){if(!me(n)||!n.hasOwnProperty("raw"))throw Error("invalid template strings array");return Ce!==void 0?Ce.createHTML(t):t}var $t=(n,t)=>{let e=n.length-1,s=[],r,i=t===2?"<svg>":t===3?"<math>":"",o=P;for(let a=0;a<e;a++){let l=n[a],u,m,p=-1,f=0;for(;f<l.length&&(o.lastIndex=f,m=o.exec(l),m!==null);)f=o.lastIndex,o===P?m[1]==="!--"?o=ke:m[1]!==void 0?o=Re:m[2]!==void 0?(Ue.test(m[2])&&(r=RegExp("</"+m[2],"g")),o=S):m[3]!==void 0&&(o=S):o===S?m[0]===">"?(o=r??P,p=-1):m[1]===void 0?p=-2:(p=o.lastIndex-m[2].length,u=m[1],o=m[3]===void 0?S:m[3]==='"'?Me:Le):o===Me||o===Le?o=S:o===ke||o===Re?o=P:(o=S,r=void 0);let g=o===S&&n[a+1].startsWith("/>")?" ":"";i+=o===P?l+xt:p>=0?(s.push(u),l.slice(0,p)+Oe+l.slice(p)+x+g):l+x+(p===-2?a:g)}return[Pe(n,i+(n[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},I=class n{constructor({strings:t,_$litType$:e},s){let r;this.parts=[];let i=0,o=0,a=t.length-1,l=this.parts,[u,m]=$t(t,e);if(this.el=n.createElement(u,s),$.currentNode=this.el.content,e===2||e===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(r=$.nextNode())!==null&&l.length<a;){if(r.nodeType===1){if(r.hasAttributes())for(let p of r.getAttributeNames())if(p.endsWith(Oe)){let f=m[o++],g=r.getAttribute(p).split(x),T=/([.?@])?(.*)/.exec(f);l.push({type:1,index:i,name:T[2],strings:g,ctor:T[1]==="."?de:T[1]==="?"?ue:T[1]==="@"?pe:R}),r.removeAttribute(p)}else p.startsWith(x)&&(l.push({type:6,index:i}),r.removeAttribute(p));if(Ue.test(r.tagName)){let p=r.textContent.split(x),f=p.length-1;if(f>0){r.textContent=G?G.emptyScript:"";for(let g=0;g<f;g++)r.append(p[g],j()),$.nextNode(),l.push({type:2,index:++i});r.append(p[f],j())}}}else if(r.nodeType===8)if(r.data===De)l.push({type:2,index:i});else{let p=-1;for(;(p=r.data.indexOf(x,p+1))!==-1;)l.push({type:7,index:i}),p+=x.length-1}i++}}static createElement(t,e){let s=A.createElement("template");return s.innerHTML=t,s}};function k(n,t,e=n,s){if(t===y)return t;let r=s!==void 0?e._$Co?.[s]:e._$Cl,i=z(t)?void 0:t._$litDirective$;return r?.constructor!==i&&(r?._$AO?.(!1),i===void 0?r=void 0:(r=new i(n),r._$AT(n,e,s)),s!==void 0?(e._$Co??(e._$Co=[]))[s]=r:e._$Cl=r),r!==void 0&&(t=k(n,r._$AS(n,t.values),r,s)),t}var ce=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,r=(t?.creationScope??A).importNode(e,!0);$.currentNode=r;let i=$.nextNode(),o=0,a=0,l=s[0];for(;l!==void 0;){if(o===l.index){let u;l.type===2?u=new q(i,i.nextSibling,this,t):l.type===1?u=new l.ctor(i,l.name,l.strings,this,t):l.type===6&&(u=new he(i,this,t)),this._$AV.push(u),l=s[++a]}o!==l?.index&&(i=$.nextNode(),o++)}return $.currentNode=A,r}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},q=class n{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,r){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=k(this,t,e),z(t)?t===d||t==null||t===""?(this._$AH!==d&&this._$AR(),this._$AH=d):t!==this._$AH&&t!==y&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):St(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==d&&z(this._$AH)?this._$AA.nextSibling.data=t:this.T(A.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,r=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=I.createElement(Pe(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===r)this._$AH.p(e);else{let i=new ce(r,this),o=i.u(this.options);i.p(e),this.T(o),this._$AH=i}}_$AC(t){let e=Ne.get(t.strings);return e===void 0&&Ne.set(t.strings,e=new I(t)),e}k(t){me(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,r=0;for(let i of t)r===e.length?e.push(s=new n(this.O(j()),this.O(j()),this,this.options)):s=e[r],s._$AI(i),r++;r<e.length&&(this._$AR(s&&s._$AB.nextSibling,r),e.length=r)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=Te(t).nextSibling;Te(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},R=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,r,i){this.type=1,this._$AH=d,this._$AN=void 0,this.element=t,this.name=e,this._$AM=r,this.options=i,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=d}_$AI(t,e=this,s,r){let i=this.strings,o=!1;if(i===void 0)t=k(this,t,e,0),o=!z(t)||t!==this._$AH&&t!==y,o&&(this._$AH=t);else{let a=t,l,u;for(t=i[0],l=0;l<i.length-1;l++)u=k(this,a[s+l],e,l),u===y&&(u=this._$AH[l]),o||(o=!z(u)||u!==this._$AH[l]),u===d?t=d:t!==d&&(t+=(u??"")+i[l+1]),this._$AH[l]=u}o&&!r&&this.j(t)}j(t){t===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},de=class extends R{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===d?void 0:t}},ue=class extends R{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==d)}},pe=class extends R{constructor(t,e,s,r,i){super(t,e,s,r,i),this.type=5}_$AI(t,e=this){if((t=k(this,t,e,0)??d)===y)return;let s=this._$AH,r=t===d&&s!==d||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,i=t!==d&&(s===d||r);r&&this.element.removeEventListener(this.name,this,s),i&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},he=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){k(this,t)}};var At=H.litHtmlPolyfillSupport;At?.(I,q),(H.litHtmlVersions??(H.litHtmlVersions=[])).push("3.3.3");var He=(n,t,e)=>{let s=e?.renderBefore??t,r=s._$litPart$;if(r===void 0){let i=e?.renderBefore??null;s._$litPart$=r=new q(t.insertBefore(j(),i),i,void 0,e??{})}return r._$AI(n),r};var B=globalThis,_=class extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e;let t=super.createRenderRoot();return(e=this.renderOptions).renderBefore??(e.renderBefore=t.firstChild),t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=He(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return y}};_._$litElement$=!0,_.finalized=!0,B.litElementHydrateSupport?.({LitElement:_});var wt=B.litElementPolyfillSupport;wt?.({LitElement:_});(B.litElementVersions??(B.litElementVersions=[])).push("4.2.2");var Et={attribute:!0,type:String,converter:U,reflect:!1,hasChanged:Y},Tt=(n=Et,t,e)=>{let{kind:s,metadata:r}=e,i=globalThis.litPropertyMetadata.get(r);if(i===void 0&&globalThis.litPropertyMetadata.set(r,i=new Map),s==="setter"&&((n=Object.create(n)).wrapped=!0),i.set(e.name,n),s==="accessor"){let{name:o}=e;return{set(a){let l=t.get.call(this);t.set.call(this,a),this.requestUpdate(o,l,n,!0,a)},init(a){return a!==void 0&&this.C(o,void 0,n,a),a}}}if(s==="setter"){let{name:o}=e;return function(a){let l=this[o];t.call(this,a),this.requestUpdate(o,l,n,!0,a)}}throw Error("Unsupported decorator location: "+s)};function L(n){return(t,e)=>typeof e=="object"?Tt(n,t,e):((s,r,i)=>{let o=r.hasOwnProperty(i);return r.constructor.createProperty(i,s),o?Object.getOwnPropertyDescriptor(r,i):void 0})(n,t,e)}function J(n){return L({...n,state:!0,attribute:!1})}var F=["open","closed","unknown"],je={ouvert:"open",ferme:"closed",ferm\u00E9:"closed",inconnu:"unknown"},Z=[0,1,2,3,4,5,6],ze=["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"],ge=["list","tiles"],Ie={liste:"list",tuiles:"tiles"};var Ct={open:"var(--success-color)",closed:"var(--error-color)",unknown:"var(--primary-color)"};function qe(n){if(n==null||n==="")return;if(Array.isArray(n)){if(n.length!==3)return;let e=n.map(Number);return e.some(s=>!Number.isInteger(s)||s<0||s>255)?void 0:`rgb(${e[0]}, ${e[1]}, ${e[2]})`}if(typeof n!="string")return;let t=n.trim();if(!(t===""||t.length>120||/[;{}<>]/.test(t)))return t}function Be(n,t){return(n==="open"?t.open:n==="closed"?t.closed:void 0)??Ct[n]}var Q=.88;function Fe(n){if(n==null||n==="")return;let t=Number(n);if(!(!Number.isFinite(t)||t<0||t>1))return t}function Ve({background:n,overlay:t,intensity:e}){return[n?`background-image:url("${n}")`:"",`--esc-overlay:${t}`,`--esc-intensity:${e}`].filter(Boolean).join(";")}function ee(n){return n.open===!0?"open":n.open===!1?"closed":"unknown"}function We(n){return n==="open"?{color:"#1b5e20",bg:"#c8e6c9"}:n==="closed"?{color:"#b71c1c",bg:"#ffcdd2"}:{color:"#37474f",bg:"#cfd8dc"}}function Ke(n){return n==="open"?"Ouvert":n==="closed"?"Ferm\xE9":"Statut inconnu"}function Ye(n){return typeof n!="number"||!Number.isFinite(n)?{type:"unknown",text:"date inconnue"}:n<0?{type:"unknown",text:"cr\xE9neau pass\xE9"}:n===0?{type:"today",text:"aujourd'hui"}:n===1?{type:"tomorrow",text:"demain"}:n<=7?{type:"soon",text:`dans ${n} jours`}:{type:"later",text:`dans ${n} jours`}}var kt="0.4.0";function Ge(){console.info(`%c ESCALADE-CARD %c ${kt} IS INSTALLED `,"color: white; background: #1565c0; font-weight: bold;","color: #1565c0; background: #bbdefb; font-weight: bold;")}function c(n,t,e,...s){let r=`%c ESCALADE-CARD %c [${t}]`,i=["color: white; background: #1565c0; font-weight: bold;","color: #1565c0; font-weight: bold;"];console[n](r+" "+e,...i,...s)}var Je=10,Rt=2e3,Lt=15e3,te=class{constructor(t,e){this.cardName=t;this.fire=e;this.timer=null;this.count=0}schedule(){if(this.timer||(this.count++,this.count>Je))return;let t=Math.min(Rt*this.count,Lt);c("info",this.cardName,"Retry %d dans %dms\u2026",this.count,t),this.timer=setTimeout(()=>{this.timer=null,this.fire()},t)}get exhausted(){return this.count>Je}reset(){this.count=0,this.cancel()}cancel(){this.timer&&(clearTimeout(this.timer),this.timer=null)}};var Xe=["lun.","mar.","mer.","jeu.","ven.","sam.","dim."],Mt=["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"],Ze=["janv.","f\xE9vr.","mars","avr.","mai","juin","juil.","ao\xFBt","sept.","oct.","nov.","d\xE9c."],Nt=["janvier","f\xE9vrier","mars","avril","mai","juin","juillet","ao\xFBt","septembre","octobre","novembre","d\xE9cembre"],Ot=/(\d{1,2})\s*h\s*(\d{2})?\s*[-–—]\s*(\d{1,2})\s*h\s*(\d{2})?/;function Dt(n){if(typeof n!="string")return null;let t=Ot.exec(n);if(!t)return null;let e=Number(t[1]),s=Number(t[2]??"0"),r=Number(t[3]),i=Number(t[4]??"0");if(e>23||r>23||s>59||i>59)return null;let o=e*60+s,a=r*60+i;return a<=o?null:{start:o,end:a}}function _e(n){if(!n)return null;let t=e=>{let s=Math.floor(e/60),r=e%60;return r===0?`${s}h`:`${s}h${String(r).padStart(2,"0")}`};return`${t(n.start)} \u2013 ${t(n.end)}`}function ye(n,t=0){let e=/^(\d{4})-(\d{2})-(\d{2})$/.exec(n);if(!e)return null;let s=new Date(Number(e[1]),Number(e[2])-1,Number(e[3]),Math.floor(t/60),t%60,0,0);return Number.isNaN(s.getTime())?null:s}function Ut(n,t){let e=new Date(n.getFullYear(),n.getMonth(),n.getDate(),12),s=new Date(t.getFullYear(),t.getMonth(),t.getDate(),12);return Math.round((s.getTime()-e.getTime())/864e5)}function Qe(n){return n.isNow?"en cours":n.daysUntil===null?"":n.daysUntil===0?"aujourd'hui":n.daysUntil===1?"demain":`dans ${n.daysUntil} j`}function Pt(n,t){if(typeof n.date!="string")return null;let e=ye(n.date);if(!e)return null;let s=Dt(n.horaire),r=s?ye(n.date,s.start):e,i=s?ye(n.date,s.end):null;if(!r)return null;let o=Ut(t,e);return{date:n.date,weekday:n.weekday,dayOfMonth:e.getDate(),month:e.getMonth(),start:r,end:i,range:s,status:n.open===!0?"open":n.open===!1?"closed":"unknown",statut:n.statut,daysUntil:o,isToday:o===0,isNow:i!==null&&r<=t&&t<i}}function et(n,t,e){let s=[];for(let r of n){let i=Pt(r,t);if(i){if(i.end!==null){if(i.end<=t)continue}else if(i.daysUntil!==null&&i.daysUntil<0)continue;s.push(i)}}return s.sort((r,i)=>r.start.getTime()-i.start.getTime()),s.slice(0,Math.max(0,e))}function tt(n){let t=Mt[n.weekday]??"",e=Nt[n.month]??"",s=`${t} ${n.dayOfMonth} ${e}`.trim(),r=_e(n.range);return r?`${s}, ${r}`:s}function be({title:n,message:t="Chargement\u2026"}){return h`
    <ha-card>
      <div class="escalade-header">
        <span class="escalade-title">${n}</span>
      </div>
      <div class="escalade-loader-box">
        <div class="escalade-loader"></div>
        <div class="escalade-loader-text">${t}</div>
      </div>
    </ha-card>
  `}var Ht=720*60*1e3;function st(n){if(n.fetch_ok!==!1)return d;let t=n.last_success?new Date(n.last_success):null,e=t?.getTime();if(e!==void 0&&!Number.isNaN(e)&&Date.now()-e<Ht)return d;let s=e===void 0||Number.isNaN(e)?"date inconnue":t.toLocaleString("fr-FR",{dateStyle:"short",timeStyle:"short"});return h`
    <div class="escalade-stale" role="status">
      <span>⚠</span>
      <span>Calendrier du club injoignable — créneaux relevés le ${s}</span>
    </div>
  `}function nt({title:n,badgeText:t,highlight:e,onRefresh:s}){return h`
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
  `}var se={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},ne=n=>(...t)=>({_$litDirective$:n,values:t}),M=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,s){this._$Ct=t,this._$AM=e,this._$Ci=s}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};var rt="important",jt=" !"+rt,ve=ne(class extends M{constructor(n){if(super(n),n.type!==se.ATTRIBUTE||n.name!=="style"||n.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(n){return Object.keys(n).reduce((t,e)=>{let s=n[e];return s==null?t:t+`${e=e.includes("-")?e:e.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`},"")}update(n,[t]){let{style:e}=n.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(t)),this.render(t);for(let s of this.ft)t[s]==null&&(this.ft.delete(s),s.includes("-")?e.removeProperty(s):e[s]=null);for(let s in t){let r=t[s];if(r!=null){this.ft.add(s);let i=typeof r=="string"&&r.endsWith(jt);s.includes("-")||i?e.setProperty(s,i?r.slice(0,-11):r,i?rt:""):e[s]=r}}return y}});function it({slot:n}){let t=ee(n),e=We(t),s=Ye(n.days_left);return h`
    <div class="escalade-row escalade-row-${t}">
      <span
        class="escalade-dot"
        style=${ve({background:e.color})}
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
          style=${ve({color:e.color,background:e.bg})}
          >${Ke(t)}</span
        >
        <span class="escalade-delay escalade-delay-${s.type}">${s.text}</span>
      </div>
    </div>
  `}var ot=ne(class extends M{constructor(n){if(super(n),n.type!==se.ATTRIBUTE||n.name!=="class"||n.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(n){return" "+Object.keys(n).filter(t=>n[t]).join(" ")+" "}update(n,[t]){if(this.st===void 0){this.st=new Set,n.strings!==void 0&&(this.nt=new Set(n.strings.join(" ").split(/\s/).filter(s=>s!=="")));for(let s in t)t[s]&&!this.nt?.has(s)&&this.st.add(s);return this.render(t)}let e=n.element.classList;for(let s of this.st)s in t||(e.remove(s),this.st.delete(s));for(let s in t){let r=!!t[s];r===this.st.has(s)||this.nt?.has(s)||(r?(e.add(s),this.st.add(s)):(e.remove(s),this.st.delete(s)))}return y}});var zt={open:"Ouvert",closed:"Ferm\xE9"};function It({session:n,showTime:t,showCountdown:e,showStatus:s,accents:r}){let i=_e(n.range),o=Qe(n),a=zt[n.status],l=s&&a!==void 0,u=e&&o!=="",m=`--esc-accent:${Be(n.status,r)}`;return h`
    <div
      class=${ot({"esc-tile":!0,today:n.isToday,closed:n.status==="closed",tinted:n.status!=="unknown",[`status-${n.status}`]:!0})}
      style=${m}
    >
      <span class="esc-weekday">${Xe[n.weekday]??""}</span>
      <span class="esc-daynum">${n.dayOfMonth}</span>
      <span class="esc-month">${Ze[n.month]??""}</span>
      ${t&&i?h`<span class="esc-time">${i}</span>`:d}
      ${u||l?h`<div class="esc-bottom">
            <span class="esc-countdown">${u?o:""}</span>
            ${l?h`<span class="esc-status esc-status-${n.status}"
                  ><span class="esc-status-dot"></span>${a}</span
                >`:d}
          </div>`:d}
    </div>
  `}function at({sessions:n,columns:t,showTime:e,showCountdown:s,showStatus:r,accents:i}){return h`
    <div class="esc-tiles" style="--esc-columns:${t}">
      ${n.map(o=>It({session:o,showTime:e,showCountdown:s,showStatus:r,accents:i}))}
    </div>
  `}function xe(n){return h`<div class="esc-tiles-empty">${n}</div>`}var lt=O`
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
`;var ct=O`
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
    /* Accent assombri : la teinte se pose sous un texte clair, donc elle doit
       rester sombre. Une couleur vive en fond ferait tomber le contraste du
       gris secondaire sous le seuil. */
    --esc-accent-dark: color-mix(in srgb, var(--esc-accent, #2196f3) 62%, black);
    /* Les tuiles ordinaires ne reçoivent qu'une fraction de l'intensité : la
       séance du jour doit rester la plus visible de la grille, et un seul
       réglage vaut mieux que deux qu'il faudrait accorder. */
    --esc-tile-alpha: calc(var(--esc-intensity, 0.88) * 0.4);
    /* Le verre neutre reste en couleur de fond, la teinte est un calque
       d'image par-dessus : sur une photo, remplacer le verre par la teinte
       rendrait la tuile transparente et le texte illisible. */
    background-color: rgba(22, 22, 22, 0.62);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: var(--primary-text-color);
    /* min-width:0 sur une piste de grille : sans lui, un horaire un peu long
       force la colonne à s'élargir et la grille déborde de la card. */
    min-width: 0;
  }
  /* Plus d'opacité de retrait sur les séances fermées : elle existait pour les
     distinguer quand rien d'autre ne le faisait, et c'est désormais le rôle de
     la teinte de fond. Cumuler les deux faisait tomber le texte secondaire à
     4,39:1 sur une tuile fermée — sous le seuil de 4,5:1, et invisible à la
     relecture puisque chaque effet est inoffensif pris seul.

     Conséquence assumée : à « accent_intensity: 0 », plus rien ne distingue un
     soir fermé sans activer « show_status ». C'est un réglage explicite, pas
     un défaut. */
  /* Teinte de fond, appliquée dès que le statut est connu. Un statut non
     reconnu reste sur le verre neutre : lui donner une couleur en ferait une
     troisième catégorie de créneau. */
  .esc-tile.tinted {
    background-image: linear-gradient(
      color-mix(in srgb, var(--esc-accent-dark) calc(var(--esc-tile-alpha) * 100%), transparent),
      color-mix(in srgb, var(--esc-accent-dark) calc(var(--esc-tile-alpha) * 100%), transparent)
    );
  }
  .esc-tile.today {
    --esc-tile-alpha: var(--esc-intensity, 0.88);
    color: #fff;
  }
  /* Replis pour un navigateur sans color-mix — une WebView Android un peu
     ancienne. Statiques, donc par statut : la teinte y est figée aux couleurs
     du thème par défaut, mais la tuile du jour reste lisible. */
  @supports not (background: color-mix(in srgb, red 50%, blue)) {
    .esc-tile.today.status-open {
      background-color: rgba(47, 109, 50, 0.88);
    }
    .esc-tile.today.status-closed {
      background-color: rgba(151, 42, 33, 0.88);
    }
    .esc-tile.today.status-unknown {
      background-color: rgba(21, 97, 158, 0.88);
    }
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
  /* Variantes claires fixes, et non dérivées de l'accent : la couleur
     configurable est celle du fond. Une pastille qui suivrait un accent choisi
     très clair passerait sous 4,5:1 sur la tuile sombre, et rien ne le
     signalerait. */
  .esc-status-open {
    color: #81c784;
  }
  .esc-status-closed {
    color: #ef9a9a;
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
`;var qt={open:"Cr\xE9neaux ouverts",closed:"Cr\xE9neaux ferm\xE9s",unknown:"Statut non reconnu"},Bt={entity:"Entit\xE9 (sensor)",mode:"Pr\xE9sentation",title:"Titre personnalis\xE9 (mode liste)",days:"Jours affich\xE9s",statuses:"Statuts affich\xE9s",max:"Nombre maximal de cr\xE9neaux (mode liste)",count:"Nombre de tuiles (mode tuiles)",show_time:"Afficher l'horaire",show_countdown:"Afficher le d\xE9lai",show_status:"Afficher le statut",background:"Photo de fond (mode tuiles)",overlay:"Opacit\xE9 du voile",accent_open:"Couleur des cr\xE9neaux ouverts",accent_closed:"Couleur des cr\xE9neaux ferm\xE9s",accent_intensity:"Intensit\xE9 de la teinte"},Ft=[{name:"entity",required:!0,selector:{entity:{domain:"sensor",integration:"escalade_veauche"}}},{name:"mode",selector:{select:{mode:"dropdown",options:[{value:"list",label:"Liste (une ligne par cr\xE9neau)"},{value:"tiles",label:"Tuiles calendrier (compact)"}]}}},{name:"title",selector:{text:{}}},{name:"days",selector:{select:{multiple:!0,mode:"list",options:Z.map(n=>({value:String(n),label:ze[n]??String(n)}))}}},{name:"statuses",selector:{select:{multiple:!0,options:F.map(n=>({value:n,label:qt[n]??n}))}}},{name:"max",selector:{number:{min:1,max:60,mode:"box"}}},{name:"count",selector:{number:{min:1,max:4,mode:"box"}}},{name:"show_time",selector:{boolean:{}}},{name:"show_countdown",selector:{boolean:{}}},{name:"show_status",selector:{boolean:{}}},{name:"background",selector:{text:{}}},{name:"overlay",selector:{number:{min:0,max:1,step:.05,mode:"slider"}}},{name:"accent_open",selector:{color_rgb:{}}},{name:"accent_closed",selector:{color_rgb:{}}},{name:"accent_intensity",selector:{number:{min:0,max:1,step:.05,mode:"slider"}}}],Vt=n=>Bt[n.name]??n.name,V=class extends _{constructor(){super(...arguments);this._config={entity:""}}setConfig(e){this._config=e??{entity:""}}createRenderRoot(){return this}render(){if(!this.hass)return h``;let e={...this._config,days:this._config.days?.map(String)};return h`
      <ha-form
        .hass=${this.hass}
        .data=${e}
        .schema=${Ft}
        .computeLabel=${Vt}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `}_valueChanged(e){let s={...e.detail.value};for(let r of Object.keys(s)){if(r==="entity"){typeof s[r]!="string"&&(s[r]="");continue}r==="days"&&Array.isArray(s[r])&&(s[r]=s[r].map(Number).filter(o=>Number.isInteger(o)));let i=s[r];(i===""||i===void 0||i===null)&&delete s[r],Array.isArray(i)&&i.length===0&&delete s[r]}this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:s},bubbles:!0,composed:!0}))}};C([L({attribute:!1})],V.prototype,"hass",2),C([J()],V.prototype,"_config",2);customElements.get("escalade-card-editor")||customElements.define("escalade-card-editor",V);var Wt=6e4,w=class w extends _{constructor(){super(...arguments);this._id=++w._instances;this._retry=new te("card",()=>this.requestUpdate());this._hasRendered=!1;this._firstUpdateLogged=!1;this._tick=null;this._handleKeydown=e=>{e.key!=="Enter"&&e.key!==" "||(e.preventDefault(),this._handleTap())};this._handleTap=()=>{let e=this._config,s=e?.tap_action?.action??"more-info";if(!(s==="none"||!e)){if(s==="url"){let r=e.tap_action?.url_path;r&&window.open(r,"_blank","noopener");return}if(s==="navigate"){let r=e.tap_action?.navigation_path;if(!r)return;history.pushState(null,"",r),window.dispatchEvent(new CustomEvent("location-changed",{bubbles:!0,composed:!0}));return}e.entity&&this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:e.entity},bubbles:!0,composed:!0}))}};this._refresh=()=>{this._hass&&this._hass.callService("escalade_veauche","refresh",{}).catch(e=>{c("warn","card","le rafra\xEEchissement a \xE9chou\xE9 : %o",e)})}}set hass(e){this._hass=e,this._syncEntityState()}get hass(){return this._hass}setConfig(e){if(!e||typeof e!="object")throw c("error","card","setConfig rejet\xE9, config non-objet : %o",e),new Error("Configuration manquante ou invalide");let s="";typeof e.entity=="string"?s=e.entity:e.entity!==void 0&&e.entity!==null&&c("error","card","'entity' doit \xEAtre une cha\xEEne, re\xE7u %o \u2014 carte en attente de configuration",e.entity);let r=this._normalizeStatuses(e.statuses),i=this._normalizeDays(e.days),o=this._normalizeMode(e.mode),a=this._normalizeCount(e.count),l=this._normalizeOverlay(e.overlay),u=this._normalizeBackground(e.background),m=this._normalizeAccent("accent_open",e.accent_open),p=this._normalizeAccent("accent_closed",e.accent_closed),f=this._normalizeIntensity(e.accent_intensity),g;if(e.max!==void 0){let ie=Number(e.max);!Number.isInteger(ie)||ie<1?c("warn","card","'max' doit \xEAtre un entier positif, ignor\xE9 (re\xE7u : %o)",e.max):g=ie}c("info","card","#%d setConfig accept\xE9 (entity=%s, mode=%s, jours=%s, statuts=%s) \xE0 t=%dms",this._id,s||"(vide)",o,i?i.join(","):"tous",r?r.join(","):"tous",Math.round(performance.now()));let T=this._config;this._config={...e,entity:s,days:i,statuses:r,max:g,mode:o,count:a,overlay:l,background:u,accent_open:m,accent_closed:p,accent_intensity:f,show_time:e.show_time===!0,show_countdown:e.show_countdown===!0,show_status:e.show_status===!0},T?.entity!==this._config.entity&&(this._hasRendered=!1,this._lastTemplate=void 0,this._renderedEntityState=void 0,this._retry.reset()),this._syncEntityState()}_normalizeStatuses(e){if(e===void 0)return;if(!Array.isArray(e)){c("warn","card","'statuses' doit \xEAtre une liste, ignor\xE9 (re\xE7u : %o)",e);return}let s=[],r=[];for(let i of e){let o=je[String(i)]??i;F.includes(o)?s.includes(o)||s.push(o):r.push(i)}if(r.length&&c("warn","card","Statuts inconnus ignor\xE9s : %s. Valides : %s",r.join(", "),F.join(", ")),s.length===0){c("warn","card","Filtre de statuts vide, filtre ignor\xE9");return}return s}_normalizeDays(e){if(e===void 0)return;if(!Array.isArray(e)){c("warn","card","'days' doit \xEAtre une liste, ignor\xE9 (re\xE7u : %o)",e);return}let s=[],r=[];for(let i of e){let o=Number(i);Number.isInteger(o)&&Z.includes(o)?s.includes(o)||s.push(o):r.push(i)}if(r.length&&c("warn","card","Jours inconnus ignor\xE9s : %s. Attendu : 0 (lundi) \xE0 6 (dimanche)",r.join(", ")),s.length===0){c("warn","card","Filtre de jours vide, filtre ignor\xE9");return}return s.sort((i,o)=>i-o),s}_normalizeMode(e){if(e===void 0)return"list";let s=Ie[String(e)]??e;return ge.includes(s)?s:(c("warn","card","Mode '%s' inconnu, repli sur 'list'. Modes valides : %s",e,ge.join(", ")),"list")}_normalizeCount(e){if(e===void 0)return 3;let s=Number(e);return!Number.isInteger(s)||s<1||s>4?(c("warn","card","'count' doit \xEAtre un entier de 1 \xE0 4, repli sur 3 (re\xE7u : %o)",e),3):s}_normalizeOverlay(e){if(e===void 0)return .35;let s=Number(e);return!Number.isFinite(s)||s<0||s>1?(c("warn","card","'overlay' doit \xEAtre entre 0 et 1, repli sur 0.35 (re\xE7u : %o)",e),.35):s}_normalizeBackground(e){if(!(e===void 0||e==="none"||e==="")){if(typeof e!="string"||!/^[\w\-./:%?&=+@,~#]+$/.test(e)){c("warn","card","'background' ignor\xE9 : chemin inattendu (%o)",e);return}return e}}_normalizeIntensity(e){let s=Fe(e);return s===void 0&&e!==void 0&&c("warn","card","'accent_intensity' doit \xEAtre entre 0 et 1, repli sur %s (re\xE7u : %o)",Q,e),s??Q}_normalizeAccent(e,s){if(s===void 0)return;let r=qe(s);return r===void 0&&c("warn","card","'%s' ignor\xE9 : valeur inattendue (%o)",e,s),r}_syncEntityState(){let e=this._hass?.states;if(!e||!this._config?.entity){this._entityState=void 0;return}this._entityState=e[this._config.entity]}static getStubConfig(e,s,r){let i=e?.states??{},o=[...s??[],...r??[],...Object.keys(i)].filter(l=>l.startsWith("sensor."));return{entity:o.find(l=>i[l]?.attributes?.creneaux)??o.find(l=>l.includes("escalade"))??""}}static getConfigElement(){return document.createElement("escalade-card-editor")}get _detailsShown(){let e=this._config;return!!(e?.show_time||e?.show_countdown||e?.show_status)}getCardSize(){return this._config?.mode!=="tiles"?4:this._detailsShown?3:2}getGridOptions(){return this._config?.mode!=="tiles"?{columns:12,min_columns:6,rows:4,min_rows:2}:{columns:12,min_columns:6,rows:"auto",min_rows:1}}connectedCallback(){super.connectedCallback(),this._retry.reset(),customElements.get("ha-card")||customElements.whenDefined("ha-card").then(()=>{c("info","card","ha-card d\xE9fini apr\xE8s le premier rendu, re-rendu"),this.requestUpdate()}),this._tick??(this._tick=setInterval(()=>{this._config?.mode==="tiles"&&this.requestUpdate()},Wt))}disconnectedCallback(){super.disconnectedCallback(),this._retry.cancel(),this._tick!==null&&(clearInterval(this._tick),this._tick=null)}updated(){this._firstUpdateLogged||(this._firstUpdateLogged=!0,c("info","card","#%d premier rendu effectu\xE9 \xE0 t=%dms (donn\xE9es=%s)",this._id,Math.round(performance.now()),this._hasRendered?"oui":"non, loader")),this._renderedEntityState=this._entityState,this._hasRendered&&this.dispatchEvent(new CustomEvent("escalade-card-update",{bubbles:!0,composed:!0}))}shouldUpdate(e){return e.has("_config")||!this._hasRendered?!0:e.has("hass")?this._entityState!==this._renderedEntityState:!0}render(){try{return this._render()}catch(e){return c("error","card","render() a lev\xE9, repli sur le loader : %o",e),this._retry.schedule(),be({title:"Escalade Veauche",message:"Erreur \u2014 voir console"})}}_message(e,s){return this._config?.mode!=="tiles"?be({title:e,message:s}):this._tilesShell(xe(s),null)}_render(){let e=this._config?.title??"Cr\xE9neaux escalade";if(!this._config)return this._message(e,"En attente de configuration\u2026");if(!this._hass)return this._message(e,"Connexion \xE0 Home Assistant\u2026");let s=this._config.entity;if(!s)return this._message(e,"S\xE9lectionnez une entit\xE9");let r=this._hass.states;if(!r)return c("warn","card","hass.states absent, rendu du loader"),this._retry.schedule(),this._retry.exhausted?this._message(e,"Donn\xE9es Home Assistant indisponibles"):this._lastTemplate??this._message(e,"En attente de Home Assistant\u2026");let i=r[s];if(!i||i.state==="unavailable"||i.state==="unknown"){let l=i?`state=${i.state}`:"entit\xE9 introuvable";return c("warn","card","%s \u2014 %s %s",s,l,this._hasRendered?"(dernier rendu conserv\xE9)":"(loader)"),this._retry.schedule(),this._hasRendered&&!this._retry.exhausted?this._lastTemplate??this._message(e,"Chargement\u2026"):this._hasRendered?this._message(e,this._config?.mode==="tiles"?"Cr\xE9neaux indisponibles":`${s} indisponible`):(this._lastTemplate=this._message(e,this._retry.exhausted?this._config?.mode==="tiles"?"Cr\xE9neaux indisponibles":`Donn\xE9es indisponibles pour ${s}`:"En attente des donn\xE9es\u2026"),this._lastTemplate)}if(!("creneaux"in(i.attributes??{})))return c("error","card","%s ne porte pas \xAB creneaux \xBB : ce n'est pas un capteur de cette int\xE9gration",s),this._message(e,`${s} n'est pas un capteur Escalade`);this._retry.reset();let a=this._config.mode==="tiles"?this._renderTilesMode(i):this._renderCalendar(i,e);return this._lastTemplate=a,this._hasRendered=!0,a}_visibleSlots(e){let s=this._config?.days,r=this._config?.statuses,i=e;s&&(i=i.filter(a=>s.includes(a.weekday))),r&&(i=i.filter(a=>r.includes(ee(a))));let o=this._config?.max;return o!==void 0?i.slice(0,o):i}_renderCalendar(e,s){let r=e.attributes??{},i=Array.isArray(r.creneaux)?r.creneaux:[],o=this._visibleSlots(i),a=!!this._config?.days||!!this._config?.statuses,l=`${o.length}`;return h`
      <ha-card>
        ${nt({title:s,badgeText:l,highlight:a&&o.length>0,onRefresh:this._refresh})}
        ${st(r)}
        ${o.length===0?h`<div class="escalade-empty">
              ${i.length===0?"Aucun cr\xE9neau annonc\xE9 par le club":"Aucun cr\xE9neau ne correspond au filtre de cette carte"}
            </div>`:o.map(u=>it({slot:u}))}
      </ha-card>
    `}_tilesShell(e,s){let r=this._config,i=r?.background,a=(r?.tap_action?.action??"more-info")!=="none",l=Ve({background:i,overlay:r?.overlay??.35,intensity:r?.accent_intensity??Q}),u=s?`Escalade : prochaine s\xE9ance ${tt(s)}`:"Escalade : cr\xE9neaux";return h`
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
    `}_renderTilesMode(e){let s=e.attributes??{},r=Array.isArray(s.creneaux)?s.creneaux:[],i=this._config?.count??3,o=et(this._visibleSlots(r),new Date,i),a=o.length===0?xe("Aucune s\xE9ance \xE0 venir"):at({sessions:o,columns:i,showTime:this._config?.show_time===!0,showCountdown:this._config?.show_countdown===!0,showStatus:this._config?.show_status===!0,accents:{open:this._config?.accent_open,closed:this._config?.accent_closed}});return this._tilesShell(o.length===0?a:h`<div class="esc-tiles-body">${a}</div>`,o[0]??null)}};w.styles=[lt,ct],w._instances=0,C([L({attribute:!1})],w.prototype,"hass",1),C([J()],w.prototype,"_config",2);var re=w;Ge();window.loadCardHelpers?.().catch(n=>{c("warn","card","loadCardHelpers() a \xE9chou\xE9 : %o",n)});var E="escalade-card",Kt=5,dt=0;function Yt(){if(customElements.get(E)||dt>=Kt)return!1;dt++;try{return customElements.define(E,class extends re{}),c("warn","card","r\xE9-enregistr\xE9 \xE0 t=%dms : le registre d'\xE9l\xE9ments personnalis\xE9s avait \xE9t\xE9 remplac\xE9 depuis le premier enregistrement",Math.round(performance.now())),!0}catch(n){return c("error","card","r\xE9-enregistrement impossible : %o",n),!1}}customElements.get(E)?c("info","card","module d\xE9j\xE0 enregistr\xE9, ce chargement est ignor\xE9"):(customElements.define(E,re),c("info","card","\xE9l\xE9ment enregistr\xE9 \xE0 t=%dms apr\xE8s le d\xE9but du chargement de la page",Math.round(performance.now())));function Gt(){let n=0,t=e=>{if(e.localName==="hui-error-card"){let s=e;((s._config??s.config)?.message??"").includes(E)&&(e.dispatchEvent(new CustomEvent("ll-rebuild",{bubbles:!0,composed:!0})),n++);return}for(let s of[...e.shadowRoot?.children??[],...e.children])t(s)};return document.body&&t(document.body),n}for(let n of[0,50,150,400,1e3,2e3,4e3])window.setTimeout(()=>{try{Yt();let t=Gt();t>0&&c("warn","card","%d carte(s) d'erreur reconstruite(s) apr\xE8s %dms \u2014 la vue a \xE9t\xE9 b\xE2tie avant l'enregistrement de l'\xE9l\xE9ment",t,n)}catch(t){c("error","card","r\xE9paration des cartes d'erreur impossible : %o",t)}},n);window.customCards=window.customCards??[];window.customCards.some(n=>n.type===E)||window.customCards.push({type:E,name:"Escalade Veauche",description:"Affiche les cr\xE9neaux d'ouverture des Cimes Veauchoises"});export{re as EscaladeCard};
