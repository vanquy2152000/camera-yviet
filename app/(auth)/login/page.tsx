'use client'

import React, { useState } from 'react'
import apiAuth from '../../../services/auth.services';

import { TextField, Button, Container, Typography, Box } from '@mui/material';

import { toast } from 'react-toastify';

import { CookieCore } from "@/lib/cookie";

import { useRouter } from 'next/navigation';
import { useCookie } from '../../../hooks/useCookie';

type Props = {}

const Login = (props: Props) => {
    const router = useRouter()
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [error, setError] = useState<string>('')

    const { setCookie, removeCookie } = useCookie()

    const validateForm = () => {
        if (!username || !password) {
            setError('Vui lòng nhập đầy đủ thông tin.');
            return false;
        }
        if (password.length < 6) {
            setError('Mật khẩu phải dài ít nhất 6 ký tự.');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            e.preventDefault();

            if (!validateForm()) return;
            const dataSubmit = {
                username: username,
                password: password
            }
            const data = await apiAuth.postLogin(dataSubmit)
            console.log('data data: ', data);


            if (data && data.status === 200) {
                toast.success('Đăng nhập thành công!');

                CookieCore.set('refreshToken', data.data.refreshToken, { expires: 7 }); // lưu 7 ngày
                CookieCore.set('accessToken', data.data.token);

                // Xử lý chuyển hướng hoặc lưu token...

                // ✅ Chuyển hướng về Home
                router.push('/');
            } else {
                toast.error(data.message || 'Đăng nhập thất bại: Sai tài khoản hoặc mật khẩu');
            }
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Lỗi kết nối đến server.';
            toast.error(message);
        }
    };

    return (
        <div className="h-screen flex justify-center items-center bg-gray-100 text-black">

            <Box
                className="flex flex-col gap-4 bg-white p-8 rounded-lg shadow w-full max-w-md"
                component="form"
                onSubmit={handleSubmit}
            >
                <Typography
                    variant="h4"
                    align="center"
                    gutterBottom
                    className="!font-semibold"
                >
                    Đăng nhập
                </Typography>

                <TextField
                    label="Username"
                    variant="outlined"
                    fullWidth
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <TextField
                    label="Password"
                    variant="outlined"
                    type="password"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && <Typography color="error">{error}</Typography>}

                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    fullWidth
                    className='!text-lg h-12'
                >
                    Đăng nhập
                </Button>
            </Box>
        </div>
    )
}

export default Login