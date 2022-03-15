// Taken from google api docs
const initStorageCache = getAllStorageSyncData().then((items) => {
  processInput(items.words);
});

chrome.action.onClicked.addListener(async (tab) => {
  try {
    await initStorageCache;
  } catch (e) {
    console.log(e);
  }
});

function getAllStorageSyncData() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(null, (items) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(items);
    });
  });
}
// --------------

chrome.alarms.create("10m", {
  periodInMinutes: 10,
});

chrome.storage.onChanged.addListener((changes) =>
  processInput(changes.words.newValue)
);

//Clear every 10m for last hour
chrome.alarms.onAlarm.addListener(() => {
  makeTheJobDone();
});

let theWords = [];

function processInput(input) {
  const words = input.split(",");
  const trimmedWords = words.map((word) => word.trim());
  theWords = trimmedWords;
  // Clear last hour
  makeTheJobDone();
}

function makeTheJobDone() {
  const now = new Date();
  const hourEarly = new Date(now);
  hourEarly.setHours(now.getHours() - 1);

  // Get all urls since last hour
  chrome.history.search(
    {
      text: "",
      maxResults: 10000,
      startTime: hourEarly.valueOf(),
    },
    (data) => {
      // Get all urls met the condition
      const toBeDeleted = data.filter(
        (historyItem) =>
          theWords.some((word) => historyItem.title.includes(word)) // Condition
      );

      // Delete all urls met the condition
      toBeDeleted.forEach((historyItem) => {
        chrome.history.deleteUrl({ url: historyItem.url }, (cb) => {});
      });
      console.log(`${toBeDeleted.length} deletion`);
    }
  );
}
