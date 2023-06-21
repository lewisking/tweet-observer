document.addEventListener("DOMContentLoaded", () => {
  const tweetsList = document.getElementById("tweets-list");
  const clearDataBtn = document.getElementById("clear-data-btn");

  // Function to render the tweets in the popup
  function renderTweets(tweets) {
    // Sort the tweets by the "Last Seen" date in descending order
    tweets.sort((a, b) => new Date(b.last_seen) - new Date(a.last_seen));

    tweetsList.innerHTML = "";

    if (tweets.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.textContent = "No tweets stored.";
      tweetsList.appendChild(emptyMessage);
    } else {
      tweets.forEach((tweet) => {
        const tweetItem = document.createElement("div");
        tweetItem.classList.add("tweet-item");

        const author = document.createElement("p");
        author.textContent = `Author: ${tweet.author}`;

        const statusId = document.createElement("p");
        statusId.textContent = `Status ID: ${tweet.status_id}`;

        const lastSeen = document.createElement("p");
        lastSeen.textContent = `Last Seen: ${tweet.last_seen}`;

        const content = document.createElement("p");
        content.textContent = `Content: ${tweet.content}`;

        const seenAt = document.createElement("p");
        seenAt.textContent = `URL seen on: ${tweet.seen_at}`;

        tweetItem.appendChild(author);
        tweetItem.appendChild(statusId);
        tweetItem.appendChild(lastSeen);
        tweetItem.appendChild(content);
        tweetItem.appendChild(seenAt);

        if (tweet.image_urls && tweet.image_urls.length > 0) {
          tweet.image_urls.forEach((imageUrl) => {
            const image = document.createElement("img");
            image.src = imageUrl;
            tweetItem.appendChild(image);
          });
        }

        tweetsList.appendChild(tweetItem);
      });
    }
  }

  // Function to clear stored data
  function clearData() {
    chrome.runtime.sendMessage({ action: "clearData" }, () => {
      console.log("Data cleared");
      tweetsList.innerHTML = "";
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
