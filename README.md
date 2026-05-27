<p align="center">
  <h1 align="center">Ternary Computing · 三进制计算</h1>
  <p align="center">
    从数学基础到 AI 硬件加速 —— 关于三进制数字系统、逻辑电路、<br>
    处理器架构与软件生态的综合性开源项目
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-active-brightgreen" alt="status">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="license">
  <img src="https://img.shields.io/badge/language-中文-orange" alt="language">
</p>

---

## 项目概览

本项目围绕 **三进制计算（Ternary Computing）** 这一主题，提供从理论到实践的完整资源：

| 组成部分           | 说明                                                                 | 文件                                                               |
| ------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 📖 **核心著作**     | 19 章 + 3 附录，约 5000 行，系统阐述三进制计算全部领域               | [`ternary-computing.md`](ternary-computing.md)                     |
| 🐍 **进制转换器**   | 平衡三进制 ↔ 十进制，任意小数精度，循环节自动检测                    | [`balanced_ternary_converter.py`](balanced_ternary_converter.py)   |
| 🔢 **三进制计算器** | `BalancedTernary` 类，支持 Python 原生运算符 (`+`, `-`, `*`, `/` 等) | [`balanced_ternary_calculator.py`](balanced_ternary_calculator.py) |
| 🧩 **VSCode 扩展**  | 右键转换、交互式计算器、状态栏快捷操作                               | [`extension/`](extension/)                                         |

---

## 📖 核心著作：[ternary-computing.md](ternary-computing.md)

> 一部关于三进制数字系统、逻辑电路、硬件架构与软件生态的综合性中文著作。

### 全书结构（19 章 + 3 附录 + 后记）

#### 第一部分：数学与逻辑基础（第 1–4 章）

| 章节                         | 内容概要                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| **第一章：数制基础**         | 位置计数法原理；二进制/三进制/十进制信息密度对比；$\log_2(3) \approx 1.585$ 比特/trit |
| **第二章：平衡三进制**       | $\{T, 0, 1\}$ 数码体系；正负数统一表示（无需符号位）；对称加法/减法规则；舍入零偏差   |
| **第三章：三进制逻辑代数**   | 三值逻辑函数；Kleen 逻辑与 Łukasiewicz 逻辑；多值代数完备性                           |
| **第四章：三进制逻辑门电路** | 三值 NOT / AND (min) / OR (max) / XOR 真值表；T-gate 功能完备性；CMOS 与新兴器件实现  |

#### 第二部分：数字电路（第 5–8 章）

| 章节                     | 内容概要                                                       |
| ------------------------ | -------------------------------------------------------------- |
| **第五章：组合逻辑电路** | 三值编码器/解码器；多路选择器；三进制 ALU 数据通路             |
| **第六章：时序逻辑电路** | 三值锁存器与触发器；三进制计数器；状态机设计                   |
| **第七章：算术运算单元** | 平衡三进制全加器真值表；超前进位；乘法器（Booth 算法三值推广） |
| **第八章：存储系统**     | 三值 SRAM/DRAM 单元；三进制编址方案；存储层次与 cache 设计     |

#### 第三部分：处理器架构（第 9–10 章）

| 章节                       | 内容概要                                                         |
| -------------------------- | ---------------------------------------------------------------- |
| **第九章：处理器架构**     | 三进制数据通路与控制单元；流水线设计；中断与异常处理             |
| **第十章：指令集与微架构** | 三地址指令格式；三进制操作码编码；微程序控制器；Setun 指令集分析 |

#### 第四部分：软件生态（第 11–12 章）

| 章节                         | 内容概要                                                       |
| ---------------------------- | -------------------------------------------------------------- |
| **第十一章：编程语言与软件** | 三进制类型系统；DSSP（Setun 原生语言）；三进制程序的编译与调试 |
| **第十二章：编译器设计**     | 三进制中间表示（IR）；代码生成与优化；寄存器分配（三值图着色） |

#### 第五部分：历史与比较（第 13–14 章）

| 章节                           | 内容概要                                                                      |
| ------------------------------ | ----------------------------------------------------------------------------- |
| **第十三章：三进制计算机历史** | 从 Thomas Fowler (1840)、Setun (1958) 到 Ternac (1973)；Brusentsov 团队的故事 |
| **第十四章：比较分析**         | 三进制 vs 二进制：信息密度 (+37%)、互连线数 (-37%)、电路复杂度权衡            |

#### 第六部分：前沿研究（第 15–19 章）

| 章节                          | 内容概要                                                              |
| ----------------------------- | --------------------------------------------------------------------- |
| **第十五章：多值逻辑与 CMOS** | 多阈值电压；电流模逻辑；CNTFET/忆阻器三值实现                         |
| **第十六章：前沿应用**        | 三进制通信编码；三值密码学；量子三进制（qutrit）                      |
| **第十七章：开放问题**        | 三进制 EDA 工具链；标准单元库；形式验证；学术研究路线图               |
| **第十八章：AI 硬件加速**     | 三值神经网络加速器架构； systolic array 三值化；能效比分析            |
| **第十九章：AI 深度学习**     | BitNet b1.58（1.58-bit LLM）；三值量化（{-1, 0, +1}）；训练与推理算法 |

#### 附录

- **附录 A**：三进制运算参考表（加法、乘法、全加器真值表）
- **附录 B**：术语表（trit、tryte、平衡/非平衡三进制定义）
- **附录 C**：参考资料与延伸阅读（论文、书籍、在线资源）

### 核心理念

> 二进制并非信息表示的唯一或最优方式。数学上，$e \approx 2.718$ 是基数效率的理论最优值，在整数基数中 **3 比 2 更接近 e**，因此三进制在信息密度上天然优于二进制。

平衡三进制使用 $\{-1, 0, +1\}$（记作 $\{T, 0, 1\}$）三个数码：

- 正负数**统一表示**，无需符号位
- 加法和减法规则**天然统一**
- 舍入操作**零偏差对称**

---

## 🐍 Python 工具

### 平衡三进制转换器

```bash
python balanced_ternary_converter.py
```

- 十进制数 → 平衡三进制（精确值，循环节用 `()` 标出）
- 平衡三进制 → 十进制（支持 `()` 循环节输入）
- 基于 `Fraction` 精确有理数运算，零浮点误差
- 支持分数输入（如 `1/3`、`-5/7`）

**示例：**

```
0.5    -> 0.(1)           # 1/3+1/9+... = 1/2
0.25   -> 0.(1T)          # 循环节 1T
0.1    -> 0.(010T)        # 1/10 的精确三进制展开
1/7    -> 0.(0110TT)       # 循环节长 6
3.14   -> 10.(011T1001TT0TT1T00T11)
```

**编程调用：**

```python
from balanced_ternary_converter import (
    decimal_to_balanced_ternary,
    balanced_ternary_to_decimal,
)

bt = decimal_to_balanced_ternary('3.14')   # -> '10.(011T...)'
dec = balanced_ternary_to_decimal('1T0.1T') # -> Decimal('6.222...')
```

### 平衡三进制计算器

```python
from balanced_ternary_calculator import BalancedTernary, BT

a = BT('1T0')     # 6
b = BT(5)         # 5
a + b             # BT('11T')    = 11
a * b             # BT('1010')   = 30
a / b             # BT('1.(1TT1)') = 1.2
BT('1/3') * 3     # BT('1')      = 1（精确！）
```

支持的运算符：`+`, `-`, `*`, `/`, `//`, `%`, `**`, `abs()`, `round()`, 全部比较运算符。

```bash
python balanced_ternary_calculator.py  # 启动交互式 REPL
```

---

## 🧩 VSCode 扩展

在 `extension/` 目录中。

### 功能

| 命令                         | 快捷键         |
| ---------------------------- | -------------- |
| 十进制 → 平衡三进制          | 命令面板       |
| 平衡三进制 → 十进制          | 命令面板       |
| 转换选中内容（自动识别方向） | `Ctrl+Shift+T` |
| 打开交互式计算器             | 命令面板       |

- 右键菜单集成
- 状态栏快捷按钮
- Webview 计算器面板

### 安装

```bash
cd extension
npm install
npm run compile
# 打包为 .vsix
npx @vscode/vsce package
code --install-extension ternary-converter-1.0.0.vsix
```

---

## ⚡ 快速开始

```bash
# 克隆仓库
git clone https://github.com/lbylzk8/ternary.git
cd ternary

# 转换器（交互式）
python balanced_ternary_converter.py

# 计算器（交互式 REPL）
python balanced_ternary_calculator.py

# VSCode 扩展
cd extension && npm install && npm run compile
```

---

## 📁 项目结构

```
ternary/
├── ternary-computing.md              # 核心著作（19章，约5000行）
├── ternary-computing.html            # 著作 HTML 版本（亮色主题）
├── ternary-computing-dark.html       # 著作 HTML 版本（暗色主题）
├── balanced_ternary_converter.py     # 平衡三进制 ↔ 十进制转换器
├── balanced_ternary_calculator.py    # BalancedTernary 类（支持 Python 运算符）
├── images/
│   ├── cover.jpg                     # 封面图
│   └── qrcode.png                    # 赞赏码
├── extension/                        # VSCode 扩展
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── converter.ts              # 核心转换引擎（BigInt 精确运算）
│   │   ├── extension.ts              # 扩展入口
│   │   └── calculatorPanel.ts        # Webview 计算器面板
│   └── out/                          # 编译产物
├── LICENSE                           # MIT 许可证
└── README.md                         # 本文件
```

---

## 📚 推荐阅读路线

1. **快速入门**：阅读 `ternary-computing.md` 第一、二章，理解数制基础和平衡三进制的核心优势
2. **深入理解**：继续第三至八章，掌握三进制逻辑代数与数字电路设计
3. **架构视角**：第九、十章了解处理器与指令集设计
4. **前沿探索**：第十八、十九章关注三进制 AI 硬件加速与三值神经网络的最新进展
5. **动手实践**：使用 `balanced_ternary_converter.py` 和 `balanced_ternary_calculator.py` 进行三进制运算实验

---

## 🤝 贡献

欢迎通过 Issue 和 Pull Request 贡献内容，包括但不限于：

- 修正错误或补充遗漏
- 添加新章节或扩展已有内容
- 改进代码实现或添加新工具
- 翻译为其他语言

---

## ☕ 支持这个项目

这个项目凝聚了我大量的心血和无数个深夜——从查阅文献、推导公式，到一行行编写代码和反复调试。每一章内容、每一个算法、每一行代码，都是我亲手完成。

我目前待业在家，没有稳定收入来源，独自维护这个项目。如果你觉得这个项目对你有帮助，或者你认同在三进制计算这片被低估的领域做开源工作的意义，希望你能请我喝杯奶茶。

你的每一份支持，对我来说都意义非凡——不仅是经济上的帮助，更是对我继续维护和扩展这个项目的莫大鼓励。

<p align="center">
  <img src="images/qrcode.png" alt="赞赏码" width="320">
</p>

<p align="center">
  <strong>无论金额大小，每一份心意我都铭记在心。谢谢你的支持！🙏</strong>
</p>

---

## 📄 许可

本项目采用 [MIT License](LICENSE)。

---

## 🙏 致谢

- **Nikolai Brusentsov** (1925–2014) — Setun 计算机总设计师
- **Thomas Fowler** (1777–1843) — 平衡三进制木制计算器的发明者
- 所有在多值逻辑、三进制计算和新型计算范式领域做出贡献的研究者

> "The best way to predict the future is to understand the alternatives that were already tried."
> — 改编自 Alan Kay
