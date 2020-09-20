import { validateRequest } from '@tickethub/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Dispensed } from '../models/dispensed';
import { AvailableVehicles } from '../template/available-vehicles';
import { Orders } from '../template/delivery-request';
import { AssignedOrder } from '../template/delivery-response';
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
    const result: Array<AssignedOrder> = [];

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

