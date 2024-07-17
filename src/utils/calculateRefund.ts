import { Stripe } from "stripe";

export const calculateRefundAmount = (
    subscription: Stripe.Subscription,
    cancelDate: number,
    commissionRate: number = 0.05,
) => {
    const endDate = new Date(subscription.current_period_end * 1000);
    const startDate = new Date(subscription.current_period_start * 1000);
    const daysInPeriod = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const remainingDays = (endDate.getTime() - cancelDate) / (1000 * 60 * 60 * 24);

    // Ensure remainingDays is not negative or zero
    if (remainingDays <= 0 || daysInPeriod <= 0) {
        return 0;
    }

    const dailyRate = subscription.items?.data[0]?.plan?.amount
        ? subscription.items.data[0].plan.amount / daysInPeriod
        : 0;

    const refundAmount = dailyRate * remainingDays;
    const commission = refundAmount * commissionRate;

    return (refundAmount - commission) / 1000 ;
};
