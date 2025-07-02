const isLoggedIn = document.querySelector('meta[name="user-logged-in"]')?.content === "true";

const nav = document.createElement("nav");
nav.innerHTML = `
  <a href="/index.html">Home</a> |
  ${isLoggedIn ? `
    <a href="/upload.html">Upload</a> |
    <a href="/my-files.html">My Files</a> |
    <a href="/folders.html">My Folders</a> |
    <button onclick="logout()">Log Out</button>
  ` : `
    <a href="/login.html">Log In</a> |
    <a href="/register.html">Register</a>
  `}
  <hr />
`;
document.body.prepend(nav);
