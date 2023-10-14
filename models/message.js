import { formatDistanceToNow } from 'date-fns'
import mongoose from 'mongoose'

let Schema = mongoose.Schema 

let MessageSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
})
MessageSchema.virtual("timestamp_formatted").get(function() {
    return formatDistanceToNow(this.timestamp, "")
})
let messageModel = mongoose.model("Message", MessageSchema)

export default messageModel