import { db } from "../../db/knex.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";
import type { SignupInput, LoginInput } from "./auth.schema.js";

export async function findUserByEmail(email: string) {
    return db("users").where("email", email).first();
}

export async function createUser(input: SignupInput) {

    const existingUser = await findUserByEmail(input.email);
    if (existingUser) {
        throw new AppError(409, "CONFLICT", "Email already in use");
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const [id] = await db("users").insert({ name: input.name, email: input.email, password_hash: hashedPassword });

    const token = jwt.sign({ sub: id, name: input.name, email: input.email }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);

    return {user:{id, name: input.name, email: input.email}, token};
}

export async function login(input: LoginInput) {
    const user = await findUserByEmail(input.email);
    if (!user) {
        throw new AppError(401, "UNAUTHORIZED", "Invalid email or password");
    }
    const isPasswordValid = await bcrypt.compare(input.password, user.password_hash);
    if (!isPasswordValid) {
        throw new AppError(401, "UNAUTHORIZED", "Invalid email or password");
    }
    const token = jwt.sign({ sub: user.id, name: user.name, email: user.email }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
    return {user:{id: user.id, name: user.name, email: user.email}, token};
}

