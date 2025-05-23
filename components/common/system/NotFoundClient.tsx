'use client';

import Link from "next/link";
import SystemNotFoundAnimation from '@/components/common/system/SystemNotFoundAnimation';

export default function NotFoundClient() {
    return (
        <div className="custom-container h-screen flex flex-col 2xl:-space-y-24 -space-y-20 items-center justify-center">
            <div className="aspect-square 3xl:w-[32%] 2xl:w-[38%] xl:w-[42%] lg:w-[55%] md:w-[70%] w-full">
                <SystemNotFoundAnimation />
            </div>
            <div className="text-center flex flex-col justify-center items-center lg:gap-9 gap-6">
                <div className="space-y-2">
                    <h1 className="text-[24px] md:text-[28px] xl:text-[28px] 3xl:text-[36px] font-bold text-[#15AA7A]">
                        Úi! Không tìm thấy trang
                    </h1>
                    <h5 className="lg:text-lg text-base font-medium text-[#17181A]">
                        Trang bạn tìm kiếm đã bị gỡ hoặc không tồn tại.
                    </h5>
                </div>

                <Link
                    href="/"
                    className="flex items-center justify-between gap-2 !text-lg text-[#10805B] hover:bg-[#A3EED6]/40 hover:text-[#052B1E] font-medium px-4 py-2 border border-[#10805B] rounded-3xl lg:w-fit w-full transition-all group"
                >
                    <span>Trở về trang chủ</span>
                </Link>
            </div>
        </div>
    );
}
