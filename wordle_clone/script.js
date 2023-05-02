let attempts = 1;

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
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

// console.log(getTodaysWord());
async function main() {
  try {
    const { word: todaysWord } = await getTodaysWord();

    let index = -1;
    let guessed_word = "";
    let word_boxes = [];

    document
      .querySelector(`#attempt-${attempts}`)
      .childNodes.forEach((node, idx) => {
        if (idx % 2 !== 0) {
          word_boxes.push(node);
        }
      });

    document.querySelector("body").addEventListener("keydown", async (e) => {
      if (attempts >= 6) return;

      if (e.key === "Backspace" && index >= 0) {
        guessed_word = guessed_word.slice(0, -1);
        word_boxes[index--].textContent = "";
        return;
      }

      if (e.key === "Enter" && guessed_word.length === 5) {
        // Post to API and check if word is valid
        const { validWord } = await isWordValid(guessed_word);
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
            word_boxes[i].classList.add("bg-green-200");
          else if (todaysWord.includes(guessed_word[i]))
            word_boxes[i].classList.add("bg-yellow-200");
        });

        // Correct guess
        if (todaysWord === guessed_word) {
          alert("You guessed correctly");
        }

        attempts++;
      }

      if (!isLetter(e.key)) return;
      const letter = e.key;

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
