const quoteSpan = document.querySelector(".quote-span");
const quoteWrapper = document.querySelector(".quote-wrapper");
const nameSpan = document.querySelector(".name-span");
const loader = document.getElementById("loader");

// Show the loader while fetching data
function startLoading() {
  nameSpan.style.display = "none";
  quoteWrapper.style.display = "none";
  loader.style.display = "block";
  document.body.style.backgroundImage = "";
}

// Hide loader and show content
function stopLoading(name, url, quote) {
  nameSpan.style.display = "inline";
  quoteWrapper.style.display = "block";
  loader.style.display = "none";

  nameSpan.textContent = `${name} - ${getDate()}`;
  document.body.style.backgroundImage = `url(${url})`;
  quoteSpan.textContent = quote;
}

// Function to get the current month and year
function getDate() {
  const date = new Date();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

// Fetch and generate the poetic quote and image
export async function generateTextAndImage(name, favActivity, favPlace, temperature) {
  startLoading();

  try {
    let url = await getImage(favPlace);
    let quote = await getQuote(favActivity, favPlace, temperature);
    stopLoading(name, url, quote);
  } catch (error) {
    console.error("Error generating content:", error);
    stopLoading(name, "", "An error occurred. Please try again.");
  }
}

// Fetch an image from Unsplash
async function getImage(query) {
  try {
    const response = await fetch(
      `https://apis.scrimba.com/unsplash/photos/random/?count=1&query=${query}`
    );

    if (!response.ok) throw new Error(`Image API error: ${response.status}`);
    
    const data = await response.json();
    console.log("Image API Response:", data);

    return data.length > 0 ? data[0].urls.full : "default-image.jpg"; // Fallback image
  } catch (error) {
    console.error("Image fetch error:", error);
    return "default-image.jpg"; // Fallback image
  }
}

// Fetch a poetic quote from OpenAI
async function getQuote(favActivity, favPlace, temperature) {
  let quotePrompt = `Create a poetic phrase about ${favActivity} and ${favPlace} in the insightful, witty, and satirical style of Oscar Wilde. Omit Oscar Wilde's name.`;

  try {
    let response = await fetch("https://apis.scrimba.com/openai/v1/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: quotePrompt,
        temperature: temperature,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    let jsonResponse = await response.json();
    console.log("Quote API Response:", jsonResponse);

    if (jsonResponse.choices && jsonResponse.choices.length > 0) {
      return jsonResponse.choices[0].text.trim();
    } else {
      throw new Error("Invalid quote response.");
    }
  } catch (error) {
    console.error("Quote fetch error:", error);
    return "Life is an unscripted poem, written in the ink of experience."; // Fallback quote
  }
}
