const coins = document.getElementById("coins");
const actions = document.getElementById("actions");
const pendingBox = document.getElementById("pendingBox");
const pendingTitle = document.getElementById("pendingTitle");
const pendingList = document.getElementById("pendingList");

const user = document.getElementById("user");
const pass = document.getElementById("pass");
const error = document.getElementById("error");

const loginBox = document.getElementById("login");
const app = document.getElementById("app");
const welcome = document.getElementById("welcome");
const music = document.getElementById("music");
const rewards = document.getElementById("rewards");
const rewardsTitle = document.getElementById("rewardsTitle");

// ====== FIREBASE ======
const firebaseConfig = {
  apiKey: "AIzaSyBoBxheDKCEcmaFxoU2P6XqrEOC5LoWInA",
  authDomain: "jyjapp-bf68b.firebaseapp.com",
  projectId: "jyjapp-bf68b",
  storageBucket: "jyjapp-bf68b.appspot.com",
  messagingSenderId: "795693974786",
  appId: "1:795693974786:web:eef2d66ca42c81c8a7ae1b"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ====== USUARIOS ======
const users = {
  jeremy: "amoajenifer",
  jeni: "amoajeremy"
};

let currentUser = null;

// ====== LOGIN ======
async function doLogin() {
  const u = user.value.toLowerCase();
  const p = pass.value;

  if (!users[u] || users[u] !== p) {
    error.innerText = "Usuario o contraseña incorrectos";
    return;
  }

  currentUser = u;

 loginBox.classList.add("hidden");
  app.classList.remove("hidden");

  welcome.innerText = "Bienvenido/a " + u.toUpperCase();
  music.play();

  renderApp();
}

// ====== OTRO USUARIO ======
function otherUser() {
  return currentUser === "jeremy" ? "jeni" : "jeremy";
}

// ====== DAR MONEDA ======
async function giveCoin() {
  await db.collection("users").doc(otherUser()).update({
    coins: firebase.firestore.FieldValue.increment(1)
  });

  renderApp();
}

// ====== RECOMPENSAS ======
function openRewards() {
  app.classList.add("hidden");
  rewards.classList.remove("hidden");

  rewardsTitle.innerText =
    "Recompensas de " + otherUser().toUpperCase();

  const grid = document.querySelector(".grid");
  grid.innerHTML = "";

  const rewardsList = [
    { name: "Abrazo largo", cost: 2 },
    { name: "Beso", cost: 2 },
    { name: "chape", cost: 5 },
    { name: "Día de mimos", cost: 8 },
    { name: "Carta", cost: 10 },
    { name: "elejir peli o serie en rave", cost: 7 },
    { name: "dulce o snack", cost: 10 },
    { name: "Reto random", cost: 30 },
    { name: "Premio especial🔥", cost: 50 },
    { name: "Regalito", cost: 50 }
  ];

 rewardsList.forEach(r => {
  const div = document.createElement("div");
  div.className = "reward";
  div.innerHTML = `
    <p>${r.name}</p>
    <p>${r.cost} monedas</p>
    <button onclick="buyReward('${r.name}', ${r.cost})">Comprar</button>
  `;
  grid.appendChild(div);
});
}


// ====== RENDER ======
async function renderApp() {
  const snap = await db.collection("users").doc(currentUser).get();
  const data = snap.data();

  coins.innerText = "💰 Monedas: " + data.coins;

  actions.innerHTML = `
    <button onclick="giveCoin()">Dar moneda a ${otherUser()}</button>
    <button onclick="openRewards()">🎁 Recompensas</button>
  `;

  pendingTitle.innerText = "Recompensas que debo";
  pendingList.innerHTML = "";

 if (data.pending) {
  data.pending.forEach(r => {
    const li = document.createElement("li");

    li.innerHTML = `
      ${r}
      <button onclick="completeReward('${r}')">✔</button>
    `;

    pendingList.appendChild(li);
  });
}

  pendingBox.classList.toggle(
    "hidden",
    !data.pending || data.pending.length === 0
  );
}

// ====== MUSICA ======
function toggleMusic() {
  music.paused ? music.play() : music.pause();
}

// ====== LOGOUT ======
function logout() {
  location.reload();
}

// ====== VOLVER ======
function backToApp() {
  rewards.classList.add("hidden");
  app.classList.remove("hidden");
  renderApp();
}
async function buyReward(name, cost) {
  const myRef = db.collection("users").doc(currentUser);
  const otherRef = db.collection("users").doc(otherUser());

  const snap = await myRef.get();
  const data = snap.data();

  if (data.coins < cost) {
    alert("No te alcanzan las monedas 😭");
    return;
  }

  // descontar monedas
  await myRef.update({
    coins: data.coins - cost
  });

  // agregar recompensa pendiente al otro
  await otherRef.update({
    pending: firebase.firestore.FieldValue.arrayUnion(name)
  });

  backToApp();
}


async function completeReward(name) {
  await db.collection("users").doc(currentUser).update({
    pending: firebase.firestore.FieldValue.arrayRemove(name)
  });

  renderApp();
}
