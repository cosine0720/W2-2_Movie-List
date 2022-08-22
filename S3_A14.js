const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12
const movies = []
let filteredMovies = []
// 宣告currentPage去紀錄目前分頁，確保切換模式時分頁不會跑掉且搜尋時不會顯示錯誤
let currentPage = 1

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const changeMode = document.querySelector('#change-mode')


// 呈現API中所有電影資訊--------------------------------------------
  // 【A14_加碼功能：區分card與list的模式---------------------
function renderMovieList(data){
  if (dataPanel.dataset.mode === 'card-mode') {
    let rawHTML = ''
    data.forEach((item) => {
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
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>`
    })
    dataPanel.innerHTML = rawHTML

  } else if (dataPanel.dataset.mode === 'list-mode') {
    let rawHTML = `<table class="table table-hover">
        <thead>
          <tr>           
          </tr>
        </thead>
        <tbody>`
    data.forEach((item) => {
      rawHTML += `<tr>
            <td class="col-8">${item.title}</td>
            <td class="col-4">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal"
                data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </td>
          </tr>`
    })
    rawHTML += `</tbody>
      </table>`
    dataPanel.innerHTML = rawHTML
  }
     
}


function changeDisplayMode(displayMode) {
  if (dataPanel.dataset.mode === displayMode) return
  dataPanel.dataset.mode = displayMode
}



 
// 分頁功能---------------------------------------------------
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE) // 無條件進位
  let rawHTML = ''

  for (let page = 1;page <= numberOfPages; page ++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}


function getMoviesByPage(page) {
  //區分目前為 首頁 或 搜尋頁面
  const data = filteredMovies.length ? filteredMovies : movies 
  // 如果 filteredMovies 有資料，則回傳其搜尋資料，否則回傳原先 movies 資料
  
  const startIndex = (page - 1 ) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}




// 點擊每一部電影下方的《More》跑出Modal視窗，顯示電影資訊----------------------------------
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





// 點擊每一部電影下方的《+》，將電影加入「我的最愛」-----------------------------------------
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || [] // 沒有則給我空陣列
  const movie = movies.find((movie) => movie.id === id)   
  // movie 抓出來各自比對，find 類似 filter


  // 【重複資料】：例如 list 已存在 id=2 的電影，再點按到 id=2，比對到有重複，則movie的值不繼續執行，並跳出alert提醒
  if (list.some((movie) => movie.id === id)){
    // some: 如果有相同元素給true，否則給false，語法類似find
    return alert('此電影已經在收藏清單中！')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies',JSON.stringify(list))
}





// 綁定監聽器-----------------------------------------------------

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    // 查看電影資訊，綁定各自點擊 More 的id
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')){
    // 增加喜歡的電影清單，綁定各自點擊 "+" 的id
    addToFavorite(Number(event.target.dataset.id))
  }
})



// search bar 搜尋列-------------------------
searchForm.addEventListener('submit',function onSearchFormSubmitted(event){
  // 請瀏覽器不要做預設動作(重整)
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()  // toLowerCase() 為不分大小寫

  filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(keyword)
  )

  if (filteredMovies.length === 0 ) {
    return alert('Cannot find movie with keyword: '+ keyword)
  }
  
  currentPage = 1
  renderPaginator(filteredMovies.length)          //重製分頁器
  renderMovieList(getMoviesByPage(currentPage))   //預設顯示第 1 頁的搜尋結果
})




// 點擊畫面呈現模式的圖示----------------------
changeMode.addEventListener('click', function onchangeModeClicked(event) {
  if (event.target.matches('#card-button')) {
    changeDisplayMode('card-mode')
    renderMovieList(getMoviesByPage(currentPage))
  } else if (event.target.matches('#list-button')) {
    changeDisplayMode('list-mode')
    renderMovieList(getMoviesByPage(currentPage))
  }
})



paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return //'A' : <a>...</a>
  const page = Number(event.target.dataset.page)
  currentPage = page
  renderMovieList(getMoviesByPage(currentPage))
})



axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(... response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(currentPage))
  })
  .catch((err) => console.log(err))

  