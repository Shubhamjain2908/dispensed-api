import mongoose from 'mongoose';
import { SlotsDoc } from './slot';
import { VehicleDoc } from './vehicle';

interface AvailabilityAttrs {
    vehicle_id: mongoose.Schema.Types.ObjectId;
    slot_id: mongoose.Schema.Types.ObjectId;
}

interface AvailabilityModel extends mongoose.Model<AvailabilityDoc> {
    build(attrs: AvailabilityAttrs): AvailabilityDoc;
}

interface AvailabilityDoc extends mongoose.Document {
    vehicle_id: VehicleDoc;
    slot_id: String | SlotsDoc;
}

const availabilitySchema = new mongoose.Schema(
    {
        vehicle_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle'
        },
        slot_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Slots'
        },
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                ret._id = undefined;
            },
            versionKey: false
        }
    }
);

availabilitySchema.statics.build = (attrs: AvailabilityAttrs) => {
    return new Availability(attrs);
};

const Availability = mongoose.model<AvailabilityDoc, AvailabilityModel>('Availability', availabilitySchema);

export { Availability, AvailabilityDoc };

