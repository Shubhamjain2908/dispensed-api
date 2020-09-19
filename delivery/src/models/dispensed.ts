import mongoose from 'mongoose';
import { SlotsDoc } from './slot';
import { VehicleDoc } from './vehicle';

interface DispensedAttrs {
    vehicle_id: mongoose.Schema.Types.ObjectId;
    slot_id: mongoose.Schema.Types.ObjectId;
    weight: number;
    vendor_id: number;
}

interface DispensedModel extends mongoose.Model<DispensedDoc> {
    build(attrs: DispensedAttrs): DispensedDoc;
}

interface DispensedDoc extends mongoose.Document {
    vehicle_id: VehicleDoc;
    slot_id: SlotsDoc;
    weight: number;
    vendor_id: number;
}

const dispensedSchema = new mongoose.Schema(
    {
        vehicle_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle',
            required: true
        },
        slot_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Slots',
            required: true
        },
        weight: {
            type: Number,
            required: true,
        },
        vendor_id: {
            type: Number,
        }
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                ret._id = undefined;
            },
            versionKey: false,
        },
        timestamps: true
    }
);

dispensedSchema.statics.build = (attrs: DispensedAttrs) => {
    return new Dispensed(attrs);
};

const Dispensed = mongoose.model<DispensedDoc, DispensedModel>('Dispensed', dispensedSchema);

export { Dispensed, DispensedDoc };

