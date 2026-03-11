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

    // --- Dynamic Auth Modal Injection ---
    const injectAuthModal = () => {
        if (!document.getElementById('account-modal')) {
            const modalHTML = `
            <div class="modal-overlay" id="account-modal">
                <div class="glass-panel modal-content" style="max-width: 450px;">
                    <span class="modal-close" id="modal-close">✕</span>
                    
                    <div id="auth-tabs" style="display: flex; gap: 20px; margin-bottom: 25px; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 15px;">
                        <h3 id="tab-login" style="cursor: pointer; color: var(--accent-blue); position: relative;">Iniciar Sesión</h3>
                        <h3 id="tab-register" style="cursor: pointer; color: #64748b;">Crear Cuenta</h3>
                    </div>

                    <form id="login-form">
                        <div class="input-group">
                            <label>Correo Electrónico</label>
                            <input type="email" id="login-email" class="input-field" placeholder="tu@email.com" required>
                        </div>
                        <div class="input-group">
                            <label>Contraseña</label>
                            <input type="password" id="login-password" class="input-field" placeholder="••••••••" required>
                        </div>
                        <button type="submit" class="btn-primary" style="width: 100%; margin-top: 10px;">Entrar</button>
                    </form>

                    <form id="register-form" style="display: none;">
                        <div class="input-group">
                            <label>Nombre Completo</label>
                            <input type="text" id="reg-name" class="input-field" placeholder="Ej. Juan Pérez" required>
                        </div>
                        <div class="input-group">
                            <label>Correo Electrónico</label>
                            <input type="email" id="reg-email" class="input-field" placeholder="tu@email.com" required>
                        </div>
                        <div class="input-group">
                            <label>Contraseña</label>
                            <input type="password" id="reg-password" class="input-field" placeholder="••••••••" required>
                        </div>
                        <button type="submit" class="btn-primary" style="width: 100%; margin-top: 10px;">Registrarse</button>
                    </form>

                    <div id="auth-success-msg" style="display: none; text-align: center; padding: 20px;">
                        <h3 style="color: var(--accent-blue);">¡Bienvenido, <span id="user-display-name"></span>!</h3>
                        <p style="font-size: 14px; color: #64748b; margin-top: 10px;">Ya puedes comprar y acceder a demos.</p>
                        <button class="btn-primary" id="btn-logout" style="margin-top: 20px; background: #fef2f2; color: #ef4444; box-shadow: none; border: 1px solid #fee2e2;">Cerrar Sesión</button>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
    };
    injectAuthModal();

    // --- 0. Session Check & Cart Initialization ---
    let currentUser = null;
    let cart = JSON.parse(localStorage.getItem('futurecode_cart')) || [];
    
    function updateCartBadge() {
        const badge = document.getElementById('cart-count');
        if (badge) {
            badge.innerText = cart.length;
            badge.style.display = cart.length > 0 ? 'grid' : 'none';
        }
    }
    updateCartBadge();

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

    function updateCartBadge() {
        const badge = document.getElementById('cart-count');
        if (badge) {
            badge.innerText = cart.length;
            badge.style.display = cart.length > 0 ? 'grid' : 'none';
        }
    }

    // --- Product Database ---
    const productsDB = {
        '1': { name: 'NavBar de Cristal Premium', price: '45.00', desc: 'Componente de navegación translúcido con desenfoque dinámico y diseño ultra-moderno.', img: 'navbar_cristal_premium_1773261529300.png' },
        '2': { name: 'Dashboard Chart UI Kit', price: '89.00', desc: 'Visualizaciones de datos con estética futurista y componentes de control inteligentes.', img: 'dashboard_chart_ui_kit_1773261893390.png' },
        '3': { name: 'Botones Animados Liquid', price: '29.90', desc: 'Conjunto de 12 botones con interacciones físicas, micro-animaciones y sombras realistas.', img: 'animated_liquid_buttons_1773261949630.png' },
        '4': { name: 'Glass Card Hover Effects', price: '35.50', desc: 'Efectos cinéticos con sombras realistas de cristal y transiciones suaves.', img: 'animated_liquid_buttons_1773261949630.png' },
        '5': { name: 'Proyecto Galaxia 3D', price: '120.00', desc: 'Experiencia inmersiva con Three.js. Partículas interactivas y efectos visuales de galaxia de vanguardia.', img: 'proyectos/GALAXIA/images/portada.png' }
    };

    // --- Product Details Loader ---
    if (window.location.pathname.includes('product.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        const product = productsDB[productId];

        if (product) {
            const pName = document.getElementById('p-name');
            const pPrice = document.getElementById('p-price');
            const pDesc = document.querySelector('.product-detail-container p');
            const pPreview = document.querySelector('.preview-area');
            const buyBtn = document.getElementById('buy-now-btn');
            const demoBtn = pPreview?.querySelector('.btn-primary');

            if (pName) pName.innerText = product.name;
            if (pPrice) pPrice.innerText = product.price;
            if (pDesc) pDesc.innerText = product.desc;
            if (pPreview) {
                // Keep the demo button if it exists, but add the image before it
                const imgHTML = `<img src="${product.img}" style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; z-index: 1;">`;
                pPreview.style.position = 'relative';
                pPreview.style.overflow = 'hidden';
                pPreview.insertAdjacentHTML('afterbegin', imgHTML);
                
                if (demoBtn) {
                    demoBtn.style.position = 'relative';
                    demoBtn.style.zIndex = '2';
                    if (productId === '5') {
                        demoBtn.href = 'proyectos/GALAXIA/Galaxia.html';
                    }
                }
            }
            if (buyBtn) {
                buyBtn.dataset.id = productId;
                buyBtn.dataset.name = product.name;
                buyBtn.dataset.price = product.price;
            }
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

    // Attach to all buy and cart buttons
    document.addEventListener('click', (e) => {
        const isBuyButton = e.target.classList.contains('btn-add-cart') || (e.target.classList.contains('btn-primary') && e.target.innerText.includes('Comprar'));
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
            const btn = e.target;
            const item = {
                id: btn.dataset.id || 'N/A',
                name: btn.dataset.name || 'Componente FutureCode',
                price: btn.dataset.price || '0'
            };

            // Add to cart animation/feedback
            cart.push(item);
            localStorage.setItem('futurecode_cart', JSON.stringify(cart));
            updateCartBadge();
            
            btn.innerText = '¡Añadido!';
            btn.style.background = 'var(--accent-cyan)';
            
            setTimeout(() => {
                btn.innerText = 'Comprar';
                btn.style.background = '';
            }, 2000);

            // Optional: Auto-trigger checkout if single purchase
            // initCheckout(item.name, item.price);
        }
    });

    // Cart Button Click (Show cart - future capability)
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert("Tu carrito está vacío.");
            } else {
                let itemsList = cart.map(i => `- ${i.name} (S/ ${i.price})`).join('\n');
                if (confirm(`Productos en tu carrito:\n${itemsList}\n\n¿Deseas proceder al pago total?`)) {
                    initCheckout("Total Pedido", cart.reduce((acc, i) => acc + parseFloat(i.price), 0).toFixed(2));
                }
            }
        });
    }

    // --- 4. Search Functionality (Added Filtering) ---
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = searchInput.value.toLowerCase();
            const cards = document.querySelectorAll('.product-card');
            
            cards.forEach(card => {
                const title = card.querySelector('h3').innerText.toLowerCase();
                const desc = card.querySelector('p').innerText.toLowerCase();
                
                if (title.includes(query) || desc.includes(query)) {
                    card.style.display = 'flex';
                    card.style.opacity = '1';
                } else {
                    card.style.display = 'none';
                    card.style.opacity = '0';
                }
            });
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value;
                if (query.trim() && !window.location.pathname.includes('index.html')) {
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
