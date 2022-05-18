// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { SimLogData } from "../ui/microSim/types";
import { CACHE_KEY, FileWatcher } from "./FileWatcher";
import MicroSimProvider from "./microsim/MicroSimProvider";
// import MicroSimProvider from './microsim/MicroSimProvider';

let watcher: FileWatcher;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

function getMicroSimConfig() {
  const configuation = vscode.workspace.getConfiguration();
  const units: string[] = configuation.get("microSim.units") || [];
  const logPath = configuation.get("microSim.logPath");
  return {
    units,
    logPath,
  };
}

export function activate(context: vscode.ExtensionContext) {
  const { units, logPath } = getMicroSimConfig();
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

      watcher = new FileWatcher(context);
      vscode.commands.executeCommand("setContext", "mircrosim.show", true);
      provider.getListener((type: string) => {
        if (type === "ready") {
          if (units.length) {
            provider.sendUpdateMessage({
              type: "baseUnits",
              payload: units,
            });
          }
          watcher.watch();
          watcher.onFileChange((data: SimLogData) => {
            if (units.length <= 0) {
              let unitsSet = new Set();
              data.reduce((set, item) => {
                item.excutedTasks.forEach((i) => set.add(i.unit));
                return set;
              }, unitsSet);
              provider.sendUpdateMessage({
                type: "baseUnits",
                payload: Array.from(unitsSet),
              });
            }

            provider.sendUpdateMessage({ type: "fileContent", payload: data });
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
