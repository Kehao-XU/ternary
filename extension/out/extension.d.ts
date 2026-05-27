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
export declare function activate(context: vscode.ExtensionContext): void;
export declare function deactivate(): void;
