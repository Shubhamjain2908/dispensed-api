import { BadRequestError, validateRequest } from '@tickethub/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { Availability, AvailabilityDoc } from '../models/availablilty';
import { Dispensed } from '../models/dispensed';
import { Slots } from '../models/slot';
import { AvailableVehicles } from '../template/available-vehicles';
import { CurrentDateDispensed } from '../template/current-date-dispensed';
import { Orders } from '../template/delivery-request';

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

const validateSlot = async (slotId: any) => {
    if (!slotId) {
        throw new BadRequestError('Slot Id is required');
    }
    if (!mongoose.Types.ObjectId.isValid(slotId)) {
        throw new BadRequestError('Not a valid mongoose Id');
    }
    const slotExists = await Slots.findById(slotId);
    if (!slotExists) {
        throw new BadRequestError(`No Slot found for id: ${slotId}`);
    }
    return true;
}

const validateAndReturnTotalWeight = async (request: Array<Orders>): Promise<number> => {
    const totalWeight = request.reduce((a, b) => a + b.order_weight, 0);
    if (totalWeight > 100) {
        throw new BadRequestError('The total order weight must not exceeds the limit: 100kg');
    }
    return totalWeight;
}

const getAvailableVehiclesAndVendors = async (slotId: String): Promise<Array<AvailableVehicles>> => {
    const availableVehiclesForSlot = await Availability.find({ slot_id: slotId }).populate('vehicle');
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 1, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 59, 59);
    const currentDateDispensed: Array<CurrentDateDispensed> = await Dispensed.aggregate(
        [
            {
                $match: {
                    createdAt: { $gte: start, $lt: end }
                }
            },
            {
                $group: {
                    _id: "$vehicle_id",
                    total_weight: { $sum: "$weight" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    vehicle_id: "$_id",
                    total_weight: 1,
                    count: 1
                }
            }
        ]
    );
    return await checkRemainingVehiclesForTheCurrentDate(currentDateDispensed, availableVehiclesForSlot);
}

const checkRemainingVehiclesForTheCurrentDate = async (currentDateDispensed: Array<CurrentDateDispensed>, availableVehiclesForSlot: Array<AvailabilityDoc>): Promise<Array<AvailableVehicles>> => {
    // check if today's deliverable exceeds the total possible deliverable
    const result: Array<AvailableVehicles> = availableVehiclesForSlot.map(av => {
        const id = av.vehicle_id.id || av.vehicle_id;
        let max_day_count = av.vehicle_id.max_day_limit;
        const currentDayVehicle = currentDateDispensed.find(v => v.vehicle_id == id);
        if (currentDayVehicle && currentDayVehicle.count <= max_day_count) {
            max_day_count -= currentDayVehicle.count;
        }
        return {
            vehicle_id: id,
            remaining_count: max_day_count,
            max_weight: av.vehicle_id.max_weight
        }
    }).filter(v => v.remaining_count > 0);

    return result;
}

export { router as deliveryRouter };

