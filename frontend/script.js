// Minimal enhancements: nav toggle, reveal animations, form fake submit
(function () {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const yearEl = document.getElementById('year');
  const form = document.querySelector('.contact-form');
  const formNote = document.querySelector('.form-note');

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    // Close menu when clicking a link (mobile)
    navMenu.addEventListener('click', (e) => {
      if (e.target instanceof HTMLAnchorElement) {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // IntersectionObserver for reveal
  const revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealItems.forEach(el => observer.observe(el));
  } else {
    // Fallback: make them visible
    revealItems.forEach(el => el.classList.add('revealed'));
  }

  // Fake form submit (prevent navigation). Replace with real endpoint.
  if (form && formNote) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = new FormData(form);
      const formData = {
        name: data.get('name'),
        email: data.get('email'),
        message: data.get('message') 
      };

      try {
        const response = await fetch("https://4wjem488yg.execute-api.eu-west-1.amazonaws.com/prod/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(formData)
        });

        const text = await response.text();
        console.log("Status:", response.status, text);

        if (response.ok) {
          formNote.textContent = `Thanks, ${formData.name}! We saved your message.`;
          form.reset();
        } else {
          formNote.textContent = `Error: ${response.status} - ${text}`;
        }
      } catch (err) {
        console.error("Network/CORS error:", err);
        formNote.textContent = "Could not reach server (check CORS/URL).";
      }

      // Clear message after 4 seconds
      setTimeout(() => { formNote.textContent = ''; }, 4000);
    });
  }
})();
