import { strictTransportSecurity } from 'helmet'
import mongoose from 'mongoose'

let Schema = mongoose.Schema 

let UserSchema = new Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true 
    }, 
    password: {
        type: String, 
        required: true
    },
    is_member: {
        type: Boolean,
        required: true
    },
    is_admin: {
        type: Boolean,
        required: true
    },
})
UserSchema.virtual("full_name").get(function() {
    return this.first_name + ' ' + this.last_name
})
let userModel = mongoose.model("User", UserSchema)

export default userModel