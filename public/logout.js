async function logout() {
  const res = await fetch("/logout", {
    method: "GET",
    credentials: "include"
  });

  if (res.ok) {
    showMessage("Logged out successfully");
    setTimeout(() => {
      window.location.href = "/index.html";
    }, 1000);
  } else {
    showMessage("Failed to log out", true);
  }
}
