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
        <div class="carousel-caption d-none d-md-block">
          <h3>${post.title}</h3>
          <p>${post.excerpt}</p>
          <button class="btn btn-primary" onclick="openPost(${allPosts.indexOf(post)})">Read More</button>
        </div>
      </div>
    `;
  });
}

// Render posts with pagination
function renderPosts(posts) {
  let postContainer = document.getElementById("posts");
  postContainer.innerHTML = "";

  if (posts.length === 0) {
    postContainer.innerHTML = `<p class="text-center text-muted">No posts found.</p>`;
    document.getElementById("pagination").innerHTML = "";
    return;
  }

  let start = (currentPage - 1) * postsPerPage;
  let end = start + postsPerPage;
  let paginatedPosts = posts.slice(start, end);

  paginatedPosts.forEach((post, index) => {
    let globalIndex = allPosts.indexOf(post);
    let postHTML = `
      <div class="col-md-4">
        <div class="card h-100">
          <img src="${post.image}" class="card-img-top" alt="${post.title}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${post.title}</h5>
            <p class="card-text">${post.excerpt}</p>
            <button class="btn btn-primary mt-auto" onclick="openPost(${globalIndex})">Read More</button>
          </div>
        </div>
      </div>`;
    postContainer.innerHTML += postHTML;
  });

  renderPagination(posts.length);
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
    (post.title.toLowerCase().includes(query) || post.excerpt.toLowerCase().includes(query))
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