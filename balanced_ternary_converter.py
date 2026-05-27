"""
平衡三进制 <-> 十进制转换器，使用精确有理数运算，自动检测循环节。

平衡三进制使用 {T, 0, 1} 三个数码，其中 T 表示 -1。
小数点后第 i 位的权重为 3^(-i)：
    ... 27, 9, 3, 1, 1/3, 1/9, 1/27, ...

无限循环小数用括号 () 标出循环节，例如：
    0.(1)     = 0.111...  = 1/2
    0.(1T)    = 0.1T1T... = 1/4

示例：
    1T        =  3 - 1 = 2
    T0        = -3 + 0 = -3
    1T.1      =  3 - 1 + 1/3 = 2.333...
    0.1       =  1/3
    1.(T)     =  1 - 1/2 = 0.5
"""

from decimal import Decimal, getcontext, setcontext, Context
from fractions import Fraction
import sys


# ===========================================================================
# 公开接口
# ===========================================================================

def balanced_ternary_to_decimal(ternary_str: str) -> Decimal:
    """将平衡三进制字符串转换为 Decimal。

    支持循环节标记：用 () 括起无限循环部分，如 '0.(1T)' 表示 0.1T1T1T...

    参数:
        ternary_str: 平衡三进制字符串，如 '1T0.1T'、'0.(1T)'、'T'

    返回:
        对应的 Decimal 值

    异常:
        ValueError: 字符串包含非法字符
    """
    s = ternary_str.strip().upper()

    # 拆分整数部分和小数部分
    if '.' in s:
        int_part, frac_raw = s.split('.', 1)
    else:
        int_part, frac_raw = s, ''

    # 解析小数的循环节标记
    if '(' in frac_raw:
        prefix, cycle = frac_raw.split('(', 1)
        cycle = cycle.rstrip(')')
        if '(' in prefix or ')' in prefix:
            raise ValueError("循环节括号嵌套错误")
    else:
        prefix, cycle = frac_raw, None

    _validate(int_part)
    _validate(prefix)
    if cycle is not None:
        _validate(cycle)

    # 用 Fraction 精确计算，最后转为 Decimal
    value = Fraction(0)

    # 整数部分：digit_i × 3^i
    for i, ch in enumerate(reversed(int_part)):
        if ch == '1':
            value += Fraction(3 ** i, 1)
        elif ch == 'T':
            value -= Fraction(3 ** i, 1)

    # 非循环小数部分
    if prefix:
        value += _frac_str_to_value(prefix, start_pos=1)

    # 循环小数部分：几何级数求和
    if cycle:
        cycle_one = _frac_str_to_value(cycle, start_pos=1)       # 一个循环节的值
        shift = Fraction(1, 3 ** len(prefix))                     # 位移到前缀之后
        ratio = Fraction(1, 3 ** len(cycle))                      # 公比
        value += cycle_one * shift / (1 - ratio)

    # Fraction -> Decimal
    _ensure_decimal_precision(100)
    return Decimal(value.numerator) / Decimal(value.denominator)


def decimal_to_balanced_ternary(value, max_digits: int = 2000) -> str:
    """将十进制数转换为平衡三进制字符串（默认输出精确值）。

    使用分数精确运算，自动检测无限循环并标出循环节。若在 max_digits
    位内未发现循环，则输出截断结果并以 '...' 结尾。

    参数:
        value:      整数、浮点数、字符串或 Decimal
        max_digits: 最多探测的小数位数（默认 2000），防止极长循环节时卡死

    返回:
        平衡三进制字符串，循环节用 () 标出，如 '0.(1T)'

    异常:
        ValueError: max_digits 为负数
    """
    if max_digits < 0:
        raise ValueError("max_digits 不能为负数")

    # 统一转为 Fraction 以获得精确表示
    if isinstance(value, Fraction):
        frac = value
    elif isinstance(value, Decimal):
        frac = Fraction(value)
    elif isinstance(value, float):
        frac = Fraction(str(value))   # 避免浮点近似，如 0.1 -> Fraction(1, 10)
    elif isinstance(value, str):
        frac = Fraction(value)
    elif isinstance(value, int):
        frac = Fraction(value)
    else:
        raise TypeError(f"不支持的类型：{type(value)}")

    if frac == 0:
        return '0'

    sign = 1 if frac >= 0 else -1
    frac = abs(frac)

    # 拆分整数与小数部分，再调整小数到 [-1/2, 1/2] 区间。
    # 例如 0.6 = 1 + (-0.4)，保证小数部分在平衡三进制的精确表示范围内。
    integer_part = int(frac)          # Fraction.__int__() 向零截断
    fractional_part = frac - integer_part
    half = Fraction(1, 2)
    if fractional_part > half:
        integer_part += 1
        fractional_part -= 1

    int_str = _integer_to_bt(integer_part)
    frac_str = _fraction_to_bt_exact(fractional_part, max_digits)

    result = int_str
    if frac_str:
        result += '.' + frac_str

    if sign == -1:
        result = _negate(result)

    return result


# ===========================================================================
# 内部辅助函数
# ===========================================================================

def _integer_to_bt(n: int) -> str:
    """将非负整数转换为平衡三进制字符串。"""
    if n == 0:
        return '0'

    digits = []
    while n > 0:
        rem = n % 3
        if rem == 2:
            digits.append('T')
            n += 1          # 进位
        else:
            digits.append(str(rem))
        n //= 3

    return ''.join(reversed(digits))


def _fraction_to_bt_exact(f: Fraction, max_digits: int) -> str:
    """将 [-1/2, 1/2] 内的 Fraction 转换为平衡三进制小数部分。

    使用长除法风格的余数追踪来检测循环节：
      - 反复乘以 3，取最接近的数码 {T, 0, 1}
      - 记录每个余数首次出现的位置
      - 当余数重复时，找到循环节，用 () 标出
      - 若达到 max_digits 仍未发现循环，截断并以 '...' 结尾
    """
    if f == 0:
        return ''

    seen = {}           # Fraction -> 在 digits 中的位置
    digits = []         # 已生成的数码
    half = Fraction(1, 2)

    while len(digits) < max_digits:
        if f in seen:
            # 发现循环：在首次出现该余数的位置插入 '('
            start = seen[f]
            prefix = ''.join(digits[:start])
            cycle = ''.join(digits[start:])
            return f'{prefix}({cycle})'

        seen[f] = len(digits)
        f *= 3

        # f ∈ [-3/2, 3/2]，取最接近的 {-1, 0, 1}
        if f <= -half:
            d = -1
        elif f < half:
            d = 0
        else:
            d = 1

        digits.append('T' if d == -1 else str(d))
        f -= d

        if f == 0:
            break

    # 达到最大位数仍未发现循环或终止
    result = ''.join(digits)
    if f != 0:
        result += '...'
    return result


def _frac_str_to_value(digits: str, start_pos: int = 1) -> Fraction:
    """计算平衡三进制小数字符串对应的 Fraction 值。

    参数:
        digits:    仅含 T/0/1 的字符串
        start_pos: 第一个数码的小数位置（1 = 小数点后第 1 位）

    返回:
        相应的 Fraction 值
    """
    value = Fraction(0)
    for i, ch in enumerate(digits):
        weight = Fraction(1, 3 ** (start_pos + i))
        if ch == '1':
            value += weight
        elif ch == 'T':
            value -= weight
    return value


def _negate(bt: str) -> str:
    """将平衡三进制字符串取反：T <-> 1，0 不变。"""
    return bt.translate(str.maketrans('T01', '10T'))


def _validate(s: str) -> None:
    """检查字符串是否只包含合法的平衡三进制数码。"""
    for ch in s:
        if ch not in 'T01':
            raise ValueError(f"非法的平衡三进制数码：{ch!r}")


def _ensure_decimal_precision(n: int) -> None:
    """确保 Decimal 上下文的精度至少为 n。"""
    ctx = getcontext()
    if ctx.prec < n:
        ctx.prec = n


# ===========================================================================
# 交互式命令行
# ===========================================================================

def main():
    """交互式转换器入口。"""
    if sys.platform == 'win32':
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    setcontext(Context(prec=100))

    print("=" * 50)
    print("  平衡三进制 <-> 十进制 转换器")
    print("  （精确有理运算，自动检测循环节）")
    print("=" * 50)
    print()

    while True:
        print("请选择转换方向：")
        print("  1 — 十进制 -> 平衡三进制（精确值，循环节用 () 标出）")
        print("  2 — 平衡三进制 -> 十进制（支持 () 循环节输入）")
        print("  0 — 退出")
        print()

        choice = input("请输入选项 (0/1/2)：").strip()

        if choice == '0':
            print("再见！")
            break
        elif choice == '1':
            _do_decimal_to_ternary()
        elif choice == '2':
            _do_ternary_to_decimal()
        else:
            print("无效选项，请重新输入。")
            print()


def _do_decimal_to_ternary():
    """处理十进制 -> 平衡三进制 的交互流程。"""
    print()
    value_str = input("请输入十进制数（支持整数、小数、分数如 1/3、负数）：").strip()
    if not value_str:
        print("输入为空，已取消。")
        print()
        return

    limit_str = input("最大探测位数（默认 2000，直接回车使用默认值）：").strip()
    if limit_str:
        try:
            limit = int(limit_str)
            if limit <= 0:
                print("位数必须为正整数，已取消。")
                print()
                return
        except ValueError:
            print("位数必须是整数，已取消。")
            print()
            return
    else:
        limit = 2000

    try:
        result = decimal_to_balanced_ternary(value_str, max_digits=limit)
        print()
        print(f"  十进制 {value_str}")
        print(f"  -> 平衡三进制：{result}")
    except Exception as e:
        print(f"转换失败：{e}")
    print()


def _do_ternary_to_decimal():
    """处理平衡三进制 -> 十进制 的交互流程。"""
    print()
    print("支持循环节输入，如 0.(1T) 表示 0.1T1T1T...")
    value_str = input("请输入平衡三进制数（数码为 T、0、1）：").strip()
    if not value_str:
        print("输入为空，已取消。")
        print()
        return

    try:
        result = balanced_ternary_to_decimal(value_str)
        # 去掉末尾多余的零
        s = format(result, 'f')
        if '.' in s:
            s = s.rstrip('0').rstrip('.')
        print()
        print(f"  平衡三进制 {value_str.upper()}")
        print(f"  -> 十进制：{s}")
    except Exception as e:
        print(f"转换失败：{e}")
    print()


if __name__ == '__main__':
    main()
