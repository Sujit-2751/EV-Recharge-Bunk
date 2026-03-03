// Handles register and login (demo using localStorage)
(function(){
  function loadUsers(){
    return JSON.parse(localStorage.getItem('users')||'[]');
  }
  function saveUsers(u){ localStorage.setItem('users',JSON.stringify(u)); }

  // Register
  const regForm = document.getElementById('registerForm');
  if(regForm){
    regForm.addEventListener('submit', e=>{
      e.preventDefault();
      const name=document.getElementById('regName').value.trim();
      const email=document.getElementById('regEmail').value.trim();
      const username=document.getElementById('regUsername').value.trim();
      const password=document.getElementById('regPassword').value;
      const role=document.getElementById('regRole').value;
      const users=loadUsers();
      if(users.find(x=>x.username===username)){
        alert('Username already exists'); return;
      }
      users.push({name,email,username,password,role});
      saveUsers(users);
      alert('Registration successful. You can now login.');
      location.href='index.html';
    });
  }

  // Login
  const loginForm = document.getElementById('loginForm');
  if(loginForm){
    loginForm.addEventListener('submit', e=>{
      e.preventDefault();
      const username=document.getElementById('loginUsername').value.trim();
      const password=document.getElementById('loginPassword').value;
      const users=loadUsers();
      const found = users.find(u=>u.username===username && u.password===password);
      if(!found){ alert('Invalid credentials'); return; }
      // Save current session (demo)
      localStorage.setItem('currentUser', JSON.stringify(found));
      if(found.role==='admin') {
        location.href='admin.html';
      } else {
        // Redirect regular users to the user view
        location.href='user.html';
      }
    });
  }
})();
