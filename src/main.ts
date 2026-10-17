import "./style.css";

const FEED_URL = "https://www.nasa.gov/feeds/iotd-feed/";
function getApp(): HTMLElement {
	const element = document.querySelector<HTMLElement>("#app");
	if (!element) throw new Error("Missing #app element");
	return element;
}

const app = getApp();

interface FeedEntry {
	title: string;
	description: string;
	imageUrl: string | null;
}

function parseLatestEntry(xmlText: string): FeedEntry {
	const xml = new DOMParser().parseFromString(xmlText, "text/xml");
	if (xml.querySelector("parsererror")) throw new Error("Invalid NASA feed");

	const item = xml.querySelector("item");
	if (!item) throw new Error("NASA feed has no entries");

	return {
		title: item.querySelector("title")?.textContent?.trim() || "NASA Image of the Day",
		description: item.querySelector("description")?.textContent?.trim() || "",
		imageUrl: item.querySelector("enclosure")?.getAttribute("url") ?? null,
	};
}

function renderEntry(entry: FeedEntry): void {
	const title = document.createElement("h1");
	title.textContent = entry.title;

	const date = document.createElement("h2");
	const updateClock = () => {
		date.textContent = new Date().toLocaleString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
			second: "2-digit",
		});
	};
	updateClock();
	setInterval(updateClock, 1000);

	const description = document.createElement("p");
	description.textContent = entry.description;

	const search = document.createElement("form");
	search.className = "search-form";
	search.role = "search";
	search.action = "https://duckduckgo.com/";
	search.method = "get";
	const input = document.createElement("input");
	input.type = "search";
	input.name = "q";
	input.placeholder = "Search the web";
	input.setAttribute("aria-label", "Search the web");
	const submit = document.createElement("button");
	submit.type = "submit";
	submit.textContent = "Search";
	search.append(input, submit);

	app.replaceChildren(title, date, description, search);
	if (entry.imageUrl) {
		document.body.style.backgroundImage = `url(${JSON.stringify(entry.imageUrl)})`;
	}
}

// Keep the toggle outside #app so it stays accessible while the content is hidden.
const toggle = document.createElement("button");
toggle.id = "toggle-btn";
toggle.type = "button";
toggle.textContent = "Hide";
toggle.setAttribute("aria-controls", "app");
toggle.addEventListener("click", () => {
	const hidden = app.classList.toggle("hidden");
	toggle.textContent = hidden ? "Show" : "Hide";
	toggle.setAttribute("aria-expanded", String(!hidden));
});

toggle.setAttribute("aria-expanded", "true");
app.textContent = "Loading...";

async function loadFeed(): Promise<void> {
	try {
		const response = await fetch(FEED_URL);
		if (!response.ok) throw new Error(`NASA feed returned ${response.status}`);
		renderEntry(parseLatestEntry(await response.text()));
		document.body.append(toggle);
	} catch (error) {
		console.error("Could not load NASA feed:", error);
		app.textContent = "Could not load the NASA image. Please try again later.";
	}
}

void loadFeed();
