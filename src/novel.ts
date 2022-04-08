import * as vscode from 'vscode';
import * as fs from 'fs';

const len2Codes = new Set([
  162,
  163,
  167,
  168,
  171,
  172,
  175,
  176,
  177,
  180,
  181,
  182,
  183,
  184,
  187,
  215,
  247
]);

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function realLength(code: number): number {
  if (code >= 0 && code <= 254) {
    if (len2Codes.has(code)) {
      return 2;
    } else {
      return 1;
    }
  } else if (code >= 65377 && code <= 65439) {
    if (code === 65381) {
      return 2;
    } else {
      return 1;
    }
  } else {
    return 2;
  }
}

export function splitString(str: string, len: number): string[] {
  let curLen = 0;
  let curIndex = 0;
  const ret = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    curLen += realLength(code);
    if (curLen > len) {
      ret.push(str.substring(curIndex, i + 1));
      curIndex = i + 1;
      curLen = 0;
    }
  }
  if (curIndex < str.length) {
    ret.push(str.substring(curIndex));
  }
  return ret;
}

export class Novel {
  private filePath: string;
  private charsPerPage: number;
  private currentMsg?: vscode.Disposable;
  private pages: string[] = [];
  private enabled: boolean;

  public get configEnable() {
    return vscode.workspace.getConfiguration('thief-novel').get('enable') as boolean;
  }

  public set configEnable(value: boolean) {
    vscode.workspace.getConfiguration().update('thief-novel.enable', value, true);
  }

  public get configNovelPath() {
    return vscode.workspace.getConfiguration('thief-novel').get('novelPath') as string;
  }

  public set configNovelPath(value: string) {
    vscode.workspace.getConfiguration().update('thief-novel.novelPath', value, true);
  }

  public get configPage() {
    return vscode.workspace.getConfiguration('thief-novel').get('page') as number;
  }

  public set configPage(value: number) {
    vscode.workspace.getConfiguration().update('thief-novel.page', value, true);
  }

  public get configCharsPerPage() {
    return vscode.workspace.getConfiguration('thief-novel').get('charsPerPage') as number;
  }

  public set configCharsPerPage(value: number) {
    vscode.workspace.getConfiguration().update('thief-novel.charsPerPage', value, true);
  }

  public updatePage(page: number) {
    page = clamp(page, 0, this.pages.length - 1);
    this.configPage = page;
    this.updateStatusBar(page);
  }

  public update(force = false) {
    const filePath = this.configNovelPath;
    const charsPerPage = this.configCharsPerPage;
    const updateFilePath = filePath !== this.filePath;
    const updateCharsPerPage = charsPerPage !== this.charsPerPage;
    if (!updateFilePath && !updateCharsPerPage && !force) {
      this.updateStatusBar(this.configPage);
      return;
    }
    let page = this.configPage;
    if (updateFilePath) {
      page = 0;
    } else if (updateCharsPerPage) {
      page = Math.floor(page * this.charsPerPage / charsPerPage);
    }
    this.filePath = filePath;
    this.charsPerPage = charsPerPage;
    try {
      this.pages = [];
      const lines = fs.readFileSync(filePath, 'utf8').split('\n').map(line => splitString(line.trim(), charsPerPage));
      for (const arr of lines) {
        for (const str of arr) {
          this.pages.push(str);
        }
      }
    } catch (e) {
      this.pages = [];
      vscode.window.showErrorMessage("Failed to read file: " + filePath);
      this.resetStatusBar(100);
    }
    this.updatePage(page);
  }

  public previousPage() {
    const page = this.configPage;
    if (page > 0) {
      this.updatePage(page - 1);
    }
  }

  public nextPage() {
    const page = this.configPage;
    if (page < this.pages.length - 1) {
      this.updatePage(page + 1);
    }
  }

  public async jumpPage() {
    const query = await vscode.window.showInputBox({
      placeHolder: 'Page number',
      prompt: `Jump to page (Total: ${this.pages.length}):`,
      value: this.configPage.toString()
    });
    let value = parseInt(query!);
    if (value === NaN) {
      vscode.window.showWarningMessage('Invalid page number');
      return;
    }
    value--;
    if (value < 0 || value >= this.pages.length) {
      vscode.window.showWarningMessage(`Page number out of range [1, ${this.pages.length}]`);
      return;
    }
    if (value !== NaN && value >= 0 && value < this.pages.length) {
      this.updatePage(value);
    }
  }

  public hideNovel() {
    this.configEnable = false;
    this.enabled = false;
    this.resetStatusBar(5000);
  }

  public showNovel() {
    this.configEnable = true;
    this.enabled = true;
    this.update();
  }

  public reloadNovel() {
    this.update(true);
  }

  public updateStatusBar(page: number) {
    if (!this.enabled) {
      return;
    }
    if (page >= 0 && page < this.pages.length) {
      const prev = this.currentMsg;
      this.currentMsg = vscode.window.setStatusBarMessage(`(${page + 1}/${this.pages.length}) ${this.pages[page]}`);
      prev?.dispose();
    }
  }

  public resetStatusBar(timeout: number) {
    const prev = this.currentMsg;
    this.currentMsg = vscode.window.setStatusBarMessage('Waiting for code language server...', timeout);
    prev?.dispose();
  }

  public constructor() {
    this.enabled = this.configEnable;
    this.filePath = this.configNovelPath;
    this.charsPerPage = this.configCharsPerPage;
    this.update(true);
  }
}