/* ── helpers ─────────────────────────────────────────── */

/**
 * اتصال به API واقعی — mock حذف شد
 * @param {string} endpoint
 * @param {object} payload
 * @returns {Promise<{success: boolean, message?: string, data?: any}>}
 */
async function sendToServer(endpoint, payload) {
    const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(json.message || `خطای سرور: ${res.status}`);
    }

    return json;
}

/**
 * وضعیت بارگذاری دکمه
 * @param {HTMLButtonElement} btn
 * @param {boolean} isLoading
 * @param {string} loadingText
 */
function setLoading(btn, isLoading, loadingText = "لطفاً صبر کنید...") {
    if (isLoading) {
        btn.dataset.originalText = btn.textContent;
        btn.textContent = loadingText;
        btn.disabled = true;
    } else {
        btn.textContent = btn.dataset.originalText || btn.textContent;
        btn.disabled = false;
    }
}

/**
 * نمایش خطای یک فیلد، به صورت متن قرمز زیر همان فیلد
 * @param {string} fieldId  شناسهٔ فیلد ورودی (مثلاً "regEmail")
 * @param {string} message  متن خطا
 */
function showFieldError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errEl = document.getElementById(`err-${fieldId}`);

    if (input) input.classList.add("input-error");
    if (errEl) {
        errEl.textContent = message;
        errEl.style.display = "block";
    }
}

/**
 * پاک کردن تمام خطاهای یک فرم (خطاهای فیلدها و پیام کلی)
 * @param {HTMLFormElement} form
 */
function clearErrors(form) {
    form.querySelectorAll(".error-msg").forEach((el) => {
        el.textContent = "";
        el.style.display = "none";
    });
    form.querySelectorAll(".input-error").forEach((el) => {
        el.classList.remove("input-error");
    });

    const banner = form.querySelector(".form-message");
    if (banner) {
        banner.textContent = "";
        banner.className = "form-message";
        banner.style.display = "none";
    }
}

/**
 * نمایش پیام کلی فرم (موفقیت یا خطا) در بالای فرم
 * @param {HTMLFormElement} form
 * @param {string} message
 * @param {"success"|"error"} type
 */
function showFormMessage(form, message, type = "error") {
    const banner = form.querySelector(".form-message");
    if (!banner) return;

    banner.textContent = message;
    banner.className = `form-message form-message--${type}`;
    banner.style.display = "block";
}

/* ── login form ──────────────────────────────────────── */
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearErrors(loginForm);

        const identifier = document
            .getElementById("loginIdentifier")
            ?.value.trim();
        const password = document.getElementById("loginPassword")?.value;
        const remember =
            document.getElementById("loginRemember")?.checked ?? false;
        const btn = loginForm.querySelector(".submit-btn");

        // اعتبارسنجی سمت کلاینت
        let hasError = false;
        if (!identifier) {
            showFieldError(
                "loginIdentifier",
                "ایمیل یا شماره موبایل را وارد کنید.",
            );
            hasError = true;
        }
        if (!password) {
            showFieldError("loginPassword", "رمز عبور را وارد کنید.");
            hasError = true;
        }
        if (hasError) return;

        setLoading(btn, true, "در حال ورود...");

        try {
            const result = await sendToServer("/api/auth/login", {
                identifier,
                password,
                remember,
            });

            showFormMessage(
                loginForm,
                result.message || "ورود با موفقیت انجام شد.",
                "success",
            );
            // هدایت به صفحهٔ اصلی پس از ورود موفق
            window.location.href = "home.html";
        } catch (err) {
            showFormMessage(
                loginForm,
                err.message || "خطایی رخ داد. لطفاً دوباره تلاش کنید.",
                "error",
            );
        } finally {
            setLoading(btn, false);
        }
    });
}

/* ── register form ───────────────────────────────────── */
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearErrors(registerForm);

        const firstName = document.getElementById("regFirstName")?.value.trim();
        const lastName = document.getElementById("regLastName")?.value.trim();
        const email = document.getElementById("regEmail")?.value.trim();
        const password = document.getElementById("regPassword")?.value;
        const referralCode = document
            .getElementById("regReferral")
            ?.value.trim();
        const termsAccepted =
            document.getElementById("regTerms")?.checked ?? false;
        const btn = registerForm.querySelector(".submit-btn");

        // اعتبارسنجی سمت کلاینت
        let hasError = false;
        if (!firstName) {
            showFieldError("regFirstName", "نام را وارد کنید.");
            hasError = true;
        }
        if (!lastName) {
            showFieldError("regLastName", "نام خانوادگی را وارد کنید.");
            hasError = true;
        }
        if (!email) {
            showFieldError("regEmail", "ایمیل را وارد کنید.");
            hasError = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showFieldError("regEmail", "فرمت ایمیل صحیح نیست.");
            hasError = true;
        }
        if (!password || password.length < 8) {
            showFieldError(
                "regPassword",
                "رمز عبور باید حداقل ۸ کاراکتر باشد.",
            );
            hasError = true;
        }
        if (!termsAccepted) {
            showFieldError("regTerms", "پذیرش قوانین و مقررات الزامی است.");
            hasError = true;
        }
        if (hasError) return;

        setLoading(btn, true, "در حال ثبت‌نام...");

        try {
            const result = await sendToServer("/api/auth/register", {
                firstName,
                lastName,
                email,
                password,
                ...(referralCode && { referralCode }),
                termsAccepted,
            });

            showFormMessage(
                registerForm,
                result.message || "ثبت‌نام با موفقیت انجام شد.",
                "success",
            );
            // هدایت به صفحهٔ ورود پس از ثبت‌نام موفق
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        } catch (err) {
            showFormMessage(
                registerForm,
                err.message || "خطایی رخ داد. لطفاً دوباره تلاش کنید.",
                "error",
            );
        } finally {
            setLoading(btn, false);
        }
    });
}
