/* Global FutureCode Interactions & Supabase Auth */

// Supabase Configuration
const SB_URL = 'https://augxdfnyqnkggdgxntvi.supabase.co'; 
const SB_KEY = 'sb_publishable_8dNxzver4i52uIBu3Q_xmQ_bE8bFdr6';
let clientSB; // Use unique name to avoid conflict with window.supabase

document.addEventListener('DOMContentLoaded', async () => {
    // Correct initialization for Supabase CDN
    const initSupabase = async () => {
        try {
            if (window.supabase) {
                clientSB = window.supabase.createClient(SB_URL, SB_KEY);
                console.log("Supabase inicializado correctamente.");
                return true;
            }
        } catch (e) {
            console.error("Error al inicializar Supabase:", e);
        }
        return false;
    };

    if (!await initSupabase()) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await initSupabase();
    }

    // --- 0. Session Check ---
    let currentUser = null;
    if (clientSB) {
        const { data: { session } } = await clientSB.auth.getSession();
        currentUser = session?.user || null;
        updateAuthUI(currentUser);

        // --- Demo Page Protection ---
        if (window.location.pathname.includes('demo.html') && !currentUser) {
            const modal = document.getElementById('account-modal');
            if (modal) {
                modal.style.display = 'flex';
                alert("Debes iniciar sesión o registrarte para ver el Demo interactivo.");
            }
        }
    }

    function updateAuthUI(user) {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const authTabs = document.getElementById('auth-tabs');
        const successMsg = document.getElementById('auth-success-msg');
        const displayName = document.getElementById('user-display-name');

        if (user) {
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) registerForm.style.display = 'none';
            if (authTabs) authTabs.style.display = 'none';
            if (successMsg) successMsg.style.display = 'block';
            if (displayName) displayName.innerText = user.user_metadata?.full_name || user.email;
        } else {
            if (loginForm) loginForm.style.display = 'block';
            if (registerForm) registerForm.style.display = 'none';
            if (authTabs) authTabs.style.display = 'flex';
            if (successMsg) successMsg.style.display = 'none';
        }
    }
    // --- 1. Mobile Burger Menu ---
    const burger = document.getElementById('burger');
    const navLinks = document.getElementById('nav-links');

    if (burger && navLinks) {
        burger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Animate burger lines
            const lines = burger.querySelectorAll('.burger-line');
            if (navLinks.classList.contains('active')) {
                lines[0].style.transform = 'translateY(9px) rotate(45deg)';
                lines[1].style.opacity = '0';
                lines[2].style.transform = 'translateY(-9px) rotate(-45deg)';
            } else {
                lines[0].style.transform = 'none';
                lines[1].style.opacity = '1';
                lines[2].style.transform = 'none';
            }
        });
    }

    // --- 2. Account Modal (Register/Login) ---
    const accountBtns = document.querySelectorAll('#account-btn'); // Select all in case of duplicates
    const modal = document.getElementById('account-modal');
    const closeBtn = document.getElementById('modal-close');

    if (modal) {
        accountBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                console.log("Click en perfil detectado");
                modal.style.display = 'flex';
            });
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });

        // Tab Switching
        const tabLogin = document.getElementById('tab-login');
        const tabRegister = document.getElementById('tab-register');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (tabLogin && tabRegister) {
            tabLogin.addEventListener('click', () => {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
                tabLogin.style.color = 'var(--accent-blue)';
                tabRegister.style.color = '#64748b';
            });

            tabRegister.addEventListener('click', () => {
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
                tabRegister.style.color = 'var(--accent-blue)';
                tabLogin.style.color = '#64748b';
            });
        }

        // --- Supabase Actions ---
        if (clientSB) {
            // Register
            if (registerForm) {
                registerForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const email = document.getElementById('reg-email').value;
                    const password = document.getElementById('reg-password').value;
                    const fullName = document.getElementById('reg-name').value;

                    const { data, error } = await clientSB.auth.signUp({
                        email,
                        password,
                        options: { data: { full_name: fullName } }
                    });

                    if (error) alert("Error al registrar: " + error.message);
                    else {
                        alert("Registro exitoso. Revisa tu correo si es necesario.");
                        currentUser = data.user;
                        updateAuthUI(currentUser);
                    }
                });
            }

            // Login
            if (loginForm) {
                loginForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const email = document.getElementById('login-email').value;
                    const password = document.getElementById('login-password').value;

                    const { data, error } = await clientSB.auth.signInWithPassword({ email, password });

                    if (error) alert("Error al entrar: " + error.message);
                    else {
                        currentUser = data.user;
                        updateAuthUI(currentUser);
                    }
                });
            }

            // Logout
            const logoutBtn = document.getElementById('btn-logout');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async () => {
                    await clientSB.auth.signOut();
                    currentUser = null;
                    updateAuthUI(null);
                    window.location.reload();
                });
            }
        }
    }

    // --- 3. Mercado Pago Integration ---
    const mp = new MercadoPago('APP_USR-c08c490a-c224-4dc7-9e7e-725470199495', {
        locale: 'es-PE'
    });

    const initCheckout = async (itemName, price) => {
        alert(`Iniciando pago para: ${itemName} - S/ ${price}\n(Simulación: Redirigiendo a Mercado Pago...)`);

        // En una implementación real, aquí llamarías a tu backend para crear una preferencia
        // fetch('/api/create-preference', { method: 'POST', body: JSON.stringify({ item: itemName, price: price }) })
        // .then(res => res.json())
        // .then(preference => mp.checkout({ preferenceId: preference.id }).open());

        // Simulación de ventana de pago
        window.open('https://www.mercadopago.com.pe/checkout/v1/redirect?pref_id=YOUR_PREFERENCE_ID', '_blank');
    };

    // Attach to all buy buttons
    document.addEventListener('click', (e) => {
        const isBuyButton = e.target.classList.contains('btn-primary') && (e.target.innerText.includes('Comprar') || e.target.innerText.includes('Purchase'));
        const isDemoButton = e.target.innerText.includes('Demo') || e.target.href?.includes('demo.html');

        if (isBuyButton || isDemoButton) {
            if (!currentUser) {
                e.preventDefault();
                alert("Debes iniciar sesión para realizar compras o ver el modo Demo.");
                if (modal) modal.style.display = 'flex';
                return;
            }
        }

        if (isBuyButton) {
            const card = e.target.closest('.glass-panel');
            if (!card) return;

            // Extract Name and Price dynamically from the card
            const nameElement = card.querySelector('h1, h2, h3');
            const priceElement = card.querySelector('span[style*="font-weight: 700"], span[style*="font-weight: 800"]');

            const itemName = nameElement ? nameElement.innerText.trim() : 'Componente FutureCode';
            let priceText = priceElement ? priceElement.innerText : '0';

            // Clean price text (remove S/, spaces, etc)
            const price = priceText.replace(/[^\d.]/g, '').trim();

            if (parseFloat(price) > 0) {
                initCheckout(itemName, price);
            } else {
                console.error("No se pudo detectar un precio válido para este producto.");
            }
        }
    });

    // --- 4. Search Functionality ---
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value;
                if (query.trim()) {
                    alert(`Buscando: "${query}"... (Funcionalidad de backend pronto disponible)`);
                    window.location.href = `marketplace.html?q=${encodeURIComponent(query)}`;
                }
            }
        });
    }

    // --- 4. Smooth scrolling for internal links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- 5. Global background parallax effect ---
    window.addEventListener('mousemove', (e) => {
        const glow = document.querySelector('.bg-glow');
        if (glow) {
            const x = (window.innerWidth / 2 - e.pageX) / 40;
            const y = (window.innerHeight / 2 - e.pageY) / 40;
            glow.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1.1)`;
        }
    });

    console.log("%cFutureCode v1.1 | Sistema Totalmente Operativo", "color: #22d3ee; font-weight: bold; font-size: 16px;");
});
