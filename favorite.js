const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

// 事件1：呈現API中所有電影資訊----------------------------------------------
function renderMovieList(data) {
  let rawHTML = ''
  // 將陣列用 forEach 轉換出來
  data.forEach((item) => {
    //title,image
    rawHTML += `<div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img
                src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster" />
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
              </div>
            </div>
          </div>
        </div>`
  })
  dataPanel.innerHTML = rawHTML
}

// 事件2：點擊每一部電影下方的《More》跑出Modal視窗，顯示電影資訊----------------------------------
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    // response.data.results
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
}

// 事件3：點擊每一部電影下方的《X》，將電影移除「我的最愛」-----------------------------------------
function removeFromFavorite(id) {
  if (!movies || !movies.length) return  // 防止 movies 是空陣列的狀況

  const movieIndex = movies.findIndex((movie) => movie.id === id) // findIndex 為資料的位置
  if (movieIndex === -1) return

  movies.splice(movieIndex,1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMovieList(movies)
}


// 事件0：綁定監聽器-----------------------------------------------------------------------
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    // 查看電影資訊，綁定各自點擊 More 的id
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    // 移除喜歡的電影清單，綁定各自點擊 "+" 的id
    removeFromFavorite(Number(event.target.dataset.id))
  }
})


renderMovieList(movies)