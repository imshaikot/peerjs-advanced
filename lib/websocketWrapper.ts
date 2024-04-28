export class WebSocketWrapper {
	
    readyState = 0;
    onmessage: (e: { data: string }) => void;
    onopen: (e: unknown) => void;
    onclose: (e: unknown) => void;

	constructor(wsUrl: string) {

		chrome.runtime.sendMessage({
			action: "requestWebSocket",
			wsUrl,
		});

		chrome.runtime.onMessage.addListener((message) => {
			switch (message.action) {
				case "onmessage":
					if (this.onmessage) this.onmessage({ data: message.event })
					break;
				case "onclose":
					if (this.onclose) this.onclose({})
					break;
				case "onopen":
					if (this.onopen) this.onopen({})
					break;
				case "readyState":
					this.readyState = message.readyState;
					break;
			}
		});
	}

	send(message: string) {
		chrome.runtime.sendMessage({
			action: "send-socket-message",
			message,
		});
	}

	close() {
		chrome.runtime.sendMessage({
			action: "close-socket-connection",
		});
	}
}
