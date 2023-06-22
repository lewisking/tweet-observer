let tweets = [];
let newTweetCount = 0;

// Function to clear stored data
function clearData() {
  tweets = [];
  newTweetCount = 0;
  chrome.storage.local.set({ tweets });
  updateBadge(); // Clear the badge count
}

// Function to update the badge count
function updateBadge() {
  chrome.action.setBadgeText({
    text: newTweetCount > 0 ? newTweetCount.toString() : "",
  });
  chrome.action.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
}

// Function to handle incoming messages
function handleMessage(request, sender, sendResponse) {
  if (request.action === "storeTweet") {
    const { tweet } = request;
    const existingTweetIndex = tweets.findIndex(
      (t) => t.author === tweet.author && t.status_id === tweet.status_id
    );

    if (existingTweetIndex !== -1) {
      const alreadyInteracted = tweets[existingTweetIndex].interacted;
      tweets[existingTweetIndex] = tweet;
      if (alreadyInteracted) {
        console.log("already interacted with tweet");
        tweets[existingTweetIndex].interacted = true;
      }
    } else {
      tweets.push(tweet);
      newTweetCount++; // Increment the new tweet count
    }

    chrome.storage.local.set({ tweets });
    sendResponse(`Tweet stored successfully`);

    // Update the badge count
    updateBadge();
  } else if (request.action === "getTweets") {
    sendResponse({ tweets });
  } else if (request.action === "clearData") {
    clearData();
    sendResponse("Data cleared successfully");
  } else if (request.action === "clearNewTweetCount") {
    newTweetCount = 0;
    updateBadge(); // Clear the badge count
  }
}

// Listen for incoming messages
chrome.runtime.onMessage.addListener(handleMessage);

// Initialize the badge count when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  updateBadge();
});
