let tweets = [];

// Function to clear stored data
function clearData() {
  tweets = [];
  chrome.storage.local.set({ tweets });
}

// Function to handle incoming messages
function handleMessage(request, sender, sendResponse) {
  if (request.action === "storeTweet") {
    const { tweet } = request;
    const existingTweetIndex = tweets.findIndex(
      (t) => t.author === tweet.author && t.status_id === tweet.status_id
    );

    if (existingTweetIndex !== -1) {
      tweets[existingTweetIndex].last_seen = tweet.last_seen;
    } else {
      tweets.push(tweet);
    }

    chrome.storage.local.set({ tweets });
    sendResponse(`Tweet stored successfully`);
  } else if (request.action === "getTweets") {
    sendResponse({ tweets });
  } else if (request.action === "clearData") {
    clearData();
    sendResponse("Data cleared successfully");
  }
}

// Listen for incoming messages
chrome.runtime.onMessage.addListener(handleMessage);
