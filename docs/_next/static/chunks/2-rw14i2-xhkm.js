(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,19455,e=>{"use strict";let t,a;var r=e.i(43476),s=e.i(49838),o=e.i(7670);let l=e=>"boolean"==typeof e?`${e}`:0===e?"0":e,n=o.clsx;var i=e.i(71645);let d=(t="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2",a={variants:{variant:{default:"bg-violet-600 text-white hover:bg-violet-700 focus:ring-violet-500",secondary:"bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400",destructive:"bg-red-500 text-white hover:bg-red-600 focus:ring-red-400",outline:"border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-400",ghost:"text-gray-600 hover:bg-gray-100 focus:ring-gray-400",success:"bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-400"},size:{sm:"px-3 py-1.5 text-sm",md:"px-4 py-2 text-sm",lg:"px-6 py-3 text-base",icon:"p-2"}},defaultVariants:{variant:"default",size:"md"}},e=>{var r;if((null==a?void 0:a.variants)==null)return n(t,null==e?void 0:e.class,null==e?void 0:e.className);let{variants:s,defaultVariants:o}=a,i=Object.keys(s).map(t=>{let a=null==e?void 0:e[t],r=null==o?void 0:o[t];if(null===a)return null;let n=l(a)||l(r);return s[t][n]}),d=e&&Object.entries(e).reduce((e,t)=>{let[a,r]=t;return void 0===r||(e[a]=r),e},{});return n(t,i,null==a||null==(r=a.compoundVariants)?void 0:r.reduce((e,t)=>{let{class:a,className:r,...s}=t;return Object.entries(s).every(e=>{let[t,a]=e;return Array.isArray(a)?a.includes({...o,...d}[t]):({...o,...d})[t]===a})?[...e,a,r]:e},[]),null==e?void 0:e.class,null==e?void 0:e.className)}),c=(0,i.forwardRef)(({className:e,variant:t,size:a,loading:o,children:l,disabled:n,...i},c)=>(0,r.jsxs)("button",{ref:c,className:(0,s.cn)(d({variant:t,size:a}),e),disabled:n||o,...i,children:[o&&(0,r.jsxs)("svg",{className:"animate-spin h-4 w-4",fill:"none",viewBox:"0 0 24 24",children:[(0,r.jsx)("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4"}),(0,r.jsx)("path",{className:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"})]}),l]}));c.displayName="Button",e.s(["Button",0,c],19455)},52149,66595,15288,32036,e=>{"use strict";var t=e.i(43476),a=e.i(56420);let r=(0,a.default)("bell",[["path",{d:"M10.268 21a2 2 0 0 0 3.464 0",key:"vwvbt9"}],["path",{d:"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",key:"11g9vi"}]]),s=(0,a.default)("search",[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]]);e.s(["Search",0,s],66595),e.s(["Topbar",0,function({title:e,subtitle:a}){return(0,t.jsxs)("header",{className:"flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("h1",{className:"text-base font-semibold text-gray-900",children:e}),a&&(0,t.jsx)("p",{className:"text-xs text-gray-400",children:a})]}),(0,t.jsxs)("div",{className:"flex items-center gap-3",children:[(0,t.jsx)("button",{className:"p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors",children:(0,t.jsx)(s,{size:17})}),(0,t.jsx)("button",{className:"relative p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors",children:(0,t.jsx)(r,{size:17})})]})]})}],52149);var o=e.i(49838);e.s(["Card",0,function({children:e,className:a}){return(0,t.jsx)("div",{className:(0,o.cn)("bg-white rounded-xl border border-gray-200 shadow-sm",a),children:e})},"CardBody",0,function({children:e,className:a}){return(0,t.jsx)("div",{className:(0,o.cn)("p-5",a),children:e})},"CardHeader",0,function({children:e,className:a}){return(0,t.jsx)("div",{className:(0,o.cn)("px-5 py-4 border-b border-gray-100",a),children:e})}],15288),e.s(["fmtBRL",0,function(e){return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(e)},"fmtDate",0,function(e){return new Intl.DateTimeFormat("pt-BR").format(new Date(e))},"fmtPercent",0,function(e){return`${e.toFixed(1)}%`},"fmtPhone",0,function(e){let t=e.replace(/\D/g,"");return 11===t.length?`(${t.slice(0,2)}) ${t.slice(2,7)}-${t.slice(7)}`:10===t.length?`(${t.slice(0,2)}) ${t.slice(2,6)}-${t.slice(6)}`:e},"mesAno",0,function(e,t){return new Date(t,e-1).toLocaleDateString("pt-BR",{month:"long",year:"numeric"})}],32036)},87819,e=>{"use strict";e.s(["calcularComissao",0,function(e,t){return parseFloat((e*t/100).toFixed(2))},"calcularMRR",0,function(e){return e.reduce((e,t)=>"mensal"===t.periodicidade?e+t.valor_pago:"semestral"===t.periodicidade?e+t.valor_pago/6:"anual"===t.periodicidade?e+t.valor_pago/12:e,0)},"obterValorPlano",0,function(e,t){return"mensal"===t?e.valor_mensal:"semestral"===t?e.valor_semestral:"anual"===t?e.valor_anual:e.valor_mensal}])},95918,e=>{"use strict";var t=e.i(43476),a=e.i(52149),r=e.i(15288),s=e.i(19455),o=e.i(11795),l=e.i(32036),n=e.i(87819),i=e.i(26091);let d=(0,e.i(56420).default)("download",[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]]);var c=e.i(71645);let m=[{id:"assinaturas",title:"Relatório de Assinaturas",desc:"Lista completa com status e valores",color:"violet"},{id:"comissoes",title:"Relatório de Comissões",desc:"Comissões por profissional no período",color:"emerald"},{id:"inadimplencia",title:"Relatório de Inadimplência",desc:"Assinantes com status inadimplente ou suspenso",color:"orange"},{id:"receita",title:"Relatório de Receita (MRR)",desc:"Receita recorrente mensal por plano",color:"blue"}];function u(e,t){let a=window.open("","_blank","width=900,height=700");a&&(a.document.write(`<!DOCTYPE html><html><head><title>${e}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 13px; padding: 32px; color: #111; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    .sub { color: #666; font-size: 12px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f4f4f8; text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; color: #555; }
    td { padding: 8px 12px; border-bottom: 1px solid #eee; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
    .ativa { background: #d1fae5; color: #065f46; }
    .cancelada { background: #fee2e2; color: #991b1b; }
    .inadimplente { background: #ffedd5; color: #9a3412; }
    .suspensa { background: #fef9c3; color: #854d0e; }
    @media print { body { padding: 0; } }
  </style></head><body>${t}</body></html>`),a.document.close(),a.print())}e.s(["default",0,function(){let e=(0,o.createClient)(),h=new Date,[g,p]=(0,c.useState)(h.getMonth()+1),[f,x]=(0,c.useState)(h.getFullYear()),[b,v]=(0,c.useState)(null);async function y(t){v(t);try{if("assinaturas"===t){let{data:t}=await e.from("assinaturas").select("*, clientes(nome, telefone, email), planos(nome)").order("status"),a=t??[],r=`
          <h1>Relat\xf3rio de Assinaturas</h1>
          <div class="sub">Gerado em ${(0,l.fmtDate)(new Date)} \xb7 ${a.length} registros</div>
          <table>
            <thead><tr><th>Cliente</th><th>Telefone</th><th>Plano</th><th>Status</th><th>Cr\xe9ditos</th><th>Pr\xf3x. Cobran\xe7a</th><th>Valor</th></tr></thead>
            <tbody>
              ${a.map(e=>`
                <tr>
                  <td>${e.clientes?.nome||"—"}</td>
                  <td>${e.clientes?.telefone||"—"}</td>
                  <td>${e.planos?.nome||"—"}</td>
                  <td><span class="badge ${e.status}">${e.status}</span></td>
                  <td>${e.creditos_disponiveis}/${e.creditos_totais}</td>
                  <td>${(0,l.fmtDate)(e.proxima_cobranca)}</td>
                  <td>${(0,l.fmtBRL)(e.valor_pago)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>`;u("Relatório de Assinaturas",r)}if("comissoes"===t){let{data:t}=await e.from("comissoes").select("*, profissionais(nome, funcao), atendimentos(*, servicos(nome))").eq("periodo_mes",g).eq("periodo_ano",f),a=t??[],r={};a.forEach(e=>{let t=e.profissional_id,a=e.profissionais;r[t]||(r[t]={nome:a?.nome||"—",funcao:a?.funcao||"—",total:0,qtd:0}),r[t].total+=e.valor,r[t].qtd++});let s=`
          <h1>Relat\xf3rio de Comiss\xf5es — ${(0,l.mesAno)(g,f)}</h1>
          <div class="sub">Gerado em ${(0,l.fmtDate)(new Date)} \xb7 ${a.length} atendimentos</div>
          <table>
            <thead><tr><th>Profissional</th><th>Fun\xe7\xe3o</th><th>Atendimentos</th><th>Total Comiss\xe3o</th></tr></thead>
            <tbody>
              ${Object.values(r).map(e=>`
                <tr>
                  <td>${e.nome}</td><td>${e.funcao}</td><td>${e.qtd}</td><td><strong>${(0,l.fmtBRL)(e.total)}</strong></td>
                </tr>
              `).join("")}
              <tr><td colspan="2"><strong>Total</strong></td><td><strong>${a.length}</strong></td><td><strong>${(0,l.fmtBRL)(a.reduce((e,t)=>e+t.valor,0))}</strong></td></tr>
            </tbody>
          </table>`;u("Relatório de Comissões",s)}if("inadimplencia"===t){let{data:t}=await e.from("assinaturas").select("*, clientes(nome, telefone, whatsapp), planos(nome)").in("status",["inadimplente","suspensa"]),a=t??[],r=`
          <h1>Relat\xf3rio de Inadimpl\xeancia</h1>
          <div class="sub">Gerado em ${(0,l.fmtDate)(new Date)} \xb7 ${a.length} assinantes</div>
          <table>
            <thead><tr><th>Cliente</th><th>Telefone</th><th>Plano</th><th>Status</th><th>\xdaltima Renova\xe7\xe3o</th><th>Valor</th></tr></thead>
            <tbody>
              ${a.map(e=>`
                <tr>
                  <td>${e.clientes?.nome}</td>
                  <td>${e.clientes?.telefone}</td>
                  <td>${e.planos?.nome}</td>
                  <td><span class="badge ${e.status}">${e.status}</span></td>
                  <td>${(0,l.fmtDate)(e.data_renovacao)}</td>
                  <td>${(0,l.fmtBRL)(e.valor_pago)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>`;u("Relatório de Inadimplência",r)}if("receita"===t){let{data:t}=await e.from("assinaturas").select("*, planos(nome, valor_mensal)").eq("status","ativa"),a=t??[],r=(0,n.calcularMRR)(a),s={};a.forEach(e=>{let t=e.planos,a=t?.nome||"Sem plano";s[a]||(s[a]={nome:a,count:0,receita:0}),s[a].count++;let r="mensal"===e.periodicidade?e.valor_pago:"semestral"===e.periodicidade?e.valor_pago/6:e.valor_pago/12;s[a].receita+=r});let o=`
          <h1>Relat\xf3rio de Receita — MRR</h1>
          <div class="sub">Gerado em ${(0,l.fmtDate)(new Date)} \xb7 MRR Total: ${(0,l.fmtBRL)(r)}</div>
          <table>
            <thead><tr><th>Plano</th><th>Assinantes Ativos</th><th>Receita Mensal</th><th>% do MRR</th></tr></thead>
            <tbody>
              ${Object.values(s).map(e=>`
                <tr>
                  <td>${e.nome}</td><td>${e.count}</td>
                  <td><strong>${(0,l.fmtBRL)(e.receita)}</strong></td>
                  <td>${r>0?(0,l.fmtPercent)(e.receita/r*100):"—"}</td>
                </tr>
              `).join("")}
              <tr><td><strong>Total</strong></td><td><strong>${a.length}</strong></td><td><strong>${(0,l.fmtBRL)(r)}</strong></td><td>100%</td></tr>
            </tbody>
          </table>`;u("Relatório de Receita MRR",o)}}finally{v(null)}}let $={violet:"border-t-violet-500",emerald:"border-t-emerald-500",orange:"border-t-orange-500",blue:"border-t-blue-500"};return(0,t.jsxs)("div",{className:"flex flex-col flex-1 overflow-hidden",children:[(0,t.jsx)(a.Topbar,{title:"Relatórios",subtitle:"Exporte e imprima"}),(0,t.jsxs)("main",{className:"flex-1 overflow-y-auto p-6 space-y-6",children:[(0,t.jsxs)("div",{className:"flex items-center gap-3",children:[(0,t.jsx)("span",{className:"text-sm text-gray-500",children:"Período (comissões):"}),(0,t.jsx)("select",{value:g,onChange:e=>p(Number(e.target.value)),className:"rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm",children:Array.from({length:12},(e,a)=>(0,t.jsx)("option",{value:a+1,children:new Date(2024,a).toLocaleDateString("pt-BR",{month:"long"})},a+1))}),(0,t.jsx)("select",{value:f,onChange:e=>x(Number(e.target.value)),className:"rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm",children:[2024,2025,2026].map(e=>(0,t.jsx)("option",{value:e,children:e},e))})]}),(0,t.jsx)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:m.map(e=>(0,t.jsx)(r.Card,{className:`border-t-4 ${$[e.color]}`,children:(0,t.jsxs)(r.CardBody,{className:"flex items-center gap-4",children:[(0,t.jsx)("div",{className:"w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0",children:(0,t.jsx)(i.FileText,{size:20,className:"text-gray-500"})}),(0,t.jsxs)("div",{className:"flex-1",children:[(0,t.jsx)("div",{className:"font-semibold text-gray-900 text-sm",children:e.title}),(0,t.jsx)("div",{className:"text-xs text-gray-400 mt-0.5",children:e.desc})]}),(0,t.jsxs)(s.Button,{size:"sm",variant:"outline",loading:b===e.id,onClick:()=>y(e.id),children:[(0,t.jsx)(d,{size:14})," Gerar PDF"]})]})},e.id))})]})]})}],95918)}]);