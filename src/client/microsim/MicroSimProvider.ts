import path = require("path");
import { EventEmitter } from "vscode";
import {
  CancellationToken,
  ExtensionContext,
  WebviewView,
  WebviewViewProvider,
  WebviewViewResolveContext,
} from "vscode";
import {
  IWebviewHostOptions,
  IWebviewViewMessageListener,
  Message,
} from "../types";
import { WebviewHost } from "../webviewHost";

const folderName = path.basename(__dirname);
const EXTENSION_ROOT_DIR =
  folderName === "client"
    ? path.join(__dirname, "..", "..")
    : path.join(__dirname, "..", "..", "..", "..");

const debuggerUIDir = path.join(EXTENSION_ROOT_DIR, "dist", "ui");

export default class MicroSimProvider
  implements WebviewViewProvider, IWebviewViewMessageListener
{
  public static readonly viewType = "mircosim";

  private onMessageEmmiter = new EventEmitter<{ type: string; payload: any }>();

  private _onMessage = this.onMessageEmmiter.event;

  private webHostView: WebviewHost | undefined;
  listener: any;
  constructor(private ctx: ExtensionContext) {}

  onMessage(message: string, payload: any): void {
    console.log("onMessage:", message, payload);
    if (this.listener) this.listener(message);
    this.onMessageEmmiter.fire({ type: message, payload });
  }

  public isVisible() {
    return !!this.webHostView?.isShowing();
  }

  public getListener(listener: any) {
    this.listener = listener;
    return this._onMessage(listener);
  }

  dispose(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  resolveWebviewView(
    webviewView: WebviewView,
    _context: WebviewViewResolveContext<unknown>,
    _token: CancellationToken
  ): void | Thenable<void> {
    const cwd = this.ctx.extensionPath;
    const webHostOptions: IWebviewHostOptions = {
      listener: this,
      cwd,
      webviewHost: webviewView,
      rootPath: debuggerUIDir,
      scripts: [path.join(debuggerUIDir, "index.js")],
    };

    this.webHostView = new WebviewHost(webHostOptions, this.ctx.subscriptions);
  }

  public sendUpdateMessage(message: any) {
    console.log("send messgae:", this.webHostView);
    this.webHostView?.postMessage({ type: "fileContent", payload: message });
  }
}
