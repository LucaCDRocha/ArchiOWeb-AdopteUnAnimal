import User from "../models/user.js"
import Spa from "../models/spa.js"

export const cleanUpDatabase = async function () {
    await Promise.all([
        User.deleteMany(),
        Spa.deleteMany()
    ]);
};