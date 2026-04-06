// Archivo script.js - lógica del OVA (lecciones, quiz y chat)

let score = 0;
let progress = 0;

const lessons = [
  {id:1,title:'Introducción a la informática',desc:'Conceptos básicos: hardware, software y sistemas.',content:'Contenido de la lección 1. Explicaciones, imágenes y ejemplos.'},
  {id:2,title:'Sistemas de numeración',desc:'Binario, hexadecimal y su aplicación en electrónica.',content:'Contenido de la lección 2 con ejercicios.'},
  {id:3,title:'Estructura HTML y CSS',desc:'Cómo crear páginas y darles estilo.',content:'Ejemplos y prácticas.'},
  {id:4,title:'Algoritmos y pseudocódigo',desc:'Introducción a la lógica y a la resolución de problemas.',content:'Ejercicios resueltos y desafíos.'},
];

const questions = [
  {q:'¿Cuál es la base del sistema binario?', options:['10','2','16','8'], answer:1},
  {q:'¿Qué etiqueta HTML crea un párrafo?', options:['div','p','span','section'], answer:1},
  {q:'¿Qué es la informática?', options:['El estudio exclusivo de los computadores físicos','La ciencia que estudia el tratamiento automático de la información mediante sistemas computacionales','El uso de internet y redes sociales','El manejo de programas de edición de texto'], answer:1},
  {q:'¿Qué es un algoritmo?', options:['Un lenguaje de programación','Un programa que solo funciona en computadores','Un conjunto ordenado de pasos para resolver un problema','Un tipo de hardware del computador'], answer:2},
  {q:'¿Cuál de las siguientes opciones representa correctamente una estructura básica de un algoritmo?', options:['Inicio – Proceso – Fin','Entrada – Error – Salida','Código – Ejecución – Resultado','Variables – Constantes – Datos'], answer:0},
  {q:'¿Cuál es la función principal del lenguaje HTML?', options:['Dar estilo y color a una página web','Crear animaciones interactivas','Estructurar el contenido de una página web','Almacenar información en bases de datos'], answer:2},
  {q:'¿Para qué se utiliza CSS en una página web?', options:['Dar estilo y color a una página web','Crear animaciones interactivas','Estructurar el contenido de una página web','Almacenar información en bases de datos'], answer:0},
  {q:'¿Para qué se utiliza el pseudocódigo?', options:['Para programar directamente en un computador','Para escribir algoritmos usando un lenguaje cercano al humano','Para diseñar páginas web','Para ejecutar programas sin errores'], answer:1},
];

// Render lecciones
const lessonsEl = document.getElementById('lessons');
if(lessonsEl){
lessons.forEach(l=>{
  const el = document.createElement('div'); el.className='card lesson';
  el.innerHTML = `<h3>${l.title}</h3><p>${l.desc}</p><div style="display:flex;gap:8px;margin-top:8px"><button class='btn' onclick="goToLesson(${l.id})">Abrir</button><button class='btn outline' onclick="markDone(${l.id},this)">Marcar como leída</button></div>`;
  lessonsEl.appendChild(el);
});
}

// Render quiz
const quizEl = document.getElementById('quiz');
function renderQuiz(){
  if(!quizEl) return;

  quizEl.innerHTML='';
  questions.forEach((qq,i)=>{
    const box = document.createElement('div'); box.className='card';
    let opts = '';
    qq.options.forEach((op,j)=>{
      opts += `<div class='option' onclick='answer(${i},${j},this)'>${String.fromCharCode(65+j)}. ${op}</div>`;
    });
    box.innerHTML = `<div class='question'>${i+1}. ${qq.q}</div><div class='options'>${opts}</div>`;
    quizEl.appendChild(box);
  });
}
renderQuiz();

function answer(i,j,el){
  const locked = document.getElementById('lockAnswers')?.checked;
  const correct = questions[i].answer===j;

  if(correct){
    score += 10;
  }

  if(locked){
    alert('El docente ha bloqueado la visualización de respuestas completas.');
    el.classList.add('wrong');
    el.innerHTML += ' — Pista: repasa la lección.';
    return;
  }

  if(correct){
    el.classList.add('correct');
    alert('¡Correcto!');
  } else {
    el.classList.add('wrong');
    alert('Respuesta incorrecta. Revisa la lección.');
  }
}

/* =========================
   CHAT (CORREGIDO)
========================= */

function sendMsg(){
  const input = document.getElementById('inputMsg');
  const text = input.value.trim(); 
  if(!text) return;

  addMsg(text,'user'); 
  input.value='';

  setTimeout(()=>{
    const reply = generateReply(text);
    addMsg(reply,'bot');
  },500);
}

function addMsg(txt,who){
  const container = document.getElementById('messages');
  if(!container) return;

  const d = document.createElement('div'); 
  d.className='msg '+(who==='user'?'user':'bot'); 
  d.innerText=txt;

  container.appendChild(d); 
  container.scrollTop = container.scrollHeight;
}

function generateReply(text){
  text = text.toLowerCase();

  if(text.includes('hola')||text.includes('buenas')) return 'Hola! ¿Sobre qué lección quieres ayuda?';
  if(text.includes('binario')) return 'El sistema binario usa base 2.';
  if(text.includes('html')) return 'La etiqueta <p> crea un párrafo.';
  if(text.includes('hardware')) return '¿Puedes tocarlo? entonces es hardware.';
  if(text.includes('software')) return 'Son programas, no partes físicas.';
  if(text.includes('informatica')) return 'Es el procesamiento de la información.';
  
  return 'Intenta reformular tu pregunta.';
}

/* =========================
   VIDEO INTERACTIVO (CORREGIDO)
========================= */

document.addEventListener("DOMContentLoaded", function(){

let video = document.getElementById("videoClase");
if(!video) return;

let preguntasVideo = [
{tiempo:5, pregunta:"¿Qué concepto se explicó?", opciones:["Opción A","Opción B"], correcta:0},
{tiempo:12, pregunta:"¿Qué significa esto?", opciones:["Respuesta 1","Respuesta 2"], correcta:1}
];

let indexVideo = 0;
let activa = false;

video.addEventListener("timeupdate", ()=>{

    if(indexVideo < preguntasVideo.length && !activa){

        let p = preguntasVideo[indexVideo];

        if(video.currentTime >= p.tiempo && video.currentTime <= p.tiempo + 1){

            activa = true;
            video.pause();
            mostrarPreguntaVideo(p);
            indexVideo++;
        }
    }

});

function mostrarPreguntaVideo(p){

    document.getElementById("quizVideo").style.display="block";
    document.getElementById("quizPregunta").innerText = p.pregunta;

    let cont = document.getElementById("quizOpciones");
    cont.innerHTML = "";

    p.opciones.forEach((op,i)=>{

        let btn = document.createElement("button");
        btn.innerText = op;
        btn.className = "btn";

        btn.onclick = ()=>{

            if(i === p.correcta){
                score += 10;
            }

            setTimeout(()=>{
                document.getElementById("quizVideo").style.display="none";
                activa = false;
                video.play();
            },1500);
        }

        cont.appendChild(btn);
    });
}

});

/* =========================
   PROGRESO
========================= */

function completeLesson(id){
  const done = JSON.parse(localStorage.getItem('ova_done')||'[]');
  if(!done.includes(id)) done.push(id);
  localStorage.setItem('ova_done', JSON.stringify(done));
  updateProgress();
}

function updateProgress(){
  const done = JSON.parse(localStorage.getItem('ova_done')||'[]');
  const percent = Math.round((done.length/lessons.length)*100);

  progress = percent;

  document.getElementById('fillBar').style.width = percent+'%';
  document.getElementById('progressTxt').innerText = `${done.length}/${lessons.length}`;
}

updateProgress();

/* =========================
   OTROS
========================= */

function uploadMaterial(){
  const f = document.getElementById('file');
  if(f.files.length===0){
    alert('Selecciona un archivo');
    return;
  }
  alert('Archivo subido (simulación).');
}

function copyLink(){
  navigator.clipboard?.writeText(location.href).then(()=>alert('Enlace copiado'));
}

function togglePreview(){
  window.scrollTo({top:0,behavior:'smooth'});
}

setInterval(()=>{
  const n = Math.max(8,12 + Math.floor(Math.random()*6));
  document.getElementById('activeCount').innerText = n;
  document.getElementById('lastAccess').innerText = new Date().toLocaleTimeString();
},5000);

/* =========================
   GOOGLE SHEETS
========================= */

function guardarResultados(){

let datos = {
nombre: document.getElementById("nombre").value,
puntaje: score,
progreso: progress,
comentario: document.getElementById("comentario").value,
calificacion: document.getElementById("rating").value
}

fetch("https://script.google.com/macros/s/AKfycbzpBIaFQuuCWx6a5l19VrH2F5ZCt9bZHWN5u5ovym5OQgfeR7gczx15_qD0ZgzlbZ95/exec", {
method:"POST",
headers:{"Content-Type":"application/json"},
body: JSON.stringify(datos)
})
.then(res=>res.text())
.then(data=>{ alert("Resultados guardados correctamente") })
.catch(error=>{ alert("Error al guardar resultados") })

}

function volverInicio(){
    window.location.href="../index.html";
}
