
const KEY="academia365_v3";
const defaultState={currentDay:1,xp:0,streak:0,bestStreak:0,lastDate:null,completed:{},trophies:[],reflections:{}};
let state=loadState();
let sb=null;

function loadState(){try{return {...defaultState,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch(e){return {...defaultState}}}
function saveState(){localStorage.setItem(KEY,JSON.stringify(state)); updateUI();}
function el(id){return document.getElementById(id)}
function today(){return new Date().toISOString().slice(0,10)}
function mission(){return MISSIONS.find(m=>m.day===state.currentDay)||MISSIONS[0]}
function completedCount(){return Object.keys(state.completed).length}
function phaseIndex(m){return Math.floor((m.day-1)/30)+1}
function updateUI(){
 const m=mission(), done=completedCount(), pct=Math.round(done/365*100);
 el("dayNumber").textContent=state.currentDay; el("streak").textContent=state.streak; el("xp").textContent=state.xp; el("trophyCount").textContent=state.trophies.length;
 el("percent").textContent=pct+"%"; el("progressBar").style.width=pct+"%";
 el("phaseBadge").textContent="Fase "+phaseIndex(m); el("phaseName").textContent=m.phase;
 el("phaseDesc").textContent=m.objective; el("heroTitle").textContent=m.title; el("heroSub").textContent="Missão "+m.day+" de 365 • 30 minutos";
 el("doneStat").textContent=done+" / 365"; el("progressStat").textContent=pct+"%"; el("xpStat").textContent=state.xp; el("bestStreak").textContent=state.bestStreak;
 renderTrophies();
}
function showView(id){
 const reward_names=["Primeira Observação", "Olho Atento", "Voz em Construção", "Palavra Precisa", "Escuta Ativa", "Contexto Primeiro", "Hipótese Rival", "Sem Pressa", "Boa Pergunta", "Clareza", "Sete Dias", "Duas Semanas", "Primeiro Argumento", "Leitor de Padrões", "Calibrador", "Mestre das Pausas", "Vocabulário Vivo", "Observador Cético", "Comunicador", "Steelman", "Trinta Dias", "Sessenta Dias", "Noventa Dias", "Analista", "Influência Ética", "Sem Atalhos", "Pensamento Crítico", "Mestre da Conversa", "Mestre da Voz", "Mestre do Contexto", "Mestre da Evidência", "Mestre da Síntese", "180 Dias", "270 Dias", "365 Dias"];
function documentQueryDummy(){}
document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
 el(id).classList.add("active");
 const reward_names=["Primeira Observação", "Olho Atento", "Voz em Construção", "Palavra Precisa", "Escuta Ativa", "Contexto Primeiro", "Hipótese Rival", "Sem Pressa", "Boa Pergunta", "Clareza", "Sete Dias", "Duas Semanas", "Primeiro Argumento", "Leitor de Padrões", "Calibrador", "Mestre das Pausas", "Vocabulário Vivo", "Observador Cético", "Comunicador", "Steelman", "Trinta Dias", "Sessenta Dias", "Noventa Dias", "Analista", "Influência Ética", "Sem Atalhos", "Pensamento Crítico", "Mestre da Conversa", "Mestre da Voz", "Mestre do Contexto", "Mestre da Evidência", "Mestre da Síntese", "180 Dias", "270 Dias", "365 Dias"];
function documentQueryDummy(){}
document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n.dataset.view===id));
 window.scrollTo({top:0,behavior:"smooth"});
}
function openMission(){
 const m=mission();
 el("missionPhase").textContent=m.phase.toUpperCase();
 el("missionTitle").textContent=m.title; el("missionDay").textContent="Dia "+m.day+"/365";
 el("objective").textContent=m.objective; el("instructions").textContent=m.instructions; el("checkpoint").textContent=m.checkpoint;
 el("reflection").value=state.reflections[m.day]||"";
 el("videoLink").href="https://www.youtube.com/results?search_query="+encodeURIComponent(m.videoQuery);
 showView("missionView");
}
function completeMission(){
 const m=mission();
 if(state.completed[m.day]) return;
 const reflection=el("reflection").value.trim();
 state.reflections[m.day]=reflection;
 state.completed[m.day]={at:new Date().toISOString()};
 state.xp+=100;
 const d=today();
 if(state.lastDate!==d){ state.streak = state.lastDate===new Date(Date.now()-86400000).toISOString().slice(0,10) ? state.streak+1 : 1; state.bestStreak=Math.max(state.bestStreak,state.streak); state.lastDate=d; }
 const reward=m.reward;
 if(reward && !state.trophies.includes(reward)) state.trophies.push(reward);
 if(m.day<365) state.currentDay=m.day+1;
 saveState(); syncToCloud();
 alert("🎉 Missão concluída! Você desbloqueou: "+reward+(m.day<365?"\n\nO próximo dia está liberado.":"\n\nVocê concluiu os 365 dias!"));
 showView("homeView");
}
function renderTrophies(){
 const unlocked=new Set(state.trophies);
 el("trophyGrid").innerHTML=reward_names.map((name,i)=>`<div class="trophy ${unlocked.has(name)?"":"locked"}"><div class="emoji">${unlocked.has(name)?"🏆":"🔒"}</div><h3>${unlocked.has(name)?name:"Recompensa secreta"}</h3><small>${unlocked.has(name)?"Desbloqueado":"Continue avançando para descobrir"}</small></div>`).join("");
}
function exportBackup(){
 const blob=new Blob([JSON.stringify({app:"Academia365",version:3,exportedAt:new Date().toISOString(),state},null,2)],{type:"application/json"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="academia365-backup.json";a.click();URL.revokeObjectURL(a.href);
}
function importBackup(file){
 const r=new FileReader();r.onload=()=>{try{const data=JSON.parse(r.result);if(!data.state)throw Error();state={...defaultState,...data.state};saveState();alert("Backup restaurado com sucesso.");}catch(e){alert("Esse arquivo não parece ser um backup válido do Academia 365.")}};r.readAsText(file);
}
async function syncToCloud(){
 if(!sb) return;
 const {data:{user}}=await sb.auth.getUser();
 if(!user) return;
 const {error}=await sb.from("user_progress").upsert({
   user_id:user.id,current_day:state.currentDay,xp:state.xp,streak:state.streak,
   best_streak:state.bestStreak,last_completed_date:state.lastDate,updated_at:new Date().toISOString()
 });
 if(error) console.warn("Falha ao salvar progresso:",error.message);
 const rows=Object.keys(state.completed).map(id=>({
   user_id:user.id,mission_id:Number(id),completed_at:state.completed[id].at||new Date().toISOString(),
   reflection:state.reflections[id]||null
 }));
 if(rows.length){const {error:e2}=await sb.from("completed_missions").upsert(rows);if(e2) console.warn(e2.message);}
 const trophies=state.trophies.map(t=>({user_id:user.id,trophy_id:t}));
 if(trophies.length){const {error:e3}=await sb.from("trophies").upsert(trophies);if(e3) console.warn(e3.message);}
}
async function loadFromCloud(){
 if(!sb) return;
 const {data:{user}}=await sb.auth.getUser();
 if(!user) return;
 const p=await sb.from("user_progress").select("*").eq("user_id",user.id).maybeSingle();
 if(p.data){
   state.currentDay=p.data.current_day||state.currentDay;state.xp=p.data.xp||state.xp;
   state.streak=p.data.streak||0;state.bestStreak=p.data.best_streak||0;state.lastDate=p.data.last_completed_date||state.lastDate;
 }
 const cm=await sb.from("completed_missions").select("*").eq("user_id",user.id);
 if(cm.data) cm.data.forEach(r=>{state.completed[r.mission_id]={at:r.completed_at};if(r.reflection)state.reflections[r.mission_id]=r.reflection;});
 const tr=await sb.from("trophies").select("trophy_id").eq("user_id",user.id);
 if(tr.data) state.trophies=tr.data.map(x=>x.trophy_id);
 saveState();
}
async function initSupabase(){
 if(!window.SUPABASE_CONFIG?.url || !window.SUPABASE_CONFIG?.anonKey){
   el("cloudStatus").textContent="Modo local: configure config.js para ativar a nuvem."; return;
 }
 try{
   sb=supabase.createClient(SUPABASE_CONFIG.url,SUPABASE_CONFIG.anonKey);
   sb.auth.onAuthStateChange((_event,session)=>{
     el("authStatus").textContent=session?"Conta conectada: "+session.user.email:"Sem conta conectada.";
     el("logoutBtn").style.display=session?"inline-flex":"none";
     if(session) setTimeout(loadFromCloud,0);
   });
   el("cloudStatus").textContent="Supabase pronto. Crie uma conta para sincronizar.";
 }catch(e){el("cloudStatus").textContent="Configuração Supabase inválida: "+e.message;}
}
async function signup(){
 if(!sb){alert("Configure o Supabase primeiro.");return;}
 const email=el("emailInput").value.trim(),password=el("passwordInput").value;
 if(!email||password.length<6){alert("Informe um e-mail e uma senha de pelo menos 6 caracteres.");return;}
 const {error}=await sb.auth.signUp({email,password});
 if(error) alert("Erro ao criar conta: "+error.message); else alert("Conta criada. Se a confirmação de e-mail estiver ativada no Supabase, confirme seu e-mail antes de entrar.");
}
async function login(){
 if(!sb){alert("Configure o Supabase primeiro.");return;}
 const {data,error}=await sb.auth.signInWithPassword({email:el("emailInput").value.trim(),password:el("passwordInput").value});
 if(error) alert("Erro ao entrar: "+error.message); else {await loadFromCloud();alert("Login realizado e progresso sincronizado.");}
}
async function logout(){
 if(sb) await sb.auth.signOut();
}
async function testCloud(){
 if(!sb){alert("Supabase ainda não está configurado. Veja o README.");return;}
 const {data,error}=await sb.auth.getSession();
 alert(error?"Erro: "+error.message:(data.session?"Conectado com uma sessão ativa.":"Supabase alcançado. Nenhuma sessão ativa."));
}
const reward_names=["Primeira Observação", "Olho Atento", "Voz em Construção", "Palavra Precisa", "Escuta Ativa", "Contexto Primeiro", "Hipótese Rival", "Sem Pressa", "Boa Pergunta", "Clareza", "Sete Dias", "Duas Semanas", "Primeiro Argumento", "Leitor de Padrões", "Calibrador", "Mestre das Pausas", "Vocabulário Vivo", "Observador Cético", "Comunicador", "Steelman", "Trinta Dias", "Sessenta Dias", "Noventa Dias", "Analista", "Influência Ética", "Sem Atalhos", "Pensamento Crítico", "Mestre da Conversa", "Mestre da Voz", "Mestre do Contexto", "Mestre da Evidência", "Mestre da Síntese", "180 Dias", "270 Dias", "365 Dias"];
function documentQueryDummy(){}
document.querySelectorAll(".nav").forEach(n=>n.addEventListener("click",()=>showView(n.dataset.view)));
el("startBtn").onclick=openMission;el("completeBtn").onclick=completeMission;el("backBtn").onclick=()=>showView("homeView");
el("settingsBtn").onclick=()=>showView("settingsView");el("settingsBack").onclick=()=>showView("homeView");
el("signupBtn").onclick=signup;el("loginBtn").onclick=login;el("logoutBtn").onclick=logout;
el("exportBtn").onclick=exportBackup;el("importFile").onchange=e=>e.target.files[0]&&importBackup(e.target.files[0]);el("testCloud").onclick=testCloud;
initSupabase();updateUI();
