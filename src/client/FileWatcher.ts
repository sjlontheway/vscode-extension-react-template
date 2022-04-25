import path from "path";
import {
  Uri,
  workspace,
  RelativePattern,
  ExtensionContext,
  window,
  EventEmitter,
} from "vscode";

export const CACHE_KEY = "log_path";

export class FileWatcher {
  private lastContent: string = "";

  private onFileChangeEventEmmiter: EventEmitter<[]> = new EventEmitter();

  private onDidFileChange = this.onFileChangeEventEmmiter.event;

  private watchFilePattern: RelativePattern | undefined;
  constructor(private context: ExtensionContext) {}

  private async getLogUri(context: ExtensionContext): Promise<Uri | undefined> {
    const cachePathStr: string | undefined = context.globalState.get(CACHE_KEY);

    let cachePathUri: Uri | undefined = undefined;
    if (!cachePathStr) {
      const pickUri = await window.showOpenDialog({
        canSelectFolders: false,
        canSelectFiles: true,
        canSelectMany: false,
        openLabel: "Select microsim log file",
        defaultUri: context.extensionUri,
      });
      console.log("pickUri:", pickUri?.[0].path, pickUri?.length);

      cachePathUri = pickUri?.[0];
      if (cachePathUri) {
        context.globalState.update(CACHE_KEY, cachePathUri.path);
      }
    } else {
      cachePathUri = Uri.file(cachePathStr);
    }
    return cachePathUri;
  }

  public async loadPath() {
    const logUri: Uri | undefined = await this.getLogUri(this.context);

    console.log("loadPath:", logUri);
    if (!logUri) {
      throw Error("not pick a valid log Path!");
    }

    const logPath = logUri.path;
    const { base, dir } = path.parse(logPath);
    return new RelativePattern(dir, base);
  }

  public async watch() {
    if (!this.watchFilePattern) {
      this.watchFilePattern = await this.loadPath();
    }

    const watcher = workspace.createFileSystemWatcher(this.watchFilePattern);
    this.loadAndNotify();
    this.context.subscriptions.push(
      watcher.onDidChange(() => {
        this.loadAndNotify();
      })
    );
  }

  public dispose() {
    this.onFileChangeEventEmmiter.dispose();
  }

  private async loadAndNotify() {
    if (!this.watchFilePattern) return;
    const content = await getContentFromFilesystem(
      Uri.file(
        path.join(
          Uri.file(this.watchFilePattern.baseUri.path).path,
          this.watchFilePattern.pattern
        )
      )
    );

    if (content) {
      this.parseAndNotify(content);
    }
  }

  private parseAndNotify(newContent: string) {
    if (this.lastContent !== newContent) {
      const data = parseLog(newContent);
      this.onFileChangeEventEmmiter.fire(data);
    }
  }

  public onFileChange(listener: (content: []) => any) {
    this.onDidFileChange(listener);
  }
}

const textDecoder = new TextDecoder("utf-8");

export const getContentFromFilesystem = async (uri: Uri) => {
  try {
    const rawContent = await workspace.fs.readFile(uri);
    return textDecoder.decode(rawContent);
  } catch (e) {
    console.warn(`Error providing content for ${uri.fsPath}`, e);
    return "";
  }
};

const reg =
  /^\[(?<date>\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\.\d{3})\]\s\[(?<unit>[a-zA-Z_\d]+)\]\s\[info\]\s\[(?<cycleIndex>\d+)\](?<description>.*)$/;

function parseLog(content: string): [] {
  const contentLines = content.split("\n");

  const resultMap = new Map();
  for (let line of contentLines) {
    const m = line.match(reg);
    if (m && m.groups) {
      const { unit, cycleIndex, description } = m.groups;
      let item = resultMap.get(cycleIndex) || {
        cycleIndex: Number.parseInt(cycleIndex),
        excutedTasks: [],
      };
      const excutedTask = item.excutedTasks.find(
        (i: { unit: string; description: string }) => i.unit === unit
      );

      if (excutedTask) {
        excutedTask.description += ` ${description}`;
      } else {
        item.excutedTasks.push({
          unit,
          description,
        });
      }
      resultMap.set(cycleIndex, item);
    }
  }
  return Array.from(resultMap.values()) as [];
}
