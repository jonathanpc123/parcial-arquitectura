'use strict';
// Las respuestas se validan únicamente en el navegador: no se transmiten a ningún servidor.
const questions = [
  {text:'¿Cuál fue uno de los principales componentes utilizados en la primera generación de computadores?',multiple:false,options:['Microprocesadores','Tubos de vacío','Memorias USB','Discos SSD'],correct:[1]},
  {text:'¿Cuál es la función principal del procesador (CPU) en un computador?',multiple:false,options:['Almacenar archivos permanentemente','Mostrar imágenes en la pantalla','Interpretar y ejecutar instrucciones','Proporcionar energía a los componentes'],correct:[2]},
  {text:'¿Cuáles de las siguientes son características de la memoria RAM? Selecciona dos respuestas.',multiple:true,options:['Almacena temporalmente datos y programas en uso','Conserva todos los archivos cuando se apaga el equipo','Pierde su contenido cuando se interrumpe la energía','Convierte la corriente alterna en continua'],correct:[0,2]},
  {text:'¿Cuál de los siguientes dispositivos permite guardar archivos de manera permanente?',multiple:false,options:['Memoria RAM','Procesador (CPU)','Disco SSD','Ventilador'],correct:[2]},
  {text:'¿Cuál es la función principal de la placa base o motherboard?',multiple:false,options:['Conectar y permitir la comunicación entre los componentes','Reemplazar la memoria RAM','Imprimir documentos','Enfriar la habitación donde está el computador'],correct:[0]},
  {text:'¿Cuáles de los siguientes elementos se encuentran en una placa base? Selecciona tres respuestas.',multiple:true,options:['Zócalo para el procesador','Ranuras para memoria RAM','Ranuras PCI Express','Pantalla del monitor'],correct:[0,1,2]},
  {text:'¿Qué función cumple la fuente de alimentación (PSU) de un computador?',multiple:false,options:['Almacenar fotografías','Convertir la corriente alterna en corriente continua para alimentar los componentes','Procesar imágenes y videos','Conectar el computador a Internet'],correct:[1]},
  {text:'¿Cuáles de los siguientes dispositivos son periféricos de entrada? Selecciona dos respuestas.',multiple:true,options:['Teclado','Monitor','Ratón (mouse)','Impresora'],correct:[0,2]},
  {text:'¿Cuál de los siguientes puertos se utiliza para transmitir video y audio digital hacia una pantalla compatible?',multiple:false,options:['PS/2','HDMI','RJ-45','Puerto paralelo LPT'],correct:[1]},
  {text:'¿En qué orden realiza la CPU las etapas básicas de búsqueda, decodificación y ejecución de una instrucción?',multiple:false,options:['Ejecutar, buscar y decodificar','Decodificar, ejecutar y buscar','Buscar, decodificar y ejecutar','Guardar, imprimir y apagar'],correct:[2]}
];
const letters=['A','B','C','D'];
const questionHost=document.getElementById('questions');
const form=document.getElementById('exam-form');
const warning=document.getElementById('warning');
let finished=false;
let reportData=null;
function render(){
  questionHost.innerHTML='';
  questions.forEach((q,i)=>{
    const article=document.createElement('article'); article.className='question';article.id='question-'+i;
    const top=document.createElement('div');top.className='d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2';
    const num=document.createElement('span');num.className='question-number';num.textContent='PREGUNTA '+(i+1);
    const kind=document.createElement('span');kind.className='badge-kind';kind.textContent=q.multiple?'Selección múltiple':'Selección única';
    top.append(num,kind);article.append(top);
    const title=document.createElement('h3');title.className='question-title';title.textContent=q.text;article.append(title);
    q.options.forEach((option,j)=>{
      const label=document.createElement('label');label.className='option';
      const input=document.createElement('input');input.type=q.multiple?'checkbox':'radio';input.name='q'+i;input.value=String(j);input.setAttribute('aria-label',letters[j]+'. '+option);input.addEventListener('change',updateProgress);
      const letter=document.createElement('span');letter.className='letter';letter.textContent=letters[j]+'.';
      const content=document.createElement('span');content.textContent=option;
      label.append(input,letter,content);article.append(label);
    });
    const feedback=document.createElement('div');feedback.className='feedback d-none';feedback.id='feedback-'+i;article.append(feedback);questionHost.append(article);
  });
  updateProgress();
  activateQuestionReveal();
}
function getSelected(i){return [...document.querySelectorAll('input[name="q'+i+'"]:checked')].map(input=>Number(input.value));}
function updateProgress(){const answered=questions.reduce((n,_,i)=>n+(getSelected(i).length>0?1:0),0);document.getElementById('progress-label').textContent=answered+' de 10 respondidas';document.getElementById('progress').setAttribute('aria-valuenow',String(answered));document.getElementById('progress-bar').style.width=answered*10+'%';document.getElementById('remaining').textContent=answered===10?'Has respondido todas las preguntas.':'Faltan '+(10-answered)+' preguntas por responder.';}
function isCorrect(q,sel){return q.correct.length===sel.length && q.correct.every(x=>sel.includes(x));}
function showWarning(message){warning.textContent=message;warning.classList.remove('d-none');warning.scrollIntoView({behavior:'smooth',block:'center'});}
form.addEventListener('submit',e=>{
  e.preventDefault();if(finished)return;warning.classList.add('d-none');
  const student=document.getElementById('student').value.trim();if(!student){showWarning('Escribe tu nombre completo antes de finalizar.');document.getElementById('student').focus();return;}
  const unanswered=questions.findIndex((_,i)=>getSelected(i).length===0);
  if(unanswered!==-1){showWarning('Debes responder todas las preguntas. Revisa la pregunta '+(unanswered+1)+'.');document.getElementById('question-'+unanswered).scrollIntoView({behavior:'smooth',block:'center'});return;}
  if(!confirm('¿Deseas finalizar el parcial y ver tu resultado? Después no podrás modificar tus respuestas.'))return;
  finished=true;let hits=0;
  const review=[];
  questions.forEach((q,i)=>{
    const selected=getSelected(i);const passed=isCorrect(q,selected);if(passed)hits++;
    review.push({number:i+1,question:q.text,selected:selected.map(j=>letters[j]+". "+q.options[j]),correct:q.correct.map(j=>letters[j]+". "+q.options[j]),passed});
    const article=document.getElementById('question-'+i);article.querySelectorAll('input').forEach(input=>input.disabled=true);
    article.querySelectorAll('.option').forEach((el,j)=>{if(q.correct.includes(j))el.classList.add('correct');else if(selected.includes(j))el.classList.add('incorrect');});
    const feedback=document.getElementById('feedback-'+i);feedback.classList.remove('d-none');
    feedback.textContent=passed?'✓ Respuesta correcta.':'✕ Respuesta incorrecta.';
    feedback.style.color=passed?'#25734e':'#ad3838';
    if(!passed){const key=document.createElement('div');key.className='answer-key';key.textContent='Respuesta correcta: '+q.correct.map(j=>letters[j]+'. '+q.options[j]).join(' · ');feedback.append(key);}
  });
  const score=(hits*0.5).toFixed(1).replace('.',',');
  document.getElementById('score').innerHTML=score+' <small class="fs-5 fw-normal text-secondary">/ 5,0</small>';
  document.getElementById('hits').textContent=hits+' de 10 respuestas correctas';
  animateScore(hits*0.5);
  if(hits>=7)launchConfetti();
  document.getElementById('student-result').textContent=student+(document.getElementById('group').value.trim()?' · Grupo '+document.getElementById('group').value.trim():'');
  document.getElementById('result-message').textContent='Esta es tu calificación calculada con base en las respuestas seleccionadas.';
  reportData={student,group:document.getElementById('group').value.trim(),date:document.getElementById('date').value,score,hits,review};
  buildReport(reportData);
  document.getElementById('actions').classList.add('d-none');document.getElementById('results').classList.remove('d-none');
  for(const id of ['student','group','date'])document.getElementById(id).readOnly=true;
  document.getElementById('results').scrollIntoView({behavior:'smooth',block:'start'});
});
document.getElementById('restart-btn').addEventListener('click',()=>{if(!confirm('¿Quieres reiniciar el parcial? Se perderán las respuestas y el resultado actual.'))return;finished=false;form.reset();document.getElementById('results').classList.add('d-none');document.getElementById('report').classList.add('d-none');reportData=null;document.getElementById('actions').classList.remove('d-none');warning.classList.add('d-none');for(const id of ['student','group','date'])document.getElementById(id).readOnly=false;render();window.scrollTo({top:0,behavior:'smooth'});});
function buildReport(data){
  const info=document.getElementById('report-info');info.replaceChildren();
  for(const [k,v] of [['Estudiante',data.student],['Grupo',data.group||'No indicado'],['Fecha',data.date||'No indicada']]){
    const cell=document.createElement('div');cell.className='col-md-4';const strong=document.createElement('strong');strong.textContent=k+': ';cell.append(strong,document.createTextNode(v));info.append(cell);
  }
  document.getElementById('report-score').textContent=data.score+' / 5,0';
  document.getElementById('report-hits').textContent=data.hits+' / 10';
  const host=document.getElementById('report-rows');host.replaceChildren();
  data.review.forEach(item=>{
    const tr=document.createElement('tr');
    const add=(value,cls)=>{const td=document.createElement('td');td.textContent=value;if(cls)td.className=cls;tr.append(td);};
    add(String(item.number));add(item.question);add(item.selected.join(' | '));add(item.correct.join(' | '));add(item.passed?'Correcta':'Incorrecta',item.passed?'good':'bad');host.append(tr);
  });
  document.getElementById('report').classList.remove('d-none');
}
function downloadPdf(){
  if(!reportData)return;
  if(!window.jspdf?.jsPDF){alert('No se pudo cargar el generador de PDF. Se abrirá la opción de impresión; selecciona "Guardar como PDF".');window.print();return;}
  const doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'}),margin=16,pageWidth=210,usable=178;
  let y=20;
  function nextSpace(h){if(y+h>277){doc.addPage();y=18;}}
  function line(t,{size=10,bold=false,color=[32,49,70],indent=0,space=4}={}){
    doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(...color);
    const segments=doc.splitTextToSize(t||'-',usable-indent);
    const height=segments.length*(size*0.41+1.3);nextSpace(height+space);
    doc.text(segments,margin+indent,y);y+=height+space;
  }
  line('REPORTE DE CALIFICACION',{size:17,bold:true,color:[24,70,119],space:2});
  line('Fundamentos de Sistemas - Primer semestre',{size:10,space:7});
  line('Estudiante: '+reportData.student,{bold:true,space:1});
  line('Grupo: '+(reportData.group||'No indicado')+'      Fecha: '+(reportData.date||'No indicada'),{space:3});
  doc.setDrawColor(212,225,240);doc.line(16,y,194,y);y+=7;
  line('NOTA FINAL: '+reportData.score+' / 5,0       ACIERTOS: '+reportData.hits+' / 10',{size:13,bold:true,color:[25,80,130],space:8});
  reportData.review.forEach(q=>{
    nextSpace(34);line(q.number+'. '+q.question,{bold:true,size:10,space:2});
    line('Respuesta del estudiante: '+q.selected.join(' | '),{size:9,indent:3,space:1});
    line('Respuesta correcta: '+q.correct.join(' | '),{size:9,indent:3,space:1});
    line('Resultado: '+(q.passed?'CORRECTA (+0,5)':'INCORRECTA (+0,0)'),{size:9,bold:true,color:q.passed?[29,114,72]:[164,49,49],indent:3,space:6});
    doc.setDrawColor(225,232,240);doc.line(16,y-2,194,y-2);
  });
  nextSpace(15);line('Criterio: 0,5 puntos por pregunta correcta. Sin puntaje parcial en seleccion multiple.',{size:8,color:[100,110,125]});
  const pages=doc.internal.getNumberOfPages();for(let i=1;i<=pages;i++){doc.setPage(i);doc.setFontSize(8);doc.setTextColor(130,140,150);doc.text('Pagina '+i+' de '+pages,194,288,{align:'right'});}
  const filename='Reporte_Parcial_'+reportData.student.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'_').slice(0,48)+'.pdf';
  doc.save(filename);
}
document.getElementById('download-btn').addEventListener('click',downloadPdf);
document.getElementById('print-btn').addEventListener('click',()=>window.print());

// Efectos decorativos: no cambian respuestas, resultados ni generación de PDF.
const motionOK=()=>!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function activateQuestionReveal(){
  const nodes=[...document.querySelectorAll('.question')];
  if(!motionOK()||!('IntersectionObserver' in window))return;
  const observer=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('question-reveal');observer.unobserve(entry.target);}});
  },{threshold:0.08,rootMargin:'0px 0px 35px 0px'});
  nodes.forEach(node=>observer.observe(node));
}
function animateScore(finalScore){
  if(!motionOK())return;
  const target=document.getElementById('score'),duration=1050,start=performance.now();
  const ease=t=>1-Math.pow(1-t,3);
  function frame(now){
    if(!finished)return;
    const progress=Math.min(1,(now-start)/duration);
    target.innerHTML=(finalScore*ease(progress)).toFixed(1).replace('.',',')+' <small class="fs-5 fw-normal text-secondary">/ 5,0</small>';
    if(progress<1)requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
function launchConfetti(){
  if(!motionOK())return;
  const layer=document.createElement('div');layer.className='confetti-layer';layer.setAttribute('aria-hidden','true');
  const colors=['#40b9ee','#2b67a2','#74d5ba','#ffd166','#a5b4fc'];
  for(let i=0;i<46;i++){
    const dot=document.createElement('span');dot.className='confetti-piece';
    dot.style.left=Math.random()*100+'%';dot.style.backgroundColor=colors[i%colors.length];
    dot.style.borderRadius=i%3===0?'50%':'2px';
    dot.style.setProperty('--fall-duration',(2.1+Math.random()*1.6)+'s');
    dot.style.setProperty('--fall-delay',(Math.random()*.55)+'s');
    dot.style.setProperty('--drift',(Math.random()*220-110)+'px');
    dot.style.setProperty('--spin',(Math.random()*1000-500)+'deg');
    layer.append(dot);
  }
  document.body.append(layer);setTimeout(()=>layer.remove(),4700);
}

// Fecha local (sin conversión UTC, para evitar desfases).
const today=new Date();document.getElementById('date').value=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
render();
