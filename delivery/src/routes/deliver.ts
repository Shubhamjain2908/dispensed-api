import { validateRequest } from '@tickethub/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { AvailableVehicles } from '../template/available-vehicles';
import { Orders } from '../template/delivery-request';
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

        res.status(201).send({ availableVehicles, totalWeight });
    }
);

export { router as deliveryRouter };

