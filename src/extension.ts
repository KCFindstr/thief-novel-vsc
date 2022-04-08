import * as vscode from 'vscode';
import { Novel } from './novel';

let novel: Novel;

export function activate(context: vscode.ExtensionContext) {
  novel = new Novel();
  const hideNovel = vscode.commands.registerCommand('thief-novel.hideNovel', () => {
    novel.hideNovel();
  });
  const showNovel = vscode.commands.registerCommand('thief-novel.showNovel', () => {
    novel.showNovel();
  });
  const reloadNovel = vscode.commands.registerCommand('thief-novel.reloadNovel', () => {
    novel.reloadNovel();
  });
  const prevPage = vscode.commands.registerCommand('thief-novel.prevPage', () => {
    novel.previousPage();
  });
  const nextPage = vscode.commands.registerCommand('thief-novel.nextPage', () => {
    novel.nextPage();
  });
  const jumpPage = vscode.commands.registerCommand('thief-novel.jumpPage', () => {
    novel.jumpPage();
  });

  context.subscriptions.push(hideNovel);
  context.subscriptions.push(showNovel);
  context.subscriptions.push(reloadNovel);
  context.subscriptions.push(prevPage);
  context.subscriptions.push(nextPage);
  context.subscriptions.push(jumpPage);
}

export function deactivate() {
  novel?.resetStatusBar(100);
}
