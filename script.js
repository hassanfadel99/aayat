// العناصر

const splashScreen =
document.getElementById("splash-screen");

const appContent =
document.getElementById("app-content");

const sidebar =
document.getElementById("sidebar");

const sidebarOverlay =
document.getElementById("sidebar-overlay");

const surahGridContainer =
document.getElementById("surah-grid-container");

const searchInput =
document.getElementById("surah-search");

const selectorPanel =
document.getElementById("surah-selector-panel");

const readingZone =
document.getElementById("reading-zone");

const surahTitle =
document.getElementById("surah-title");

const surahText =
document.getElementById("surah-text");

const quranAudio =
document.getElementById("quran-audio");

const prevPageBtn =
document.getElementById("prev-page-btn");

const nextPageBtn =
document.getElementById("next-page-btn");

const pageIndicator =
document.getElementById("page-indicator");

const hijriDate =
document.getElementById("hijri-date");

const readerSelect =
document.getElementById("reader-select");

// متغيرات

let allSurahs = [];

let pages = [];

let currentPage = 0;

let currentSurah = 1;

// تشغيل التطبيق

function startApp(){

  splashScreen.style.opacity = "0";

  setTimeout(()=>{

    splashScreen.classList.add("hidden");

    appContent.classList.remove("hidden");

  },500);

}

// القائمة

function toggleSidebar(){

  sidebar.classList.toggle("close");

  sidebarOverlay.classList.toggle("hidden");

}

// عرض الصفحات

function showSection(id){

  document.querySelectorAll(".dashboard-view")
  .forEach(section=>{

    section.classList.add("hidden");

  });

  document.getElementById(id)
  .classList.remove("hidden");

}

// صفحة المطور

function openDeveloperPage(){

  toggleSidebar();

  showSection("developer-page");

}

// الرئيسية

function backToHome(){

  stopAudio();

  selectorPanel.classList.remove("hidden");

  readingZone.classList.add("hidden");

  showSection("home-dashboard");

}

// العودة للسور

function backToList(){

  stopAudio();

  selectorPanel.classList.remove("hidden");

  readingZone.classList.add("hidden");

}

// إيقاف الصوت

function stopAudio(){

  quranAudio.pause();

  quranAudio.currentTime = 0;

}

// إزالة التشكيل

function normalizeArabic(text){

  return text

  .replace(/[ًٌٍَُِّْـ]/g,"")

  .replace(/أ|إ|آ/g,"ا")

  .replace(/ة/g,"ه")

  .replace(/ى/g,"ي");

}

// تحميل السور

async function loadSurahs(){

  try{

    const response =
    await fetch(
      "https://api.alquran.cloud/v1/surah"
    );

    const data =
    await response.json();

    allSurahs = data.data;

    renderSurahs(allSurahs);

  }catch{

    surahGridContainer.innerHTML =
    "تعذر تحميل السور";

  }

}

// عرض السور

function renderSurahs(list){

  surahGridContainer.innerHTML = "";

  list.forEach(surah=>{

    const button =
    document.createElement("button");

    button.className =
    "surah-grid-item";

    button.innerHTML = `

      <div class="surah-number">
        ${surah.number}
      </div>

      <div class="surah-name">
        ${surah.name}
      </div>

    `;

    button.onclick = ()=>{

      selectSurah(
        surah.number,
        surah.name
      );

    };

    surahGridContainer
    .appendChild(button);

  });

}

// البحث

searchInput.addEventListener("input",()=>{

  const value =
  normalizeArabic(
    searchInput.value.trim()
  );

  const filtered =
  allSurahs.filter(surah=>{

    return normalizeArabic(
      surah.name
    ).includes(value);

  });

  renderSurahs(filtered);

});

// اختيار سورة

async function selectSurah(number,name){

  currentSurah = number;

  selectorPanel.classList.add("hidden");

  readingZone.classList.remove("hidden");

  surahTitle.innerHTML =
  `سورة ${name}`;

  surahText.innerHTML =
  "جاري تحميل السورة...";

  try{

    const response =
    await fetch(
      `https://api.alquran.cloud/v1/surah/${number}`
    );

    const data =
    await response.json();

    createPages(data.data.ayahs);

    currentPage = 0;

    renderPage();

    loadAudio(number);

  }catch{

    surahText.innerHTML =
    "تعذر تحميل السورة";

  }

}

// تحميل الصوت

function loadAudio(number){

  const reader =
  readerSelect.value;

  quranAudio.src =
  `https://cdn.islamic.network/quran/audio-surah/128/${reader}/${number}.mp3`;

}

// تغيير القارئ

readerSelect.addEventListener("change",()=>{

  loadAudio(currentSurah);

});

// تقسيم الصفحات

function createPages(ayahs){

  pages = [];

  let temp = [];

  ayahs.forEach((ayah,index)=>{

    temp.push({

      text:ayah.text,

      number:index + 1

    });

    if(temp.length >= 7){

      pages.push(temp);

      temp = [];

    }

  });

  if(temp.length > 0){

    pages.push(temp);

  }

}

// عرض الصفحة

function renderPage(){

  surahText.innerHTML = "";

  const page =
  pages[currentPage];

  page.forEach((ayah)=>{

    const div =
    document.createElement("div");

    div.className =
    "ayah-box";

    div.innerHTML =
    `${ayah.text} ﴿${ayah.number}﴾`;

    surahText.appendChild(div);

  });

  pageIndicator.innerHTML =
  `صفحة ${currentPage + 1}
   من ${pages.length}`;

  prevPageBtn.disabled =
  currentPage === 0;

  nextPageBtn.disabled =
  currentPage === pages.length - 1;

}

// التالي

nextPageBtn.addEventListener("click",()=>{

  if(currentPage < pages.length - 1){

    currentPage++;

    renderPage();

  }

});

// السابق

prevPageBtn.addEventListener("click",()=>{

  if(currentPage > 0){

    currentPage--;

    renderPage();

  }

});

// التاريخ

async function loadHijriDate(){

  try{

    const response =
    await fetch(
      "https://api.aladhan.com/v1/gToH"
    );

    const data =
    await response.json();

    const hijri =
    data.data.hijri;

    hijriDate.innerHTML =
    `${hijri.day}
     ${hijri.month.ar}
     ${hijri.year} هـ`;

  }catch{

    hijriDate.innerHTML =
    "تعذر التحميل";

  }

}

// تشغيل

window.addEventListener("DOMContentLoaded",()=>{

  loadSurahs();

  loadHijriDate();

});