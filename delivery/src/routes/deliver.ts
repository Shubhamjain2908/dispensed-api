import { validateRequest } from '@tickethub/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Dispensed } from '../models/dispensed';
import { AvailableVehicles } from '../template/available-vehicles';
import { Orders } from '../template/delivery-request';
import { AssignedOrder } from '../template/delivery-response';
import { firstFit } from '../util/binpack';
import { assignOrderToVehicle } from '../util/knapsack';
import { getAvailableVehiclesAndVendors, validateAndReturnTotalWeight, validateSlot } from '../util/validator';

const router = express.Router();

router.post(
    '/api/delivery',
    [
        body().isArray().withMessage('Request must be an array'),
        body('*.order_id').not().isEmpty().withMessage('Order Id is required'),
        body('*.order_weight')
            .isFloat({ gt: 0, lt: 101 })
            .withMessage('Order weight must be greater than 0 & less that 100'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const slotId = `${req.query.slotId}`;

        // validating slot info
        await validateSlot(slotId);

        const orders: Array<Orders> = req.body;

        // checking total order weights: for any slot the weight must not exceed 100KG
        const totalWeight = await validateAndReturnTotalWeight(orders);

        // Checking for available vehicles & vendors
        const availableVehicles: Array<AvailableVehicles> = await getAvailableVehiclesAndVendors(slotId);

        const assignedOrders = await assignOrder(orders, availableVehicles, slotId, totalWeight);

        res.status(201).send({ assignedOrders });
    }
);

const assignOrder = async (orders: Array<Orders>, availableVehicles: Array<AvailableVehicles>, slotId: string, totalWeight: number): Promise<Array<AssignedOrder>> => {
    // knapsack problem
    let result: Array<AssignedOrder> = [];
    // if total weight exactly matches any weight of availableVehicles, then assign all orders to that vehicle
    for (let i = 0; i < availableVehicles.length; i++) {
        const v = availableVehicles[i];
        if (v.max_weight === totalWeight) {
            const listOfOrdersAssigned = orders.map(order => order.order_id);
            let obj: AssignedOrder = {
                delivery_partner_id: Math.floor(Math.random() * 2) + 1,  // currently since there are only 2 partner & no diff in them whatsoever
                list_order_ids_assigned: listOfOrdersAssigned,
                vehicle_type: v.vehicle_id
            }
            result.push(obj);
            await saveDispensedHistory(result, slotId);
            return result;
        }
    }

    // binpacking algo => to get the no of vehicles needed
    for (let i = 0; i < availableVehicles.length; i++) {
        const v = availableVehicles[i];
        const vehichleRequired = firstFit(orders, v.max_weight);
        if (vehichleRequired <= v.remaining_count) {
            // assign all orders to this vehicle only
            result = await assignment(orders, v);
            await saveDispensedHistory(result, slotId);
            return result;
        }
    }

    // loop through all available vehicles & assign orders accordingly
    let remainingOrders = [...orders], assignedOrder;
    const allVehicles: Array<AvailableVehicles> = [];
    availableVehicles.forEach(v => {
        for (let i = 0; i < v.remaining_count; i++) {
            allVehicles.push(v);
        }
    });
    for (let i = 0; i < allVehicles.length; i++) {
        const v = allVehicles[i];
        if (remainingOrders.length) {
            [remainingOrders, assignedOrder] = assignOrderToVehicle(v.max_weight, remainingOrders);
            v.remaining_count = v.remaining_count - 1;
            // assign all orders to this vehicle only
            result = [...result, ...await assignment(orders, v)];
            await saveDispensedHistory(result, slotId);
        } else {
            break;
        }
    }
    return result;
}

const saveDispensedHistory = async (orders: Array<AssignedOrder>, slotId: string): Promise<void> => {
    const history: any[] = [];
    orders.forEach((order) => {
        const d = Dispensed.build({
            slot_id!: slotId,
            vehicle_id: order.vehicle_type,
            vendor_id: order.delivery_partner_id
        });
        history.push(d.save());
    });
    await Promise.all(history);
}

export { router as deliveryRouter };

const assignment = async (orders: Array<Orders>, vehicle: AvailableVehicles) => {
    let remainingOrders = [...orders], assignedOrder;
    let totalVehicles = vehicle.remaining_count;
    const result: Array<AssignedOrder> = [];
    while (totalVehicles > 0 && remainingOrders.length) {
        [remainingOrders, assignedOrder] = assignOrderToVehicle(vehicle.max_weight, remainingOrders);
        const listOfOrdersAssigned = assignedOrder.map(order => order.order_id);
        let obj: AssignedOrder = {
            delivery_partner_id: Math.floor(Math.random() * 2) + 1,  // currently since there are only 2 partner & no diff in them whatsoever
            list_order_ids_assigned: listOfOrdersAssigned,
            vehicle_type: vehicle.vehicle_id
        }
        result.push(obj);
    }
    return result;
}