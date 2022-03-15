const input = document.getElementById("input");
const save = document.getElementById("save");

save.addEventListener("click", () => {
  chrome.storage.sync.set({ words: input.value });
});

chrome.storage.sync.get("words", ({ words }) => {
  input.value = words;
});
