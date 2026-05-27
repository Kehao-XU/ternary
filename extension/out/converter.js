"use strict";
/**
 * 平衡三进制 ↔ 十进制 转换核心
 *
 * 使用 BigInt 分数实现精确有理数运算，支持：
 *   - 十进制字符串 → 平衡三进制（自动检测循环节）
 *   - 平衡三进制字符串（含循环节标记）→ 十进制字符串
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.decimalToBalancedTernary = decimalToBalancedTernary;
exports.balancedTernaryToDecimal = balancedTernaryToDecimal;
exports.isBalancedTernary = isBalancedTernary;
// ===========================================================================
// BigInt 精确分数
// ===========================================================================
function gcd(a, b) {
    a = a < 0n ? -a : a;
    while (b !== 0n) {
        [a, b] = [b, a % b];
    }
    return a;
}
class BigFraction {
    constructor(num, den) {
        if (den === 0n) {
            throw new Error('分母为零');
        }
        if (den < 0n) {
            num = -num;
            den = -den;
        }
        const g = gcd(num < 0n ? -num : num, den);
        this.num = num / g;
        this.den = den / g;
    }
    // ---- 算术 ----
    add(other) {
        return new BigFraction(this.num * other.den + other.num * this.den, this.den * other.den);
    }
    sub(other) {
        return new BigFraction(this.num * other.den - other.num * this.den, this.den * other.den);
    }
    mul(other) {
        return new BigFraction(this.num * other.num, this.den * other.den);
    }
    div(other) {
        if (other.num === 0n) {
            throw new Error('除以零');
        }
        return new BigFraction(this.num * other.den, this.den * other.num);
    }
    neg() {
        return new BigFraction(-this.num, this.den);
    }
    abs() {
        return new BigFraction(this.num < 0n ? -this.num : this.num, this.den);
    }
    // ---- 比较 ----
    eq(other) {
        return this.num === other.num && this.den === other.den;
    }
    lt(other) {
        return this.num * other.den < other.num * this.den;
    }
    gt(other) {
        return this.num * other.den > other.num * this.den;
    }
    lte(other) {
        return this.num * other.den <= other.num * this.den;
    }
    gte(other) {
        return this.num * other.den >= other.num * this.den;
    }
    isZero() {
        return this.num === 0n;
    }
    // ---- 转换 ----
    /** 整数部分（向零截断，同 int() 行为） */
    intPart() {
        return this.num / this.den;
    }
    /** 小数部分：this - intPart()，∈ [0, 1) 当 this >= 0 */
    fracPart() {
        const i = this.intPart();
        return new BigFraction(this.num - i * this.den, this.den);
    }
    /** 精确等于整数？ */
    isInteger() {
        return this.den === 1n;
    }
    toString() {
        return this.den === 1n ? `${this.num}` : `${this.num}/${this.den}`;
    }
    /** 用作 Map 的键 */
    toKey() {
        return `${this.num}/${this.den}`;
    }
}
// 常用常量
const ZERO = new BigFraction(0n, 1n);
const ONE = new BigFraction(1n, 1n);
const HALF = new BigFraction(1n, 2n);
const THREE = new BigFraction(3n, 1n);
// ===========================================================================
// 解析：字符串 → BigFraction
// ===========================================================================
function parseToFraction(s) {
    s = s.trim();
    if (s === '') {
        throw new Error('输入为空');
    }
    // 分数形式 "a/b"
    if (s.includes('/')) {
        const parts = s.split('/');
        if (parts.length !== 2) {
            throw new Error(`无效的分数：${s}`);
        }
        return new BigFraction(BigInt(parts[0].trim()), BigInt(parts[1].trim()));
    }
    // 小数形式 "a.b" 或整数
    if (s.includes('.')) {
        const [intPart, fracPart] = s.split('.');
        const sign = s.startsWith('-') ? -1n : 1n;
        const intStr = intPart.replace(/^-/, '') || '0';
        const den = 10n ** BigInt(fracPart.length);
        const num = BigInt(intStr + fracPart) * sign;
        return new BigFraction(num, den);
    }
    // 整数
    return new BigFraction(BigInt(s), 1n);
}
// ===========================================================================
// 十进制 → 平衡三进制
// ===========================================================================
/**
 * 将十进制数字字符串转换为平衡三进制。
 * @param value 十进制字符串，支持 "42", "3.14", "-0.5", "1/3" 等格式
 * @param maxDigits 最大探测小数位数（默认 2000）
 * @returns 平衡三进制字符串，循环节用 () 标出
 */
function decimalToBalancedTernary(value, maxDigits = 2000) {
    if (maxDigits <= 0) {
        throw new Error('maxDigits 必须为正整数');
    }
    let f = parseToFraction(value);
    if (f.isZero()) {
        return '0';
    }
    const sign = f.num < 0n ? -1 : 1;
    if (sign < 0) {
        f = f.neg();
    }
    // 拆分整数与小数，再将小数调整到 [-1/2, 1/2]
    let intPart = f.intPart();
    let fracPart = f.sub(new BigFraction(intPart, 1n));
    if (fracPart.gt(HALF)) {
        intPart += 1n;
        fracPart = fracPart.sub(ONE);
    }
    const intStr = integerToBT(intPart);
    const fracStr = fractionToBT(fracPart, maxDigits);
    let result = intStr;
    if (fracStr) {
        result += '.' + fracStr;
    }
    if (sign < 0) {
        result = negateBT(result);
    }
    return result;
}
/** 非负整数 → 平衡三进制 */
function integerToBT(n) {
    if (n === 0n) {
        return '0';
    }
    const digits = [];
    while (n > 0n) {
        const rem = Number(n % 3n);
        if (rem === 2) {
            digits.push('T');
            n += 1n;
        }
        else {
            digits.push(String(rem));
        }
        n /= 3n;
    }
    return digits.reverse().join('');
}
/** Fraction ∈ [-1/2, 1/2] → 平衡三进制小数（自动检测循环节） */
function fractionToBT(f, maxDigits) {
    if (f.isZero()) {
        return '';
    }
    const seen = new Map(); // remainder key → 位置
    const digits = [];
    while (digits.length < maxDigits) {
        const key = f.toKey();
        if (seen.has(key)) {
            const start = seen.get(key);
            const prefix = digits.slice(0, start).join('');
            const cycle = digits.slice(start).join('');
            return `${prefix}(${cycle})`;
        }
        seen.set(key, digits.length);
        f = f.mul(THREE); // f ∈ [-3/2, 3/2]
        let d;
        if (f.lte(HALF.neg())) {
            d = -1;
        }
        else if (f.lt(HALF)) {
            d = 0;
        }
        else {
            d = 1;
        }
        digits.push(d === -1 ? 'T' : String(d));
        f = f.sub(new BigFraction(BigInt(d), 1n));
        if (f.isZero()) {
            break;
        }
    }
    const result = digits.join('');
    if (!f.isZero()) {
        return result + '...';
    }
    // 去掉末尾零
    return result.replace(/0+$/, '');
}
/** 平衡三进制取反：T ↔ 1 */
function negateBT(s) {
    let result = '';
    for (const ch of s) {
        if (ch === 'T') {
            result += '1';
        }
        else if (ch === '1') {
            result += 'T';
        }
        else if (ch === '0') {
            result += '0';
        }
        else {
            result += ch;
        } // '.', '(', ')' 等保持原样
    }
    return result;
}
// ===========================================================================
// 平衡三进制 → 十进制
// ===========================================================================
/**
 * 将平衡三进制字符串转换为十进制数字字符串。
 * 支持循环节标记，如 "0.(1T)" 表示 0.1T1T1T...
 * @param s 平衡三进制字符串
 * @returns 十进制字符串
 */
function balancedTernaryToDecimal(s) {
    s = s.trim().toUpperCase();
    // 先做基础合法性检查（允许 . () 等标记字符）
    if (/[^T01.()\-]/.test(s)) {
        throw new Error(`包含非法字符`);
    }
    let intPart;
    let fracRaw;
    if (s.includes('.')) {
        [intPart, fracRaw] = s.split('.', 2);
    }
    else {
        intPart = s;
        fracRaw = '';
    }
    // 解析小数的循环节标记
    let prefix = '';
    let cycle = null;
    if (fracRaw.includes('(')) {
        const match = fracRaw.match(/^([^()]*)\(([^()]+)\)$/);
        if (!match) {
            throw new Error(`循环节格式错误：${fracRaw}`);
        }
        prefix = match[1];
        cycle = match[2];
        validateBT(prefix);
        validateBT(cycle);
    }
    else {
        prefix = fracRaw;
    }
    let value = ZERO;
    // 整数部分
    for (let i = 0; i < intPart.length; i++) {
        const ch = intPart[intPart.length - 1 - i];
        const weight = new BigFraction(3n ** BigInt(i), 1n);
        if (ch === '1') {
            value = value.add(weight);
        }
        else if (ch === 'T') {
            value = value.sub(weight);
        }
    }
    // 非循环小数部分
    if (prefix) {
        value = value.add(evalFracBT(prefix, 1));
    }
    // 循环小数部分：几何级数求和
    if (cycle) {
        const cycleVal = evalFracBT(cycle, 1); // 一个循环节的值
        const shift = new BigFraction(1n, 3n ** BigInt(prefix.length)); // 位移到前缀之后
        const ratio = new BigFraction(1n, 3n ** BigInt(cycle.length)); // 公比
        const seriesSum = cycleVal.mul(shift).div(ONE.sub(ratio));
        value = value.add(seriesSum);
    }
    return fractionToDecimalString(value);
}
/** 计算平衡三进制小数字符串（无小数点）对应的分数值 */
function evalFracBT(digits, startPos) {
    let val = ZERO;
    for (let i = 0; i < digits.length; i++) {
        const pos = startPos + i;
        const weight = new BigFraction(1n, 3n ** BigInt(pos));
        if (digits[i] === '1') {
            val = val.add(weight);
        }
        else if (digits[i] === 'T') {
            val = val.sub(weight);
        }
    }
    return val;
}
/** Fraction → 十进制字符串（长除法，检测循环节） */
function fractionToDecimalString(f) {
    if (f.isZero()) {
        return '0';
    }
    const sign = f.num < 0n ? '-' : '';
    let num = f.num < 0n ? -f.num : f.num;
    const den = f.den;
    const intPart = num / den;
    let rem = num % den;
    if (rem === 0n) {
        return sign + intPart.toString();
    }
    const digits = [];
    const seen = new Map(); // remainder → position
    while (rem !== 0n && digits.length < 200) {
        const key = rem.toString();
        if (seen.has(key)) {
            const start = seen.get(key);
            const prefix = digits.slice(0, start).join('');
            const cycle = digits.slice(start).join('');
            return `${sign}${intPart}.${prefix}(${cycle})`;
        }
        seen.set(key, digits.length);
        rem *= 10n;
        digits.push((rem / den).toString());
        rem = rem % den;
    }
    const frac = digits.join('').replace(/0+$/, '');
    return frac ? `${sign}${intPart}.${frac}` : `${sign}${intPart}`;
}
// ===========================================================================
// 工具
// ===========================================================================
function validateBT(s) {
    for (const ch of s) {
        if (ch !== 'T' && ch !== '0' && ch !== '1') {
            throw new Error(`非法的平衡三进制数码：${ch}`);
        }
    }
}
/** 检测字符串是否为平衡三进制（包含 T 或只由 T01.- 组成） */
function isBalancedTernary(s) {
    s = s.trim().toUpperCase();
    // 必须先包含至少一个 T/0/1 中的字符，且包含 T 则明确为三进制
    if (s.includes('T')) {
        return true;
    }
    // 若不含 T，检查是否所有字符都是 T01.- 中的
    const stripped = s.replace(/[.\-()]/g, '');
    if (stripped.length === 0) {
        return false;
    }
    return /^[T01]+$/.test(stripped);
}
//# sourceMappingURL=converter.js.map