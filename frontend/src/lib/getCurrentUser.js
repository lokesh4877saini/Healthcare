// src/lib/auth.js
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { fetcher } from './api';

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    try {
        const { id } = jwt.verify(token, process.env.JWT_SECRET);
        const res = await fetcher(`me`, {
            headers: {
                Cookie: `token=${token}`
            },
            cache: 'no-store'
        });
        if(res.success){
            return res.user;
        }else{
            return null;
        }
    } catch (err) {
        return null;
    }
}
