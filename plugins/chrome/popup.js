document.addEventListener("DOMContentLoaded", () => {
  const tweetsList = document.getElementById("tweets-list");
  const clearDataBtn = document.getElementById("clear-data-btn");

  function createEmptyState() {
    tweetsList.innerHTML = "";
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "No tweets stored.";
    tweetsList.appendChild(emptyMessage);
  }

  // Function to render the tweets in the popup
  function renderTweets(tweets) {
    // Sort the tweets by the "Last Seen" date in descending order
    tweets.sort((a, b) => new Date(b.last_seen) - new Date(a.last_seen));

    if (tweets.length === 0) {
      createEmptyState();
    } else {
      tweets.forEach((tweet) => {
        const tweetItem = document.createElement("div");
        tweetItem.classList.add("tweet-item");

        const author = document.createElement("p");
        author.innerHTML = `<strong>Author:</strong> ${tweet.author}`;

        const statusId = document.createElement("p");
        statusId.innerHTML = `<strong>Status ID:</strong> ${tweet.status_id}`;

        const interacted = document.createElement("p");
        interacted.innerHTML = `<strong>Interacted:</strong> ${tweet.interacted}`;

        const lastSeen = document.createElement("p");
        lastSeen.innerHTML = `<strong>Last Seen:</strong> ${tweet.last_seen}`;

        const content = document.createElement("p");
        content.innerHTML = `<strong>Content:</strong> ${tweet.content}`;

        const lastSeenAt = document.createElement("p");
        lastSeenAt.innerHTML = `<strong>URL last seen on:</strong> ${tweet.last_seen_on}`;

        tweetItem.appendChild(author);
        tweetItem.appendChild(interacted);
        tweetItem.appendChild(statusId);
        tweetItem.appendChild(lastSeen);
        tweetItem.appendChild(content);
        tweetItem.appendChild(lastSeenAt);

        if (tweet.image_urls && tweet.image_urls.length > 0) {
          tweet.image_urls.forEach((imageUrl) => {
            const image = document.createElement("img");
            image.src = imageUrl;
            tweetItem.appendChild(image);
          });
        }

        if (tweet.video_poster) {
          const poster = document.createElement("img");
          poster.src = tweet.video_poster;
          tweetItem.appendChild(poster);
        }

        if (tweet.external_link) {
          const externalLink = document.createElement("p");
          externalLink.innerHTML = `<strong>External link:</strong> ${tweet.external_link}`;
          tweetItem.append(externalLink);
        }

        tweetsList.appendChild(tweetItem);
      });
    }
    chrome.runtime.sendMessage({ action: "clearNewTweetCount" }); // Clear the new tweet count
  }

  // Function to clear stored data
  function clearData() {
    chrome.runtime.sendMessage({ action: "clearData" }, () => {
      console.log("Data cleared");
      createEmptyState();
    });
  }

  // Add click event listener to the clear data button
  clearDataBtn.addEventListener("click", clearData);

  // Request tweets data from the background script
  chrome.runtime.sendMessage({ action: "getTweets" }, (response) => {
    const tweets = response.tweets || [];
    renderTweets(tweets);
  });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "updateBadge") {
    const newTweetCount = message.newTweetCount;
    chrome.action.setBadgeText({
      text: newTweetCount > 0 ? newTweetCount.toString() : "",
    });
    chrome.action.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
  }
});
