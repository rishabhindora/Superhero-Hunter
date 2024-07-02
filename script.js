/* ----Scroll To The Top Function---- */
window.onscroll = function() { displayScrollBtn() };
modalClose();

function displayScrollBtn() {
    const scrollTopBtn = document.getElementById("scrollTopBtn");

    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scrollTopBtn.classList.add("show");
    } else {
        scrollTopBtn.classList.remove("show");
    }
  }

function scrollToTop() {
    const body = document.body;
    const html = document.documentElement;
    body.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function scrollToTopSudden() {
  const body = document.body;
  const html = document.documentElement;
  body.scrollIntoView({block: 'start' });
}

/* ----Downloading Heroes and save them. If you already saved, then retrieve them in Global Variable---- */
var allDownloadedHeroes=false;
const storedData = localStorage.getItem('allMarvelHeroes');
(async()=>{
  if (storedData){
    try {
        allDownloadedHeroes = JSON.parse(LZString.decompress(storedData));
        for (let [index, hero] of allDownloadedHeroes.entries()) {
          hero.ind = index;
        }        
    } catch (error) {
        console.error('Error parsing stored data:', error);
        // Handle parsing error (e.g., set default value)
    }
}
  await allHeroesDownloader();
  renderSuperHeroes(allDownloadedHeroes);
})();

async function allHeroesDownloader(){
  if (allDownloadedHeroes==false){
  let allHeroList=[];
  let offset=0;
  let batchLength=100;
  
  while  (batchLength ==  100){
    let data=await fetchHero(offset);
    let batchHeroes=data.data.results;
    allHeroList.push(...batchHeroes)
    batchLength= batchHeroes.length;
    offset += batchLength;
  }

  allHeroList.forEach((hero) => {
    hero.wishlist = false;
});

  let compressed_allHeroListJSON=LZString.compress(JSON.stringify(allHeroList));
  localStorage.setItem('allMarvelHeroes',             compressed_allHeroListJSON);

  allDownloadedHeroes = JSON.parse(LZString.decompress(localStorage.getItem( 'allMarvelHeroes')));
  for (let [index, hero] of allDownloadedHeroes.entries()) {
    hero.ind = index;
  }
  console.log('All heros downloaded')
}
}


/* ---Function to fetch batches of heroes--- */
async function fetchHero(offset=0){
  try{
    const publicKey='8efe55253abeafff3b3830dc23987533';
    const privateKey='d6a7719ee695bab27443bf4d873823aa22c63b61'
    const timestamp = new Date().getTime();
    const hash = CryptoJS.MD5(timestamp + privateKey + publicKey).toString();
    let limit=100;
    const apiUrl = `https://gateway.marvel.com/v1/public/characters?ts=${timestamp}&apikey=${publicKey}&hash=${hash}&limit=${limit}&offset=${offset}`;
    
    let response= await fetch(apiUrl);
    let data=await response.json();
    return data;
  }
  catch(error){
    console.log("Error: " + error);
  }
}


/* ----Add Hover Sound Effects to Thumbnails---- */
function thumbnailHoverSound(heroContainer){  
  // Var HoverSound is the audio tag
  let hoverSound = document.getElementById('hoverSound');
  // Add event listeners for mouseover and mouseout events
  heroContainer.addEventListener('mouseover', () => {
      if (event.target === heroContainer){
        hoverSound.play();
      }      
  });

  heroContainer.addEventListener('mouseout', () => {      
      if (event.target === heroContainer){
        hoverSound.pause();
        hoverSound.currentTime = 0;
      }
      
  });
}


/* ------Render The  Heroes Into Home Page------ */
function renderSuperHeroes(data){
  let homeSuperHeroes= document.querySelector(".home-superheroes");
  let All_CharacterData = data;
  for  (let heroData of All_CharacterData){
    var heroContainer = document.createElement('DIV');
    heroContainer.classList.add('hero-container');
    var heroContent = document.createElement( 'DIV' );
    heroContent.classList.add('hero-content')
    var heroName = document.createElement('H2')
    heroContainer.setAttribute('hero-id', heroData.id);
    heroContainer.setAttribute('hero-ind', heroData.ind);
    heroContainer.appendChild(heroContent);
    heroContent.appendChild(heroName);
    heroName.textContent = heroData.name;
    homeSuperHeroes.appendChild(heroContainer);
    let heroImageURL= `${heroData.thumbnail.path}.${heroData.thumbnail.extension}`;
    heroContainer.style.backgroundImage=`url('${heroImageURL}')` 
    heroContainer.style.backgroundSize = 'cover';
    
    thumbnailHoverSound(heroContainer);
    heroContainer.addEventListener('click', function() { 
      let heroInd = this.getAttribute('hero-ind');
      heroInd=parseInt(heroInd, 10);
      console.log(heroInd);
      modalOpener(allDownloadedHeroes[heroInd]);
      scrollToTopSudden();
    }
  );
    
      }
}



/* ---input event listener--- */
var input= document.querySelector('.search input')
input.addEventListener("keydown", function (event) {
  if (event.code === 'Enter') {
    event.preventDefault();
    searchHeroesFinder();
  }
});


/* -----Function to Search Heroes----- */

function searchHeroesFinder(){
  modalClose();
  let sectionHomeSuperheroes=document.getElementById("section-home-superheroes");
  let sectionSearchResults=document.getElementById( "section-search-results" ) ;
  let sectionWishlist=document.getElementById('section-wishlist');
  sectionHomeSuperheroes.style.display='none';
  sectionSearchResults.style.display= 'block';
  sectionWishlist.style.display='none';
  
  let searchInput = document.querySelector(".search>input").value;
  document.querySelector(".search>input").value=''
  matchingHeroes=[]

  for (let [index, hero] of allDownloadedHeroes.entries()){
    if (hero.name.toLowerCase().replace(/\s/g, '').includes(searchInput.toLowerCase().replace(/\s/g, ''))){
      matchingHeroes.push(hero);
    }
  }
  console.log(matchingHeroes);
  renderSearchResults(matchingHeroes);
}


/* ----Render SuperHeroes To Search Results---- */
function renderSearchResults(matchingHeroes){
  let searchHeroesContainer = document.querySelector(".search-heroes-container");
  searchHeroesContainer.innerHTML="";
  for( hero of matchingHeroes){
    var heroContainer = document.createElement('DIV');
    
    heroContainer.classList.add('hero-container');
    var heroContent = document.createElement( 'DIV' );
    heroContent.classList.add('hero-content')
    var heroName = document.createElement('H2')
    heroContainer.setAttribute('hero-id', hero.id);
    heroContainer.setAttribute('hero-ind', hero.ind);
    
    heroContainer.appendChild(heroContent);
    heroContent.appendChild(heroName);
    heroName.textContent = hero.name;
    searchHeroesContainer.appendChild(heroContainer);
    let heroImageURL= `${hero.thumbnail.path}.${hero.thumbnail.extension}`;
    heroContainer.style.backgroundImage=`url('${heroImageURL}')` 
    heroContainer.style.backgroundSize = 'cover';
    searchHeroesContainer.appendChild(heroContainer);
    heroContainer.addEventListener('click', function() { 
      let heroInd = this.getAttribute('hero-ind');
      heroInd=parseInt(heroInd, 10);
      console.log(heroInd);
      modalOpener(allDownloadedHeroes[heroInd]);
      scrollToTopSudden();
    }
  );


    let addToWishlist=document.createElement('DIV');
    addToWishlist.classList.add('add-to-wishlist');
    addToWishlist.setAttribute('wish-ID',hero.id)
    let wishIcon=document.createElement('I');
    wishIcon.classList.add('fa-regular','fa-heart');
    if (hero.wishlist){
      wishIcon.classList.add('filled-icon');
    }
    addToWishlist.appendChild(wishIcon);
    heroContainer.appendChild(addToWishlist);
    thumbnailHoverSound(heroContainer);
    
    addToWishlist.addEventListener('click', ()=>{wishlistFunction(addToWishlist)
      event.stopPropagation();
    });
    
  }
}
/* -------wishlist------- */
renderWishlist();
var heroWishlist=[]

var localWishlist= JSON.parse(localStorage.getItem('wishList'));
if (localWishlist){
  heroWishlist.push(...localWishlist);
  console.log('local wishlist added!');
}

function wishlistFunction(favBtn){
  let heroId=parseInt(favBtn.parentNode.getAttribute('hero-id'));
  let heroIndex=parseInt(favBtn.parentNode.getAttribute('hero-ind'));
  
  /* for(hero of allDownloadedHeroes){    
    if(hero.id===heroId){      
      console.log('wishlist before', hero.wishlist);
      hero.wishlist = !hero.wishlist;      
      favBtn.children[0].classList.toggle('filled-icon');
      console.log('wishlist after', hero.wishlist);      
      saveWishlist(hero);      
    }
  } */

  let wishlistStatus=allDownloadedHeroes[heroIndex].wishlist;
  allDownloadedHeroes[heroIndex].wishlist=!wishlistStatus;
  favBtn.children[0].classList.toggle('filled-icon');
  
  
  setTimeout(function() {
    Swal.fire({
      title: 'Updating...',
      text: 'Please Wait',
      timer: 500, // Timer for auto close (in milliseconds)
      timerProgressBar: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      showConfirmButton: false
    }).then(function() {
      // This code will execute after the SweetAlert is closed
      saveWishlist(allDownloadedHeroes[heroIndex]);
    });
  }, 0);

}
function saveWishlist(hero){  
  let compressed_allDownloadedHeroesJson=LZString.compress(JSON.stringify(allDownloadedHeroes));
  localStorage.setItem('allMarvelHeroes',             compressed_allDownloadedHeroesJson);
  renderWishlist();
  console.log('wishlist saved!');
  Swal.fire({
    title: 'Superhero Updated😊',
    text: 'Have Fun',
    timer: 500, // Timer for auto ckjlose (in milliseconds)
    timerProgressBar: true,
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    showConfirmButton: false
  })
}


function wishlistNavigation(){
  let sectionHomeSuperheroes=document.getElementById("section-home-superheroes");
  let sectionSearchResults=document.getElementById( "section-search-results" ) ;
  let sectionWishlist=document.getElementById('section-wishlist');
  let modalHero=document.querySelector('#modal-hero');

  sectionHomeSuperheroes.style.display='none';
  sectionSearchResults.style.display= 'none';
  sectionWishlist.style.display='block';
  modalHero.style.display='none';
}

function renderWishlist(){
  let wishlistHeroesContainer= document.getElementsByClassName('wishlist-heroes-container')[0];  
  wishlistHeroesContainer.innerHTML=''
  for  (let hero of allDownloadedHeroes){
    if(hero.wishlist==true) {
      var heroContainer = document.createElement('DIV');
      heroContainer.classList.add('hero-container');
      var heroContent = document.createElement( 'DIV' );
      heroContent.classList.add('hero-content')
      var heroName = document.createElement('H2')
      heroContainer.setAttribute('hero-id', hero.id);
      heroContainer.setAttribute('hero-ind', hero.ind);
      heroContainer.appendChild(heroContent);
      heroContent.appendChild(heroName);
      heroName.textContent = hero.name;
      wishlistHeroesContainer.appendChild(heroContainer);
      let heroImageURL= `${hero.thumbnail.path}.${hero.thumbnail.extension}`;
      heroContainer.style.backgroundImage=`url('${heroImageURL}')` 
      heroContainer.style.backgroundSize = 'cover';
      thumbnailHoverSound(heroContainer);
      
      heroContainer.addEventListener('click', function() { 
        let heroInd = this.getAttribute('hero-ind');
        heroInd=parseInt(heroInd, 10);
        console.log(heroInd);
        modalOpener(allDownloadedHeroes[heroInd]);
        scrollToTopSudden();
      }
    );

      let addToWishlist=document.createElement('DIV');
      addToWishlist.classList.add('add-to-wishlist');
      addToWishlist.setAttribute('wish-ID',hero.id)
      let wishIcon=document.createElement('I');
      wishIcon.classList.add('fa-regular','fa-heart');
      wishIcon.classList.add('filled-icon');
      addToWishlist.appendChild(wishIcon);
      heroContainer.appendChild(addToWishlist);
      thumbnailHoverSound(heroContainer);
    
      addToWishlist.addEventListener('click', ()=>{wishlistFunction(addToWishlist)
        event.stopPropagation();
      }
      
    );
      
        }
      }
}
/* -----Button to Navigate to Home Page---- */
function home(){
  
  let sectionHomeSuperheroes=document.getElementById("section-home-superheroes");
  let sectionSearchResults=document.getElementById( "section-search-results" ) ;
  let sectionWishlist=document.getElementById('section-wishlist');
  sectionHomeSuperheroes.style.display='block';
  sectionSearchResults.style.display= 'none';
  sectionWishlist.style.display='none';
}

/* async function appearancesExtracter(heroId){
  const ts = '1';
  const publicKey = '8efe55253abeafff3b3830dc23987533';
  const privateKey = 'd6a7719ee695bab27443bf4d873823aa22c63b61';
  const toHash = ts + privateKey + publicKey;
  const hash = CryptoJS.MD5(toHash);  // Use a library like crypto-js or a similar md5 hashing library

  const apiUrl = `http://gateway.marvel.com/v1/public/characters/1009597/comics/${heroId}?ts=${ts}&apikey=${publicKey}&hash=${hash}`;
  let response= await fetch(apiUrl);
  let data=await response.json();
  return data;
} */

function modalOpener(hero){
  let modalHero = document.querySelector('#modal-hero');
  let body = document.querySelector('body') 
  modalHero.style.display='flex';
  body.style.overflow = 'hidden';

  let modalHeroDescription = document.querySelector('.modal-hero-description')
  if (hero.description.trim().length === 0){
    console.log('no description available')
    modalHeroDescription.innerHTML = 'No description available';
  }
  else{
    modalHeroDescription.innerHTML=hero.description;
  }
  let modalImg= document.querySelector('.modal-hero-img-container');
  modalImg.style.backgroundImage = `url(${hero.thumbnail.path}.${hero.thumbnail.extension})`;
  let heroName = document.querySelector('.modal-hero-name');
  heroName.innerHTML = hero.name;


  let comicNum = document.querySelector('.comic-num');
  let seriesNum = document.querySelector('.series-num');
  let storiesNum = document.querySelector('.stories-num');
  let eventsNum = document.querySelector('.events-num');
console.log(comicNum)
  comicNum.innerHTML=hero.comics.available;
  seriesNum.innerHTML=hero.series.available;
  storiesNum.innerHTML=hero.stories.available;
  eventsNum.innerHTML=hero.events.available;
  console.log(hero);
  console.log(hero.description);

  let comicNames= document.querySelector('.comic-box > ul');
  let seriesNames= document.querySelector('.series > ul');
  let eventsNames= document.querySelector('.events > ul');

  comicNames.innerHTML='';
  seriesNames.innerHTML='';
  eventsNames.innerHTML='';
  if (hero.comics.items.length < 3) {
    for (let i = 0; i < hero.comics.items.length; i++) {
      let comicName = document.createElement('li');
      comicName.innerHTML = hero.comics.items[i].name;
      comicNames.appendChild(comicName);
    }
  } else {
    for (let i = 0; i < 3; i++) {
      let comicName = document.createElement('li');
      comicName.innerHTML = hero.comics.items[i].name;
      comicNames.appendChild(comicName);
    }
  }


  if (hero.series.items.length < 3) {
    for (let i = 0; i < hero.series.items.length; i++) {
      let seriesName = document.createElement('li');
      seriesName.innerHTML = hero.comics.items[i].name;
      seriesNames.appendChild(seriesName);
    }
  } else {
    for (let i = 0; i < 3; i++) {
      let seriesName = document.createElement('li');
      seriesName.innerHTML = hero.comics.items[i].name;
      seriesNames.appendChild(seriesName);
    }
  }


  if (hero.events.items.length < 3) {
    for (let i = 0; i < hero.events.items.length; i++) {
      let eventsName = document.createElement('li');
      eventsName.innerHTML = hero.comics.items[i].name;
      eventsNames.appendChild(eventsName);
    }
  } else {
    for (let i = 0; i < 3; i++) {
      let eventsName = document.createElement('li');
      eventsName.innerHTML = hero.comics.items[i].name;
      eventsNames.appendChild(evenstName);
    }
  }

}
function modalClose(){
  let modalHero = document.querySelector('#modal-hero');
  let body = document.querySelector('body') 
  modalHero.style.display='none';
  body.style.overflow = 'visible';
  
}