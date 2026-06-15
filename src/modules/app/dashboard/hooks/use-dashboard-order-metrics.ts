import { useMemo } from "react";

import { useGetOrders } from "@/modules/app/orders/api/useGetOrders";

const ONE_ITEM_PAGE_SIZE = 1;

export function useDashboardOrderMetrics(today: string) {
  const draftOrdersQuery = useGetOrders({
    page: 1,
    pageSize: ONE_ITEM_PAGE_SIZE,
    status: "PENDING",
  });

  const confirmedOrdersQuery = useGetOrders({
    page: 1,
    pageSize: ONE_ITEM_PAGE_SIZE,
    status: "CONFIRMED",
  });

  const cuttingOrdersQuery = useGetOrders({
    page: 1,
    pageSize: ONE_ITEM_PAGE_SIZE,
    status: "CUTTING",
  });

  const sewingOrdersQuery = useGetOrders({
    page: 1,
    pageSize: ONE_ITEM_PAGE_SIZE,
    status: "SEWING",
  });

  const inProgressOrdersQuery = useGetOrders({
    page: 1,
    pageSize: ONE_ITEM_PAGE_SIZE,
    status: "IN_PROGRESS",
  });

  const readyOrdersQuery = useGetOrders({
    page: 1,
    pageSize: ONE_ITEM_PAGE_SIZE,
    status: "READY",
  });

  const deliveredOrdersQuery = useGetOrders({
    page: 1,
    pageSize: ONE_ITEM_PAGE_SIZE,
    status: "DELIVERED",
  });

  const completedOrdersQuery = useGetOrders({
    page: 1,
    pageSize: ONE_ITEM_PAGE_SIZE,
    status: "COMPLETED",
  });

  const todayOrdersQuery = useGetOrders({
    page: 1,
    pageSize: ONE_ITEM_PAGE_SIZE,
    orderDate: today,
  });

  return useMemo(() => {
    const draftOrders =
      draftOrdersQuery.data?.data.pagination.totalItems ?? 0;
    const inProgressOrders =
      (confirmedOrdersQuery.data?.data.pagination.totalItems ?? 0) +
      (cuttingOrdersQuery.data?.data.pagination.totalItems ?? 0) +
      (sewingOrdersQuery.data?.data.pagination.totalItems ?? 0) +
      (inProgressOrdersQuery.data?.data.pagination.totalItems ?? 0);
    const readyOrders =
      readyOrdersQuery.data?.data.pagination.totalItems ?? 0;
    const deliveredOrders =
      (deliveredOrdersQuery.data?.data.pagination.totalItems ?? 0) +
      (completedOrdersQuery.data?.data.pagination.totalItems ?? 0);
    const todayOrders =
      todayOrdersQuery.data?.data.pagination.totalItems ?? 0;

    const isLoading = [
      draftOrdersQuery,
      confirmedOrdersQuery,
      cuttingOrdersQuery,
      sewingOrdersQuery,
      inProgressOrdersQuery,
      readyOrdersQuery,
      deliveredOrdersQuery,
      completedOrdersQuery,
      todayOrdersQuery,
    ].some((query) => query.isLoading || query.isFetching);

    return {
      draftOrders,
      inProgressOrders,
      readyOrders,
      deliveredOrders,
      todayOrders,
      isLoading,
    };
  }, [
    completedOrdersQuery,
    confirmedOrdersQuery,
    cuttingOrdersQuery,
    deliveredOrdersQuery,
    draftOrdersQuery,
    inProgressOrdersQuery,
    readyOrdersQuery,
    sewingOrdersQuery,
    todayOrdersQuery,
  ]);
}
