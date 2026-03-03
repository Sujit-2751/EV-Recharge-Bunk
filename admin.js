// Simple admin CRUD using localStorage for demo
(function(){
  const ensure = (k,init)=>{ if(!localStorage.getItem(k)) localStorage.setItem(k,JSON.stringify(init)); };
  ensure('locations',[]); ensure('bunks',[]); ensure('slots',[]);

  const qs = id => document.getElementById(id);
  const locForm = qs('locationForm');
  const bunkForm = qs('bunkForm');
  const slotForm = qs('slotForm');
  const locationsList = qs('locationsList');
  const bunksList = qs('bunksList');
  const slotsList = qs('slotsList');
  const bunkLocation = qs('bunkLocation');
  const slotBunk = qs('slotBunk');

  function read(k){ return JSON.parse(localStorage.getItem(k)||'[]'); }
  function write(k,v){ localStorage.setItem(k,JSON.stringify(v)); }

  function renderLocations(){
    const locs = read('locations');
    locationsList.innerHTML = '';
    bunkLocation.innerHTML = '<option value="">Select location</option>';
    locs.forEach((l,idx)=>{
      const el = document.createElement('div'); el.className='item';
      el.innerHTML = `<div class="meta"><strong>${l.name}</strong><small>${l.city}</small></div>
        <div class="actions"><button data-id="${idx}" class="btn ghost" data-type="edit-l">Edit</button>
        <button data-id="${idx}" class="btn ghost" data-type="del-l">Delete</button></div>`;
      locationsList.appendChild(el);
      const opt = document.createElement('option'); opt.value=idx; opt.textContent = l.name+' — '+l.city; bunkLocation.appendChild(opt);
    });
  }

  function renderBunks(){
    const bunks = read('bunks');
    bunksList.innerHTML='';
    slotBunk.innerHTML = '<option value="">Select bunk</option>';
    bunks.forEach((b,idx)=>{
      const el = document.createElement('div'); el.className='item';
      el.innerHTML = `<div class="meta"><strong>${b.name}</strong><small>${b.address} — ${b.chargers} chargers — ${b.locName||'No location'}</small></div>
        <div class="actions"><button data-id="${idx}" class="btn ghost" data-type="edit-b">Edit</button>
        <button data-id="${idx}" class="btn ghost" data-type="del-b">Delete</button></div>`;
      bunksList.appendChild(el);
      const opt = document.createElement('option'); opt.value=idx; opt.textContent = b.name+' ('+ (b.locName||'') +')'; slotBunk.appendChild(opt);
    });
  }

  function renderSlots(){
    const slots = read('slots');
    slotsList.innerHTML='';
    slots.forEach((s,idx)=>{
      const el = document.createElement('div'); el.className='item';
      el.innerHTML = `<div class="meta"><strong>${s.bunkName}</strong><small>${s.date} ${s.start} → ${s.end} • cap ${s.capacity}</small></div>
        <div class="actions"><button data-id="${idx}" class="btn ghost" data-type="edit-s">Edit</button>
        <button data-id="${idx}" class="btn ghost" data-type="del-s">Delete</button></div>`;
      slotsList.appendChild(el);
    });
  }

  // initial render
  renderLocations(); renderBunks(); renderSlots();

  // add location
  locForm && locForm.addEventListener('submit', e=>{
    e.preventDefault();
    const name = qs('locName').value.trim();
    const city = qs('locCity').value.trim();
    const lat = qs('locLat').value.trim();
    const lng = qs('locLng').value.trim();
    const locs = read('locations');
    locs.push({name,city,lat,lng}); write('locations',locs);
    locForm.reset(); renderLocations();
  });

  // add bunk
  bunkForm && bunkForm.addEventListener('submit', e=>{
    e.preventDefault();
    const locIdx = qs('bunkLocation').value;
    const locs = read('locations');
    const locName = locIdx!==''? locs[locIdx].name : '';
    const name = qs('bunkName').value.trim();
    const address = qs('bunkAddress').value.trim();
    const chargers = Number(qs('bunkChargers').value||0);
    const bunks = read('bunks');
    bunks.push({locIdx,locName,name,address,chargers}); write('bunks',bunks);
    bunkForm.reset(); renderBunks();
  });

  // add slot
  slotForm && slotForm.addEventListener('submit', e=>{
    e.preventDefault();
    const bunkIdx = qs('slotBunk').value; if(bunkIdx===''){ alert('Select bunk'); return; }
    const bunks = read('bunks');
    const bunkName = bunks[bunkIdx].name || '';
    const date = qs('slotDate').value; const start=qs('slotStart').value; const end=qs('slotEnd').value; const capacity=Number(qs('slotCapacity').value);
    const slots = read('slots');
    slots.push({bunkIdx,bunkName,date,start,end,capacity}); write('slots',slots);
    slotForm.reset(); renderSlots();
  });

  // list delegates
  document.body.addEventListener('click', e=>{
    const t = e.target; const type = t.dataset.type; const id = t.dataset.id;
    if(!type) return;
    if(type==='del-l'){ const locs = read('locations'); locs.splice(id,1); write('locations',locs); renderLocations(); }
    if(type==='edit-l'){ const locs = read('locations'); const l = locs[id]; const name=prompt('Name',l.name); if(name!=null){ l.name=name; l.city=prompt('City',l.city)||l.city; write('locations',locs); renderLocations(); } }

    if(type==='del-b'){ const bunks = read('bunks'); bunks.splice(id,1); write('bunks',bunks); renderBunks(); }
    if(type==='edit-b'){ const bunks = read('bunks'); const b=bunks[id]; b.name=prompt('Bunk name',b.name)||b.name; b.address=prompt('Address',b.address)||b.address; b.chargers=Number(prompt('Chargers',b.chargers)||b.chargers); write('bunks',bunks); renderBunks(); }
    if(type==='del-s'){ const slots = read('slots'); slots.splice(id,1); write('slots',slots); renderSlots(); }
    if(type==='edit-s'){ const slots = read('slots'); const s=slots[id]; s.date=prompt('Date',s.date)||s.date; s.start=prompt('Start time',s.start)||s.start; s.end=prompt('End time',s.end)||s.end; s.capacity=Number(prompt('Capacity',s.capacity)||s.capacity); write('slots',slots); renderSlots(); }
  });

  // logout
  const logoutBtn = qs('logoutBtn'); if(logoutBtn){ logoutBtn.addEventListener('click', ()=>{ localStorage.removeItem('currentUser'); location.href='index.html'; }); }

  // Security: redirect if not admin
  (function checkAdmin(){ const cur = JSON.parse(localStorage.getItem('currentUser')||'null'); if(!cur || cur.role!=='admin'){ alert('Admin access required'); location.href='index.html'; } })();
})();
