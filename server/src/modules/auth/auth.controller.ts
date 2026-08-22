import type { Request, Response } from "express";
import * as authService from "./auth.service.js";

export async function signup(req: Request, res: Response) {
    const result = await authService.createUser(req.body);

    res.status(201).json({
        status: "success",
        message: "User created successfully",
        data: result,
    });
}

export async function login(req: Request, res: Response) {
    const result = await authService.login(req.body);

    res.status(200).json({
        status: "success",
        message: "User logged in successfully",
        data: result,
    });
}


export async function me(req: Request, res: Response) {
    res.json({ user: req.user });
}

