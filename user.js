// Sample bunk data. Replace or extend with real data as needed.
const bunks = [
  {id:1,name:"GreenCharge Station",address:"12 Green St, New Delhi",phone:"+91-98100-00001",lat:28.6139,lng:77.2090,totalSlots:8,slotsAvailable:3},
  {id:2,name:"FastZap Bunk",address:"45 Market Rd, New Delhi",phone:"+91-98100-00002",lat:28.6200,lng:77.2150,totalSlots:6,slotsAvailable:1},
  {id:3,name:"ChargePoint Central",address:"78 Ring Rd, New Delhi",phone:"+91-98100-00003",lat:28.6050,lng:77.2300,totalSlots:10,slotsAvailable:7},
  {id:4,name:"EV Express",address:"9 Park Lane, New Delhi",phone:"+91-98100-00004",lat:28.6100,lng:77.2000,totalSlots:4,slotsAvailable:0},
  {id:5,name:"SparkCharge",address:"200 MG Rd, New Delhi",phone:"+91-98100-00005",lat:28.6250,lng:77.1950,totalSlots:12,slotsAvailable:9}
];

const resultsEl = document.getElementById('results');
const detailsEl = document.getElementById('details');
const searchInput = document.getElementById('searchInput');
const locBtn = document.getElementById('locBtn');
const statusEl = document.getElementById('status');

let currentLocation = null; // {lat, lng}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = v => v * Math.PI / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function formatDistance(km){
  if (km < 1) return Math.round(km*1000) + ' m';
  return km.toFixed(1) + ' km';
}

function renderResults(list){
  resultsEl.innerHTML = '';
  if(!list.length){ resultsEl.innerHTML = '<p class="muted">No bunks found.</p>'; return; }

  list.forEach(b => {
    const item = document.createElement('div');
    item.className = 'item';
    const meta = document.createElement('div'); meta.className='meta';
    const title = document.createElement('strong'); title.textContent = b.name;
    const addr = document.createElement('small'); addr.textContent = b.address;
    meta.appendChild(title); meta.appendChild(addr);
    const right = document.createElement('div');
    const dist = document.createElement('div'); dist.textContent = b.distance!=null?formatDistance(b.distance):'-';
    const btn = document.createElement('button'); btn.className='btn'; btn.textContent='View';
    btn.onclick = ()=> showDetails(b);
    right.appendChild(dist); right.appendChild(btn);
    item.appendChild(meta); item.appendChild(right);
    resultsEl.appendChild(item);
  });
}

function showDetails(b){
  // Render selected bunk details inline in the details panel (no popup)
  detailsEl.innerHTML = '';
  const card = document.createElement('div'); card.className = 'item';
  const meta = document.createElement('div'); meta.className = 'meta';
  const title = document.createElement('strong'); title.textContent = b.name;
  const addr = document.createElement('small'); addr.textContent = b.address;
  meta.appendChild(title); meta.appendChild(addr);
  card.appendChild(meta);

  const info = document.createElement('div'); info.className = 'meta';
  const phone = document.createElement('div'); phone.textContent = 'Phone: ' + b.phone;
  const slots = document.createElement('div'); slots.textContent = `Slots: ${b.slotsAvailable} / ${b.totalSlots}`;
  if(b.slotsAvailable===0) slots.style.color='salmon';
  info.appendChild(phone); info.appendChild(slots);
  card.appendChild(info);
  detailsEl.appendChild(card);

  // Add embedded live map (using maps.google.com embed query). No API key required for this simple embed.
  const mapWrap = document.createElement('div'); mapWrap.className = 'map-wrap';
  const iframe = document.createElement('iframe');
  iframe.className = 'map-frame';
  iframe.src = `https://maps.google.com/maps?q=${b.lat},${b.lng}&z=15&output=embed`;
  iframe.setAttribute('loading','lazy');
  iframe.setAttribute('referrerpolicy','no-referrer-when-downgrade');
  mapWrap.appendChild(iframe);
  detailsEl.appendChild(mapWrap);
}


function updateList(){
  const q = (searchInput.value||'').trim().toLowerCase();
  let list = bunks.map(b => Object.assign({}, b));
  if(currentLocation){
    list.forEach(b=> b.distance = haversineDistance(currentLocation.lat,currentLocation.lng,b.lat,b.lng));
    list.sort((a,b)=> (a.distance||0) - (b.distance||0));
  }
  if(q){
    list = list.filter(b=> b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q));
  }
  renderResults(list);
  renderDetailsSummary(list.slice(0,5));
}

function renderDetailsSummary(list){
  detailsEl.innerHTML = '';
  if(!list.length){ detailsEl.innerHTML='<p class="muted">No details to show.</p>'; return; }
  list.forEach(b=>{
    const item = document.createElement('div'); item.className='item';
    const meta = document.createElement('div'); meta.className='meta';
    const title = document.createElement('strong'); title.textContent = b.name + (b.distance?(' — '+formatDistance(b.distance)):'');
    const small = document.createElement('small'); small.textContent = `${b.address} • ${b.phone}`;
    const vacancy = document.createElement('div'); vacancy.textContent = `Vacancy: ${b.slotsAvailable}/${b.totalSlots}`;
    if(b.slotsAvailable===0) vacancy.style.color='salmon';
    meta.appendChild(title); meta.appendChild(small);
    item.appendChild(meta); item.appendChild(vacancy);
    detailsEl.appendChild(item);
  });
}

locBtn.addEventListener('click', ()=>{
  if(!navigator.geolocation){
    if(statusEl) statusEl.textContent = 'Geolocation not supported in this browser.'; return;
  }
  locBtn.disabled = true; locBtn.textContent = 'Locating...';
  if(statusEl) statusEl.textContent = 'Locating...';
  navigator.geolocation.getCurrentPosition(pos=>{
    currentLocation = {lat: pos.coords.latitude, lng: pos.coords.longitude};
    locBtn.textContent = 'Use my location'; locBtn.disabled=false;
    if(statusEl) statusEl.textContent = '';
    updateList();
  }, err=>{
    if(statusEl) statusEl.textContent = 'Unable to get location: ' + err.message;
    locBtn.textContent = 'Use my location'; locBtn.disabled=false;
  }, {enableHighAccuracy:true,timeout:10000});
});

searchInput.addEventListener('input', ()=> updateList());

// initial render (without location sorts)
updateList();
