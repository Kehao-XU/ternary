"use strict";
/**
 * 平衡三进制交互式计算器 —— Webview 面板
 *
 * 通过 postMessage 与扩展主进程通信，主进程负责精确计算。
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculatorPanel = void 0;
const vscode = __importStar(require("vscode"));
const converter_1 = require("./converter");
class CalculatorPanel {
    constructor(panel) {
        this._disposables = [];
        this._panel = panel;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.html = this._getHtml();
        this._panel.webview.onDidReceiveMessage(this._handleMessage.bind(this), null, this._disposables);
    }
    static createOrShow(context) {
        const column = vscode.ViewColumn.Two;
        if (CalculatorPanel.currentPanel) {
            CalculatorPanel.currentPanel._panel.reveal(column);
            return;
        }
        const panel = vscode.window.createWebviewPanel('ternaryCalculator', '平衡三进制计算器', column, {
            enableScripts: true,
            retainContextWhenHidden: true,
        });
        CalculatorPanel.currentPanel = new CalculatorPanel(panel);
    }
    dispose() {
        CalculatorPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            this._disposables.pop().dispose();
        }
    }
    // ------------------------------------------------------------------
    // 消息处理
    // ------------------------------------------------------------------
    _handleMessage(msg) {
        try {
            let result;
            switch (msg.type) {
                case 'toTernary':
                    result = (0, converter_1.decimalToBalancedTernary)(msg.value);
                    break;
                case 'toDecimal':
                    result = (0, converter_1.balancedTernaryToDecimal)(msg.value);
                    break;
                default:
                    return;
            }
            this._panel.webview.postMessage({ id: msg.id, result });
        }
        catch (e) {
            this._panel.webview.postMessage({ id: msg.id, error: e.message });
        }
    }
    // ------------------------------------------------------------------
    // HTML 页面
    // ------------------------------------------------------------------
    _getHtml() {
        return /* html */ `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>平衡三进制计算器</title>
<style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
        font-family: var(--vscode-editor-font-family, 'Consolas', monospace);
        font-size: var(--vscode-editor-font-size, 14px);
        color: var(--vscode-editor-foreground);
        background: var(--vscode-editor-background);
        padding: 16px;
    }
    h2 {
        font-size: 16px;
        margin-bottom: 12px;
        color: var(--vscode-foreground);
    }
    .display {
        background: var(--vscode-input-background);
        border: 1px solid var(--vscode-input-border);
        border-radius: 4px;
        padding: 12px;
        margin-bottom: 12px;
    }
    .display .ternary {
        font-size: 20px;
        font-weight: bold;
        word-break: break-all;
        min-height: 28px;
    }
    .display .decimal {
        font-size: 13px;
        color: var(--vscode-descriptionForeground);
        margin-top: 4px;
        word-break: break-all;
        min-height: 18px;
    }
    .row {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
    }
    input {
        flex: 1;
        font-family: inherit;
        font-size: 14px;
        padding: 8px 10px;
        background: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        border: 1px solid var(--vscode-input-border);
        border-radius: 4px;
        outline: none;
    }
    input:focus {
        border-color: var(--vscode-focusBorder);
    }
    button {
        font-family: inherit;
        font-size: 13px;
        padding: 8px 14px;
        background: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        white-space: nowrap;
    }
    button:hover {
        background: var(--vscode-button-hoverBackground);
    }
    button.secondary {
        background: var(--vscode-button-secondaryBackground);
        color: var(--vscode-button-secondaryForeground);
    }
    button.secondary:hover {
        background: var(--vscode-button-secondaryHoverBackground);
    }
    .btn-row {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
        margin-bottom: 12px;
    }
    .btn-row button {
        padding: 10px 0;
        font-size: 16px;
    }
    .history {
        border-top: 1px solid var(--vscode-input-border);
        padding-top: 12px;
        margin-top: 12px;
        max-height: 200px;
        overflow-y: auto;
    }
    .history .entry {
        padding: 4px 0;
        font-size: 13px;
        border-bottom: 1px solid var(--vscode-tree-tableLinesBorder, transparent);
        cursor: pointer;
    }
    .history .entry:hover {
        background: var(--vscode-list-hoverBackground);
    }
    .history .entry .bt { font-weight: bold; }
    .history .entry .dec { color: var(--vscode-descriptionForeground); margin-left: 8px; }
    .error {
        color: var(--vscode-errorForeground);
        font-size: 13px;
        margin-top: 4px;
    }
</style>
</head>
<body>

<h2>平衡三进制计算器</h2>

<div class="display">
    <div class="ternary" id="displayTernary">0</div>
    <div class="decimal" id="displayDecimal">0</div>
    <div class="error" id="displayError"></div>
</div>

<div class="row">
    <input type="text" id="inputField" placeholder="输入十进制或三进制数（T/0/1）…"
           autofocus>
    <button id="btnToTernary">→ 三进制</button>
    <button id="btnToDecimal" class="secondary">→ 十进制</button>
</div>

<div class="btn-row">
    <button class="secondary" data-op="+">+</button>
    <button class="secondary" data-op="-">−</button>
    <button class="secondary" data-op="*">×</button>
    <button class="secondary" data-op="/">÷</button>
    <button class="secondary" data-op="**">^</button>
    <button class="secondary" data-op="neg">±</button>
    <button class="secondary" data-op="abs">|x|</button>
    <button class="secondary" data-op="clr">C</button>
</div>

<div class="history" id="history"></div>

<script>
const vscode = acquireVsCodeApi();

// ---- DOM ----
const inputField = document.getElementById('inputField');
const displayTernary = document.getElementById('displayTernary');
const displayDecimal = document.getElementById('displayDecimal');
const displayError = document.getElementById('displayError');
const historyDiv = document.getElementById('history');
const btnToTernary = document.getElementById('btnToTernary');
const btnToDecimal = document.getElementById('btnToDecimal');

// ---- 状态 ----
let pendingId = 0;
const callbacks = new Map();

let currentValue = '';       // 当前显示的十进制值
let operand = '';           // 待运算的操作数（十进制）
let pendingOp = '';         // 待执行的运算符

// ---- 发送消息 ----
function sendMessage(type, value) {
    const id = String(++pendingId);
    return new Promise((resolve, reject) => {
        callbacks.set(id, { resolve, reject });
        vscode.postMessage({ id, type, value });
    });
}

window.addEventListener('message', (e) => {
    const { id, result, error } = e.data;
    const cb = callbacks.get(id);
    if (!cb) return;
    callbacks.delete(id);
    if (error) {
        cb.reject(new Error(error));
    } else {
        cb.resolve(result);
    }
});

// ---- 显示 ----
function updateDisplay(ternary, decimal) {
    displayTernary.textContent = ternary || '0';
    displayDecimal.textContent = decimal || '0';
    displayError.textContent = '';
    currentValue = decimal;
}

function showError(msg) {
    displayError.textContent = msg;
}

// ---- 转换 ----
async function convertToTernary(value) {
    const result = await sendMessage('toTernary', value);
    updateDisplay(result, value);
    addHistory(value, result);
}

async function convertToDecimal(value) {
    const result = await sendMessage('toDecimal', value);
    updateDisplay(value.toUpperCase(), result);
    addHistory(result, value.toUpperCase());
}

// ---- 历史记录 ----
const MAX_HISTORY = 20;

function addHistory(decimal, ternary) {
    const entry = document.createElement('div');
    entry.className = 'entry';
    entry.innerHTML = '<span class="bt">' + ternary + '</span>' +
                      '<span class="dec">= ' + decimal + '</span>';
    entry.addEventListener('click', () => {
        inputField.value = ternary;
        convertToDecimal(ternary);
    });
    historyDiv.insertBefore(entry, historyDiv.firstChild);

    // 限制历史记录数
    while (historyDiv.children.length > MAX_HISTORY) {
        historyDiv.lastChild?.remove();
    }
}

// ---- 事件 ----
btnToTernary.addEventListener('click', async () => {
    const value = inputField.value.trim();
    if (!value) return;
    try {
        await convertToTernary(value);
        inputField.value = '';
    } catch (e) {
        showError(e.message);
    }
});

btnToDecimal.addEventListener('click', async () => {
    const value = inputField.value.trim();
    if (!value) return;
    try {
        await convertToDecimal(value);
        inputField.value = '';
    } catch (e) {
        showError(e.message);
    }
});

inputField.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        const value = inputField.value.trim();
        if (!value) return;
        try {
            // 自动检测：含 T 则按三进制解析，否则按十进制
            if (value.toUpperCase().includes('T')) {
                await convertToDecimal(value);
            } else {
                await convertToTernary(value);
            }
            inputField.value = '';
        } catch (err) {
            showError(err.message);
        }
    }
});

// ---- 运算符按钮 ----
document.querySelectorAll('[data-op]').forEach(btn => {
    btn.addEventListener('click', async () => {
        const op = btn.dataset.op;
        const input = inputField.value.trim();

        try {
            if (op === 'clr') {
                currentValue = '0';
                operand = '';
                pendingOp = '';
                updateDisplay('0', '0');
                inputField.value = '';
                return;
            }

            if (op === 'neg') {
                if (currentValue) {
                    const val = currentValue.startsWith('-')
                        ? currentValue.slice(1) : '-' + currentValue;
                    const result = await sendMessage('toTernary', val);
                    updateDisplay(result, val);
                    addHistory(val, result);
                }
                return;
            }

            if (op === 'abs') {
                if (currentValue) {
                    const val = currentValue.startsWith('-')
                        ? currentValue.slice(1) : currentValue;
                    const result = await sendMessage('toTernary', val);
                    updateDisplay(result, val);
                    addHistory(val, result);
                }
                return;
            }

            // 二元运算符
            if (!input && op === '-' && !currentValue) {
                // 允许输入负数
                inputField.value = '-';
                return;
            }

            const operandValue = input || currentValue || '0';

            if (pendingOp && operand) {
                // 链式计算
                const expr = operand + pendingOp + operandValue;
                // 用 JS eval 计算（两边都是十进制字符串）
                const fn = new Function('return (' + expr + ')');
                const val = String(fn());
                const result = await sendMessage('toTernary', val);
                updateDisplay(result, val);
                addHistory(val, result);
                operand = val;
            } else {
                operand = operandValue;
            }

            pendingOp = op === '**' ? '**' : op;
            inputField.value = '';
            inputField.placeholder = operand + ' ' + getOpSymbol(pendingOp) + ' ...';
        } catch (e) {
            showError(e.message);
        }
    });
});

function getOpSymbol(op) {
    const map = { '+': '+', '-': '−', '*': '×', '/': '÷', '**': '^' };
    return map[op] || op;
}
</script>
</body>
</html>`;
    }
}
exports.CalculatorPanel = CalculatorPanel;
//# sourceMappingURL=calculatorPanel.js.map