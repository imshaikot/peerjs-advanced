import { util } from "./util";
import logger from "./logger";
import type { PeerJSOption } from "./optionInterfaces";
import { version } from "../package.json";

export class API {
	constructor(private readonly _options: PeerJSOption) {}

	private _buildRequest(method: string): Promise<any> {
		const protocol = this._options.secure ? "https" : "http";
		const { host, port, path, key } = this._options;
		const url = new URL(`${protocol}://${host}:${port}${path}${key}/${method}`);
		// TODO: Why timestamp, why random?
		url.searchParams.set("ts", `${Date.now()}${Math.random()}`);
		url.searchParams.set("version", version);
		return new Promise((res) => {
			chrome.runtime.sendMessage({
				action: "requestPeerId",
				url,
				version,
				referrerPolicy: this._options.referrerPolicy,
				method,
			});
			chrome.runtime.onMessage.addListener((message) => {
				if (message.action === "fetchResponse") {
					res(message.response);
				}
			});
		});
	}

	/** Get a unique ID from the server via XHR and initialize with it. */
	async retrieveId(): Promise<string> {
		const response = await this._buildRequest("id");
		if (response.type === "error") throw new Error(response.error);
		if (response.type === "id") return response.data;
	}

	/** @deprecated */
	async listAllPeers(): Promise<any[]> {
		const response = await this._buildRequest("id");
		if (response.type === "error") throw new Error(response.error);
		if (response.type === "peers") return Promise.resolve(response.data);
	}
}
