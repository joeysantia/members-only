import createError from "http-errors";
import express from "express";
import debugConfig from 'debug'
import http from 'http'
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import helmet from "helmet";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import passport from "passport";
import passportLocal from "passport-local";
import dotenv from "dotenv";
import compression from "compression";
import session from "express-session";
import RateLimit from "express-rate-limit";
import indexRouter from "../routes/index.js";
import User from "../models/user.js";

const __dirname = path.resolve();
dotenv.config();
const LocalStrategy = passportLocal.Strategy;

var app = express();

mongoose.set("strictQuery", false);
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(process.env.MONGODB_KEY);
}

const limiter = RateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
});

app.use(limiter);
app.use(helmet());
app.use(compression());

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export { passport }
export default app;
