/* ============ PROFILES ============ */
const PROFILES = [
  { id: "freak", name: "Freak", image: "assets/freak-dp.jpg", emoji: "👽", color: "#facc15" },
  { id: "shax", name: "Shaziya", image: "assets/ghost-dp.jpg", emoji: "👸", color: "#b4d4ac" },
  { id: "leo", name: "Leo", image: "assets/brian-dp.jpg", emoji: "🚀", color: "#34d399" },
  { id: "zoe", name: "Zoe", image: "assets/emoji-dp.svg", emoji: "🌿", color: "#e50914" },
  { id: "ayush", name: "Ayush", image: "assets/robo-dp.svg", emoji: "🤖", color: "#22d3ee" }
];

const MOODS = ["comfort", "dark", "mysterious", "fast-paced",
  "emotional", "weird", "thoughtful", "hopeless", "adventurous"];

const GENRES = ["Fiction", "Non-fiction", "Sci-Fi", "Self-help", "Mystery", "Romance"];

/* Mood -> Google Books search keyword */
const MOOD_QUERY = {
  comfort: "cozy", dark: "psychological thriller", mysterious: "mystery",
  "fast-paced": "thriller", emotional: "family saga", weird: "magical realism",
  thoughtful: "literary fiction", hopeless: "dystopian", adventurous: "adventure"
};

/* Genre -> Google Books subject filter */
const GENRE_SUBJECT = {
  "Fiction": "subject:Fiction", "Non-fiction": "subject:Nonfiction",
  "Sci-Fi": "subject:Science Fiction", "Self-help": "subject:Self-Help",
  "Mystery": "subject:Mystery", "Romance": "subject:Love stories"
};

/* ============ PLACEHOLDER DATA — TODO: replace with Netlify DB ============ */
let posts = [
  { profileId: "shax", bookTitle: "Piranesi", quote: "The beauty of the house is immeasurable.", mood: "mysterious", genre: "Fiction", status: "reading" },
  { profileId: "leo", bookTitle: "Project Hail Mary", quote: "I love how panicked science feels.", mood: "fast-paced", genre: "Sci-Fi", status: "reading" },
  { profileId: "zoe", bookTitle: "Circe", quote: "When the gods look at you, do they see anything at all?", mood: "emotional", genre: "Fiction", status: "finished" }
];

let crashDesk = [
  { profileId: "freak", bookTitle: "The Silmarillion", reason: "Twelve names, all identical", percent: 18, mood: "thoughtful" },
  { profileId: "shax", bookTitle: "Infinite Jest", reason: "Read in the wrong season of my life", percent: 7, mood: "hopeless" },
  { profileId: "leo", bookTitle: "Atlas Shrugged", reason: "It kept going. And going.", percent: 34, mood: "dark" }
];

const readingNow = {
  freak: "Atomic Habits", shax: "Snow White", leo: "Project Hail Mary",
  zoe: "Circe", ayush: "Harry Potter and the Philosopher's Stone"
};

/* ============ STATE ============ */
let activeProfile = null;
let postMood = null, postGenre = null, recMood = null, recGenre = null;

/* ============ BOOT ============ */
const profileIdFromUrl = new URLSearchParams(window.location.search).get("profile");
const profileFromUrl = PROFILES.find((profile) => profile.id === profileIdFromUrl);

try {
  const storedProfile = JSON.parse(localStorage.getItem("activeProfile"));
  activeProfile = profileFromUrl ||
    PROFILES.find((profile) => profile.id === storedProfile?.id) ||
    null;
} catch (error) {
  console.warn("Could not read the saved profile; checking the page URL.", error);
  activeProfile = profileFromUrl || null;
}

if (!activeProfile) {
  window.location.href = "dashboard.html";
} else {
  document.title = `${activeProfile.name} - Shelf`;
  const avatar = document.getElementById("chipHex");
  if (activeProfile.image) {
    const image = document.createElement("img");
    image.src = activeProfile.image;
    image.alt = `${activeProfile.name} profile`;
    avatar.replaceChildren(image);
  } else {
    avatar.textContent = activeProfile.emoji || activeProfile.name.charAt(0);
  }
  document.getElementById("chipName").textContent = activeProfile.name;
  document.getElementById("readers").textContent = PROFILES.length + " readers";
}

document.getElementById("switchBtn").addEventListener("click", () => {
  window.location.href = "dashboard.html";
});

/* Scroll to the post form when choosing a recommendation. */
const postCard = document.getElementById("postCard");
const postHead = postCard.querySelector(".post-head");
const postSlot = postCard.parentElement;
let previousScrollY = window.scrollY;
let scrollSettleTimer;
let lastScrollDirection = 0;
const scrollSettleDelay = 500;

function reservePostSlot() {
  if (!postCard.classList.contains("rolled")) {
    postSlot.style.setProperty(
      "--post-slot-height",
      `${Math.ceil(postCard.getBoundingClientRect().height)}px`
    );
  }
}

function openPostCard() {
  postCard.classList.remove("rolled");
  postCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

postCard.querySelector(".post-body").addEventListener("transitionend", (event) => {
  if (event.propertyName === "max-height" && !postCard.classList.contains("rolled")) {
    reservePostSlot();
  }
});

function updatePostCardForScroll() {
  const scrollDirection = lastScrollDirection;
  const headBounds = postHead.getBoundingClientRect();

  if (scrollDirection > 0 && headBounds.bottom <= -12) {
    postCard.classList.add("rolled");
  } else if (
    scrollDirection < 0 &&
    headBounds.bottom > 0 &&
    headBounds.top < window.innerHeight - 96
  ) {
    postCard.classList.remove("rolled");
  }

}

function schedulePostCardUpdate() {
  window.clearTimeout(scrollSettleTimer);
  scrollSettleTimer = window.setTimeout(() => {
    window.requestAnimationFrame(updatePostCardForScroll);
  }, scrollSettleDelay);
}

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;
  const scrollDelta = currentScrollY - previousScrollY;
  if (scrollDelta !== 0) lastScrollDirection = Math.sign(scrollDelta);
  previousScrollY = currentScrollY;

  schedulePostCardUpdate();
}, { passive: true });

window.addEventListener("resize", reservePostSlot, { passive: true });

if (postHead.getBoundingClientRect().bottom <= -12) {
  postCard.classList.add("rolled");
}

/* ============ PILLS ============ */
function buildPills(containerId, items, onSelect) {
  const box = document.getElementById(containerId);
  items.forEach((item) => {
    const pill = document.createElement("span");
    pill.className = "pill";
    pill.textContent = item;
    pill.addEventListener("click", () => {
      box.querySelectorAll(".pill").forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      onSelect(item);
    });
    box.appendChild(pill);
  });
}

buildPills("postMoods", MOODS, (m) => (postMood = m));
buildPills("postGenres", GENRES, (g) => (postGenre = g));
buildPills("recMoods", MOODS, (m) => (recMood = m));
buildPills("recGenres", GENRES, (g) => (recGenre = g));

/* ============ CRASH REASON TOGGLE ============ */
document.querySelectorAll('input[name="status"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    document.getElementById("crashReason").classList.toggle(
      "hidden", radio.value !== "crash" || !radio.checked
    );
  });
});

/* ============ RENDER: CURRENTLY READING ============ */
function renderReading() {
  const row = document.getElementById("readingRow");
  row.innerHTML = "";
  PROFILES.forEach((p) => {
    const chip = document.createElement("div");
    chip.className = "reading-chip";
    chip.innerHTML = `
      <span class="reading-hex" style="background:${p.color}">${p.emoji}</span>
      <div><strong>${p.name}</strong><span>${readingNow[p.id] || "—"}</span></div>`;
    row.appendChild(chip);
  });
}

/* ============ RENDER: FEED ============ */
function nameOf(id) {
  const p = PROFILES.find((x) => x.id === id);
  return p ? p.name : id;
}

function renderFeed() {
  const feed = document.getElementById("feed");
  feed.innerHTML = "";
  posts.forEach((post) => {
    const item = document.createElement("div");
    item.className = "feed-item";
    item.innerHTML = `
      <p class="feed-quote">"${post.quote || "…"}"</p>
      <div class="feed-meta">${post.bookTitle} • ${post.mood || "no mood"} •
        ${post.genre || "any genre"} • ${nameOf(post.profileId)} • ${post.status}</div>
      <div class="feed-actions">
        <button class="mini-btn">same vibe</button>
        <button class="mini-btn">want it</button>
      </div>`;
    const [vibeBtn, wantBtn] = item.querySelectorAll(".mini-btn");
    vibeBtn.addEventListener("click", () => toast("Same vibe noted (DB later)"));
    wantBtn.addEventListener("click", () => addToWant({
      title: post.bookTitle, author: post.author || "", thumb: null
    }));
    feed.appendChild(item);
  });
}

/* ============ RENDER: CRASH DESK ============ */
function renderCrash() {
  const row = document.getElementById("crashRow");
  row.innerHTML = "";
  crashDesk.forEach((item, i) => {
    const card = document.createElement("div");
    card.className = "crash-item";
    card.innerHTML = `
      <strong>💀 ${item.bookTitle}</strong>
      <p>"${item.reason}" — ${item.percent}% read, mood: ${item.mood}<br/>by ${nameOf(item.profileId)}</p>
      <button class="mini-btn">resurrect ↺</button>`;
    card.querySelector("button").addEventListener("click", () => {
      crashDesk.splice(i, 1);
      posts.unshift({
        profileId: item.profileId, bookTitle: item.bookTitle,
        quote: "Resurrected. Second chance.", mood: item.mood,
        genre: "", status: "reading"
      });
      readingNow[item.profileId] = item.bookTitle;
      renderCrash(); renderFeed(); renderReading(); renderWantShelf();
      toast("↺ Resurrected from the Crash Desk");
    });
    row.appendChild(card);
  });
}

/* ============ RENDER: MARQUEE ============ */
function renderMarquee() {
  const track = document.getElementById("marqueeTrack");
  const quotes = posts.filter((p) => p.quote).map((p) => `"${p.quote}" — ${nameOf(p.profileId)}`);
  const html = quotes.map((q) => `<span class="marquee-item">${q}</span>`).join("");
  track.innerHTML = html + html; /* duplicate for seamless loop */
}

/* ============ POST SUBMIT ============ */
document.getElementById("postBtn").addEventListener("click", () => {
  const title = document.getElementById("bookTitle").value.trim();
  if (!title) { toast("Book title needed"); return; }

  const status = document.querySelector('input[name="status"]:checked').value;
  const quote = document.getElementById("quote").value.trim();
  const code = document.getElementById("bookCode").value.trim();

  if (status === "crash") {
    crashDesk.unshift({
      profileId: activeProfile.id, bookTitle: title,
      reason: document.getElementById("crashReason").value.trim() || "It just died",
      percent: 0, mood: postMood || "unknown"
    });
    renderCrash();
    toast("🪦 Sent to the Crash Desk");
  } else {
    posts.unshift({
      profileId: activeProfile.id, bookTitle: title, bookCode: code,
      quote, mood: postMood || "", genre: postGenre || "", status
    });
    if (status === "reading") readingNow[activeProfile.id] = title;
    renderFeed(); renderReading(); renderMarquee();
    toast("✨ Posted to the feed");
  }

  /* TODO: DB — POST /.netlify/functions/posts */

  document.getElementById("bookTitle").value = "";
  document.getElementById("bookCode").value = "";
  document.getElementById("quote").value = "";
  document.getElementById("crashReason").value = "";
});

/* ============ BOOK SEARCH (Google Books with Open Library fallback) ============ */
async function searchBooks(query, maxResults) {
  let googleBooksError;
  try {
    const url = "https://www.googleapis.com/books/v1/volumes?q=" +
      encodeURIComponent(query) +
      `&maxResults=${maxResults}&orderBy=relevance`;
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || `Google Books returned HTTP ${response.status}`);
    }
    const books = (data.items || []).map((item) => {
      const info = item.volumeInfo || {};
      return {
        title: info.title || "Untitled",
        authors: info.authors || ["Unknown"],
        thumbnail: info.imageLinks?.thumbnail || null
      };
    });
    if (books.length) return books;
  } catch (err) {
    googleBooksError = err;
  }

  if (googleBooksError) {
    console.warn("Google Books unavailable; trying Open Library:", googleBooksError);
  }

  const fallbackUrl = "https://openlibrary.org/search.json?q=" +
    encodeURIComponent(query) +
    `&limit=${maxResults}&fields=title,author_name,cover_i`;
  const fallbackResponse = await fetch(fallbackUrl);
  const fallbackData = await fallbackResponse.json();
  if (!fallbackResponse.ok) {
    throw new Error(`Open Library returned HTTP ${fallbackResponse.status}`);
  }
  return (fallbackData.docs || []).map((book) => ({
    title: book.title || "Untitled",
    authors: book.author_name || ["Unknown"],
    thumbnail: book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
      : null
  }));
}

/* ============ MOOD RECOMMENDER ============ */
document.getElementById("suggestBtn").addEventListener("click", async () => {
  const results = document.getElementById("recResults");
  if (!recMood) { toast("Pick a mood first"); return; }

  const btn = document.getElementById("suggestBtn");
  btn.disabled = true;
  btn.textContent = "Searching the shelves…";
  results.innerHTML = "";

  const keyword = MOOD_QUERY[recMood] || recMood;
  const subject = recGenre ? " " + GENRE_SUBJECT[recGenre] : "";

  try {
    const books = await searchBooks(keyword + subject, 3);
    if (!books.length) {
      results.innerHTML = `<div class="rec-card">No books matched. Try another mood.</div>`;
      return;
    }

    books.forEach((book) => {
      const card = document.createElement("div");
      card.className = "rec-card";

      const thumb = document.createElement(book.thumbnail ? "img" : "div");
      thumb.className = "rec-thumb";
      if (book.thumbnail) {
        thumb.src = book.thumbnail;
        thumb.alt = "";
      } else {
        thumb.textContent = "📖";
      }

      const info = document.createElement("div");
      info.className = "rec-info";
      const title = document.createElement("strong");
      title.textContent = book.title;
      const authors = document.createElement("span");
      authors.textContent = book.authors.join(", ");
      info.append(title, authors);

      const actions = document.createElement("div");
      actions.className = "rec-actions";
      actions.innerHTML = '<button class="mini-btn">want</button><button class="mini-btn">post this</button>';

      card.append(thumb, info, actions);

      const [wantBtn, postBtn] = card.querySelectorAll("button");
      wantBtn.addEventListener("click", () => addToWant({
        title: book.title,
        author: book.authors.join(", "),
        thumb: book.thumbnail
      }));
      postBtn.addEventListener("click", () => {
        document.getElementById("bookTitle").value = book.title;
        openPostCard(); /* unroll + scroll, replaces old .col-post scroll */
        toast("Pre-filled — add your quote");
      });

      results.appendChild(card);
    });
  } catch (err) {
    console.error("Book recommendation request failed:", err);
    const message = document.createElement("div");
    message.className = "rec-card";
    message.textContent = `Could not load book suggestions: ${err.message}`;
    results.replaceChildren(message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Suggest me ✨";
  }
});

/* ============ TOAST ============ */
function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

/* ============ WANT-TO-READ LIST — TODO: replace with Netlify DB ============ */
let wantList = JSON.parse(localStorage.getItem("wantList") || "[]");

function saveWantList() {
  localStorage.setItem("wantList", JSON.stringify(wantList));
}

function addToWant(book) { /* book: {title, author, thumb} */
  if (wantList.some((b) => b.title === book.title && b.profileId === activeProfile.id)) {
    toast("Already on your shelf");
    return;
  }
  wantList.unshift({ ...book, profileId: activeProfile.id });
  saveWantList();
  renderWantShelf();
  toast("📚 Added to want-to-read");
}

function renderWantShelf() {
  const box = document.getElementById("wantShelf");
  box.innerHTML = "";
  const mine = wantList.filter((b) => b.profileId === activeProfile.id);

  if (!mine.length) {
    box.innerHTML = `<div class="rec-card">Nothing here yet. Hit "want" on a suggestion.</div>`;
    return;
  }

  mine.forEach((b) => {
    const card = document.createElement("div");
    card.className = "rec-card";
    card.innerHTML = `
      ${b.thumb ? `<img class="rec-thumb" src="${b.thumb}" alt=""/>` : `<div class="rec-thumb">📖</div>`}
      <div class="rec-info"><strong>${b.title}</strong><span>${b.author || ""}</span></div>
      <div class="rec-actions">
        <button class="mini-btn">start</button>
        <button class="mini-btn">✕</button>
      </div>`;
    const [startBtn, delBtn] = card.querySelectorAll("button");
    startBtn.addEventListener("click", () => {
      readingNow[activeProfile.id] = b.title;
      posts.unshift({
        profileId: activeProfile.id, bookTitle: b.title,
        quote: "", mood: "", genre: "", status: "reading"
      });
      wantList = wantList.filter((x) => x !== b);
      saveWantList();
      renderWantShelf(); renderReading(); renderFeed();
      toast("▶ Moved to currently reading");
    });
    delBtn.addEventListener("click", () => {
      wantList = wantList.filter((x) => x !== b);
      saveWantList();
      renderWantShelf();
      toast("Removed from shelf");
    });
    box.appendChild(card);
  });
}

/* ============ ISBN / CODE AUTO-LOOKUP ============ */
document.getElementById("bookCode").addEventListener("change", async (e) => {
  const code = e.target.value.trim();
  if (!/^[0-9-]{10,17}$/.test(code)) return;
  try {
    const books = await searchBooks("isbn:" + code, 1);
    if (books[0]) {
      document.getElementById("bookTitle").value = books[0].title;
      toast("📖 Found: " + books[0].title);
    } else {
      toast("No book found for that ISBN");
    }
  } catch (err) {
    console.error("Book ISBN lookup failed:", err);
    toast("ISBN lookup failed. Enter the book title manually.");
  }
});

/* ============ INITIAL RENDER ============ */
renderReading();
renderFeed();
renderCrash();
renderMarquee();
renderWantShelf();
reservePostSlot();