/**
 * 日期时间工具类
 * 提供统一的日期时间格式化方法
 */
export class DateUtil {
  /**
   * 格式化日期时间为 yyyy-MM-dd HH:mm:ss
   * @param date Date 对象
   * @returns 格式化后的字符串，例如：2024-01-27 18:30:00
   */
  static formatDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * 格式化日期时间为 yyyy-MM-dd HH:mm:ss.SSS（含毫秒）
   * @param date Date 对象
   * @returns 格式化后的字符串，例如：2024-01-27 18:30:00.123
   */
  static formatDateTimeWithMs(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ms = String(date.getMilliseconds()).padStart(3, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${ms}`;
  }

  /**
   * 格式化日期为 yyyy-MM-dd
   * @param date Date 对象
   * @returns 格式化后的字符串，例如：2024-01-27
   */
  static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 格式化时间为 HH:mm:ss
   * @param date Date 对象
   * @returns 格式化后的字符串，例如：18:30:00
   */
  static formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  /**
   * 获取今天的日期字符串 yyyy-MM-dd
   * @returns 今天的日期，例如：2024-01-27
   */
  static getTodayDate(): string {
    return this.formatDate(new Date());
  }

  /**
   * 获取当前日期时间字符串 yyyy-MM-dd HH:mm:ss
   * @returns 当前日期时间，例如：2024-01-27 18:30:00
   */
  static getNow(): string {
    return this.formatDateTime(new Date());
  }

  /**
   * 计算两个日期之间的天数差
   * @param date1 第一个日期
   * @param date2 第二个日期
   * @returns 天数差（正数表示 date1 在 date2 之后）
   */
  static daysBetween(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000; // 一天的毫秒数
    const diffMs = date1.getTime() - date2.getTime();
    return Math.floor(diffMs / oneDay);
  }

  /**
   * 添加天数
   * @param date 原始日期
   * @param days 要添加的天数（负数表示减少）
   * @returns 新的日期对象
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * 设置时间为当天的开始 00:00:00.000
   * @param date 原始日期
   * @returns 新的日期对象
   */
  static startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * 设置时间为当天的结束 23:59:59.999
   * @param date 原始日期
   * @returns 新的日期对象
   */
  static endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * 解析日期字符串 yyyy-MM-dd 为 Date 对象
   * @param dateString 日期字符串，例如：2024-01-27
   * @returns Date 对象
   */
  static parseDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  /**
   * 检查日期是否为今天
   * @param date 要检查的日期
   * @returns 是否为今天
   */
  static isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  /**
   * 检查日期是否在指定范围内
   * @param date 要检查的日期
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 是否在范围内
   */
  static isBetween(date: Date, startDate: Date, endDate: Date): boolean {
    return date >= startDate && date <= endDate;
  }
}