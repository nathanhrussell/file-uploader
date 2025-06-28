fetch("/partials/navbar.html")
.then(res => res.text())
.then(html => {
    document.body.insertAdjacentHTML("afterbegin", html);

    fetch("/me", { credentials: "include" }).then( res => {
        if (res.ok) {
            document.getElementById("logoutBtn").style.display = "inline-block";
        }
    });
});