import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import Message from "./models/message.js"
import User from "./models/user.js"

mongoose.set("strictQuery", false)

dotenv.config()

main().catch(err => console.log(err))

async function main() {
    console.log('script initializing')
    await mongoose.connect(process.env.MONGODB_KEY)
    console.log('connection successful')
  //  await addUsers()
   // console.log('all users added')
    await addMessages()
    console.log('all messages added')
    console.log('closing connection...')
    mongoose.connection.close()
    console.log('script terminated')
}  


async function addUsers() {
    const userData = [
        {
            firstName: "Kat",
            lastName: "Stevens",
            username: "kstev1998",
            password: "Password1!"
        },
        {
            firstName: "Jimmy",
            lastName: "Cage",
            username: "cjcjcj",
            password: "Password2!"
        },
        {
            firstName: "Liv",
            lastName: "Thompson",
            username: "bluesun22",
            password: "Password3!"
        },
        {
            firstName: "Bill",
            lastName: "Noid",
            username: "drnoid",
            password: "Password4!"
        },
        {
            firstName: "Rick",
            lastName: "Van Winkle",
            username: "xXxXsandmanXxXx",
            password: "Password5!"
        }
    ]

    await Promise.all(
        userData.map(user => {
            bcrypt.hash(user.password, 10, async (err, hashedPassword) => {
                if (err) {
                    return console.log(err)
                }

                const newUser = new User({
                    first_name: user.firstName,
                    last_name: user.lastName,
                    username: user.username,
                    password: hashedPassword,
                    is_member: false,
                    is_admin: false
                })

                //const existingUser = await User.find({ username: user.username })
                //if (!existingUser) {
                    await newUser.save()
                    console.log(`user ${newUser.username} saved successfully`)
                //}
                
            })
        })
    )
}

async function addMessages() {
    const userData = [
      {
        title: "Hello World!",
        text: "And don't forget to become a member ... ",
        timestamp: Date.now(),
        username: "bluesun22"
      },
    ]

    await Promise.all(
        userData.map(async message => {
                const the_user = await User.findOne({ username: message.username })
                const newMessage = new Message({
                    title: message.title,
                    text: message.text,
                    timestamp: message.timestamp,
                    user: the_user._id
                })
                await newMessage.save()
                console.log(`message ${newMessage.title} saved successfully`)
        })
    )
}


