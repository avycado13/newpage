import "./style.css";

// const API_KEY = import.meta.env.VITE_NASA_API_KEY;
document.querySelector("#app").innerHTML = "<p>loading...</p>";

// fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&date=${date}`)
fetch("https://www.nasa.gov/feeds/iotd-feed/")
	.then((response) => response.text())
	.then((xmlText) => {
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(xmlText, "text/xml");
		const items = xmlDoc.getElementsByTagName("item");

		if (items.length === 0) {
			console.log("No entries found.");
		}
		const latestItem = items[0];
		const entry = {
			title: latestItem.getElementsByTagName("title")[0]?.textContent,
			link: latestItem.getElementsByTagName("link")[0]?.textContent,
			pubDate: latestItem.getElementsByTagName("pubDate")[0]?.textContent,
			description:
				latestItem.getElementsByTagName("description")[0]?.textContent,
			imageUrl: latestItem
				.getElementsByTagName("enclosure")[0]
				?.getAttribute("url"),
		};
		console.log(entry);
		document.querySelector("#app").innerHTML = `
				<button id="toggle-btn" style="position: fixed; top: 20px; right: 20px; z-index: 1000; padding: 10px 15px; border-radius: 8px; background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.4); backdrop-filter: blur(5px); cursor: pointer;">Hide</button>
        <h1>${entry.title}</h1>
				<h2>${new Date().toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric" })}</h2>
				<p>${entry.description}</p>
    `;
		document.body.style.backgroundImage = `url(${entry.imageUrl})`;
		// <img src="${entry.imageUrl}" />
	});
const toggleBtn = document.getElementById("toggle-btn");
const app = document.getElementById("#app") || document.querySelector("#app");

toggleBtn.addEventListener("click", () => {
	app.classList.toggle("hidden");
});
