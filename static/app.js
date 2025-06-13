const slides = [
  {
    title: "Welcome",
    content: "This is a real-time synchronized presentation app!",
  },
  {
    title: "How it works",
    content: "When the presenter changes slides, all viewers see the same slide instantly.",
  },
  {
    title: "Tech Stack",
    content: "Deno, Oak, TailwindCSS, Server-Sent Events, Deno Deploy",
  },
  {
    title: "Enjoy!",
    content: "Try presenting and joining from multiple browsers!",
  },
];

let currentSlide = 0;
let isPresenter = false;

// Use Server-Sent Events instead of WebSocket
const eventSource = new EventSource('/events');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'slide' && !isPresenter) {
    currentSlide = data.index;
    renderSlide();
  }
};

eventSource.onerror = (error) => {
  console.log('SSE connection error:', error);
};

async function updateSlide(slideIndex) {
  if (isPresenter) {
    try {
      await fetch('/slide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ index: slideIndex }),
      });
    } catch (error) {
      console.error('Failed to update slide:', error);
    }
  }
}

function renderSlide() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="flex flex-col items-center justify-center w-full h-full">
      <h1 class="text-4xl font-bold mb-4">${slides[currentSlide].title}</h1>
      <p class="text-xl mb-8">${slides[currentSlide].content}</p>
      <div class="flex gap-4 mb-4">
        <button id="prev" class="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700" ${currentSlide === 0 ? "disabled" : ""}>Previous</button>
        <button id="next" class="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700" ${currentSlide === slides.length - 1 ? "disabled" : ""}>Next</button>
        <button id="fullscreen" class="px-4 py-2 bg-green-600 rounded hover:bg-green-700">Full Screen</button>
      </div>
      <div class="mb-2">
        <label class="mr-2">
          <input type="checkbox" id="presenter" ${isPresenter ? "checked" : ""} /> Presenter mode
        </label>
      </div>
      <div class="text-sm text-gray-400">Slide ${currentSlide + 1} of ${slides.length}</div>
    </div>
  `;

  document.getElementById("prev").onclick = async () => {
    if (currentSlide > 0) {
      currentSlide--;
      await updateSlide(currentSlide);
      renderSlide();
    }
  };
  document.getElementById("next").onclick = async () => {
    if (currentSlide < slides.length - 1) {
      currentSlide++;
      await updateSlide(currentSlide);
      renderSlide();
    }
  };
  document.getElementById("fullscreen").onclick = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  };
  document.getElementById("presenter").onchange = (e) => {
    isPresenter = e.target.checked;
  };
}

window.onload = renderSlide; 