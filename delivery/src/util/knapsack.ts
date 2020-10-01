import { Orders } from '../template/delivery-request';

const getknapSack = (maxCapacity: number, wt: Array<Orders>) => {
    const assignedOrder: Array<Orders> = [];
    const n = wt.length;
    let knapsack = [];
    for (let i = 0; i < n + 1; i++) {
        knapsack.push(new Array(maxCapacity + 1).fill(0));
    }

    // Build table knapsack[][] in bottom up manner 
    for (let i = 0; i <= n; i++) {
        for (let w = 0; w <= maxCapacity; w++) {
            if (i == 0 || w == 0) {
                knapsack[i][w] = 0;
            } else if (wt[i - 1].order_weight <= w) {
                knapsack[i][w] = Math.max(wt[i - 1].order_weight +
                    knapsack[i - 1][w - wt[i - 1].order_weight], knapsack[i - 1][w]);
            } else {
                knapsack[i][w] = knapsack[i - 1][w];
            }
        }
    }

    // stores the result of Knapsack 
    let res = knapsack[n][maxCapacity];

    let w = maxCapacity;
    for (let i = n; i > 0 && res > 0; i--) {

        // either the result comes from the top (knapsack[i-1][w]) or from (wt[i-1] + K[i-1][w-wt[i-1]]) as in Knapsack table.
        // If it comes from the latter one/ it means the item is included. 
        if (res === knapsack[i - 1][w])
            continue;
        else {
            // This item is included.
            assignedOrder.push(wt[i - 1]);

            // Since this weight is included its value is deducted 
            res = res - wt[i - 1].order_weight;
            w = w - wt[i - 1].order_weight;
        }
    }
    const remainingOrders: Array<Orders> = wt.filter(a => !assignedOrder.includes(a));
    return [remainingOrders, assignedOrder];
}

export { getknapSack as assignOrderToVehicle };

