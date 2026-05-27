/**
 * 平衡三进制 ↔ 十进制 转换核心
 *
 * 使用 BigInt 分数实现精确有理数运算，支持：
 *   - 十进制字符串 → 平衡三进制（自动检测循环节）
 *   - 平衡三进制字符串（含循环节标记）→ 十进制字符串
 */
/**
 * 将十进制数字字符串转换为平衡三进制。
 * @param value 十进制字符串，支持 "42", "3.14", "-0.5", "1/3" 等格式
 * @param maxDigits 最大探测小数位数（默认 2000）
 * @returns 平衡三进制字符串，循环节用 () 标出
 */
export declare function decimalToBalancedTernary(value: string, maxDigits?: number): string;
/**
 * 将平衡三进制字符串转换为十进制数字字符串。
 * 支持循环节标记，如 "0.(1T)" 表示 0.1T1T1T...
 * @param s 平衡三进制字符串
 * @returns 十进制字符串
 */
export declare function balancedTernaryToDecimal(s: string): string;
/** 检测字符串是否为平衡三进制（包含 T 或只由 T01.- 组成） */
export declare function isBalancedTernary(s: string): boolean;
