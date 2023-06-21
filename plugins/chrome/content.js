// Function to extract author and status ID from link href
function extractAuthorAndStatusId(href) {
  const parts = href.split("/");
  const author = parts[1];
  const statusId = parts[3];
  return { author, statusId };
}

// Function to get the content of the span inside the tweetText element
function getTweetContent(article) {
  const tweetTextElement = article.querySelector('[data-testid="tweetText"]');
  const tweetText = tweetTextElement?.innerHTML;
  if (tweetText) {
    // Remove classes and aria labels using regular expressions
    const cleanTweetText = tweetText
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    return cleanTweetText;
  } else {
    return "";
  }
}

// Function to get the image URL if available
function getImageUrls(article) {
  const imageElements = article.querySelectorAll('div[aria-label="Image"] img');
  if (imageElements.length > 0) {
    const imageUrlArray = Array.from(imageElements).map((imageElement) => imageElement.src);
    return imageUrlArray;
  }
  return [];
}


// Function to send a message to the background script
function sendMessageToBackgroundScript(message) {
  chrome.runtime.sendMessage(message, (response) => {
    console.log(response);
  });
}

// Create a new Intersection Observer instance
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const article = entry.target;
        const timeElement = article.querySelector("time");

        if (timeElement) {
          const linkElement = timeElement.parentElement;
          const hrefValue = linkElement.getAttribute("href");

          const { author, statusId } = extractAuthorAndStatusId(hrefValue);
          const lastSeen = new Date().toString();
          const content = getTweetContent(article);
          const imageUrls = getImageUrls(article);

          const tweet = {
            author,
            status_id: statusId,
            last_seen: lastSeen,
            content,
            image_urls: imageUrls,
          };

          sendMessageToBackgroundScript({ action: "storeTweet", tweet });
        }
      }
    });
  },
  {
    rootMargin: "0px",
    threshold: 0.5,
  }
);

// Function to observe new elements and apply Intersection Observer
function observeNewElements(elements) {
  elements.forEach((element) => {
    observer.observe(element);
  });
}

// Select all the initial article elements on the page
const articles = document.querySelectorAll("article");

// Observe the initial article elements
observeNewElements(articles);

// Create a new Mutation Observer instance
const mutationObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    const addedElements = mutation.addedNodes;
    observeNewElements(addedElements);
  });
});

// Configure and start the Mutation Observer
mutationObserver.observe(document.body, {
  childList: true,
  subtree: true,
});
