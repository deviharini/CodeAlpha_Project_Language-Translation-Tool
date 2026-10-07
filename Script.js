async function translateText() {
	const text = document.getElementById("inputText").value.trim();
	const source = document.getElementById("sourceLanguage").value;
	const target = document.getElementById("targetLanguage").value;
	const output = document.getElementById("outputText");
	const status = document.getElementById("status");
	const translateButton = document.querySelector(".container > button");

	if (!text) {
		status.textContent = "Enter some text to translate.";
		document.getElementById("inputText").focus();
		return;
	}

	if (source === target) {
		output.value = text;
		status.textContent = "Source and target languages match.";
		return;
	}

	output.value = "";
	status.textContent = "Translating...";
	translateButton.disabled = true;

	try {
		const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Translation request failed (${response.status}).`);
		}

		const data = await response.json();
		const translatedText = data.responseData?.translatedText;
		if (data.responseStatus !== 200 || typeof translatedText !== "string") {
			throw new Error(data.responseDetails || "The translation service returned an invalid response.");
		}

		output.value = translatedText;
		status.textContent = "Translation completed.";
	} catch (error) {
		status.textContent = "Translation failed. Check your connection and try again.";
		console.error("Translation failed:", error);
	} finally {
		translateButton.disabled = false;
	}
}

function copyText() {
	const output = document.getElementById("outputText");

	if (!output.value.trim()) {
		document.getElementById("status").textContent = "There is no translation to copy.";
		return;
	}

	if (!navigator.clipboard?.writeText) {
		document.getElementById("status").textContent = "Clipboard access is unavailable in this browser context.";
		return;
	}

	navigator.clipboard.writeText(output.value)
		.then(() => {
			document.getElementById("status").textContent = "Translation copied.";
		})
		.catch((error) => {
			console.error(error);
			document.getElementById("status").textContent = "Could not copy. Check clipboard permissions.";
		});
}

function speakText() {
	const text = document.getElementById("outputText").value;
	const target = document.getElementById("targetLanguage").value;

	if (!text.trim()) {
		document.getElementById("status").textContent = "There is no translation to speak.";
		return;
	}

	if (!("speechSynthesis" in window)) {
		document.getElementById("status").textContent = "Speech is unavailable in this browser.";
		return;
	}

	const speech = new SpeechSynthesisUtterance(text);
	speech.lang = target;
	speechSynthesis.speak(speech);
}
