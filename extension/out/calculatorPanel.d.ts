/**
 * 平衡三进制交互式计算器 —— Webview 面板
 *
 * 通过 postMessage 与扩展主进程通信，主进程负责精确计算。
 */
import * as vscode from 'vscode';
export declare class CalculatorPanel {
    private static currentPanel;
    private readonly _panel;
    private _disposables;
    private constructor();
    static createOrShow(context: vscode.ExtensionContext): void;
    dispose(): void;
    private _handleMessage;
    private _getHtml;
}
