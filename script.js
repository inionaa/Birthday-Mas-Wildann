console.log('Wildan Birthday v4');

/* =====================================================
   DAFTAR ISI
   1. Pengaturan (edit di sini)
   2. Fungsi bantu
   3. Navigasi antar layar
   4. Musik
   5. Kalender
   6. Password
   7. Lilin: harapan -> tiup -> konfeti -> pop up
   8. Surat
   9. Grid foto
   10. Mesin capit
   11. Bunga
   12. Jalankan saat halaman dibuka
   ===================================================== */


/* =====================================================
   1. PENGATURAN (edit di sini)
   ===================================================== */
const TANGGAL_BENAR = 20;       // tanggal yang benar di kalender Oktober 2026
const PASSWORD      = "201002";
const CHAT_TEXT     = "Emm... Mas Wildannya aku itu, orangnya gimana sihh";
const FACT_TEXT     = "Baiikkk polll pollannn mwahh, royal, perhatian, pipinyo lucuu, sabar, sayang sama akuhh, dan humoris!!!";

// Foto bunga. Tambah baris baru kalau mau bunga lain.
// "result" (opsional) = gambar yang muncul di pop up setelah dipilih.
// Kalau tidak diisi, dipakai gambar "img".
const FLOWERS = [
  { img: "img/bunga1.png", result: "img/bunga1-hasil.png" },
  { img: "img/bunga2.png", result: "img/bunga2-hasil.png" }
];

// Foto di folder "yours" dan "us"
const GRID_YOURS = ["img/y1.jpg", "img/y2.jpg", "img/y3.jpg", "img/y4.jpg"];
const GRID_US    = ["img/u1.jpg", "img/u2.jpg", "img/u3.jpg", "img/u4.jpg"];


/* =====================================================
   2. FUNGSI BANTU
   ===================================================== */

// Singkatan: $('abc') sama dengan document.getElementById('abc')
function $(id) {
  return document.getElementById(id);
}

// Daftar timer yang sedang jalan, supaya bisa dibatalkan saat pindah layar
let timers = [];

// Waktu terakhir pindah layar (dipakai untuk mengabaikan ketukan "nyangkut")
let enteredAt = 0;

// Seperti setTimeout, tapi timer-nya dicatat
function later(fn, ms) {
  timers.push(setTimeout(fn, ms));
}

// Placeholder foto: kalau gambar berhasil dimuat, sembunyikan kotak abu-abu
function bindSlot(img) {
  const slot = img.parentNode;

  function onLoaded() {
    slot.classList.add('loaded');
  }

  function onError() {
    img.style.display = 'none';
    slot.classList.remove('loaded');
  }

  if (img.complete) {
    // Gambar sudah selesai dimuat (atau gagal)
    if (img.naturalWidth) onLoaded();
    else onError();
  } else {
    img.addEventListener('load', onLoaded);
    img.addEventListener('error', onError);
  }
}

// Membuat HTML satu slot foto
function slotHTML(src, label, extraClass) {
  const cls = extraClass || '';
  const text = label || src;
  return '<div class="slot ' + cls + '" data-label="' + text + '"><img src="' + src + '" alt=""></div>';
}


/* =====================================================
   3. NAVIGASI ANTAR LAYAR
   Pakai: go('id-layar')
   ===================================================== */
function go(id) {
  // Batalkan semua timer dari layar sebelumnya
  timers.forEach(clearTimeout);
  timers = [];
  enteredAt = Date.now();

  // Sembunyikan semua layar, lalu tampilkan layar tujuan
  document.querySelectorAll('.screen').forEach(function (s) {
    s.classList.remove('active');
  });
  const screen = $(id);
  screen.classList.add('active');
  screen.scrollTop = 0;
  $('app').dataset.screen = id;

  // Bersih-bersih
  if (id !== 's-candle') stopConfetti();
  closeModal();

  // Siapkan isi layar tujuan
  switch (id) {
    case 's-date':   initCalendar(); break;
    case 's-pass':   initPass(); break;
    case 's-chat2':  typeText('typeTxt', CHAT_TEXT, 70); break;
    case 's-about':
      $('factTxt').textContent = '';
      later(function () { typeText('factTxt', FACT_TEXT, 45); }, 600);
      break;
    case 's-candle': initCandle(); break;
    case 's-letter': $('envWrap').classList.remove('open'); break;
    case 's-claw':   resetClaw(); break;
    case 's-flower': showFlower(0); break;
  }
}

// Efek mengetik huruf demi huruf
function typeText(elementId, text, speed) {
  const el = $(elementId);
  el.textContent = '';
  el.classList.add('caret');
  let i = 0;

  function typeNext() {
    if (i < text.length) {
      el.textContent += text[i];
      i++;
      later(typeNext, speed);
    } else {
      el.classList.remove('caret');
    }
  }
  typeNext();
}


/* =====================================================
   4. MUSIK
   ===================================================== */
function toggleMusic() {
  const audio = $('bgm');
  const button = $('musicBtn');
  const tip = $('musicTip');

  if (audio.paused) {
    audio.play()
      .then(function () {
        button.classList.add('playing');
        button.textContent = '⏸';
        tip.classList.add('hidden');
        tip.classList.remove('err');
      })
      .catch(function () {
        // File musik tidak ketemu
        tip.textContent = 'File musik tidak ditemukan.\nTaruh di audio/musik.mp3';
        tip.style.whiteSpace = 'pre-line';
        tip.classList.remove('hidden');
        tip.classList.add('err');
      });
  } else {
    audio.pause();
    button.classList.remove('playing');
    button.textContent = '🎵';
  }
}


/* =====================================================
   5. KALENDER
   ===================================================== */
let calLock = false;   // true = sudah benar, jangan terima klik lagi

function initCalendar() {
  calLock = false;
  const grid = $('calGrid');
  grid.innerHTML = '';

  // Hari pertama Oktober 2026 jatuh di hari apa? (0 = Minggu)
  const firstDay = new Date(2026, 9, 1).getDay();
  // Jumlah hari di bulan Oktober
  const totalDays = new Date(2026, 10, 0).getDate();

  // Kotak kosong sebelum tanggal 1
  for (let i = 0; i < firstDay; i++) {
    grid.appendChild(document.createElement('span'));
  }

  // Tombol tanggal 1 sampai akhir bulan
  for (let day = 1; day <= totalDays; day++) {
    const button = document.createElement('button');
    const isSunday = (firstDay + day - 1) % 7 === 0;

    button.className = 'cell' + (isSunday ? ' sun' : '');
    button.textContent = day;
    button.onclick = function () { pickDate(button, day); };
    grid.appendChild(button);
  }

  $('calMsg').textContent = 'Pilih tanggal yang benar ya!';
}

function pickDate(button, day) {
  // Abaikan kalau sudah benar, atau tanggal ini sudah pernah salah
  if (calLock || button.classList.contains('wrong')) return;

  if (day === TANGGAL_BENAR) {
    calLock = true;
    button.classList.add('right');
    $('calMsg').textContent = 'Yeay, benar! 💖';
    later(function () { go('s-notif'); }, 1600);
  } else {
    button.classList.add('wrong');
    $('calMsg').textContent = 'Hmm, bukan itu… coba lagi ya 😅';
  }
}


/* =====================================================
   6. PASSWORD
   ===================================================== */
let entered = "";   // angka yang sudah ditekan

function initPass() {
  entered = "";
  const keypad = $('keypad');

  // Tombol angka hanya dibuat sekali
  if (keypad.children.length === 0) {
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].forEach(function (n) {
      const button = document.createElement('button');
      button.className = 'key' + (n === 0 ? ' zero' : '');
      button.textContent = n;
      button.onclick = function () { pressKey(String(n)); };
      keypad.appendChild(button);
    });
  }
  renderDots();
}

// Menggambar kotak bintang sesuai jumlah angka yang sudah dimasukkan
function renderDots() {
  const box = $('pwDots');
  box.innerHTML = '';

  for (let i = 0; i < PASSWORD.length; i++) {
    const dot = document.createElement('span');
    dot.textContent = i < entered.length ? '*' : '';
    box.appendChild(dot);
  }
}

function pressKey(n) {
  if (entered.length >= PASSWORD.length) return;

  entered += n;
  renderDots();

  // Kalau sudah lengkap, cek password
  if (entered.length === PASSWORD.length) {
    setTimeout(checkPassword, 250);
  }
}

function checkPassword() {
  if (entered === PASSWORD) {
    go('s-chat');
  } else {
    // Salah: getar, lalu kosongkan
    const box = $('pwDots');
    box.classList.add('shake');
    setTimeout(function () {
      box.classList.remove('shake');
      entered = "";
      renderDots();
    }, 400);
  }
}


/* =====================================================
   7. LILIN: harapan -> tiup -> konfeti -> pop up
   ===================================================== */

// Dipanggil setiap kali layar lilin dibuka: mulai dari tahap tulis harapan
function initCandle() {
  stopConfetti();

  $('wishInput').value = '';
  $('wishError').textContent = '';

  $('wishStage').classList.remove('hide');         // tampilkan kotak harapan
  $('cakeStage').classList.remove('show', 'blown'); // sembunyikan kue
  $('wishPopup').classList.remove('show');          // sembunyikan pop up
}

// Tombol "Aamiin, lanjut tiup lilin"
function submitWish() {
  const wish = $('wishInput').value.trim();

  // Harapan wajib diisi
  if (wish === '') {
    $('wishError').textContent = 'Tulis harapanmu dulu ya 😊';
    return;
  }

  // Ganti ke tahap kue
  $('wishStage').classList.add('hide');
  $('cakeStage').classList.add('show');
}

// Ketuk kue untuk meniup lilin
function blowCandle() {
  // Abaikan ketukan "nyangkut" dari tombol di layar sebelumnya
  if (Date.now() - enteredAt < 600) return;

  const stage = $('cakeStage');

  // Sudah ditiup? jangan ulangi
  if (stage.classList.contains('blown')) return;

  // 1) Api padam + keluar asap (diatur CSS lewat class "blown")
  stage.classList.add('blown');

  // 2) Setelah api padam: konfeti jatuh
  later(startConfetti, 900);

  // 3) Sedikit kemudian: pop up ucapan
  later(function () {
    $('wishPopup').classList.add('show');
  }, 1800);
}

/* ---------- Konfeti ---------- */
let confettiFrame;          // id animasi (untuk dihentikan)
let confettiPieces = [];    // daftar potongan konfeti

function startConfetti() {
  const canvas = $('confetti');
  const app = $('app');

  // Samakan ukuran canvas dengan ukuran aplikasi
  canvas.width = app.clientWidth;
  canvas.height = app.clientHeight;
  canvas.classList.add('on');

  const ctx = canvas.getContext('2d');
  const colors = ['#e83232', '#2f6bff', '#ffd23f', '#ff7a00', '#ff6fb5', '#ffffff'];

  // Buat 110 potongan konfeti dengan posisi, ukuran, dan kecepatan acak
  confettiPieces = [];
  for (let i = 0; i < 110; i++) {
    confettiPieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,        // mulai dari atas layar
      size: 4 + Math.random() * 6,
      speed: 1 + Math.random() * 2.5,
      angle: Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }

  cancelAnimationFrame(confettiFrame);

  // Gambar ulang tiap frame
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confettiPieces.forEach(function (p) {
      // Gerakkan
      p.y += p.speed;
      p.angle += 0.08;
      p.x += Math.sin(p.angle) * 0.8;

      // Kalau lewat bawah layar, ulang dari atas
      if (p.y > canvas.height) {
        p.y = -10;
        p.x = Math.random() * canvas.width;
      }

      // Gambar kotak kecil berputar
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(0, 0, p.size, p.size * 1.6);
      ctx.restore();
    });

    confettiFrame = requestAnimationFrame(draw);
  }
  draw();
}

function stopConfetti() {
  cancelAnimationFrame(confettiFrame);
  const canvas = $('confetti');
  canvas.classList.remove('on');
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}


/* =====================================================
   8. SURAT
   ===================================================== */
function openLetter() {
  // Abaikan ketukan "nyangkut"
  if (Date.now() - enteredAt < 600) return;

  const wrap = $('envWrap');
  if (!wrap.classList.contains('open')) {
    wrap.classList.add('open');
  }
}


/* =====================================================
   9. GRID FOTO
   ===================================================== */
function openGrid(type) {
  $('searchTxt').textContent = type;

  const photos = (type === 'yours') ? GRID_YOURS : GRID_US;
  const box = $('gridBox');

  // Buat satu kotak foto untuk tiap gambar
  box.innerHTML = photos.map(function (src, i) {
    return '<div class="slot" style="animation-delay:' + (i * 0.2) + 's" data-label="foto ' + (i + 1) + '">' +
             '<img src="' + src + '" alt="">' +
             '<div class="x dark">•</div>' +
           '</div>';
  }).join('');

  box.querySelectorAll('img').forEach(bindSlot);
  go('s-grid');
}


/* =====================================================
   10. MESIN CAPIT
   ===================================================== */
const SVG_NS = 'http://www.w3.org/2000/svg';

// Membuat elemen SVG: mk('circle', {cx: 10, cy: 10}, induk)
function mk(tag, attrs, parent) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
  if (parent) parent.appendChild(el);
  return el;
}

// Warna bola: [warna terang, warna utama, warna gelap]
const BALL_COLORS = {
  b: ['#d6ebff', '#3f8cff', '#1b4fb8'],   // biru
  g: ['#e2ffd0', '#7ed957', '#3a9a22'],   // hijau
  y: ['#fffbd0', '#ffd23f', '#d99a00'],   // kuning
  p: ['#ffd6e6', '#ee3a6e', '#b01545'],   // pink
  v: ['#f0d9ff', '#c76ae0', '#8031a3'],   // ungu
  o: ['#ffe3c4', '#ff9a3d', '#d45a00']    // oranye
};

// Daftar bola: [x, y, ukuran, warna, (1 = bola target)]
const BALLS = [
  [122, 247, 19, 'g'], [160, 249, 17, 'b'], [198, 247, 20, 'p'], [236, 252, 13, 'v'],
  [141, 227, 17, 'o'], [180, 226, 18, 'g'], [219, 230, 15, 'b'],
  [182, 197, 19, 'y', 1]   // bola target (paling atas)
];

// Membangun isi mesin capit (dipanggil sekali saat halaman dibuka)
function buildClaw() {
  const defs = $('clawDefs');

  // Gradasi warna untuk tiap bola
  for (const key in BALL_COLORS) {
    const gradient = mk('radialGradient', { id: 'rg-' + key, cx: '.35', cy: '.3', r: '.8' }, defs);
    const offsets = [0, 0.55, 1];
    BALL_COLORS[key].forEach(function (color, i) {
      mk('stop', { offset: offsets[i], 'stop-color': color }, gradient);
    });
  }

  // Gambar bola-bola
  const ballsGroup = $('balls');
  BALLS.forEach(function (ball) {
    const x = ball[0], y = ball[1], r = ball[2], color = ball[3], isTarget = ball[4];

    const group = mk('g', isTarget ? { id: 'target' } : {}, ballsGroup);

    // Badan bola
    mk('circle', {
      cx: x, cy: y, r: r,
      fill: 'url(#rg-' + color + ')',
      stroke: 'rgba(0,0,0,.35)',
      'stroke-width': 1.5
    }, group);

    // Kilau putih di bola
    const shineX = x - r * 0.35;
    const shineY = y - r * 0.4;
    mk('ellipse', {
      cx: shineX, cy: shineY, rx: r * 0.3, ry: r * 0.18,
      fill: '#fff', opacity: 0.6,
      transform: 'rotate(-30 ' + shineX + ' ' + shineY + ')'
    }, group);
  });

  // Lampu kelap-kelip di atas mesin
  const bulbs = $('bulbs');
  for (let x = 28; x <= 252; x += 28) {
    mk('circle', { class: 'bulb', cx: x, cy: 16, r: 3.5 }, bulbs);
  }
}

// Singkatan untuk memindah elemen
function move(element, transform) {
  element.style.transform = transform;
}

// Posisi lengan capit: terbuka & tertutup
const ARM_OPEN = ['rotate(26deg)', 'rotate(-26deg)'];
const ARM_SHUT = ['rotate(-6deg)', 'rotate(6deg)'];

// Kembalikan semua ke posisi awal (tanpa animasi)
function resetClaw() {
  const svg = $('clawSvg');
  svg.classList.add('notrans');

  move($('carriage'), 'translate(140px,0px)');
  move($('hoist'), 'translate(0px,100px)');
  move($('armL'), 'rotate(8deg)');
  move($('armR'), 'rotate(-8deg)');

  $('carried').setAttribute('opacity', 0);
  $('dropBall').setAttribute('opacity', 0);
  move($('dropBall'), 'translate(71px,140px)');
  $('doorBall').setAttribute('opacity', 0);
  $('target').style.opacity = 1;

  // Paksa browser menerapkan perubahan, baru aktifkan animasi lagi
  void svg.getBoundingClientRect();
  svg.classList.remove('notrans');

  $('btnClaw').disabled = false;
}

// Jalankan urutan animasi capit (angka = milidetik sejak tombol ditekan)
function doClaw() {
  $('btnClaw').disabled = true;

  // 0 dtk: buka capit dan geser ke atas bola
  move($('armL'), ARM_OPEN[0]);
  move($('armR'), ARM_OPEN[1]);
  move($('carriage'), 'translate(182px,0px)');

  // 1,3 dtk: turun
  later(function () {
    move($('hoist'), 'translate(0px,158px)');
  }, 1300);

  // 2,4 dtk: jepit
  later(function () {
    move($('armL'), ARM_SHUT[0]);
    move($('armR'), ARM_SHUT[1]);
  }, 2400);

  // 2,9 dtk: bola ikut terangkat
  later(function () {
    $('target').style.opacity = 0;
    $('carried').setAttribute('opacity', 1);
  }, 2900);

  // 3,2 dtk: naik
  later(function () {
    move($('hoist'), 'translate(0px,100px)');
  }, 3200);

  // 4,3 dtk: geser ke lubang hadiah
  later(function () {
    move($('carriage'), 'translate(71px,0px)');
  }, 4300);

  // 5,5 dtk: lepas, bola jatuh
  later(function () {
    move($('armL'), ARM_OPEN[0]);
    move($('armR'), ARM_OPEN[1]);
    $('carried').setAttribute('opacity', 0);

    const dropBall = $('dropBall');
    dropBall.setAttribute('opacity', 1);
    void dropBall.getBoundingClientRect();
    move(dropBall, 'translate(71px,262px)');
  }, 5500);

  // 6,25 dtk: bola sampai di pintu hadiah
  later(function () {
    $('dropBall').setAttribute('opacity', 0);
    $('doorBall').setAttribute('opacity', 1);
  }, 6250);

  // 7,3 dtk: pindah ke layar voucher
  later(function () {
    go('s-voucher');
  }, 7300);
}


/* =====================================================
   11. BUNGA
   ===================================================== */
let flowerIndex = 0;   // bunga yang sedang tampil

// dir: 0 = tanpa animasi, 1 = geser dari kanan, -1 = geser dari kiri
function showFlower(dir) {
  const card = $('fCard');
  const flower = FLOWERS[flowerIndex];

  card.innerHTML = slotHTML(flower.img, 'bunga ' + (flowerIndex + 1) + '\n' + flower.img, 'contain');
  bindSlot(card.querySelector('img'));

  // Ulang animasi geser
  card.classList.remove('slide-l', 'slide-r');
  void card.offsetWidth;
  if (dir) card.classList.add(dir > 0 ? 'slide-l' : 'slide-r');
}

// Panah kiri/kanan
function flip(direction) {
  flowerIndex = (flowerIndex + direction + FLOWERS.length) % FLOWERS.length;
  showFlower(direction);
}

// Pilih bunga: tampilkan pop up
function pickFlower() {
  const flower = FLOWERS[flowerIndex];
  const src = flower.result || flower.img;
  const box = $('mImg');

  box.className = 'slot contain m-img';
  box.setAttribute('data-label', src);
  box.innerHTML = '<img src="' + src + '" alt="">';
  bindSlot(box.querySelector('img'));

  $('modal').classList.add('show');
}

function closeModal() {
  $('modal').classList.remove('show');
}


/* =====================================================
   12. JALANKAN SAAT HALAMAN DIBUKA
   ===================================================== */
(function init() {
  buildClaw();
  document.querySelectorAll('.slot img').forEach(bindSlot);
})();
