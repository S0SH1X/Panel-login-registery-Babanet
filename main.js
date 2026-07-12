const tabEls = document.querySelectorAll("[data-tab]");
tabEls.forEach((el) => {
    el.addEventListener("click", () => {
        const target = el.getAttribute("data-tab");
        document
            .querySelectorAll(".tab")
            .forEach((t) => t.classList.remove("active"));
        document
            .querySelector(`.tab[data-tab="${target}"]`)
            .classList.add("active");
        document
            .querySelectorAll(".panel")
            .forEach((p) => p.classList.remove("active"));
        document.getElementById(target).classList.add("active");
    });
});

document.querySelectorAll('a[href="#"]').forEach((a) => {
    a.addEventListener("click", (e) => e.preventDefault());
});

async function sendToServer(endpoint, payload) {
    await new Promise((resolve) => setTimeout(resolve, 700));

    console.log(`[${endpoint}] →`, payload);
    return { success: true };
}

function setLoading(form, isLoading, loadingText) {
    const btn = form.querySelector(".submit-btn");
    if (isLoading) {
        btn.dataset.originalText = btn.textContent;
        btn.textContent = loadingText;
        btn.disabled = true;
    } else {
        btn.textContent = btn.dataset.originalText || btn.textContent;
        btn.disabled = false;
    }
}

// ---------- فرم ورود ----------
const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const identifier = document.getElementById("loginIdentifier").value.trim();
    const password = document.getElementById("loginPassword").value;
    const remember = document.getElementById("loginRemember").checked;

    if (!identifier) {
        alert("لطفاً ایمیل یا شماره موبایل خود را وارد کنید");
        return;
    }
    if (!password) {
        alert("لطفاً رمز عبور خود را وارد کنید");
        return;
    }

    const payload = { identifier, password, remember };

    try {
        setLoading(loginForm, true, "در حال ورود...");
        const result = await sendToServer("/api/auth/login", payload);
        if (result.success) {
            alert("ورود با موفقیت انجام شد");
            // loginForm.reset();
        }
    } catch (err) {
        alert(err.message || "ورود انجام نشد. دوباره تلاش کنید");
    } finally {
        setLoading(loginForm, false);
    }
});

const registerForm = document.getElementById("registerForm");
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("regFirstName").value.trim();
    const lastName = document.getElementById("regLastName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const referralCode = document.getElementById("regReferral").value.trim();
    const ageConfirmed = document.getElementById("regAge").checked;
    const termsAccepted = document.getElementById("regTerms").checked;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!firstName) {
        alert("لطفاً نام خود را وارد کنید");
        return;
    }
    if (!lastName) {
        alert("لطفاً نام خانوادگی خود را وارد کنید");
        return;
    }
    if (!email) {
        alert("لطفاً ایمیل خود را وارد کنید");
        return;
    }
    if (!emailPattern.test(email)) {
        alert("فرمت ایمیل واردشده صحیح نیست");
        return;
    }
    if (!password) {
        alert("لطفاً رمز عبور را وارد کنید");
        return;
    }
    if (password.length < 8) {
        alert("رمز عبور باید حداقل ۸ کاراکتر باشد");
        return;
    }
    if (!ageConfirmed) {
        alert("برای ثبت‌نام باید تأیید کنید سن شما بالای ۱۸ سال است");
        return;
    }
    if (!termsAccepted) {
        alert("برای ادامه باید قوانین و مقررات را بپذیرید");
        return;
    }

    const payload = {
        firstName,
        lastName,
        email,
        password,
        referralCode,
        ageConfirmed,
        termsAccepted,
    };

    try {
        setLoading(registerForm, true, "در حال ثبت‌نام...");
        const result = await sendToServer("/api/auth/register", payload);
        if (result.success) {
            alert("ثبت‌نام با موفقیت انجام شد");
        }
    } catch (err) {
        alert(err.message || "ثبت‌نام انجام نشد. دوباره تلاش کنید");
    } finally {
        setLoading(registerForm, false);
    }
});
