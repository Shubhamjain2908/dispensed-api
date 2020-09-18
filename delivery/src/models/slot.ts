import mongoose from 'mongoose';

interface SlotsAttrs {
    label: string;
    start_time: Date;
    end_time: Date;
}

interface SlotsModel extends mongoose.Model<SlotsDoc> {
    build(attrs: SlotsAttrs): SlotsDoc;
}

interface SlotsDoc extends mongoose.Document {
    label: string;
    start_time: Date;
    end_time: Date;
}

const SlotsSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            required: true
        },
        start_time: {
            type: Date
        },
        end_time: {
            type: Date
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

SlotsSchema.statics.build = (attrs: SlotsAttrs) => {
    return new Slots(attrs);
};

const Slots = mongoose.model<SlotsDoc, SlotsModel>('Slots', SlotsSchema);

export { Slots };

