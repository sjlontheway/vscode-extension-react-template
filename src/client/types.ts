import {
    Uri,
    WebviewPanel,
    WebviewView,
    Event,
    ViewColumn,
    Disposable,
} from 'vscode';

export interface IDisposable {
    dispose(): void | undefined;
}
export interface IAsyncDisposable {
    dispose(): Promise<void>;
}

export type Resource = Uri | undefined;

export interface IWebviewMessageListener {
    /**
     * Listens to webview messages
     * @param message: the message being sent
     * @param payload: extra data that came with the message
     */
    onMessage(message: string, payload: any): void;
}

export type Message = {
    type: string;
    payload?: any;
};

export interface IWebviewHost {
    readonly loadFailed: Event<void>;
    /**
     *  post message to html
     * @param message
     */
    postMessage(message: Message): void;

    /**
     *
     * @param localResource
     * webview.html = `<img src="${webview.asWebviewUri(vscode.Uri.file('/Users/codey/workspace/cat.gif'))}">`
     */
    asWebviewUri(localResource: Uri): Uri;
}

export interface IWebviewViewMessageListener
    extends IWebviewMessageListener,
        IAsyncDisposable {}

export interface IWebviewHostOptions {
    listener: IWebviewViewMessageListener;
    cwd: string;
    rootPath: string;
    scripts: string[];
    webviewHost: WebviewView ;
}