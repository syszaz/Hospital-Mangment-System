import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.route.js";
import doctorRouter from "./routes/doctor.route.js";
import { errorHandler } from "./middlewares/error.js";
import userRouter from "./routes/user.route.js";
import adminRouter from "./routes/admin.route.js";
import appointmentRouter from "./routes/appointment.route.js";

dotenv.config();

const app = express();
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/auth", authRouter);
app.use("/user", userRouter); 
app.use("/doctor", doctorRouter);
app.use("/admin", adminRouter);
app.use("/seats", appointmentRouter);


app.use(errorHandler);

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running on http://localhost:3000");
});
