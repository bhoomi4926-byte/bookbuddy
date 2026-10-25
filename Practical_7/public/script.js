const form=document.getElementById('book-form');
const message=document.getElementById('form-message');
const submitBtn=document.getElementById('submit-btn');
const cancelBtn=document.getElementById('cancel-btn');
const list=document.getElementById('books-list');
const count=document.getElementById('book-count');
const refreshBtn=document.getElementById('refresh-btn');
const idInput=document.getElementById('book-id');
const field=id=>document.getElementById(id);
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function showMessage(text,type=''){message.textContent=text;message.className=`form-message ${type}`;}
function resetForm(){form.reset();idInput.value='';field('rating').value='4';submitBtn.textContent='Save book';cancelBtn.classList.add('hidden');showMessage('');}
function renderBooks(books){
 count.textContent=books.length;
 if(!books.length){list.innerHTML='<div class="empty-state"><div>📚</div><h3>Your shelf is waiting</h3><p>Add your first book using the form.</p></div>';return;}
 list.innerHTML=books.map(b=>{const r=Number(b.rating)||4;return `<article class="book-card"><div class="book-cover"><span>BOOK<br>BUDDY</span></div><div class="book-info"><span class="genre-pill">${esc(b.genre||'Fiction')}</span><h3>${esc(b.title)}</h3><p class="author">by ${esc(b.author)}</p><p class="stars">${'★'.repeat(r)}<span>${'☆'.repeat(5-r)}</span></p>${b.description?`<p class="description">${esc(b.description)}</p>`:''}${b.review?`<p class="review">“${esc(b.review)}”</p>`:''}<div class="card-meta"><span>${esc(b.language||'English')}</span><span>Saved to MongoDB</span></div><div class="card-actions"><button class="edit-btn" data-action="edit" data-id="${esc(b._id)}">Edit</button><button class="delete-btn" data-action="delete" data-id="${esc(b._id)}">Delete</button></div></div></article>`;}).join('');
}
async function loadBooks(){refreshBtn.disabled=true;try{const r=await fetch('/api/books');const j=await r.json();if(!r.ok)throw Error(j.message||'Could not retrieve books');renderBooks(j.data);}catch(e){showMessage(e.message,'error');}finally{refreshBtn.disabled=false;}}
form.addEventListener('submit',async e=>{e.preventDefault();const id=idInput.value;const payload={title:field('title').value.trim(),author:field('author').value.trim(),genre:field('genre').value,language:field('language').value,rating:Number(field('rating').value),description:field('description').value.trim(),review:field('review').value.trim()};submitBtn.disabled=true;try{const r=await fetch(id?`/api/books/${id}`:'/api/books',{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const j=await r.json();if(!r.ok)throw Error(j.message||'Request failed');showMessage(j.message||'Book saved successfully','success');resetForm();await loadBooks();}catch(e){showMessage(e.message,'error');}finally{submitBtn.disabled=false;submitBtn.textContent=idInput.value?'Update book':'Save book';}});
list.addEventListener('click',async e=>{const btn=e.target.closest('button[data-action]');if(!btn)return;const id=btn.dataset.id;if(btn.dataset.action==='edit'){try{const r=await fetch(`/api/books/${id}`);const j=await r.json();if(!r.ok)throw Error(j.message||'Could not load book');const b=j.data;idInput.value=b._id;for(const key of ['title','author','genre','language','rating','description','review'])field(key).value=b[key]??(key==='rating'?4:'');submitBtn.textContent='Update book';cancelBtn.classList.remove('hidden');showMessage('Editing this book. Save changes when ready.');field('title').focus();window.scrollTo({top:0,behavior:'smooth'});}catch(err){showMessage(err.message,'error');}}
if(btn.dataset.action==='delete'){const title=btn.closest('.book-card')?.querySelector('h3')?.textContent||'this book';if(!confirm(`Delete "${title}" from your collection?`))return;btn.disabled=true;try{const r=await fetch(`/api/books/${id}`,{method:'DELETE'});const j=await r.json();if(!r.ok)throw Error(j.message||'Could not delete book');showMessage(j.message,'success');if(idInput.value===id)resetForm();await loadBooks();}catch(err){showMessage(err.message,'error');btn.disabled=false;}}});
cancelBtn.addEventListener('click',resetForm);refreshBtn.addEventListener('click',loadBooks);
