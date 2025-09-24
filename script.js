let allPosts = [];
let currentCategory = "All";
let currentPage = 1;
const postsPerPage = 6;

// Fetch posts
fetch("posts.json")
  .then(response => response.json())
  .then(posts => {
    allPosts = posts;
    renderFeaturedPost(allPosts);
    renderPosts(allPosts);
    
  })
  .catch(err => console.error("Error loading posts:", err));

  // Render Featured Posts Carousel
function renderFeaturedPost(posts) {
  let featuredPosts = posts.filter(p => p.featured);
  console.log("Featured posts found:", featuredPosts); // DEBUG

  if (featuredPosts.length === 0) {
    document.getElementById("featuredPosts").innerHTML = `<div class="text-center text-muted">No featured posts yet.</div>`;
    return;
  }

  let container = document.getElementById("featuredPosts");
  container.innerHTML = "";

  featuredPosts.forEach((post, index) => {
    container.innerHTML += `
      <div class="carousel-item ${index === 0 ? "active" : ""}">
        <img src="${post.image}" alt="${post.title}">
        <div class="carousel-caption d-block bg-dark bg-opacity-50 rounded p-2">
          <h3>${post.title}</h3>
          <p>${post.description}</p>
          <button class="btn btn-primary" onclick="openPost(${allPosts.indexOf(post)})">Read More</button>
        </div>
      </div>
    `;
  });
}

// Load likes from localStorage
    function getLikes(postId) {
      const likes = JSON.parse(localStorage.getItem("likes")) || {};
      return likes[postId] || 0;
    }

    // Check if post is liked
    function isLiked(postId) {
      const likedPosts = JSON.parse(localStorage.getItem("likedPosts")) || {};
      return !!likedPosts[postId];
    }

// Render posts with pagination
// Generate blog cards
function renderPosts(posts) {
  const postsContainer = document.getElementById("posts");
  postsContainer.innerHTML = "";

  posts.forEach((post, index) => {
    // Read likes + liked state
    let likes = parseInt(localStorage.getItem(`likes_${index}`)) || 0;
    let liked = localStorage.getItem(`liked_${index}`) === "true";

    postsContainer.innerHTML += `
      <div class="col-md-4">
        <div class="card h-100 shadow-sm">
          <img src="${post.image}" class="card-img-top" alt="${post.title}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${post.title}</h5>
            <p class="card-text">${post.description}</p>
            <div class="mt-auto d-flex justify-content-between align-items-center">
              <button class="btn btn-sm btn-outline-primary" onclick="openPost(${index})">Read More</button>
              <button 
                id="like-btn-${index}" 
                class="btn btn-sm ${liked ? "btn-danger" : "btn-outline-danger"}">
                ❤️ <span id="like-count-${index}">${likes}</span>
              </button>
              <button class="btn btn-sm btn-outline-success" onclick="sharePost(${index})">🔗 Share</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  // Attach like listeners AFTER cards are rendered
  posts.forEach((_, index) => {
    const btn = document.getElementById(`like-btn-${index}`);
    btn.addEventListener("click", () => toggleLike(index, btn));
  });
}

  

// Render categories
function renderCategories(posts) {
  let categories = ["All", ...new Set(posts.map(post => post.category))];
  let catContainer = document.getElementById("categories");
  catContainer.innerHTML = "";

  categories.forEach(cat => {
    let btn = document.createElement("button");
    btn.classList.add("btn", "btn-outline-primary");
    if (cat === "All") btn.classList.add("active");
    btn.textContent = cat;
    btn.addEventListener("click", () => filterByCategory(cat));
    catContainer.appendChild(btn);
  });
}

// Filter by category
function filterByCategory(category) {
  currentCategory = category;
  currentPage = 1;
  document.querySelectorAll("#categories .btn").forEach(btn => btn.classList.remove("active"));
  Array.from(document.getElementById("categories").children).forEach(btn => {
    if (btn.textContent === category) btn.classList.add("active");
  });
  renderPosts(getFilteredPosts());
}

// Get filtered posts
function getFilteredPosts() {
  let query = document.getElementById("searchBar").value.toLowerCase();
  return allPosts.filter(post =>
    (currentCategory === "All" || post.category === currentCategory) &&
    (post.title.toLowerCase().includes(query) || post.description.toLowerCase().includes(query))
  );
}

// Pagination
function renderPagination(totalPosts) {
  let totalPages = Math.ceil(totalPosts / postsPerPage);
  let pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    let li = document.createElement("li");
    li.classList.add("page-item");
    if (i === currentPage) li.classList.add("active");
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener("click", (e) => {
      e.preventDefault();
      currentPage = i;
      renderPosts(getFilteredPosts());
    });
    pagination.appendChild(li);
  }
}

// Open modal
function openPost(index) {
  const post = allPosts[index];
  document.getElementById("modalTitle").textContent = post.title;
  document.getElementById("modalImage").src = post.image;
  document.getElementById("modalContent").textContent = post.content;
  new bootstrap.Modal(document.getElementById("postModal")).show();
}

// Search
document.getElementById("searchBar").addEventListener("input", function() {
  currentPage = 1;
  renderPosts(getFilteredPosts());
});

// Dark Mode Toggle
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
  body.classList.add("dark");
  themeToggle.textContent = "☀️";
}

// Toggle theme
themeToggle.addEventListener("click", () => {
  body.classList.toggle("dark");
  if (body.classList.contains("dark")) {
    themeToggle.textContent = "☀️";
    localStorage.setItem("theme", "dark");
  } else {
    themeToggle.textContent = "🌙";
    localStorage.setItem("theme", "light");
  }
});

// Back to Top Button
const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    backToTop.style.display = "block";
  } else {
    backToTop.style.display = "none";
  }
});

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});




// Share Post Function
function sharePost(index) {
  const post = allPosts[index];
  const shareData = {
    title: post.title,
    text: post.description,
    url: window.location.href
  };

  if (navigator.share) {
    navigator.share(shareData).catch(err => console.log("Share failed:", err));
  } else {
    // Fallback: copy link to clipboard
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert("Link copied to clipboard!");
    });
  }
}

function toggleLike(index, btn) {
  let likes = parseInt(localStorage.getItem(`likes_${index}`)) || 0;
  let liked = localStorage.getItem(`liked_${index}`) === "true";

  if (!liked) {
    // Like it
    likes++;
    localStorage.setItem(`likes_${index}`, likes);
    localStorage.setItem(`liked_${index}`, "true");
    btn.classList.remove("btn-outline-danger");
    btn.classList.add("btn-danger");
  } else {
    // Unlike it
    likes = Math.max(0, likes - 1);
    localStorage.setItem(`likes_${index}`, likes);
    localStorage.setItem(`liked_${index}`, "false");
    btn.classList.remove("btn-danger");
    btn.classList.add("btn-outline-danger");
  }

  document.getElementById(`like-count-${index}`).textContent = likes;
}

Object.keys(localStorage).forEach(key => {
  if (key.startsWith("likes_") || key.startsWith("liked_")) {
    localStorage.removeItem(key);
  }
});

