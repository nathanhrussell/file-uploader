async function logout() {
    const res = await fetch("/logout", {
        method: "GET",
        credentials: "include"
    });

    if (res.ok) {
        alert("Logged out");
        window.location.href = "/index.html";
    } else {
        alert("Failed to log out");
    }
}