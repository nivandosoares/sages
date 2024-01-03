document.addEventListener("DOMContentLoaded", function () {
  TextDecodeAnimation.init();

  document.querySelector(".start-again").onclick = (e) => {
    e.preventDefault();
    TextDecodeAnimation.reset();
  };
});

function convertElementToSpans(el, text) {
  // Clear all elements out
  el.innerHTML = "";

  Array.from(text).forEach((char) => {
    const span = document.createElement("span");
    span.textContent = char;
    span.classList.add("placeholder");
    el.appendChild(span);
  });
}

class TextDecodeAnimation {
  static placeholderCharacters =
    "α β γ δ ε ζ η θ ι κ λ μ ν ξ ο π ρ σ τ υ φ χ ψ ω Α Β Γ Δ Ε Ζ Η Θ Ι Κ Λ Μ Ν Ξ Ο Π Ρ Σ Τ Υ Φ Χ Ψ Ω";
  static placeholderCharacterArray = Array.from(this.placeholderCharacters);
  static instances = [];

  constructor(el, speed = 700) {
    this.el = el;
    this.text = el.textContent.trim();
    this.animationId = null;
    this.speed = speed;
  }

  start() {
    this.position = 0;
    this.lastUpdateTime = 0;
    convertElementToSpans(this.el, this.text);
    this.animateId = requestAnimationFrame(this._animateFrame.bind(this));
  }

  stop() {
    cancelAnimationFrame(this.animationId);
  }

  _animateFrame() {
    if (this.position >= this.text.length) {
      this.el.textContent = "SAGES";
      return;
    }

    const currentTime = Date.now();

    if (currentTime > this.lastUpdateTime + this.speed) {
      const characterSpanEl = this.el.children.item(this.position);
      characterSpanEl.textContent = this.text[this.position];
      characterSpanEl.classList.remove("placeholder");
      this.position++;
      this.lastUpdateTime = currentTime;
    } else {
      for (let i = this.position; i < this.text.length; i++) {
        const randomCharacterIndex = Math.floor(
          Math.random() * TextDecodeAnimation.placeholderCharacterArray.length
        );
        const characterSpanEl = this.el.children.item(i);
        characterSpanEl.textContent =
          TextDecodeAnimation.placeholderCharacterArray[randomCharacterIndex];
      }
    }

    this.animateId = requestAnimationFrame(this._animateFrame.bind(this));
  }

  static init() {
    this.instances = [];
    document.querySelectorAll(".text-decode-effect").forEach((el) => {
      const instance = new TextDecodeAnimation(el);
      this.instances.push(instance);
      instance.start();
    });
  }

  static reset() {
    this.instances.forEach((instance) => {
      instance.start();
    });
  }

  static destroy() {
    this.instances.forEach((instance) => {
      instance.stop();
    });
    this.instances = [];
  }
}
