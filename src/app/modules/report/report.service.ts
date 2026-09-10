import Bill from "../bill/bill.model";

const getSalesReport = async (from?: string, to?: string) => {
  const endDate = to ? new Date(to) : new Date();

  const startDate = from
    ? new Date(from)
    : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

  const days = await Bill.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalSales: { $sum: "$total" },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const summary = days.reduce(
    (acc, day) => ({
      totalSales: acc.totalSales + day.totalSales,
      totalOrders: acc.totalOrders + day.orderCount,
    }),
    { totalSales: 0, totalOrders: 0 },
  );
  return { days, summary, from: startDate, to: endDate };
};
export const ReportServices = { getSalesReport };
