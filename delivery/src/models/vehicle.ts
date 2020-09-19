import mongoose from 'mongoose';

interface VehicleAttrs {
    name: string;
    max_weight: number;
}

interface VehicleModel extends mongoose.Model<VehicleDoc> {
    build(attrs: VehicleAttrs): VehicleDoc;
}

interface VehicleDoc extends mongoose.Document {
    name: string;
    max_weight: number;
}

const vehicleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        max_weight: {
            type: Number,
            required: true,
            default: 0
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

vehicleSchema.statics.build = (attrs: VehicleAttrs) => {
    return new Vehicle(attrs);
};

const Vehicle = mongoose.model<VehicleDoc, VehicleModel>('Vehicle', vehicleSchema);

export { Vehicle, VehicleDoc };

