package com.vic.crm.enums;

/**
 * Reasons for closing a candidate
 */
public enum CloseReason {
    // Good reasons (voluntary exit)
    RETURNED_HOME, // 回国
    FOUND_FULLTIME, // 找到full time
    OTHER_OPPORTUNITY, // 其他机会

    // Bad reasons (performance/behavior)
    NO_HOMEWORK, // 没写作业
    BEHAVIOR_ISSUE, // behavior问题
    NO_RESPONSE // 长期无回复
}
