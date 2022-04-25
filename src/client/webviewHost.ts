import {
  WebviewView,
  Event,
  Uri,
  EventEmitter,
  WebviewOptions,
  Disposable,
} from "vscode";

import * as fs from "fs";
import { IWebviewHostOptions, Message } from "./types";

export class WebviewHost {
  protected webviewHost: WebviewView | undefined;

  private _loadFailedEmitter: EventEmitter<void> = new EventEmitter<void>();
  loadFailed: Event<void> = this._loadFailedEmitter.event;
  protected loadPromise: Promise<void>;
  private _onDidChangeVisibility: any;

  constructor(
    protected options: IWebviewHostOptions,
    private disposableRegistry: Disposable[],
    additionalRootPaths: Uri[] = []
  ) {
    const webViewOptions: WebviewOptions = {
      enableScripts: true,
      localResourceRoots: [
        Uri.file(this.options.rootPath),
        Uri.file(this.options.cwd),
        ...additionalRootPaths,
      ],
    };

    this.webviewHost = options.webviewHost;
    this.webviewHost.webview.options = webViewOptions;

    this.loadPromise = this.load();
  }

  public postMessage(message: Message): void {
    this.webviewHost?.webview.postMessage(message);
  }

  isShowing() {
    return !!this.webviewHost?.visible;
  }

  public asWebviewUri(localResource: Uri): Uri {
    if (!this.webviewHost?.webview) {
      throw new Error("WebView not initialized, too early to get a Uri");
    }
    return this.webviewHost.webview.asWebviewUri(localResource);
  }

  public postLoad(webviewHost: WebviewView): void {
    // Reset when the current panel is closed
    this.disposableRegistry.push(
      webviewHost.onDidDispose(() => {
        this.webviewHost = undefined;
        this.options.listener.dispose().catch(() => {});
      })
    );

    this.disposableRegistry.push(
      webviewHost.webview.onDidReceiveMessage((message) => {
        // Pass the message onto our listener
        console.log("xxxxx");
        this.options.listener.onMessage(message.type, message.payload);
      })
    );

    this.disposableRegistry.push(
      webviewHost.onDidChangeVisibility(() => {
        this._onDidChangeVisibility.fire();
      })
    );

    // Fire one inital visibility change once now as we have loaded
    this._onDidChangeVisibility.fire();
  }

  public loadReactHtml(): string {
    if (!this.webviewHost?.webview) {
      throw new Error("WebView not initialized, too early to get a Uri");
    }

    const uriBase = this.webviewHost?.webview
      .asWebviewUri(Uri.file(this.options.cwd))
      .toString();
    const uris = this.options.scripts.map((script: string) =>
      this.asWebviewUri(Uri.file(script))
    );

    const rootPath = this.webviewHost.webview
      .asWebviewUri(Uri.file(this.options.rootPath))
      .toString();

    return `
        <!doctype html>
        <html lang="en">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
                <meta http-equiv="Content-Security-Policy" content="img-src 'self' data: https: http: blob: ${
                  this.webviewHost.webview.cspSource
                }; default-src 'unsafe-inline' 'unsafe-eval' data: https: http: blob: ${
      this.webviewHost.webview.cspSource
    };">
                <meta name="theme-color" content="#000000">
                <title>VS Code Python React UI</title>
                <base href="${uriBase}${uriBase.endsWith("/") ? "" : "/"}"/>
                </head>
            <body>
                <noscript>You need to enable JavaScript to run this app.</noscript>
                <div id="root"></div>
                <script type="text/javascript">
                    // Public path that will be used by webpack.
                    window.__PVSC_Public_Path = "${rootPath}/";
                    function resolvePath(relativePath) {
                        if (relativePath && relativePath[0] == '.' && relativePath[1] != '.') {
                            return "${uriBase}" + relativePath.substring(1);
                        }

                        return "${uriBase}" + relativePath;
                    }
                </script>
                ${uris
                  .map(
                    (uri) =>
                      `<script type="text/javascript" src="${uri}"></script>`
                  )
                  .join("\n")}
            </body>
        </html>`;
  }

  private async load() {
    try {
      if (this.webviewHost?.webview) {
        const localFilesExist = await Promise.all(
          this.options.scripts.map((s) => fs.existsSync(s))
        );
        if (localFilesExist.every((exists) => exists === true)) {
          // Call our special function that sticks this script inside of an html page
          // and translates all of the paths to vscode-resource URIs
          this.webviewHost.webview.html = this.loadReactHtml();

          // Hook up class specific events after load
          this.postLoad(this.webviewHost);
        } else {
          // Indicate that we can't load the file path

          this.webviewHost.webview.html = `${this.options.scripts.join(
            ", "
          )} loaded failed!`;
        }
      }
    } catch (error) {
      // If our web panel failes to load, report that out so whatever
      // is hosting the panel can clean up
      this._loadFailedEmitter.fire();
    }
  }
}
