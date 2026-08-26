import type { Account, Category } from "@/hooks/use-accounts";
import { getCountry } from "@/lib/countries";

type ExportAccount = Account & { _country?: { flag: string; name: string } | null };

function escapeForScript(json: string) {
  return json.replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

export function buildAccountsHtml(accounts: Account[], categories: Category[]) {
  const data: ExportAccount[] = accounts.map((a) => {
    const c = getCountry(a.country_code);
    return { ...a, _country: c ? { flag: c.flag, name: c.name } : null };
  });

  const payload = escapeForScript(JSON.stringify({ accounts: data, categories }));
  const generatedAt = new Date().toLocaleString();

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>TikTok Accounts — Exportado</title>
<style>
  :root{
    --bg:#0a0a0a; --card:#141414; --card2:#1b1b1b; --border:#262626;
    --fg:#fafafa; --muted:#a1a1aa; --primary:#22c55e; --primary-fg:#052e16;
    --warning:#facc15; --warning-fg:#3b2f00; --danger:#ef4444;
    --radius:14px;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--fg);font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
  a{color:inherit}
  .container{max-width:1200px;margin:0 auto;padding:0 14px}
  header{position:sticky;top:0;z-index:20;background:rgba(10,10,10,.75);backdrop-filter:blur(10px);border-bottom:1px solid var(--border)}
  .hrow{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 0;flex-wrap:wrap}
  .brand{display:flex;align-items:center;gap:10px}
  .logo{height:38px;width:38px;border-radius:11px;background:rgba(34,197,94,.15);display:grid;place-items:center;color:var(--primary)}
  h1{font-size:17px;margin:0;line-height:1.1}
  .sub{font-size:11px;color:var(--muted)}
  button{font:inherit;cursor:pointer;border-radius:10px;border:1px solid var(--border);background:var(--card);color:var(--fg);padding:8px 12px;transition:.18s}
  button:hover{background:#222;transform:translateY(-1px)}
  button.primary{background:var(--primary);color:var(--primary-fg);border-color:var(--primary);font-weight:600}
  button.danger{color:var(--danger)}
  button.ghost{background:transparent;border-color:transparent;padding:5px 7px}
  input,select{font:inherit;background:var(--card);border:1px solid var(--border);color:var(--fg);border-radius:10px;padding:9px 11px;width:100%}
  input:focus,select:focus{outline:2px solid rgba(34,197,94,.45);outline-offset:1px}
  main{padding:18px 0 60px}
  .stats{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
  @media(min-width:900px){.stats{grid-template-columns:repeat(4,1fr)}}
  .stat{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:14px;animation:fadeUp .5s both}
  .stat .l{font-size:11px;color:var(--muted)}
  .stat .v{font-size:24px;font-weight:700;margin-top:4px}
  .tabs{display:flex;gap:6px;overflow-x:auto;padding:14px 0 6px}
  .tab{white-space:nowrap;border-radius:999px;padding:6px 13px;font-size:12px}
  .tab.active{background:var(--primary);color:var(--primary-fg);border-color:var(--primary);font-weight:600}
  .filters{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:12px;display:grid;gap:9px}
  .frow{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}
  @media(min-width:900px){.frow{grid-template-columns:repeat(4,1fr)}}
  .grid{display:grid;grid-template-columns:1fr;gap:14px;margin-top:16px}
  @media(min-width:760px){.grid{grid-template-columns:repeat(2,1fr)}}
  @media(min-width:1080px){.grid{grid-template-columns:repeat(3,1fr)}}
  .card{position:relative;background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:15px;display:flex;flex-direction:column;gap:11px;animation:fadeUp .45s both;transition:.2s}
  .card:hover{transform:translateY(-3px);box-shadow:0 14px 34px -18px rgba(0,0,0,.9)}
  .card.mon{border-color:rgba(34,197,94,.6);box-shadow:0 0 0 1px rgba(34,197,94,.22)}
  .card.pend{border-color:rgba(250,204,21,.4)}
  .ribbon{position:absolute;top:-9px;right:-6px;background:var(--primary);color:var(--primary-fg);font-size:10px;font-weight:800;padding:3px 9px;border-radius:999px;animation:pulse 2s infinite}
  .top{display:flex;gap:11px;align-items:flex-start}
  .av{height:56px;width:56px;border-radius:50%;background:var(--card2);border:1px solid var(--border);display:grid;place-items:center;overflow:hidden;font-weight:700;color:var(--muted);flex:none}
  .av img{height:100%;width:100%;object-fit:cover}
  .name{font-weight:650;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .handle{font-size:13px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .meta{display:flex;gap:8px;align-items:center;font-size:11px;color:var(--muted);margin-top:4px;flex-wrap:wrap}
  .chip{background:var(--card2);border:1px solid var(--border);border-radius:999px;padding:2px 8px;font-size:10px}
  .metrics{display:flex;gap:16px;font-size:14px;align-items:center}
  .badges{display:flex;gap:6px;flex-wrap:wrap}
  .badge{font-size:11px;font-weight:600;border-radius:999px;padding:3px 10px}
  .b-green{background:var(--primary);color:var(--primary-fg)}
  .b-yellow{background:var(--warning);color:var(--warning-fg)}
  .b-mute{background:var(--card2);color:var(--muted);border:1px solid var(--border)}
  .creds{background:rgba(255,255,255,.035);border-radius:10px;padding:9px;font-size:12px;display:grid;gap:6px}
  .crow{display:flex;align-items:center;gap:8px}
  .crow .k{color:var(--muted)}
  .crow .v{margin-left:auto;font-family:ui-monospace,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .actions{display:flex;gap:6px}
  .actions button{flex:0 0 auto;padding:7px 10px;font-size:13px}
  .actions .edit{flex:1}
  .blurred{filter:blur(6px);user-select:none}
  .dates{display:flex;justify-content:space-between;font-size:10px;color:var(--muted)}
  .empty{text-align:center;color:var(--muted);padding:60px 0}
  dialog{border:1px solid var(--border);background:var(--card);color:var(--fg);border-radius:16px;padding:0;width:min(520px,94vw)}
  dialog::backdrop{background:rgba(0,0,0,.65);backdrop-filter:blur(2px)}
  .dlg{padding:18px;display:grid;gap:10px;animation:fadeUp .25s both}
  .dlg h3{margin:0 0 4px}
  .dlg label{font-size:12px;color:var(--muted);display:grid;gap:4px}
  .dlg .two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .dlg .foot{display:flex;gap:8px;justify-content:flex-end;margin-top:6px}
  .toast{position:fixed;bottom:18px;left:50%;transform:translateX(-50%) translateY(20px);background:var(--card);border:1px solid var(--border);padding:10px 16px;border-radius:12px;opacity:0;transition:.25s;z-index:60}
  .toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.55}}
</style>
</head>
<body>
<header>
  <div class="container hrow">
    <div class="brand">
      <div class="logo">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.1v12.4a2.59 2.59 0 1 1-1.84-2.48V9.75a5.79 5.79 0 1 0 4.94 5.73V9.4a7.35 7.35 0 0 0 4.3 1.38V7.68a4.28 4.28 0 0 1-3.24-1.86Z"/></svg>
      </div>
      <div>
        <h1>TikTok Accounts</h1>
        <div class="sub">Exportado em ${generatedAt}</div>
      </div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button id="blurBtn">Borrar</button>
      <button id="addBtn">+ Nova conta</button>
      <button class="primary" id="saveBtn">Salvar HTML</button>
    </div>
  </div>
</header>

<main class="container">
  <div class="stats" id="stats"></div>
  <div class="tabs" id="tabs"></div>
  <div class="filters">
    <input id="q" placeholder="Buscar nome, @ ou email..." />
    <div class="frow">
      <select id="fCountry"></select>
      <select id="fStatus">
        <option value="all">Todos status</option>
        <option value="monetized">Monetizadas</option>
        <option value="pending">Pendentes</option>
        <option value="shop">Com Shop</option>
      </select>
      <select id="sort">
        <option value="created">Mais recentes</option>
        <option value="followers">Mais seguidores</option>
        <option value="likes">Mais likes</option>
      </select>
      <select id="fCat"></select>
    </div>
  </div>
  <div class="grid" id="grid"></div>
  <div class="empty" id="empty" hidden>Nenhuma conta encontrada.</div>
</main>

<dialog id="dlg"><form method="dialog" class="dlg" id="form">
  <h3 id="dlgTitle">Editar conta</h3>
  <div class="two">
    <label>Email<input name="email" required /></label>
    <label>Senha<input name="password" /></label>
  </div>
  <label>Nome de exibição<input name="display_name" /></label>
  <div class="two">
    <label>Username (@)<input name="username" /></label>
    <label>Link TikTok<input name="tiktok_url" /></label>
  </div>
  <div class="two">
    <label>Seguidores<input name="followers" type="number" min="0" /></label>
    <label>Likes<input name="likes" type="number" min="0" /></label>
  </div>
  <div class="two">
    <label>Categoria<select name="category_id" id="catSel"></select></label>
    <label>País<select name="country_code" id="countrySel"></select></label>
  </div>
  <div class="foot">
    <button value="cancel" type="submit">Cancelar</button>
    <button class="primary" value="save" type="submit">Salvar</button>
  </div>
</form></dialog>

<div class="toast" id="toast"></div>

<script id="data" type="application/json">${payload}</script>
<script>
(function(){
  var raw = JSON.parse(document.getElementById('data').textContent);
  var stored = null;
  try { stored = JSON.parse(localStorage.getItem('tta_export_v1') || 'null'); } catch(e){}
  var state = stored && stored.accounts ? stored : raw;
  var accounts = state.accounts || [];
  var categories = state.categories || [];
  var countries = {};
  accounts.forEach(function(a){ if(a.country_code && a._country) countries[a.country_code] = a._country; });
  var blur = false, filterCat='all', editingId=null;

  var el = function(id){ return document.getElementById(id); };
  function persist(){ try{ localStorage.setItem('tta_export_v1', JSON.stringify({accounts:accounts,categories:categories})); }catch(e){} }
  function toast(msg){ var t=el('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(function(){t.classList.remove('show');},1800); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function fmt(n){ n=Number(n||0); if(n>=1e9) return (n/1e9).toFixed(1).replace('.0','')+'B'; if(n>=1e6) return (n/1e6).toFixed(1).replace('.0','')+'M'; if(n>=1e3) return (n/1e3).toFixed(1).replace('.0','')+'K'; return String(n); }
  function catName(id){ var c=categories.filter(function(x){return x.id===id;})[0]; return c?c.name:null; }

  function fillSelects(){
    el('fCat').innerHTML = '<option value="all">Todas categorias</option><option value="none">Sem categoria</option>' +
      categories.map(function(c){return '<option value="'+esc(c.id)+'">'+esc(c.name)+'</option>';}).join('');
    el('fCat').value = filterCat;
    el('catSel').innerHTML = '<option value="">Sem categoria</option>' +
      categories.map(function(c){return '<option value="'+esc(c.id)+'">'+esc(c.name)+'</option>';}).join('');
    var codes = Object.keys(countries);
    el('fCountry').innerHTML = '<option value="all">Todos países</option>' +
      codes.map(function(k){return '<option value="'+esc(k)+'">'+esc(countries[k].flag+' '+countries[k].name)+'</option>';}).join('');
    el('countrySel').innerHTML = '<option value="">Sem país</option>' +
      codes.map(function(k){return '<option value="'+esc(k)+'">'+esc(countries[k].flag+' '+countries[k].name)+'</option>';}).join('');
  }

  function visible(){
    var q = el('q').value.toLowerCase();
    var rows = accounts.slice();
    if(q) rows = rows.filter(function(a){
      return (a.display_name||'').toLowerCase().indexOf(q)>-1 || (a.username||'').toLowerCase().indexOf(q)>-1 || (a.email||'').toLowerCase().indexOf(q)>-1;
    });
    if(filterCat==='none') rows = rows.filter(function(a){return !a.category_id;});
    else if(filterCat!=='all') rows = rows.filter(function(a){return a.category_id===filterCat;});
    var fc = el('fCountry').value; if(fc!=='all') rows = rows.filter(function(a){return a.country_code===fc;});
    var fs = el('fStatus').value;
    if(fs==='monetized') rows = rows.filter(function(a){return (a.followers||0)>=10000;});
    if(fs==='pending') rows = rows.filter(function(a){return (a.followers||0)<10000;});
    if(fs==='shop') rows = rows.filter(function(a){return (a.followers||0)>=2000;});
    var s = el('sort').value;
    if(s==='followers') rows.sort(function(a,b){return (b.followers||0)-(a.followers||0);});
    else if(s==='likes') rows.sort(function(a,b){return (b.likes||0)-(a.likes||0);});
    else rows.sort(function(a,b){return new Date(b.created_at||0)-new Date(a.created_at||0);});
    return rows;
  }

  function renderStats(){
    var mon = accounts.filter(function(a){return (a.followers||0)>=10000;}).length;
    var shop = accounts.filter(function(a){return (a.followers||0)>=2000;}).length;
    var f = accounts.reduce(function(s,a){return s+(a.followers||0);},0);
    var items = [['Contas',accounts.length],['Monetizadas',mon],['Com Shop',shop],['Total seguidores',fmt(f)]];
    el('stats').innerHTML = items.map(function(it,i){
      return '<div class="stat" style="animation-delay:'+(i*50)+'ms"><div class="l">'+it[0]+'</div><div class="v">'+it[1]+'</div></div>';
    }).join('');
  }

  function renderTabs(){
    var tabs = [{id:'all',name:'Todas',n:accounts.length}]
      .concat(categories.map(function(c){return {id:c.id,name:c.name,n:accounts.filter(function(a){return a.category_id===c.id;}).length};}))
      .concat([{id:'none',name:'Sem categoria',n:accounts.filter(function(a){return !a.category_id;}).length}]);
    el('tabs').innerHTML = tabs.map(function(t){
      return '<button class="tab'+(filterCat===t.id?' active':'')+'" data-cat="'+esc(t.id)+'">'+esc(t.name)+' <span style="opacity:.7">('+t.n+')</span></button>';
    }).join('');
    Array.prototype.forEach.call(el('tabs').children, function(b){
      b.onclick = function(){ filterCat = b.getAttribute('data-cat'); el('fCat').value = filterCat; render(); };
    });
  }

  function card(a){
    var mon=(a.followers||0)>=10000, shop=(a.followers||0)>=2000;
    var awaiting = !a.tiktok_url && !a.username;
    var bl = blur ? ' blurred' : '';
    var cn = catName(a.category_id);
    var initial = (a.display_name||a.email||'?').charAt(0).toUpperCase();
    return '<div class="card '+(mon?'mon':'pend')+'">'+
      (mon?'<div class="ribbon">✓ MONETIZED</div>':'')+
      '<div class="top">'+
        '<div class="av'+bl+'">'+(a.avatar_url?'<img src="'+esc(a.avatar_url)+'" alt="" />':(awaiting?'<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.1v12.4a2.59 2.59 0 1 1-1.84-2.48V9.75a5.79 5.79 0 1 0 4.94 5.73V9.4a7.35 7.35 0 0 0 4.3 1.38V7.68a4.28 4.28 0 0 1-3.24-1.86Z"/></svg>':esc(initial)))+'</div>'+
        '<div style="min-width:0;flex:1">'+
          '<div class="name'+bl+'">'+esc(a.display_name || (awaiting?'Aguardando conta':'—'))+'</div>'+
          '<div class="handle'+(awaiting?'':bl)+'">'+(a.username?'@'+esc(a.username):(awaiting?'Em espera de criação':'sem perfil carregado'))+'</div>'+
          '<div class="meta">'+(a._country?esc(a._country.flag+' '+a._country.name):'')+(cn?'<span class="chip">'+esc(cn)+'</span>':'')+'</div>'+
        '</div>'+
      '</div>'+
      '<div class="metrics"><span>👥 <b>'+fmt(a.followers)+'</b></span><span>❤️ <b>'+fmt(a.likes)+'</b></span></div>'+
      '<div class="dates"><span>Adicionado: '+(a.created_at?new Date(a.created_at).toLocaleDateString():'—')+'</span>'+(a.last_synced_at?'<span>Sync: '+new Date(a.last_synced_at).toLocaleString()+'</span>':'')+'</div>'+
      '<div class="badges">'+
        '<span class="badge '+(mon?'b-green':'b-yellow')+'">'+(mon?'Monetized':'Pendente')+'</span>'+
        '<span class="badge '+(shop?'b-green':'b-mute')+'">'+(shop?'Shop ativo':'Shop bloqueado')+'</span>'+
      '</div>'+
      '<div class="creds">'+
        '<div class="crow"><span class="k">Email:</span><span class="v'+bl+'">'+esc(a.email)+'</span><button class="ghost" data-copy="'+esc(a.email)+'">⧉</button></div>'+
        '<div class="crow"><span class="k">Senha:</span><span class="v" data-pwd="'+esc(a.password||'')+'">'+('•'.repeat(Math.min((a.password||'').length,12)))+'</span><button class="ghost" data-toggle="1">👁</button><button class="ghost" data-copy="'+esc(a.password||'')+'">⧉</button></div>'+
      '</div>'+
      '<div class="actions">'+
        '<button class="edit" data-edit="'+esc(a.id)+'">✏️ Editar</button>'+
        (awaiting?'':'<button data-open="'+esc(a.tiktok_url||'')+'">↗</button>')+
        '<button class="danger" data-del="'+esc(a.id)+'">🗑</button>'+
      '</div>'+
    '</div>';
  }

  function render(){
    renderStats(); renderTabs(); fillSelects();
    var rows = visible();
    el('grid').innerHTML = rows.map(function(a,i){ return card(a).replace('class="card ','style="animation-delay:'+(i*40)+'ms" class="card '); }).join('');
    el('empty').hidden = rows.length>0;
    var g = el('grid');
    g.querySelectorAll('[data-copy]').forEach(function(b){ b.onclick=function(){ navigator.clipboard.writeText(b.getAttribute('data-copy')); toast('Copiado'); }; });
    g.querySelectorAll('[data-toggle]').forEach(function(b){ b.onclick=function(){
      var span=b.parentNode.querySelector('[data-pwd]'); var p=span.getAttribute('data-pwd');
      if(span.getAttribute('data-shown')==='1'){ span.textContent='•'.repeat(Math.min(p.length,12)); span.removeAttribute('data-shown'); }
      else { span.textContent=p; span.setAttribute('data-shown','1'); }
    };});
    g.querySelectorAll('[data-open]').forEach(function(b){ b.onclick=function(){ window.open(b.getAttribute('data-open'),'_blank'); }; });
    g.querySelectorAll('[data-edit]').forEach(function(b){ b.onclick=function(){ openDialog(b.getAttribute('data-edit')); }; });
    g.querySelectorAll('[data-del]').forEach(function(b){ b.onclick=function(){
      var id=b.getAttribute('data-del');
      if(confirm('Excluir esta conta?')){ accounts=accounts.filter(function(a){return a.id!==id;}); persist(); render(); toast('Conta excluída'); }
    };});
  }

  function openDialog(id){
    editingId = id;
    var a = accounts.filter(function(x){return x.id===id;})[0] || {};
    fillSelects();
    el('dlgTitle').textContent = id ? 'Editar conta' : 'Nova conta';
    var f = el('form');
    f.email.value=a.email||''; f.password.value=a.password||''; f.display_name.value=a.display_name||'';
    f.username.value=a.username||''; f.tiktok_url.value=a.tiktok_url||'';
    f.followers.value=a.followers||0; f.likes.value=a.likes||0;
    f.category_id.value=a.category_id||''; f.country_code.value=a.country_code||'';
    el('dlg').showModal();
  }

  el('form').addEventListener('submit', function(ev){
    var btn = ev.submitter;
    if(!btn || btn.value!=='save') return;
    var f = el('form');
    var patch = {
      email:f.email.value.trim(), password:f.password.value, display_name:f.display_name.value.trim()||null,
      username:f.username.value.trim().replace(/^@/,'')||null, tiktok_url:f.tiktok_url.value.trim()||null,
      followers:Number(f.followers.value||0), likes:Number(f.likes.value||0),
      category_id:f.category_id.value||null, country_code:f.country_code.value||null
    };
    patch._country = patch.country_code ? countries[patch.country_code] : null;
    if(editingId){
      accounts = accounts.map(function(a){ return a.id===editingId ? Object.assign({},a,patch) : a; });
    } else {
      accounts.unshift(Object.assign({id:'local-'+Date.now(), created_at:new Date().toISOString(), avatar_url:null, last_synced_at:null}, patch));
    }
    persist(); render(); toast('Salvo');
  });

  el('addBtn').onclick = function(){ openDialog(null); };
  el('blurBtn').onclick = function(){ blur=!blur; el('blurBtn').textContent = blur?'Mostrar':'Borrar'; render(); };
  ['q','fCountry','fStatus','sort'].forEach(function(id){ el(id).addEventListener('input', render); });
  el('fCat').addEventListener('change', function(){ filterCat = el('fCat').value; render(); });

  el('saveBtn').onclick = function(){
    var clone = document.documentElement.cloneNode(true);
    clone.querySelector('#data').textContent = JSON.stringify({accounts:accounts,categories:categories});
    var html = '<!doctype html>' + clone.outerHTML;
    var blob = new Blob([html], {type:'text/html'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href=url; a.download='tiktok-accounts.html'; a.click();
    setTimeout(function(){URL.revokeObjectURL(url);},1000);
    toast('HTML atualizado baixado');
  };

  render();
})();
</script>
</body>
</html>`;
}

export function downloadAccountsHtml(accounts: Account[], categories: Category[]) {
  const html = buildAccountsHtml(accounts, categories);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tiktok-accounts-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
