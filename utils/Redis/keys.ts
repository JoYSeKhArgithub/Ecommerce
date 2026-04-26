export const RedisKey = {
    otp: (email: string) => `otp:${email}`,
    otpCoolDown: (email: string)=> `otp_cooldown:${email}`,
    otpLock: (email: string)=> `otp_lock:${email}`,
    otpSpamLock: (email: string)=> `otp_spam_lock:${email}`,
    otpRequestCount: (email: string) => `otp_request_count:${email}`
}