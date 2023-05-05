let attempts = 1;
let index = -1;
let guessed_word = "";
let word_boxes = [];

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function hideLoader() {
  document.querySelector("#loader").classList.add("hidden");
}

function showLoader() {
  document.querySelector("#loader").classList.remove("hidden");
}

async function getTodaysWord() {
  const resp = await fetch("https://words.dev-apis.com/word-of-the-day");
  return await resp.json();
}

async function isWordValid(word) {
  const resp = await fetch("https://words.dev-apis.com/validate-word", {
    method: "POST",
    body: JSON.stringify({ word }),
  });
  return await resp.json();
}

function updateWordsBox() {
  if (attempts > 6) return;

  word_boxes.forEach((box) => {
    box.classList.remove("border-blue-900");
  });

  word_boxes = [];

  document
    .querySelector(`#attempt-${attempts}`)
    .childNodes.forEach((node, idx) => {
      if (idx % 2 !== 0) {
        word_boxes.push(node);
      }
    });

  word_boxes.forEach((box) => {
    box.classList.add("border-blue-900");
  });
}

async function main() {
  updateWordsBox();

  try {
    showLoader();
    const { word: todaysWord } = await getTodaysWord();
    hideLoader();

    document.querySelector("body").addEventListener("keydown", async (e) => {
      if (attempts > 6) {
        alert("Refresh the page to try again");
        return;
      }

      if (e.key === "Backspace" && index >= 0) {
        guessed_word = guessed_word.slice(0, -1);
        word_boxes[index--].textContent = "";
        return;
      }

      if (e.key === "Enter" && guessed_word.length === 5) {
        // Post to API and check if word is valid
        showLoader();
        const { validWord } = await isWordValid(guessed_word);
        hideLoader();

        if (!validWord) {
          word_boxes.forEach((box) => {
            box.classList.add("border-red-900");
          });

          setTimeout(() => {
            word_boxes.forEach((box) => {
              box.classList.remove("border-red-900");
            });
          }, 700);

          return;
        }

        // Highlight correct parts of the word
        todaysWord.split("").forEach((l, i) => {
          if (guessed_word[i] === l)
            word_boxes[i].classList.add("bg-green-500");
          else if (todaysWord.includes(guessed_word[i]))
            word_boxes[i].classList.add("bg-yellow-500");
          else {
            word_boxes[i].classList.add("bg-gray-700");
          }
        });

        // Correct guess
        if (todaysWord === guessed_word) {
          alert("You guessed correctly");
        }

        attempts++;

        updateWordsBox();
        index = -1;
        guessed_word = "";
      }

      if (!isLetter(e.key)) return;
      const letter = e.key.toLowerCase();

      if (index < 4) {
        word_boxes[++index].textContent = letter.toUpperCase();
        guessed_word += letter;
      }
    });
  } catch (error) {
    console.error(error);
  }
}

main();
