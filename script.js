// 1. EFEK NAVBAR JIKA DI-SCROLL
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// 2. TOGGLE MENU MOBILE RESPONSIVE
const menu = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('.nav-links');

menu.addEventListener('click', function() {
    menuLinks.classList.toggle('active');
    // Animasi tombol burger jadi 'X'
    menu.classList.toggle('is-active'); 
});


// 3. TYPING EFFECT (EFEK MENGETIK KATA)
const words = ["Web Designer", "Frontend Developer", "Creative Thinker"];
let i = 0;
let timer;

function typingEffect() {
    let word = words[i].split("");
    var loopTyping = function() {
        if (word.length > 0) {
            document.querySelector('.typing-text').innerHTML += word.shift();
        } else {
            setTimeout(deletingEffect, 2000);
            return false;
        }
        timer = setTimeout(loopTyping, 100);
    };
    loopTyping();
}

function deletingEffect() {
    let word = words[i].split("");
    var loopDeleting = function() {
        if (word.length > 0) {
            word.pop();
            document.querySelector('.typing-text').innerHTML = word.join("");
        } else {
            if (words.length > (i + 1)) {
                i++;
            } else {
                i = 0;
            }
            setTimeout(typingEffect, 500);
            return false;
        }
        timer = setTimeout(loopDeleting, 50);
    };
    loopDeleting();
}

// Jalankan efek mengetik setelah halaman dimuat
document.addEventListener("DOMContentLoaded", typingEffect);
// ==========================================
// SIMULASI PHYSICS LANYARD & ID CARD (MANTUL EKSTREM)
// ==========================================
const card = document.getElementById('idCard');
const path = document.getElementById('lanyardPath');

// Titik Jangkar Sabuk/Paku atas (Anchor)
const anchorX = window.innerWidth <= 768 ? window.innerWidth / 2 : (window.innerWidth * 0.75); 
const anchorY = 25; // koordinat Y gantungan baju/paku

// Posisi & Fisika Kartu
let cardX = 0, cardY = 140; // Posisi real-time
let targetX = 0, targetY = 140; // Titik kesetimbangan semula (relatif dari tengah container)
let vx = 0, vy = 0; // Kecepatan gerak (Velocity)

let isDraggingCard = false;
let pointerStartX = 0, pointerStartY = 0;
let cardStartX = 0, cardStartY = 0;

// Parameter Elastisitas Pegas (Silahkan utak-atik biar dapet sensasi mantul yang pas)
const stiffness = 0.15; // Kekencangan pegas karet lanyard
const damping = 0.82;   // Redaman ayunan (makin kecil makin lama mantulnya)
const gravity = 0.4;    // Efek berat kartu jatuh ke bawah

// Set posisi awal kartu ke tengah container secara presisi saat load halaman
function initCardPosition() {
    const rect = card.parentElement.getBoundingClientRect();
    targetX = rect.width / 2;
    cardX = targetX;
    updateVisuals();
}

// Fungsi Update Posisi Tali SVG dan Transformasi Kartu
function updateVisuals() {
    const rect = card.parentElement.getBoundingClientRect();
    const localAnchorX = rect.width / 2;

    // Geser letak kartu memakai CSS Translate secara instan tanpa delay transisi css
    card.style.transform = `translate(-50%, 0) translate(${cardX - localAnchorX}px, ${cardY - 140}px) rotate(${(cardX - localAnchorX) * 0.15}deg)`;

    // Buat tali Lanyard menekuk elastis mengikuti sudut seretan kartu
    path.setAttribute('d', `M ${localAnchorX} ${anchorY} Q ${(localAnchorX + cardX)/2} ${(anchorY + cardY)/2 + 20} ${cardX} ${cardY}`);
}

// Handler Klik / Sentuh Layar
function onPointerDown(e) {
    isDraggingCard = true;
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    
    pointerStartX = clientX;
    pointerStartY = clientY;
    cardStartX = cardX;
    cardStartY = cardY;
    
    vx = 0; vy = 0; // Reset speed pas dipegang
}

// Handler Saat Kartu Diseret (Drag)
function onPointerMove(e) {
    if (!isDraggingCard) return;
    
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    
    // Hitung jarak pergeseran kursor
    const dx = clientX - pointerStartX;
    const dy = clientY - pointerStartY;
    
    // Posisi kartu langsung mengikuti pergerakan tangan tanpa ampun
    cardX = cardStartX + dx;
    cardY = cardStartY + dy;
    
    // Beri batasan tarikan maksimal ke bawah atau samping demi estetika layout
    if(cardY < 60) cardY = 60; 
    
    updateVisuals();
}

// Handler Saat Klik Dilepas (Mental ke mana-mana)
function onPointerUp() {
    if (!isDraggingCard) return;
    isDraggingCard = false;
}

// Loops Simulasi Fisika (Dijalankan terus-menerus setiap frame lewat requestAnimationFrame)
function physicsLoop() {
    if (!isDraggingCard) {
        // Rumus Hukum Hooke untuk Pegas (Spring Physics)
        let ax = (targetX - cardX) * stiffness;
        let ay = (targetY - cardY) * stiffness + gravity; // Ditambah efek gravitasi bumi
        
        // Akumulasikan percepatan ke kecepatan
        vx += ax;
        vy += ay;
        
        // Aplikasikan friction/damping agar ayunannya melambat seiring waktu
        vx *= damping;
        vy *= damping;
        
        // Ubah koordinat posisi kartu berdasarkan kecepatan saat ini
        cardX += vx;
        cardY += vy;
        
        updateVisuals();
    }
    requestAnimationFrame(physicsLoop);
}

// Daftarkan Event Listener
card.addEventListener('mousedown', onPointerDown);
window.addEventListener('mousemove', onPointerMove);
window.addEventListener('mouseup', onPointerUp);

card.addEventListener('touchstart', onPointerDown);
window.addEventListener('touchmove', onPointerMove);
window.addEventListener('touchend', onPointerUp);

// Jalankan ketika halaman web selesai dimuat
document.addEventListener("DOMContentLoaded", () => {
    initCardPosition();
    physicsLoop();
});

// Update ulang titik tengah kartu jika ukuran window browser di-resize
window.addEventListener('resize', initCardPosition);
// ==========================================
// PARTICLE TYPOGRAPHY - MAULANA ISHAQ
// ==========================================
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

let particleArray = [];
const textToRender = "MAULANA ISHAQ";

// Manajemen koordinat mouse
const mouse = {
    x: null,
    y: null,
    radius: 60 // Jarak radius jangkauan dorongan mouse ke partikel
};

// Deteksi gerakan mouse di area canvas
window.addEventListener('mousemove', function(event) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
});

// Reset posisi mouse kalau kursor keluar dari area nama
window.addEventListener('mouseout', function() {
    mouse.x = null;
    mouse.y = null;
});

// Blueprint Object Partikel Tunggal
class Particle {
    constructor(x, y) {
        this.x = x + 200; // Mulai dari posisi acak saat pertama di-load
        this.y = y + 200;
        this.originX = x; // Menyimpan koordinat asli huruf
        this.originY = y;
        this.color = '#0ea5e9'; // Warna biru neon menyala sesuai tema
        this.size = 2.5; // Ukuran butiran partikel
        this.vx = 0; // Kecepatan horizontal
        this.vy = 0; // Kecepatan vertikal
        this.density = (Math.random() * 30) + 15; // Tingkat kelembaman/berat partikel saat mental
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        // Hitung jarak partikel dengan kursor mouse
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        
        // Rumus interaksi gaya tolak mouse (Physics Repulsion)
        if (distance < mouse.radius) {
            let force = (mouse.radius - distance) / mouse.radius;
            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;
            
            this.vx -= directionX;
            this.vy -= directionY;
        } else {
            // Jika mouse menjauh, kembalikan partikel ke bentuk huruf semula (Hukum Hooke)
            let ax = (this.originX - this.x) * 0.08;
            let ay = (this.originY - this.y) * 0.08;
            this.vx += ax;
            this.vy += ay;
        }
        
        // Geser posisi partikel dengan friksi agar tidak melesat tak terkendali
        this.vx *= 0.85;
        this.vy *= 0.85;
        this.x += this.vx;
        this.y += this.vy;
    }
}

// Fungsi memindai koordinat teks lalu diubah jadi array partikel
function initParticles() {
    // Sesuaikan resolusi canvas internal dengan ukuran layout aslinya
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    
    particleArray = [];
    
    // Tulis teks sementara di memori canvas tersembunyi untuk di-scan koordinat pixel-nya
    ctx.fillStyle = 'white';
    // Gunakan font tebal agar jumlah partikelnya padat dan keterbacaan teksnya jelas
    ctx.font = '900 36px Poppins'; 
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(textToRender, 0, canvas.height / 2);
    
    // Ambil data gambar pixel dari area canvas teks tersebut
    const textPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Lakukan scanning pixel (Langkah loncatan per 4 pixel agar performa super enteng)
    for (let y = 0; y < textPixels.height; y += 4) {
        for (let x = 0; x < textPixels.width; x += 4) {
            // Cek jika pixel tersebut berwarna putih (ada tulisan hurufnya)
            if (textPixels.data[(y * 4 * textPixels.width) + (x * 4) + 3] > 128) {
                particleArray.push(new Particle(x, y));
            }
        }
    }
}

// Loop Animasi Canvas
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particleArray.length; i++) {
        particleArray[i].update();
        particleArray[i].draw();
    }
    requestAnimationFrame(animateParticles);
}

// Handle jika user mengubah ukuran browser agar partikel disusun ulang otomatis
window.addEventListener('resize', function() {
    initParticles();
});

// Jalankan animasi setelah halaman siap
document.addEventListener("DOMContentLoaded", () => {
    initParticles();
    animateParticles();
});
// ==========================================
// ANIMASI INTRO HURUF M ALA NETFLIX
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const introOverlay = document.getElementById('introOverlay');
    const nCanvas = document.getElementById('netflixCanvas');
    const nCtx = nCanvas.getContext('2d');

    // Kunci scroll saat intro berjalan
    document.body.style.overflow = 'hidden';

    // Set resolusi internal canvas
    function resizeNetflixCanvas() {
        nCanvas.width = window.innerWidth;
        nCanvas.height = window.innerHeight;
    }
    resizeNetflixCanvas();

    // Parameter Animasi
    let scale = 0.5;        // Skala awal huruf M
    let alphaM = 1;         // Transparansi huruf M
    let stage = 1;          // Stage 1: Zoom M, Stage 2: Pecah jadi Garis (Streaks)
    let streaks = [];       // Array untuk menampung garis barcode
    const totalStreaks = 45; // Jumlah potongan garis vertikal

    // Inisialisasi data garis vertikal untuk Stage 2
    function createStreaks() {
        const centerX = nCanvas.width / 2;
        for (let i = 0; i < totalStreaks; i++) {
            // Variasi warna gradasi neon biru-putih agar matching dengan tema web kamu
            const colors = ['#0ea5e9', '#38bdf8', '#0284c7', '#ffffff', '#1e293b'];
            streaks.push({
                x: centerX + (Math.random() - 0.5) * 150, // Menyebar dari area tengah huruf M
                y: 0,
                width: Math.random() * 4 + 1,
                height: nCanvas.height,
                speedY: Math.random() * 15 + 10,
                speedScale: Math.random() * 0.04 + 0.02,
                currentScale: 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: Math.random() * 0.5 + 0.5
            });
        }
    }

    // Loop Utama Render Animasi Netflix
    function drawNetflixIntro() {
        nCtx.fillStyle = '#000000';
        nCtx.fillRect(0, 0, nCanvas.width, nCanvas.height);

        const centerX = nCanvas.width / 2;
        const centerY = nCanvas.height / 2;

        if (stage === 1) {
            // --- STAGE 1: HURUF M MAJU & MEMBESAR ---
            scale += 0.007; // Kecepatan pembesaran huruf

            nCtx.save();
            nCtx.translate(centerX, centerY);
            nCtx.scale(scale, scale);

            // Efek Bayangan Kebelakang (3D Shadow effect khas Netflix)
            for (let depth = 30; depth > 0; depth--) {
                nCtx.fillStyle = `rgba(14, 165, 233, ${0.01 * (30 - depth)})`; // Gradasi bayangan biru
                nCtx.font = '900 150px Georgia, serif';
                nCtx.textAlign = 'center';
                nCtx.textBaseline = 'middle';
                nCtx.fillText('M', -depth * 0.5, depth * 0.5);
            }

            // Huruf Utama di lapisan paling depan
            nCtx.fillStyle = `rgba(255, 255, 255, ${alphaM})`;
            nCtx.font = '900 150px Georgia, serif';
            nCtx.textAlign = 'center';
            nCtx.textBaseline = 'middle';
            nCtx.fillText('M', 0, 0);
            nCtx.restore();

            // Jika ukuran huruf sudah sangat besar, pindah ke Stage 2 (Explosion/Streaks)
            if (scale >= 1.3) {
                stage = 2;
                createStreaks();
            }
        } else if (stage === 2) {
            // --- STAGE 2: PECAH MENJADI GARIS VERTIKAL MALESAT ---
            let activeStreaks = 0;

            streaks.forEach(s => {
                nCtx.save();
                // Gambar garis vertikal
                nCtx.fillStyle = s.color;
                nCtx.globalAlpha = s.opacity;
                
                // Efek garis melesat mendekati kamera (menggunakan transformasi scale)
                s.currentScale += s.speedScale;
                s.opacity -= 0.015; // Perlahan memudar

                nCtx.translate(s.x, centerY);
                nCtx.scale(1, s.currentScale);
                nCtx.fillRect(-s.width/2, -centerY, s.width, nCanvas.height);
                nCtx.restore();

                if (s.opacity > 0) activeStreaks++;
            });

            // Jika semua garis sudah pudar, akhiri intro
            if (activeStreaks === 0) {
                introOverlay.classList.add('intro-fade-out');
                document.body.style.overflow = 'auto'; // Aktifkan scroll web kembali

                // Trigger shockwave partikel nama utama (jika ada kodingannya)
                if (typeof particleArray !== 'undefined' && particleArray.length > 0) {
                    particleArray.forEach(p => {
                        p.vx = (Math.random() - 0.5) * 45;
                        p.vy = (Math.random() - 0.5) * 45;
                    });
                }
                return; // Stop loop animasi canvas
            }
        }

        requestAnimationFrame(drawNetflixIntro);
    }

    // Jalankan animasi
    drawNetflixIntro();

    window.addEventListener('resize', resizeNetflixCanvas);
});
// ==========================================
// 3. SMOOTH SCROLL ENGINE & REVEAL ANIMATION
// ==========================================

// Inisialisasi Engine Smooth Scroll (Lenis)
const lenis = new Lenis({
    duration: 1.2,          // Durasi kehalusan scroll (makin besar makin lambat/smooth)
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Rumus kelenturan physics scroll
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false
});

// Fungsi loop yang diwajibkan oleh Lenis Engine
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);


// Fungsi Deteksi Elemen Saat Di-scroll (Reveal Animation)
function handleReveal() {
    const reveals = document.querySelectorAll('.reveal');
    
    reveals.forEach(reveal => {
        const windowHeight = window.innerHeight;
        const elementTop = reveal.getBoundingClientRect().top;
        const elementVisible = 120; // Jarak trigger memicu animasi (pixel)
        
        if (elementTop < windowHeight - elementVisible) {
            reveal.classList.add('active');
        }
    });
}

// Jalankan deteksi reveal setiap kali user melakukan scrolling
window.addEventListener('scroll', handleReveal);
// ==========================================
// LOGIKA ANIMASI MATA INTERAKTIF (RESPONSIVE + PUPIL SCALE)
// ==========================================
const irises = document.querySelectorAll('.cyber-iris');
const pupils = document.querySelectorAll('.cyber-pupil');
const eyes = document.querySelectorAll('.cyber-eye');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// Menangkap kursor mouse
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Menangkap sentuhan HP
window.addEventListener('touchmove', (e) => {
    if (e.touches[0]) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
    }
}, { passive: true });

const irisData = Array.from(irises).map(() => ({ currentX: 0, currentY: 0 }));

function animateEyes() {
    irises.forEach((iris, index) => {
        const eye = eyes[index];
        const pupil = pupils[index];
        const rect = eye.getBoundingClientRect();
        
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;
        
        const dx = mouseX - eyeCenterX;
        const dy = mouseY - eyeCenterY;
        const angle = Math.atan2(dy, dx);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Batasi pergerakan bola mata
        const maxOffset = 16; 
        const clampedDistance = Math.min(distance, 180);
        const targetX = Math.cos(angle) * (clampedDistance / 180 * maxOffset);
        const targetY = Math.sin(angle) * (clampedDistance / 180 * maxOffset);
        
        // --- FIX GERAKAN LAMBAT: Naikkan nilai dari 0.1 ke 0.25 biar responsif gila! ---
        irisData[index].currentX += (targetX - irisData[index].currentX) * 0.25;
        irisData[index].currentY += (targetY - irisData[index].currentY) * 0.25;
        
        // Aplikasikan pergerakan mata
        iris.style.transform = `translate(${irisData[index].currentX}px, ${irisData[index].currentY}px)`;
        
        // --- EFEK TAKJUB (PUPIL MEMBESAR) ---
        // Jika kursor mendekati area mata (jarak kurang dari 250px), pupil membesar up to 1.5x
        if (distance < 250) {
            // Semakin dekat kursor, semakin besar pupil hitamnya
            const scaleFactor = 1 + ((250 - distance) / 250) * 0.5; 
            pupil.style.transform = `scale(${scaleFactor})`;
        } else {
            pupil.style.transform = `scale(1)`; // Ukuran normal jika kursor jauh
        }
    });
    
    requestAnimationFrame(animateEyes);
}
animateEyes();

// --- LOGIKA BERKEDIP ACAK ---
function triggerRandomBlink() {
    eyes.forEach(eye => {
        if (Math.random() > 0.25) {
            eye.classList.add('blink');
            setTimeout(() => {
                eye.classList.remove('blink');
            }, 120); 
        }
    });
    setTimeout(triggerRandomBlink, 2500 + Math.random() * 3500);
}
setTimeout(triggerRandomBlink, 2000);
// ==========================================
// INTEGRASI DATABASE SUPABASE (KIRIM & PAJANG PESAN)

// ==========================================
// KUNCI DATABASE SUPABASE KAMU (UPDATED)
// ==========================================
const SUPABASE_URL = 'https://vybtvktcyqyjrhnkwlj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_0bneid89jGgwpIupg2eLmw_VSHilDvhq'; 

// PERBAIKAN: Tambahkan kata 'supabase.' di awal createClient agar tidak error koneksi
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// 1. FUNGSI MENGAMBIL PESAN YANG SUDAH DI-APPROVE UNTUK DIPAJANG
async function muatTestimoni() {
    const grid = document.getElementById('testimonialsGrid');
    
    // Ambil data yang kolom 'tampilkan' bernilai true
    const { data, error } = await supabase
        .from('pesan_pengunjung')
        .select('nama, pesan')
        .eq('tampilkan', true);

    if (error) {
        grid.innerHTML = '<div class="loading-text">Gagal memuat pesan.</div>';
        return;
    }

    if (data.length === 0) {
        grid.innerHTML = '<div class="loading-text">Belum ada pesan terpajang. Berikan komentar pertamamu di bawah!</div>';
        return;
    }

    grid.innerHTML = ''; // Kosongkan text loading
    
    // Render data ke bentuk kartu HTML
    data.forEach(item => {
        const inisial = item.nama.charAt(0);
        const cardHtml = `
            <div class="testimonial-card">
                <p class="testimonial-quote">"${item.pesan}"</p>
                <div class="testimonial-author">
                    <div class="author-avatar">${inisial}</div>
                    <div class="author-info">
                        <h4>${item.nama}</h4>
                    </div>
                </div>
            </div>
        `;
        grid.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// 2. FUNGSI MENGIRIM PESAN DARI FORM HUBUNGI SAYA
const formKontak = document.querySelector('.contact-section form') || document.querySelector('form');

if (formKontak) {
    formKontak.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Ambil elemen input (sesuaikan name/class-nya dengan html kamu bre)
        const namaInput = formKontak.querySelector('input[type="text"]') || formKontak.querySelector('[name="nama"]');
        const emailInput = formKontak.querySelector('input[type="email"]') || formKontak.querySelector('[name="email"]');
        const pesanInput = formKontak.querySelector('textarea');
        const tombolKirim = formKontak.querySelector('button');

        const dataPesan = {
            nama: namaInput.value,
            email: emailInput.value,
            pesan: pesanInput.value
        };

        tombolKirim.innerText = 'Mengirim...';
        tombolKirim.disabled = true;

        // Insert data ke tabel Supabase
        const { error } = await supabase.from('pesan_pengunjung').insert([dataPesan]);

        if (error) {
            alert('Waduh eror bre, silakan coba lagi!');
            tombolKirim.innerText = 'Kirim Pesan';
            tombolKirim.disabled = false;
        } else {
            alert('Pesan berhasil terkirim, bre! Makasih ya. Pesanmu akan disaring dulu sebelum dipajang.');
            formKontak.reset();
            tombolKirim.innerText = 'Kirim Pesan';
            tombolKirim.disabled = false;
        }
    });
}

// Jalankan fungsi muat data saat website pertama kali dibuka
document.addEventListener('DOMContentLoaded', muatTestimoni);