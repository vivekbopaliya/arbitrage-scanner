export class SingularWebsocket {
    private static instance: SingularWebsocket;
    private ws: WebSocket | null = null;
    private callbacks: Record<string, any[]> = {};
    private initialized: boolean = false;
    private bufferedMessages: any[] = [];

    private constructor() {
        this.init();
    }

    static getInstance(): SingularWebsocket {
        if (!this.instance) {
            this.instance = new SingularWebsocket();
        }
        return this.instance;
    }

    private init(): void {
        this.ws = new WebSocket("ws://localhost:3001");

        this.ws.onopen = () => {
            this.initialized = true;
            this.bufferedMessages.forEach((message) => {
                this.ws?.send(JSON.stringify(message));
            });
            this.bufferedMessages = [];
        };

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === "all") {
                // Handle all pairs data
                this.broadcast("difference.all", message.data);
            } else if (message.priceDifference !== undefined) {
                // Handle single pair data
                this.broadcast(`difference.${message.pair}`, message);
            }
        };

        this.ws.onclose = () => {
            console.warn("WebSocket closed. Reconnecting...");
            this.initialized = false;
            setTimeout(() => this.init(), 5000);
        };

        this.ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
    }

    private broadcast(type: string, data: any): void {
        if (this.callbacks[type]) {
            this.callbacks[type].forEach((callback) => callback(data));
        }
    }

    sendMessage(message: any): void {
        if (!this.initialized) {
            this.bufferedMessages.push(message);
        } else {
            this.ws?.send(JSON.stringify(message));
        }
    }

    registerCallback(type: string, callback: any): void {
        this.callbacks[type] = this.callbacks[type] || [];
        this.callbacks[type].push(callback);
    }

    deregisterCallback(type: string, callback: any): void {
        if (this.callbacks[type]) {
            this.callbacks[type] = this.callbacks[type].filter((cb) => cb !== callback);
        }
    }
}