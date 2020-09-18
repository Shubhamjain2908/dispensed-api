import mongoose from 'mongoose';

interface DispensedAttrs {
    vehicle_id: mongoose.Schema.Types.ObjectId;
    slot_id: mongoose.Schema.Types.ObjectId;
    weight: number;
}

interface DispensedModel extends mongoose.Model<DispensedDoc> {
    build(attrs: DispensedAttrs): DispensedDoc;
}

interface DispensedDoc extends mongoose.Document {
    vehicle_id: mongoose.Schema.Types.ObjectId;
    slot_id: mongoose.Schema.Types.ObjectId;
    weight: number;
}

const DispensedSchema = new mongoose.Schema(
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

DispensedSchema.statics.build = (attrs: DispensedAttrs) => {
    return new Dispensed(attrs);
};

const Dispensed = mongoose.model<DispensedDoc, DispensedModel>('Dispensed', DispensedSchema);

export { Dispensed };

