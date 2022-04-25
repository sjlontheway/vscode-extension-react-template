// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { CACHE_KEY, FileWatcher } from "./FileWatcher";
import MicroSimProvider from "./microsim/MicroSimProvider";
// import MicroSimProvider from './microsim/MicroSimProvider';

let watcher: FileWatcher;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const provider = new MicroSimProvider(context);

  let disposable = vscode.commands.registerCommand(
    "vscode-microsim.showMicroSim",
    async () => {
      if (provider.isVisible()) {
        return;
      }
      context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
          MicroSimProvider.viewType,
          provider
        )
      );
      let isFirst = true;

      watcher = new FileWatcher(context);
      vscode.commands.executeCommand("setContext", "mircrosim.show", true);
      provider.getListener((type: string) => {
        if (type === "ready") {
          watcher.watch();
          watcher.onFileChange((e) => {
            if (isFirst) {
              isFirst = false;
            }
            provider.sendUpdateMessage(e);
          });
        }
      });
    }
  );

  context.subscriptions.push(disposable);

  context.subscriptions.push(
    vscode.commands.registerCommand("vscode-microsim.resetMicrosimpath", () => {
      context.globalState.update(CACHE_KEY, undefined);
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {
  vscode.commands.executeCommand("setContext", "mircrosim.show", false);
}
