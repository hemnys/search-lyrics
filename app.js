const fetchData = ({ url, callBack }) => {
  const BASE_URL = `https://api.lyrics.ovh`;
  return fetch(`${BASE_URL}/${url}`)
    .then((res) => res.json())
    .then((data) => callBack({ data }));
};
const stringToHTML = (s) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(s, "text/html");
  return doc.body.firstChild;
};
const clearContent = () => {
  const contentSearch = document.getElementById("contentSearch");
  const search = document.getElementById("search");
  const contentlyrics = document.getElementById("contentlyrics");
  contentSearch.innerHTML = "";
  contentlyrics.innerHTML = "";
  search.value = "";
};
const showError = ({ message }) => {
  const messageSelector = document.getElementById("message");
  messageSelector.innerHTML = message;
  messageSelector.style.opacity = 1;
  setTimeout(() => {
    messageSelector.style.opacity = 0;
  }, 2000);
};
const templateSongs = ({ data }) => {
  let { data: songs } = data;
  let template = `<ul class="songs">
    ${songs
      .map((song) => {
        let {
          title,
          artist: { name },
        } = song;
        return `<li class="song">
          <span>${title} by ${name}</span>
          <button
            class="detail"
            data-title="${title}"
            data-artist="${name}"
          >Detail</button>
      </li>`;
      })
      .join("")}
  </ul>`;
  return template;
};
const templateLyric = ({ data }) => {
  let { lyrics } = data;
  if (lyrics === undefined) {
    return showError({ message: "Lyric not found" });
  }
  lyrics = lyrics.replace(/(\n|\r)/g, "<br>");
  const template = `
        <div class="lyric">
          <button id="copy" class="detail"> Copy Lyric</button>
            <p>
            ${lyrics}
            </p>
        </div>`;
  return template;
};
const copySong = ({ selector, content }) => {
  if (selector.id === "copy") {
    navigator.clipboard.writeText(content);
  }
};
const showLyric = ({ data }) => {
  const lyricsWrapper = document.getElementById("contentlyrics");
  let contentHTML = stringToHTML(templateLyric({ data }));
  lyricsWrapper.innerHTML = "";
  lyricsWrapper.append(contentHTML);
  lyricsWrapper.addEventListener("click", (evt) =>
    copySong({ selector: evt.target, content: lyricsWrapper.innerText })
  );
};
const fetchLyric = ({ title, artist }) => {
  let url = `/v1/${artist}/${title}`;
  return fetchData({ url, callBack: showLyric });
};
const handleSong = (evt) => {
  if (evt.target.classList.contains("detail")) {
    let { title, artist } = evt.target.dataset;
    fetchLyric({ title, artist });
  }
};
const showSongs = ({ data }) => {
  const contentSearch = document.getElementById("contentSearch");
  let contentHTML = stringToHTML(templateSongs({ data }));
  clearContent();
  contentSearch.append(contentHTML);
  contentSearch.addEventListener("click", handleSong);
};
const searchSong = ({ search }) => {
  let url = `/suggest/${search}`;
  return fetchData({ url, callBack: showSongs });
};
const handleSubmit = (evt) => {
  evt.preventDefault();
  const formData = new FormData(evt.target);
  const search = formData.get("search");
  if (!search) return;
  searchSong({ search });
};
window.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".form");
  form.addEventListener("submit", handleSubmit);
});
