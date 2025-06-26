function showMessage(text, isError = false) {
    const msgEl = document.getElementById("message");
    if (!msgEl) return;

    msgEl.textContent = text;
    msgEl.style.color = isError ? "red" : "green";

    setTimeout(() => {
        msgEl.textContent = "";
    }, 4000);
}