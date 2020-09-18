import mongoose from 'mongoose';

interface VendorAttrs {
    vendor_id: string;
    vehicle_id: mongoose.Schema.Types.ObjectId;
}

interface VendorModel extends mongoose.Model<VendorDoc> {
    build(attrs: VendorAttrs): VendorDoc;
}

interface VendorDoc extends mongoose.Document {
    vendor_id: string;
    vehicle_id: mongoose.Schema.Types.ObjectId;
}

const VendorSchema = new mongoose.Schema(
    {
        vendor_id: {
            type: String,
            required: true
        },
        vehicle_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle'
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

VendorSchema.statics.build = (attrs: VendorAttrs) => {
    return new Vendor(attrs);
};

const Vendor = mongoose.model<VendorDoc, VendorModel>('Vendor', VendorSchema);

export { Vendor };

