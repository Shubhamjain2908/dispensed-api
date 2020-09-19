import { validateRequest } from '@tickethub/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';

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
        res.status(201).send({ title: 'CKMB' });
    }
);

export { router as deliveryRouter };

