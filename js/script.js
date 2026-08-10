(() => {
  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const yearEl = document.getElementById("year");
  const form = document.getElementById("contact-form");
  const statusEl = document.getElementById("form-status");
  const submitBtn = document.getElementById("submit-btn");
  const nextInput = document.getElementById("form-next");

  const CONTACT_EMAIL = "jitenchapagain45@gmail.com";

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* Set absolute thank-you URL for FormSubmit redirect */
  if (nextInput) {
    const thankYou =
      window.location.protocol === "file:"
        ? "thank-you.html"
        : new URL("thank-you.html", window.location.href).href;
    nextInput.value = thankYou;
  }

  /* Sticky header */
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 48);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile nav */
  const setMenu = (open) => {
    if (!nav || !toggle || !header) return;
    nav.classList.toggle("is-open", open);
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  };

  toggle?.addEventListener("click", () => {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });

  /* Scroll reveal */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* Contact form */
  const emailOk = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const setStatus = (message, type) => {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = `form-status${type ? ` ${type}` : ""}`;
  };

  const clearInvalid = () => {
    form?.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
  };

  const openMailtoFallback = (name, email, subject, message) => {
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearInvalid();
    setStatus("");

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject.value.trim();
    const message = form.message.value.trim();

    let valid = true;
    if (!name) {
      form.name.classList.add("is-invalid");
      valid = false;
    }
    if (!emailOk(email)) {
      form.email.classList.add("is-invalid");
      valid = false;
    }
    if (!subject) {
      form.subject.classList.add("is-invalid");
      valid = false;
    }
    if (!message) {
      form.message.classList.add("is-invalid");
      valid = false;
    }

    if (!valid) {
      setStatus("Please complete all fields with a valid email address.", "error");
      return;
    }

    /* file:// cannot reliably POST to FormSubmit */
    if (window.location.protocol === "file:") {
      setStatus(
        "Opening your email app so the message can be sent. For automatic delivery, host this site online (or use a local server).",
        "success"
      );
      openMailtoFallback(name, email, subject, message);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    setStatus("Sending your message...");

    const formData = new FormData(form);
    formData.set("_subject", `Portfolio contact: ${subject}`);

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to send message.");
      }

      form.reset();
      if (nextInput) {
        nextInput.value =
          window.location.protocol === "file:"
            ? "thank-you.html"
            : new URL("thank-you.html", window.location.href).href;
      }

      setStatus(
        "Message sent. If this is your first time, check jitenchapagain45@gmail.com for a FormSubmit activation email and confirm it.",
        "success"
      );

      window.setTimeout(() => {
        window.location.href = "thank-you.html";
      }, 1200);
    } catch (err) {
      console.error(err);
      setStatus(
        "Online delivery failed. Opening your email app as a backup...",
        "error"
      );
      openMailtoFallback(name, email, subject, message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send message";
    }
  });
})();
