(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,19455,e=>{"use strict";let t,a;var s=e.i(43476),r=e.i(49838),o=e.i(7670);let i=e=>"boolean"==typeof e?`${e}`:0===e?"0":e,l=o.clsx;var n=e.i(71645);let d=(t="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2",a={variants:{variant:{default:"bg-violet-600 text-white hover:bg-violet-700 focus:ring-violet-500",secondary:"bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400",destructive:"bg-red-500 text-white hover:bg-red-600 focus:ring-red-400",outline:"border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-400",ghost:"text-gray-600 hover:bg-gray-100 focus:ring-gray-400",success:"bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-400"},size:{sm:"px-3 py-1.5 text-sm",md:"px-4 py-2 text-sm",lg:"px-6 py-3 text-base",icon:"p-2"}},defaultVariants:{variant:"default",size:"md"}},e=>{var s;if((null==a?void 0:a.variants)==null)return l(t,null==e?void 0:e.class,null==e?void 0:e.className);let{variants:r,defaultVariants:o}=a,n=Object.keys(r).map(t=>{let a=null==e?void 0:e[t],s=null==o?void 0:o[t];if(null===a)return null;let l=i(a)||i(s);return r[t][l]}),d=e&&Object.entries(e).reduce((e,t)=>{let[a,s]=t;return void 0===s||(e[a]=s),e},{});return l(t,n,null==a||null==(s=a.compoundVariants)?void 0:s.reduce((e,t)=>{let{class:a,className:s,...r}=t;return Object.entries(r).every(e=>{let[t,a]=e;return Array.isArray(a)?a.includes({...o,...d}[t]):({...o,...d})[t]===a})?[...e,a,s]:e},[]),null==e?void 0:e.class,null==e?void 0:e.className)}),c=(0,n.forwardRef)(({className:e,variant:t,size:a,loading:o,children:i,disabled:l,...n},c)=>(0,s.jsxs)("button",{ref:c,className:(0,r.cn)(d({variant:t,size:a}),e),disabled:l||o,...n,children:[o&&(0,s.jsxs)("svg",{className:"animate-spin h-4 w-4",fill:"none",viewBox:"0 0 24 24",children:[(0,s.jsx)("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4"}),(0,s.jsx)("path",{className:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"})]}),i]}));c.displayName="Button",e.s(["Button",0,c],19455)},52149,66595,15288,32036,e=>{"use strict";var t=e.i(43476),a=e.i(56420);let s=(0,a.default)("bell",[["path",{d:"M10.268 21a2 2 0 0 0 3.464 0",key:"vwvbt9"}],["path",{d:"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",key:"11g9vi"}]]),r=(0,a.default)("search",[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]]);e.s(["Search",0,r],66595),e.s(["Topbar",0,function({title:e,subtitle:a}){return(0,t.jsxs)("header",{className:"flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("h1",{className:"text-base font-semibold text-gray-900",children:e}),a&&(0,t.jsx)("p",{className:"text-xs text-gray-400",children:a})]}),(0,t.jsxs)("div",{className:"flex items-center gap-3",children:[(0,t.jsx)("button",{className:"p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors",children:(0,t.jsx)(r,{size:17})}),(0,t.jsx)("button",{className:"relative p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors",children:(0,t.jsx)(s,{size:17})})]})]})}],52149);var o=e.i(49838);e.s(["Card",0,function({children:e,className:a}){return(0,t.jsx)("div",{className:(0,o.cn)("bg-white rounded-xl border border-gray-200 shadow-sm",a),children:e})},"CardBody",0,function({children:e,className:a}){return(0,t.jsx)("div",{className:(0,o.cn)("p-5",a),children:e})},"CardHeader",0,function({children:e,className:a}){return(0,t.jsx)("div",{className:(0,o.cn)("px-5 py-4 border-b border-gray-100",a),children:e})}],15288),e.s(["fmtBRL",0,function(e){return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(e)},"fmtDate",0,function(e){return new Intl.DateTimeFormat("pt-BR").format(new Date(e))},"fmtPercent",0,function(e){return`${e.toFixed(1)}%`},"fmtPhone",0,function(e){let t=e.replace(/\D/g,"");return 11===t.length?`(${t.slice(0,2)}) ${t.slice(2,7)}-${t.slice(7)}`:10===t.length?`(${t.slice(0,2)}) ${t.slice(2,6)}-${t.slice(6)}`:e},"mesAno",0,function(e,t){return new Date(t,e-1).toLocaleDateString("pt-BR",{month:"long",year:"numeric"})}],32036)},87819,e=>{"use strict";e.s(["calcularComissao",0,function(e,t){return parseFloat((e*t/100).toFixed(2))},"calcularMRR",0,function(e){return e.reduce((e,t)=>"mensal"===t.periodicidade?e+t.valor_pago:"semestral"===t.periodicidade?e+t.valor_pago/6:"anual"===t.periodicidade?e+t.valor_pago/12:e,0)},"obterValorPlano",0,function(e,t){return"mensal"===t?e.valor_mensal:"semestral"===t?e.valor_semestral:"anual"===t?e.valor_anual:e.valor_mensal}])},95918,e=>{"use strict";var t=e.i(43476),a=e.i(52149),s=e.i(15288),r=e.i(19455),o=e.i(11795),i=e.i(32036),l=e.i(87819),n=e.i(26091),d=e.i(56420);let c=(0,d.default)("download",[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]]),m=(0,d.default)("printer",[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]]);var p=e.i(71645);let x=[{id:"assinaturas",title:"Relatório de Assinaturas",desc:"Lista completa com status e valores",color:"violet"},{id:"comissoes",title:"Relatório de Comissões",desc:"Comissões por profissional no período",color:"emerald"},{id:"inadimplencia",title:"Relatório de Inadimplência",desc:"Assinantes com status inadimplente ou suspenso",color:"orange"},{id:"receita",title:"Relatório de Receita (MRR)",desc:"Receita recorrente mensal por plano",color:"blue"}];function u(e,t){let a=window.open("","_blank","width=900,height=700");a&&(a.document.write(`<!DOCTYPE html><html><head><title>${e}</title>
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
    .card { page-break-inside: avoid; }
    .total-row { background: #f9fafb; font-weight: bold; }
    @media print { body { padding: 0; } }
  </style></head><body>${t}</body></html>`),a.document.close(),a.print())}e.s(["default",0,function(){let e=(0,o.createClient)(),d=new Date,[h,g]=(0,p.useState)(d.getMonth()+1),[f,b]=(0,p.useState)(d.getFullYear()),[v,y]=(0,p.useState)(null),[j,w]=(0,p.useState)([]),[N,$]=(0,p.useState)(!1);async function R(){try{let{data:t}=await e.from("atendimentos").select("*, profissionais(id, nome, funcao, comissao_percentual), servicos(nome), assinaturas(periodicidade, planos(valor_mensal, valor_semestral, valor_anual))").gte("created_at",new Date(f,h-1,1).toISOString()).lt("created_at",new Date(f,h,1).toISOString()),a={};(t??[]).forEach(e=>{let t=e.profissionais;if(!t)return;a[t.id]||(a[t.id]={id:t.id,nome:t.nome,funcao:t.funcao,comissaoPercentual:t.comissao_percentual,atendimentos:[],totalComissao:0,totalAtendimentos:0});let s=e.assinaturas,r=s?.planos,o=s?.periodicidade||"mensal",i=0;r&&(i="mensal"===o?r.valor_mensal:"semestral"===o?r.valor_semestral:r.valor_anual);let l=i*t.comissao_percentual/100,n=e.servicos?.nome||"Serviço";a[t.id].atendimentos.push({servico:n,valor:l}),a[t.id].totalComissao+=l,a[t.id].totalAtendimentos++}),w(Object.values(a).sort((e,t)=>t.totalComissao-e.totalComissao))}catch(e){console.error("Erro ao carregar comissões:",e)}}async function C(t){y(t);try{if("assinaturas"===t){let{data:t}=await e.from("assinaturas").select("*, clientes(nome, telefone, email), planos(nome)").order("status"),a=t??[],s=`
          <h1>Relat\xf3rio de Assinaturas</h1>
          <div class="sub">Gerado em ${(0,i.fmtDate)(new Date)} \xb7 ${a.length} registros</div>
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
                  <td>${(0,i.fmtDate)(e.proxima_cobranca)}</td>
                  <td>${(0,i.fmtBRL)(e.valor_pago)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>`;u("Relatório de Assinaturas",s)}if("comissoes"===t){await R();let e=j.reduce((e,t)=>e+t.totalComissao,0),t=j.reduce((e,t)=>e+t.totalAtendimentos,0),a=`
          <h1>Clube+ — Relat\xf3rio Mensal de Comiss\xf5es</h1>
          <div class="sub">${(0,i.mesAno)(h,f)} \xb7 Gerado em ${(0,i.fmtDate)(new Date)}</div>

          ${j.map(e=>`
            <div class="card" style="margin-bottom: 24px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <div style="margin-bottom: 12px;">
                <h3 style="margin: 0; font-size: 14px; font-weight: bold; color: #111;">${e.nome}</h3>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">${e.funcao} \xb7 ${e.comissaoPercentual}% comiss\xe3o</p>
              </div>

              <table style="width: 100%; margin-bottom: 12px; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="border-bottom: 1px solid #ddd;">
                    <th style="text-align: left; padding: 6px 0; font-size: 11px; text-transform: uppercase; color: #666;">Servi\xe7o</th>
                    <th style="text-align: right; padding: 6px 0; font-size: 11px; text-transform: uppercase; color: #666;">Comiss\xe3o</th>
                  </tr>
                </thead>
                <tbody>
                  ${e.atendimentos.map(e=>`
                    <tr style="border-bottom: 1px solid #eee;">
                      <td style="padding: 6px 0;">${e.servico}</td>
                      <td style="text-align: right; padding: 6px 0;">${(0,i.fmtBRL)(e.valor)}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>

              <div style="padding-top: 12px; border-top: 2px solid #e5e7eb; display: flex; justify-content: space-between;">
                <span style="font-size: 12px; color: #666;">Total de atendimentos: <strong>${e.totalAtendimentos}</strong></span>
                <span style="font-size: 12px; color: #666;">Total: <strong style="color: #059669; font-size: 14px;">${(0,i.fmtBRL)(e.totalComissao)}</strong></span>
              </div>
            </div>
          `).join("")}

          <div class="total-row" style="padding: 16px; background: #f9fafb; border-top: 3px solid #059669; margin-top: 24px;">
            <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: bold;">
              <span>Total Geral do Sal\xe3o</span>
              <span style="color: #059669; font-size: 16px;">${(0,i.fmtBRL)(e)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 8px;">
              <span>${t} atendimentos realizados</span>
              <span>${j.length} profissionais</span>
            </div>
          </div>`;u(`Relat\xf3rio de Comiss\xf5es — ${(0,i.mesAno)(h,f)}`,a)}if("inadimplencia"===t){let{data:t}=await e.from("assinaturas").select("*, clientes(nome, telefone, whatsapp), planos(nome)").in("status",["inadimplente","suspensa"]),a=t??[],s=`
          <h1>Relat\xf3rio de Inadimpl\xeancia</h1>
          <div class="sub">Gerado em ${(0,i.fmtDate)(new Date)} \xb7 ${a.length} assinantes</div>
          <table>
            <thead><tr><th>Cliente</th><th>Telefone</th><th>Plano</th><th>Status</th><th>\xdaltima Renova\xe7\xe3o</th><th>Valor</th></tr></thead>
            <tbody>
              ${a.map(e=>`
                <tr>
                  <td>${e.clientes?.nome}</td>
                  <td>${e.clientes?.telefone}</td>
                  <td>${e.planos?.nome}</td>
                  <td><span class="badge ${e.status}">${e.status}</span></td>
                  <td>${(0,i.fmtDate)(e.data_renovacao)}</td>
                  <td>${(0,i.fmtBRL)(e.valor_pago)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>`;u("Relatório de Inadimplência",s)}if("receita"===t){let{data:t}=await e.from("assinaturas").select("*, planos(nome, valor_mensal)").eq("status","ativa"),a=t??[],s=(0,l.calcularMRR)(a),r={};a.forEach(e=>{let t=e.planos,a=t?.nome||"Sem plano";r[a]||(r[a]={nome:a,count:0,receita:0}),r[a].count++;let s="mensal"===e.periodicidade?e.valor_pago:"semestral"===e.periodicidade?e.valor_pago/6:e.valor_pago/12;r[a].receita+=s});let o=`
          <h1>Relat\xf3rio de Receita — MRR</h1>
          <div class="sub">Gerado em ${(0,i.fmtDate)(new Date)} \xb7 MRR Total: ${(0,i.fmtBRL)(s)}</div>
          <table>
            <thead><tr><th>Plano</th><th>Assinantes Ativos</th><th>Receita Mensal</th><th>% do MRR</th></tr></thead>
            <tbody>
              ${Object.values(r).map(e=>`
                <tr>
                  <td>${e.nome}</td><td>${e.count}</td>
                  <td><strong>${(0,i.fmtBRL)(e.receita)}</strong></td>
                  <td>${s>0?(0,i.fmtPercent)(e.receita/s*100):"—"}</td>
                </tr>
              `).join("")}
              <tr class="total-row"><td><strong>Total</strong></td><td><strong>${a.length}</strong></td><td><strong>${(0,i.fmtBRL)(s)}</strong></td><td>100%</td></tr>
            </tbody>
          </table>`;u("Relatório de Receita MRR",o)}}finally{y(null)}}(0,p.useEffect)(()=>{N&&R()},[h,f,N]);let z={violet:"border-t-violet-500",emerald:"border-t-emerald-500",orange:"border-t-orange-500",blue:"border-t-blue-500"},_=j.reduce((e,t)=>e+t.totalComissao,0),B=j.reduce((e,t)=>e+t.totalAtendimentos,0);return(0,t.jsxs)("div",{className:"flex flex-col flex-1 overflow-hidden",children:[(0,t.jsx)(a.Topbar,{title:"Relatórios",subtitle:"Exporte, visualize e imprima"}),(0,t.jsxs)("main",{className:"flex-1 overflow-y-auto p-6 space-y-6",children:[(0,t.jsxs)("div",{className:"flex items-center gap-3",children:[(0,t.jsx)("span",{className:"text-sm text-gray-500",children:"Período:"}),(0,t.jsx)("select",{value:h,onChange:e=>g(Number(e.target.value)),className:"rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm",children:Array.from({length:12},(e,a)=>(0,t.jsx)("option",{value:a+1,children:new Date(2024,a).toLocaleDateString("pt-BR",{month:"long"})},a+1))}),(0,t.jsx)("select",{value:f,onChange:e=>b(Number(e.target.value)),className:"rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm",children:[2024,2025,2026].map(e=>(0,t.jsx)("option",{value:e,children:e},e))})]}),(0,t.jsx)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:x.map(e=>(0,t.jsx)(s.Card,{className:`border-t-4 ${z[e.color]}`,children:(0,t.jsxs)(s.CardBody,{className:"flex items-center gap-4",children:[(0,t.jsx)("div",{className:"w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0",children:(0,t.jsx)(n.FileText,{size:20,className:"text-gray-500"})}),(0,t.jsxs)("div",{className:"flex-1",children:[(0,t.jsx)("div",{className:"font-semibold text-gray-900 text-sm",children:e.title}),(0,t.jsx)("div",{className:"text-xs text-gray-400 mt-0.5",children:e.desc})]}),(0,t.jsx)(r.Button,{size:"sm",variant:"outline",loading:v===e.id,onClick:()=>{"comissoes"===e.id&&$(!N),C(e.id)},children:"comissoes"===e.id&&N?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(m,{size:14})," Imprimir"]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(c,{size:14})," Gerar"]})})]})},e.id))}),N&&(0,t.jsxs)("div",{className:"space-y-6",children:[(0,t.jsxs)("div",{className:"border-b border-gray-200 pb-6",children:[(0,t.jsx)("h1",{className:"text-3xl font-bold text-gray-900",children:"Clube+ Assinaturas"}),(0,t.jsxs)("p",{className:"text-lg text-gray-600 mt-2",children:["Relatório Mensal de Comissões — ",(0,i.mesAno)(h,f)]}),(0,t.jsxs)("p",{className:"text-sm text-gray-400 mt-1",children:["Gerado em ",(0,i.fmtDate)(new Date)]})]}),(0,t.jsx)("div",{className:"space-y-4",children:j.map(e=>(0,t.jsx)(s.Card,{className:"border-l-4 border-l-violet-500",children:(0,t.jsxs)(s.CardBody,{children:[(0,t.jsxs)("div",{className:"flex items-start justify-between mb-4",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("h3",{className:"font-bold text-gray-900",children:e.nome}),(0,t.jsxs)("p",{className:"text-sm text-gray-500",children:[e.funcao," • ",e.comissaoPercentual,"% comissão"]})]}),(0,t.jsxs)("div",{className:"text-right",children:[(0,t.jsx)("p",{className:"text-2xl font-bold text-emerald-600",children:(0,i.fmtBRL)(e.totalComissao)}),(0,t.jsxs)("p",{className:"text-xs text-gray-500",children:[e.totalAtendimentos," atendimento(s)"]})]})]}),e.atendimentos.length>0&&(0,t.jsxs)("div",{className:"rounded-lg bg-gray-50 p-3",children:[(0,t.jsx)("div",{className:"text-xs font-semibold text-gray-600 mb-2 uppercase",children:"Serviços realizados"}),(0,t.jsx)("div",{className:"space-y-1.5",children:e.atendimentos.map((e,a)=>(0,t.jsxs)("div",{className:"flex justify-between text-sm",children:[(0,t.jsx)("span",{className:"text-gray-700",children:e.servico}),(0,t.jsx)("span",{className:"font-medium text-gray-900",children:(0,i.fmtBRL)(e.valor)})]},a))})]})]})},e.id))}),j.length>0&&(0,t.jsx)(s.Card,{className:"border-t-4 border-t-emerald-600 bg-gradient-to-r from-emerald-50 to-white",children:(0,t.jsxs)(s.CardBody,{children:[(0,t.jsxs)("div",{className:"flex items-center justify-between",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{className:"text-sm text-gray-600",children:"Total Geral do Salão"}),(0,t.jsxs)("p",{className:"text-xs text-gray-500 mt-1",children:[B," atendimentos • ",j.length," profissionais"]})]}),(0,t.jsx)("div",{className:"text-right",children:(0,t.jsx)("p",{className:"text-3xl font-bold text-emerald-600",children:(0,i.fmtBRL)(_)})})]}),(0,t.jsxs)(r.Button,{className:"w-full mt-4",onClick:()=>window.print(),children:[(0,t.jsx)(m,{size:16})," Imprimir Relatório"]})]})})]})]})]})}],95918)}]);