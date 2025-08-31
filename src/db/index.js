import mongoose from "mongoose";
import { DatabaseName } from "../constants.js";


const connectDB=async()=>{
    try {
        const url=process.env.DATABASE_URI;
        const ci=await mongoose.connect(`${url}/${DatabaseName}`);
        console.log(`MongoDB connected: ${ci.connection.host}`);
        
    } catch (error) {
        console.error("Error connecting to the database:", error);
        process.exit(1); // Exit the process with failure
    }
}
export default connectDB;