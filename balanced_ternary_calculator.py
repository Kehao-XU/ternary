"""
平衡三进制计算器 —— 支持 Python 原生运算符的 BalancedTernary 类。

内部以 Fraction 精确存储数值，所有运算返回精确结果。
字符串显示使用平衡三进制（T/0/1），自动检测循环节并标出。

用法示例：
    >>> a = BalancedTernary('1T0')      # 从三进制字符串构造
    >>> b = BalancedTernary(5)          # 从十进制整数构造
    >>> a + b                           # 1T0 + 5
    BalancedTernary('11T')
    >>> a * 2                           # 1T0 × 2
    BalancedTernary('1T0T')
    >>> abs(BalancedTernary('T01'))     # 绝对值
    BalancedTernary('10T')
    >>> int(BalancedTernary('1TT'))     # 转 int
    5
"""

from fractions import Fraction
from decimal import Decimal
import math
import sys

# 复用已有的转换核心
from balanced_ternary_converter import (
    decimal_to_balanced_ternary,
    balanced_ternary_to_decimal,
)


# ===========================================================================
# 辅助：将任意数值类型转为 Fraction
# ===========================================================================

def _to_fraction(value):
    """将各种 Python 数值类型统一转为 Fraction，用于内部运算。"""
    if isinstance(value, Fraction):
        return value
    if isinstance(value, BalancedTernary):
        return value._value
    if isinstance(value, Decimal):
        return Fraction(value)
    if isinstance(value, float):
        return Fraction(str(value))       # 避免浮点近似
    if isinstance(value, int):
        return Fraction(value, 1)
    if isinstance(value, str):
        return Fraction(value)
    return NotImplemented


# ===========================================================================
# BalancedTernary 类
# ===========================================================================

class BalancedTernary:
    """平衡三进制数，内部以 Fraction 精确存储。

    构造方式：
        BalancedTernary('1T0')       # 平衡三进制字符串（含 T）
        BalancedTernary('3.14')      # 十进制字符串
        BalancedTernary('1/3')       # 分数字符串
        BalancedTernary(5)           # int
        BalancedTernary(0.1)         # float（自动精确化）
        BalancedTernary(Decimal(…))  # Decimal
        BalancedTernary(Fraction(…)) # Fraction
        BalancedTernary.from_ternary('101')  # 强制按三进制解析
    """

    __slots__ = ('_value',)

    # ------------------------------------------------------------------
    # 构造
    # ------------------------------------------------------------------

    def __init__(self, value=0):
        if isinstance(value, BalancedTernary):
            self._value = value._value
        elif isinstance(value, Fraction):
            self._value = value
        elif isinstance(value, Decimal):
            self._value = Fraction(value)
        elif isinstance(value, float):
            self._value = Fraction(str(value))
        elif isinstance(value, int):
            self._value = Fraction(value, 1)
        elif isinstance(value, str):
            s = value.strip().upper()
            if 'T' in s:
                # 平衡三进制字符串 -> Decimal -> Fraction
                dec = balanced_ternary_to_decimal(s)
                self._value = Fraction(dec)
            else:
                # 十进制 / 分数字符串
                self._value = Fraction(s)
        else:
            raise TypeError(f"不支持的类型：{type(value).__name__}")

    @classmethod
    def from_ternary(cls, s: str) -> 'BalancedTernary':
        """显式从平衡三进制字符串构造（即使不含 T 也按三进制解析）。"""
        dec = balanced_ternary_to_decimal(s)
        return cls(Fraction(dec))

    # ------------------------------------------------------------------
    # 属性
    # ------------------------------------------------------------------

    @property
    def fraction(self) -> Fraction:
        """返回内部 Fraction 精确值。"""
        return self._value

    @property
    def is_integer(self) -> bool:
        """是否为整数。"""
        return self._value.denominator == 1

    # ------------------------------------------------------------------
    # 字符串表示
    # ------------------------------------------------------------------

    def __str__(self) -> str:
        return decimal_to_balanced_ternary(self._value)

    def __repr__(self) -> str:
        return f"BalancedTernary('{self}')"

    def to_ternary(self, max_digits: int = 2000) -> str:
        """输出平衡三进制字符串（可指定最大探测位数）。"""
        return decimal_to_balanced_ternary(self._value, max_digits=max_digits)

    def to_decimal(self, places: int | None = None) -> str:
        """输出十进制字符串。

        参数:
            places: 保留的小数位数，None 表示完整精度（去掉末尾零）。
        """
        num = self._value.numerator
        den = self._value.denominator
        d = Decimal(num) / Decimal(den)
        s = format(d, 'f')
        if places is not None:
            # 格式化到指定位数
            q = Decimal('0.' + '0' * places) if places > 0 else Decimal('1')
            s = format(d.quantize(q), 'f')
        elif '.' in s:
            s = s.rstrip('0').rstrip('.')
        return s

    # ------------------------------------------------------------------
    # 类型转换
    # ------------------------------------------------------------------

    def __int__(self) -> int:
        return int(self._value)

    def __float__(self) -> float:
        return float(self._value.numerator) / float(self._value.denominator)

    def __bool__(self) -> bool:
        return self._value != 0

    def __hash__(self) -> int:
        return hash(('BalancedTernary', self._value))

    # ------------------------------------------------------------------
    # 一元运算符
    # ------------------------------------------------------------------

    def __neg__(self) -> 'BalancedTernary':
        return BalancedTernary(-self._value)

    def __pos__(self) -> 'BalancedTernary':
        return BalancedTernary(self)

    def __abs__(self) -> 'BalancedTernary':
        return BalancedTernary(abs(self._value))

    def __round__(self, ndigits: int | None = None) -> 'BalancedTernary':
        if ndigits is None:
            return BalancedTernary(round(self._value))
        # round to ndigits decimal places
        factor = Fraction(10 ** abs(ndigits), 1)
        if ndigits >= 0:
            rounded = round(self._value * factor) / factor
        else:
            rounded = round(self._value / factor) * factor
        return BalancedTernary(rounded)

    # ------------------------------------------------------------------
    # 比较运算符
    # ------------------------------------------------------------------

    def __eq__(self, other) -> bool:
        f = _to_fraction(other)
        if f is NotImplemented:
            return NotImplemented
        return self._value == f

    def __ne__(self, other) -> bool:
        f = _to_fraction(other)
        if f is NotImplemented:
            return NotImplemented
        return self._value != f

    def __lt__(self, other) -> bool:
        f = _to_fraction(other)
        if f is NotImplemented:
            return NotImplemented
        return self._value < f

    def __le__(self, other) -> bool:
        f = _to_fraction(other)
        if f is NotImplemented:
            return NotImplemented
        return self._value <= f

    def __gt__(self, other) -> bool:
        f = _to_fraction(other)
        if f is NotImplemented:
            return NotImplemented
        return self._value > f

    def __ge__(self, other) -> bool:
        f = _to_fraction(other)
        if f is NotImplemented:
            return NotImplemented
        return self._value >= f

    # ------------------------------------------------------------------
    # 算术运算符
    # ------------------------------------------------------------------

    def __add__(self, other) -> 'BalancedTernary':
        f = _to_fraction(other)
        if f is NotImplemented:
            return NotImplemented
        return BalancedTernary(self._value + f)

    def __radd__(self, other) -> 'BalancedTernary':
        f = _to_fraction(other)
        if f is NotImplemented:
            return NotImplemented
        return BalancedTernary(f + self._value)

    def __sub__(self, other) -> 'BalancedTernary':
        f = _to_fraction(other)
        if f is NotImplemented:
            return NotImplemented
        return BalancedTernary(self._value - f)

    def __rsub__(self, other) -> 'BalancedTernary':
        f = _to_fraction(other)
        if f is NotImplemented:
            return NotImplemented
        return BalancedTernary(f - self._value)

    def __mul__(self, other) -> 'BalancedTernary':
        f = _to_fraction(other)
        if f is NotImplemented:
            return NotImplemented
        return BalancedTernary(self._value * f)

    def __rmul__(self, other) -> 'BalancedTernary':
        f = _to_fraction(other)
        if f is NotImplemented:
            return NotImplemented
        return BalancedTernary(f * self._value)

    def __truediv__(self, other) -> 'BalancedTernary':
        f = _to_fraction(other)
        if f is NotImplemented:
            return NotImplemented
        if f == 0:
            raise ZeroDivisionError("除以零")
        return BalancedTernary(self._value / f)

    def __rtruediv__(self, other) -> 'BalancedTernary':
        f = _to_fraction(other)
        if f is NotImplemented:
            return NotImplemented
        if self._value == 0:
            raise ZeroDivisionError("除以零")
        return BalancedTernary(f / self._value)

    def __floordiv__(self, other) -> 'BalancedTernary':
        f = _to_fraction(other)
        if f is NotImplemented:
            return NotImplemented
        if f == 0:
            raise ZeroDivisionError("除以零")
        return BalancedTernary(self._value // f)

    def __rfloordiv__(self, other) -> 'BalancedTernary':
        f = _to_fraction(other)
        if f is NotImplemented:
            return NotImplemented
        if self._value == 0:
            raise ZeroDivisionError("除以零")
        return BalancedTernary(f // self._value)

    def __mod__(self, other) -> 'BalancedTernary':
        f = _to_fraction(other)
        if f is NotImplemented:
            return NotImplemented
        if f == 0:
            raise ZeroDivisionError("取模零")
        # Python 风格的取模：结果与除数同号
        return BalancedTernary(self._value % f)

    def __rmod__(self, other) -> 'BalancedTernary':
        f = _to_fraction(other)
        if f is NotImplemented:
            return NotImplemented
        if self._value == 0:
            raise ZeroDivisionError("取模零")
        return BalancedTernary(f % self._value)

    def __divmod__(self, other) -> tuple['BalancedTernary', 'BalancedTernary']:
        f = _to_fraction(other)
        if f is NotImplemented:
            return NotImplemented
        if f == 0:
            raise ZeroDivisionError("除以零")
        q, r = divmod(self._value, f)
        return BalancedTernary(q), BalancedTernary(r)

    def __rdivmod__(self, other) -> tuple['BalancedTernary', 'BalancedTernary']:
        f = _to_fraction(other)
        if f is NotImplemented:
            return NotImplemented
        if self._value == 0:
            raise ZeroDivisionError("除以零")
        q, r = divmod(f, self._value)
        return BalancedTernary(q), BalancedTernary(r)

    def __pow__(self, other) -> 'BalancedTernary':
        """幂运算。指数为整数时精确计算；指数为负数或分数时返回 Fraction 自然结果。"""
        f = _to_fraction(other)
        if f is NotImplemented:
            return NotImplemented

        # 整数指数 -> 精确
        if f.denominator == 1:
            exp = f.numerator
            if exp >= 0:
                return BalancedTernary(self._value ** exp)
            else:
                return BalancedTernary(Fraction(1) / (self._value ** abs(exp)))

        # 分数指数（如平方根）-> 用 float 近似再转回 Fraction
        base = float(self._value.numerator) / float(self._value.denominator)
        exp = float(f.numerator) / float(f.denominator)
        result = base ** exp
        return BalancedTernary(result)

    def __rpow__(self, other) -> 'BalancedTernary':
        f = _to_fraction(other)
        if f is NotImplemented:
            return NotImplemented

        # other ** self
        exp = self._value
        if exp.denominator == 1:
            e = exp.numerator
            if e >= 0:
                return BalancedTernary(f ** e)
            else:
                return BalancedTernary(Fraction(1) / (f ** abs(e)))

        base = float(f.numerator) / float(f.denominator)
        exp = float(exp.numerator) / float(exp.denominator)
        return BalancedTernary(base ** exp)


# ===========================================================================
# 快捷函数
# ===========================================================================

def BT(value) -> BalancedTernary:
    """快捷构造 BalancedTernary 对象。"""
    return BalancedTernary(value)


# ===========================================================================
# 交互式计算器
# ===========================================================================

def main():
    """交互式平衡三进制计算器。"""
    if sys.platform == 'win32':
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')

    print("=" * 56)
    print("  平衡三进制计算器  (BalancedTernary)")
    print("  支持 + - * / // % ** abs() 等 Python 运算符")
    print("=" * 56)
    print()
    print("输入 Python 表达式，其中 BT('1T0') 构造三进制数。")
    print("快捷函数：BT(5) = BalancedTernary(5)")
    print("输入 'exit' 或 'quit' 退出。")
    print()

    # 准备命名空间（全局和局部共用，保证赋值语句的变量持久化）
    import builtins
    namespace = {
        '__builtins__': builtins,
        'BalancedTernary': BalancedTernary,
        'BT': BT,
        'Fraction': Fraction,
        'Decimal': Decimal,
        'math': math,
    }

    while True:
        try:
            expr = input(">>> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break

        if not expr:
            continue
        if expr.lower() in ('exit', 'quit'):
            print("再见！")
            break

        try:
            # 先尝试作为表达式求值
            result = eval(expr, namespace)
            if result is not None:
                _print_result(result)
        except SyntaxError:
            # 语法错误 → 可能是赋值等语句，改用 exec
            try:
                exec(expr, namespace)
            except Exception as e:
                print(f"错误：{e}")
        except Exception as e:
            print(f"错误：{e}")

        print()


def _print_result(result):
    """格式化输出结果。"""
    if isinstance(result, BalancedTernary):
        print(f"    = {result}")
        print(f"    ≈ {result.to_decimal()}")
    elif isinstance(result, (list, tuple)):
        # 多项结果逐项打印
        items = []
        for v in result:
            if isinstance(v, BalancedTernary):
                items.append(f"{v}  ({v.to_decimal()})")
            else:
                items.append(str(v))
        print(f"    = ({', '.join(items)})")
    else:
        print(f"    = {result}")


if __name__ == '__main__':
    main()
