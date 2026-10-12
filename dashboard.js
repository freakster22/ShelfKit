const profiles = [
  { id: "freak", name: "Freak", image: "assets/freak-dp.jpg" },
  { id: "maya", name: "Maya", image: "assets/ghost-dp.jpg" },
  { id: "leo", name: "Leo", image: "assets/brian-dp.jpg" },
  { id: "zoe", name: "Zoe", image: "assets/emoji-dp.svg" },
  { id: "ayush", name: "Ayush", image: "assets/robo-dp.svg" }
];

const row = document.getElementById("profileRow");

profiles.forEach((p) => {
  const link = document.createElement("a");
  link.className = "profile";
  link.href = `home.html?profile=${encodeURIComponent(p.id)}`;
  link.setAttribute("aria-label", `${p.name} profile`);

  link.innerHTML = `
    <div class="avatar"><img src="${p.image}" alt=""></div>
    <div class="profile-name">${p.name}</div>
  `;

  link.addEventListener("click", () => {
    try {
      localStorage.setItem("activeProfile", JSON.stringify(p));
    } catch (error) {
      console.warn("Could not save the active profile; continuing with the profile link.", error);
    }
  });

  row.appendChild(link);
});