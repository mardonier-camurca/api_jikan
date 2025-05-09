// Elementos do DOM
const searchInput = document.getElementById("search-input")
const searchButton = document.getElementById("search-button")
const resultsContainer = document.getElementById("results")
const loadingElement = document.getElementById("loading")
const errorElement = document.getElementById("error")
const themeToggleBtn = document.getElementById("theme-toggle-btn")
const htmlElement = document.documentElement

const JIKAN_API_BASE_URL = "https://api.jikan.moe/v4"

function setTheme(isDark) {
  if (isDark) {
    htmlElement.classList.add("dark-theme")
    themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>'
    localStorage.setItem("theme", "dark")
  } else {
    htmlElement.classList.remove("dark-theme")
    themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>'
    localStorage.setItem("theme", "light")
  }
}

function loadSavedTheme() {
  const savedTheme = localStorage.getItem("theme")
  if (savedTheme === "light") {
    setTheme(false)
  } else {
    // Por padrão, usar tema escuro
    setTheme(true)
  }
}

themeToggleBtn.addEventListener("click", () => {
  const isDarkTheme = htmlElement.classList.contains("dark-theme")
  setTheme(!isDarkTheme)
})

loadSavedTheme()

function showLoading() {
  loadingElement.style.display = "block"
  errorElement.style.display = "none"
  resultsContainer.innerHTML = ""
}

function hideLoading() {
  loadingElement.style.display = "none"
}

function showError(message) {
  errorElement.textContent = message
  errorElement.style.display = "block"
}

function showInitialMessage() {
  resultsContainer.innerHTML = `
    <div class="initial-message">
      <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; color: var(--button-bg);"></i>
      <h2>Pesquise por seu anime favorito</h2>
      <p>Digite o nome de um anime no campo de pesquisa acima e clique em "Pesquisar"</p>
    </div>
  `
}

async function searchAnime(query) {
  showLoading()

  try {
    const response = await fetch(`${JIKAN_API_BASE_URL}/anime?q=${encodeURIComponent(query)}&sfw=true&limit=24`)

    if (!response.ok) {
      throw new Error("Erro ao buscar dados da API. Por favor, tente novamente mais tarde.")
    }

    const data = await response.json()
    hideLoading()

    if (data.data.length === 0) {
      showError("Nenhum resultado encontrado. Tente outra pesquisa.")
      return
    }

    displayResults(data.data)
  } catch (error) {
    hideLoading()
    showError(error.message)
    console.error("Erro:", error)
  }
}

function displayResults(animes) {
  resultsContainer.innerHTML = ""
  animes.forEach((anime) => {
    if (anime.images && anime.images.jpg && anime.images.jpg.image_url) {
      const animeCard = document.createElement("div")
      animeCard.className = "anime-card"

      const animeImage = document.createElement("img")
      animeImage.className = "anime-image"
      animeImage.src = anime.images.jpg.image_url
      animeImage.alt = anime.title
      animeImage.loading = "lazy"

      const animeInfo = document.createElement("div")
      animeInfo.className = "anime-info"

      const animeTitle = document.createElement("div")
      animeTitle.className = "anime-title"
      animeTitle.textContent = anime.title

      const animeType = document.createElement("div")
      animeType.className = "anime-type"
      animeType.textContent = `${anime.type || "N/A"} | ${anime.status || "N/A"}`

      
      if (anime.rank) {
        const animeRank = document.createElement("div")
        animeRank.className = "anime-rank"
        animeRank.textContent = `Rank #${anime.rank}`
        animeInfo.appendChild(animeRank)
      }

      animeInfo.appendChild(animeTitle)
      animeInfo.appendChild(animeType)

      animeCard.appendChild(animeImage)
      animeCard.appendChild(animeInfo)

      animeCard.addEventListener("click", () => {
        window.open(anime.url, "_blank")
      })

      resultsContainer.appendChild(animeCard)
    }
  })
}

searchButton.addEventListener("click", () => {
  const query = searchInput.value.trim()
  if (query) {
    searchAnime(query)
  } else {
    showError("Por favor, digite algo para pesquisar.")
  }
})

searchInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    const query = searchInput.value.trim()
    if (query) {
      searchAnime(query)
    } else {
      showError("Por favor, digite algo para pesquisar.")
    }
  }
})

window.addEventListener("DOMContentLoaded", () => {
  showInitialMessage()
})
