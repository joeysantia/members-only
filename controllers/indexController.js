import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import Message from "../models/message.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import { passport } from "../app.js";

const index = asyncHandler(async (req, res, next) => {
  const messages = await Message.find()
    .populate("user")
    .sort({ timestamp: 1 })
    .exec();

  res.render("index", {
    user: req.user,
    messages: messages,
  });
});

const sign_in_get = (req, res) => {
  res.render("login-form", {
    user: req.user,
    title: "Sign In",
    action: "/sign-in",
    buttonText: "Sign In",
    linkHref: "/sign-up",
    linkText: "Register a new account",
    errors: [],
  });
};

const sign_in_post = [
  body("username", "Username must not be left blank")
    .isLength({ min: 1 })
    .escape(),
  body("password", "Password must not be left blank")
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("login-form", {
        user: req.user,
        title: "Sign In",
        action: "/sign-in",
        buttonText: "Sign In",
        linkHref: "/sign-up",
        linkText: "Register a new account",
        errors: errors.array(),
      });
    } else {
      next();
    }
  },
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/sign-in",
  }),
];

const sign_up_get = (req, res) => {
  res.render("login-form", {
    user: req.user,
    title: "Register New Account",
    action: "/sign-up",
    buttonText: "Register",
    linkHref: "/sign-in",
    linkText: "Log in to an existing account",
    errors: [],
  });
};

const sign_up_post = [
  body("username", "Username is already in use")
    .custom(async (value) => {
      const user = await User.findOne({ username: value });
      return user ? Promise.reject() : Promise.resolve();
    })
    .escape(),
  body("password", "Password must contain at least 8 characters").isLength({
    min: 8,
  }),
  body("password", "Password must contain a capital letter").matches(/[A-Z]/),
  body("password", "Password must contain a number").matches(/[0-9]/),
  body("password", "Password must contain a special character")
    .matches(/[^\w\*]/)
    .escape(),
  asyncHandler((req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("login-form", {
        user: req.user,
        title: "Register New Account",
        action: "/sign-up",
        buttonText: "Register",
        linkHref: "/sign-in",
        linkText: "Log in to an existing account",
        errors: errors.array(),
      });
    } else {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) return next(err);

        const user = new User({
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          username: req.body.username,
          password: hashedPassword,
          is_member: false,
          is_admin: false,
        });

        await user.save();
        next();
      });
    }
  }),
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/sign-up",
  }),
];

const log_out = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
};

const become_member_get = (req, res) => {
  res.render("secret-form", {
    user: req.user,
    title: "Become a Member",
    action: "/become-member",
    formText: "Enter the Member Password",
    errors: [],
  });
};

const become_member_post = [
  body("password", "Incorrect member password")
    .custom((value) => {
      return value === process.env.MEMBER_PASSWORD;
    })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("secret-form", {
        user: req.user,
        title: "Become a Member",
        action: "/become-member",
        formText: "Enter the Member Password",
        errors: errors.array(),
      });
    } else {
      await User.findByIdAndUpdate(req.user._id, {
        is_member: true,
      });
      res.redirect("/");
    }
  }),
];

const become_admin_get = (req, res) => {
  res.render("secret-form", {
    user: req.user,
    title: "Become an Admin",
    action: "/become-admin",
    formText: "Enter the Admin Password",
    errors: [],
  });
};

const become_admin_post = [
  body("password", "Incorrect admin password").custom((value) => {
    return value === process.env.ADMIN_PASSWORD;
  }),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("secret-form", {
        user: req.user,
        title: "Become an Admin",
        action: "/become-admin",
        formText: "Enter the Admin Password",
        errors: errors.array(),
      });
    } else {
      await User.findByIdAndUpdate(req.user._id, {
        is_admin: true,
        is_member: true,
      });
      res.redirect("/");
    }
  }),
];

const create_message_get = (req, res) => {
  res.render("create-message", {
    user: req.user,
    title: "",
    messageText: "",
    errors: [],
  });
};

const create_message_post = [
  body("title", "Title must not be left blank").isLength({ min: 1 }).escape(),
  body("message_text", "Message text must not be left blank").isLength({
    min: 1,
  }),
  body("message_text", "Message must be less than 501 characters")
    .isLength({ max: 500 })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty) {
      res.render({
        user: req.user,
        title: req.body.title,
        messageTest: req.body.message_text,
        errors: errors.array(),
      });
    } else {
      const message = new Message({
        title: req.body.title,
        text: req.body.message_text,
        user: req.user._id,
        timestamp: Date.now(),
      });
      await message.save();
      res.redirect("/");
    }
  }),
];

const delete_message_get = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id).populate("user");

  res.render("delete-message", {
    user: req.user,
    message: message,
  });
});

const delete_message_post = asyncHandler(async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.redirect("/");
});

export default {
  index,
  sign_in_get,
  sign_in_post,
  sign_up_get,
  sign_up_post,
  log_out,
  become_member_get,
  become_member_post,
  become_admin_get,
  become_admin_post,
  create_message_get,
  create_message_post,
  delete_message_get,
  delete_message_post,
};
