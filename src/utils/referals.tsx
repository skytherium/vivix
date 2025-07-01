export const generateReferralCode = (username: string) => {
    const suffix = Math.random().toString(36).substring(2, 6);
    return `${username}${suffix}`;
};