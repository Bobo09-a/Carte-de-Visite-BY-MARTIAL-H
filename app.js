// GlassTok — prototype front-end
// Aucune dépendance, fonctionne sur GitHub Pages.
// - Auto-play de la vidéo visible (IntersectionObserver)
// - Likes (localStorage), commentaires (mock), double-tap like
// - Feed vertical 100% viewport

const FEED = [
  {
    id: "v1",
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    poster: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=1200&q=60&auto=format",
    author: { name: "Awa", avatar: "https://i.pravatar.cc/100?img=15", handle: "@awa.design" },
    caption: "Effet verre (Glass UI) en CSS sur une interface mobile-first ✨",
    tags: ["#design", "#glass", "#css"],
    music: "son • dreamy-ambient",
    likes: 126,
    comments: [
      { user: "Kenji", avatar: "https://i.pravatar.cc/100?img=13", text: "Incroyable le rendu 💎" },
      { user: "Mina", avatar: "https://i.pravatar.cc/100?img=32", text: "On veut le tuto ! 🙌" },
    ]
  },
  {
    id: "v2",
    src: "https://media.w3.org/2010/05/sintel/trailer.mp4",
    poster: "https://images.unsplash.com/photo-1520975922284-7b3722b1f481?w=1200&q=60&auto=format",
    author: { name: "Youssef", avatar: "https://i.pravatar.cc/100?img=24", handle: "@youssef.code" },
    caption: "Scroll vertical auto-play avec IntersectionObserver 🔥",
    tags: ["#javascript", "#frontend"],
    music: "son • lo-fi focus",
    likes: 312,
    comments: [
      { user: "Lina", avatar: "https://i.pravatar.cc/100?img=48", text: "Merci pour l'astuce !" }
    ]
  },
  {
    id: "v3",
    src: "https://www.w3schools.com/html/mov_bbb.mp4",
    poster: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=60&auto=format",
    author: { name: "Martial", avatar: "https://i.pravatar.cc/100?img=5", handle: "@martial.dev" },
    caption: "Prototype de réseau social vidéo — GitHub Pages ready ✅",
    tags: ["#prototype", "#githubpages"],
    music: "son • upbeat",
    likes: 87,
    comments: [
      { user: "Amira", avatar: "https://i.pravatar.cc/100?img=50", text: "Le design est propre 👌" }
    ]
  }
];

const feedEl = document.getElementById('feed');
const modal = document.getElementById('commentModal');
const closeComments = document.getElementById('closeComments');
const commentList = document.getElementById('commentList');
const commentForm = document.getElementById('commentForm');
const commentInput = document.getElementById('commentInput');
const toTopBtn = document.getElementById('toTop');

// Render feed
function renderCard(item){
  const card = document.createElement('section');
  card.className = 'video-card';
  card.dataset.id = item.id;

  card.innerHTML = `
    <video
      src="${item.src}"
      poster="${item.poster}"
      preload="metadata"
      playsinline
      muted
      loop
      controlslist="nodownload nofullscreen noremoteplayback"
      disablepictureinpicture
    ></video>

    <div class="overlay">
      <div class="meta">
        <div class="author">
          <img class="avatar" src="${item.author.avatar}" alt="Avatar ${item.author.name}" />
          <div class="name">${item.author.name} <span style="opacity:.8;font-weight:600">${item.author.handle}</span></div>
          <button class="btn small ghost follow-btn" aria-label="Suivre ${item.author.name}">Suivre</button>
        </div>
        <div class="caption">${item.caption}</div>
        <div class="tags">${item.tags.join(' ')}</div>
        <div class="music">🎵 ${item.music}</div>
      </div>
      <div class="actions">
        <button class="action like" aria-label="Aimer">
          <span class="icon">❤</span>
          <span class="count">${item.likes}</span>
        </button>
        <button class="action comments-btn" aria-label="Commentaires">
          <span class="icon">💬</span>
          <span class="count">${item.comments.length}</span>
        </button>
        <button class="action share-btn" aria-label="Partager">
          <span class="icon">↗</span>
          <span class="count">Share</span>
        </button>
      </div>
    </div>
    <div class="heart-fx">❤</div>
  `;

  // like state from localStorage
  const likeBtn = card.querySelector('.action.like');
  const likeKey = 'liked_' + item.id;
  if(localStorage.getItem(likeKey)==='1'){
    likeBtn.classList.add('liked');
  }
  likeBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    const count = likeBtn.querySelector('.count');
    const liked = likeBtn.classList.toggle('liked');
    count.textContent = (+count.textContent) + (liked ? 1 : -1);
    localStorage.setItem(likeKey, liked ? '1' : '0');
  });

  // double tap like
  let lastTap = 0;
  card.addEventListener('pointerdown', (e)=>{
    const now = Date.now();
    if(now - lastTap < 300){
      const heart = card.querySelector('.heart-fx');
      heart.style.left = (e.clientX - 32) + 'px';
      heart.style.top = (e.clientY - 32) + 'px';
      heart.style.opacity = 1;
      heart.style.transform = 'scale(1)';
      setTimeout(()=>{
        heart.style.opacity = 0; heart.style.transform = 'scale(.6)';
      }, 300);
      likeBtn.click();
    }
    lastTap = now;
  });

  // comments
  card.querySelector('.comments-btn').addEventListener('click', ()=> openComments(item));

  // share
  card.querySelector('.share-btn').addEventListener('click', async ()=>{
    const shareData = {
      title: 'GlassTok',
      text: item.caption + ' — par ' + item.author.handle,
      url: location.href + '#' + item.id
    };
    try{
      if(navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(shareData.url);
        alert('Lien copié ✅');
      }
    }catch(e){ /* ignore */ }
  });

  return card;
}

function openComments(item){
  // render list
  commentList.innerHTML = '';
  (item.comments||[]).forEach(c => {
    const row = document.createElement('div');
    row.className = 'comment';
    row.innerHTML = \`
      <img class="avatar" src="\${c.avatar}" alt="Avatar \${c.user}">
      <div class="bubble"><strong>\${c.user}</strong><br>\${c.text}</div>
    \`;
    commentList.appendChild(row);
  });
  modal.classList.remove('hidden');
  modal.dataset.current = item.id;
  commentInput.value = '';
  commentInput.focus();
}
closeComments.addEventListener('click', ()=> modal.classList.add('hidden'));
modal.addEventListener('click', (e)=>{
  if(e.target.classList.contains('modal-backdrop')) modal.classList.add('hidden');
});
commentForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const id = modal.dataset.current;
  const item = FEED.find(x => x.id===id);
  const text = commentInput.value.trim();
  if(!text) return;
  item.comments.push({user: "Vous", avatar: "https://i.pravatar.cc/100?img=1", text});
  openComments(item);
});

// Build feed
FEED.forEach(item => feedEl.appendChild(renderCard(item)));
feedEl.setAttribute('aria-busy', 'false');

// IntersectionObserver: play visible video, pause others
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    const video = entry.target.querySelector('video');
    if(entry.isIntersecting){
      try { video.play().catch(()=>{}); } catch(e){}
    } else {
      video.pause();
    }
  });
}, { threshold: 0.7 });
document.querySelectorAll('.video-card').forEach(card => observer.observe(card));

// Scroll to top button
const onScroll = ()=>{
  if(window.scrollY > window.innerHeight*1.2) toTopBtn.classList.remove('hidden');
  else toTopBtn.classList.add('hidden');
};
document.addEventListener('scroll', onScroll, {passive:true});
toTopBtn.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
