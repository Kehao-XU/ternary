/**
 * 平衡三进制 VSCode 扩展入口
 *
 * 提供命令：
 *   - ternary.convertToTernary      十进制 → 平衡三进制
 *   - ternary.convertToDecimal      平衡三进制 → 十进制
 *   - ternary.convertSelection      转换选中内容（自动识别方向）
 *   - ternary.openCalculator        打开交互式计算器面板
 *
 * 支持右键菜单（选中文本时）和快捷键 Ctrl+Shift+T。
 */

import * as vscode from 'vscode';
import { decimalToBalancedTernary, balancedTernaryToDecimal, isBalancedTernary } from './converter';
import { CalculatorPanel } from './calculatorPanel';

// ---------------------------------------------------------------------------
// 激活
// ---------------------------------------------------------------------------

export function activate(context: vscode.ExtensionContext) {
    console.log('平衡三进制转换器已激活');

    // 命令：十进制 → 平衡三进制
    context.subscriptions.push(
        vscode.commands.registerCommand('ternary.convertToTernary', async () => {
            const value = await vscode.window.showInputBox({
                prompt: '请输入十进制数（支持 3.14, -0.5, 1/3 等格式）',
                placeHolder: '例如：3.14',
                validateInput: (text) => {
                    if (!text.trim()) { return '输入不能为空'; }
                    try {
                        decimalToBalancedTernary(text, 10);
                        return null;
                    } catch (e: any) {
                        return `格式错误：${e.message}`;
                    }
                },
            });
            if (!value) { return; }

            try {
                const result = decimalToBalancedTernary(value);
                showResult(`十进制 ${value}`, `平衡三进制：${result}`);
            } catch (e: any) {
                vscode.window.showErrorMessage(`转换失败：${e.message}`);
            }
        })
    );

    // 命令：平衡三进制 → 十进制
    context.subscriptions.push(
        vscode.commands.registerCommand('ternary.convertToDecimal', async () => {
            const value = await vscode.window.showInputBox({
                prompt: '请输入平衡三进制数（数码 T/0/1，支持循环节如 0.(1T)）',
                placeHolder: '例如：1T0.1T',
                validateInput: (text) => {
                    if (!text.trim()) { return '输入不能为空'; }
                    try {
                        balancedTernaryToDecimal(text);
                        return null;
                    } catch (e: any) {
                        return `格式错误：${e.message}`;
                    }
                },
            });
            if (!value) { return; }

            try {
                const result = balancedTernaryToDecimal(value);
                showResult(`平衡三进制 ${value.toUpperCase()}`, `十进制：${result}`);
            } catch (e: any) {
                vscode.window.showErrorMessage(`转换失败：${e.message}`);
            }
        })
    );

    // 命令：转换选中内容（自动识别方向）
    context.subscriptions.push(
        vscode.commands.registerCommand('ternary.convertSelection', () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) { return; }

            const selection = editor.selection;
            const text = editor.document.getText(selection);
            if (!text.trim()) {
                vscode.window.showWarningMessage('未选中任何文本');
                return;
            }

            try {
                if (isBalancedTernary(text)) {
                    const result = balancedTernaryToDecimal(text);
                    showResult(`平衡三进制 ${text.toUpperCase()}`, `十进制：${result}`);
                } else {
                    const result = decimalToBalancedTernary(text);
                    showResult(`十进制 ${text}`, `平衡三进制：${result}`);
                }
            } catch (e: any) {
                vscode.window.showErrorMessage(`转换失败：${e.message}`);
            }
        })
    );

    // 命令：打开计算器
    context.subscriptions.push(
        vscode.commands.registerCommand('ternary.openCalculator', () => {
            CalculatorPanel.createOrShow(context);
        })
    );

    // 状态栏按钮
    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );
    statusBarItem.command = 'ternary.convertSelection';
    statusBarItem.text = '$(symbol-number) 三进制转换';
    statusBarItem.tooltip = '转换选中的文本（自动识别方向：三进制 ↔ 十进制）';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
}

// ---------------------------------------------------------------------------
// 停用
// ---------------------------------------------------------------------------

export function deactivate() {}

// ---------------------------------------------------------------------------
// 辅助
// ---------------------------------------------------------------------------

/** 以信息提示框展示转换结果，并提供「复制」按钮 */
async function showResult(label: string, result: string) {
    const action = await vscode.window.showInformationMessage(
        `${label}  →  ${result}`,
        { modal: false },
        '复制结果'
    );
    if (action === '复制结果') {
        // 提取结果部分（冒号之后）
        const value = result.includes('：') ? result.split('：')[1] : result;
        await vscode.env.clipboard.writeText(value);
        vscode.window.showInformationMessage('已复制到剪贴板');
    }
}
