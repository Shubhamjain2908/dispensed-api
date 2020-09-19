import mongoose from 'mongoose';
import { VehicleDoc } from './vehicle';

interface VendorAttrs {
    vendor_id: string;
    vehicle_id: mongoose.Schema.Types.ObjectId;
}

interface VendorModel extends mongoose.Model<VendorDoc> {
    build(attrs: VendorAttrs): VendorDoc;
}

interface VendorDoc extends mongoose.Document {
    vendor_id: string;
    vehicle_id: VehicleDoc;
}

const vendorSchema = new mongoose.Schema(
    {
        vendor_id: {
            type: String,
            required: true
        },
        vehicle_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle',
            required: true
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

vendorSchema.statics.build = (attrs: VendorAttrs) => {
    return new Vendor(attrs);
};

const Vendor = mongoose.model<VendorDoc, VendorModel>('Vendor', vendorSchema);

export { Vendor };

