import { Orders } from '../template/delivery-request';

const firstFit = (weight: Array<Orders>, capacity: number) => {
    const n = weight.length;
    // Initialize result (Count of bins) 
    let res = 0;

    // Create an array to store remaining space in bins there can be at most n bins 
    let bin_rem = new Array(n);

    // Place items one by one 
    for (let i = 0; i < n; i++) {
        // Find the first bin that can accommodate weight[i] 
        let j;
        for (j = 0; j < res; j++) {
            if (bin_rem[j] >= weight[i]) {
                bin_rem[j] = bin_rem[j] - weight[i].order_weight;
                break;
            }
        }

        // If no bin could accommodate weight[i] 
        if (j == res) {
            bin_rem[res] = capacity - weight[i].order_weight;
            res++;
        }
    }
    return res;
}

export { firstFit };
