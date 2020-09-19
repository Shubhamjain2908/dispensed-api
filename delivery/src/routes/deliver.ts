import { BadRequestError, validateRequest } from '@tickethub/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { Slots } from '../models/slot';

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
        const slotId = req.query.slotId;
        await validateSlot(slotId);

        res.status(201).send({ title: 'CKMB' });
    }
);

const validateSlot = async (slotId: any) => {
    if (!slotId) {
        throw new BadRequestError('Slot Id is required');
    }
    if (!mongoose.Types.ObjectId.isValid(slotId)) {
        throw new BadRequestError('Not a valid mongoose Id');
    }
    const slotExists = await Slots.findOne({ _id: slotId });
    if (!slotExists) {
        throw new BadRequestError(`No Slot found for id: ${slotId}`);
    }
    return true;
}

export { router as deliveryRouter };

