export const TODAY      = new Date().toISOString().split('T')[0];
export const MONTH_AGO  = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
export const QUICK_PERIODS = ['오늘', '1주', '1개월', '3개월', '6개월'];
